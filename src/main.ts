import "./style.css";
import { db, Item, Stock, Storage, Shopping } from "./db";

const app = document.querySelector<HTMLDivElement>("#app")!;

let items: Item[] = [];
let stock: Stock[] = [];
let storage: Storage[] = [];
let shopping: Shopping[] = [];
let currentView = "dashboard";

const uid = () => crypto.randomUUID();
const esc = (value: string) => value.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]!));
const today = () => new Date().toISOString().slice(0,10);
const daysUntil = (date?: string) => date ? Math.ceil((new Date(date).getTime() - new Date(today()).getTime()) / 86400000) : Infinity;

async function load() {
  [items, stock, storage, shopping] = await Promise.all([db.items(), db.stock(), db.storage(), db.shopping()]);
  render();
}

function totalForItem(itemId: string) {
  return stock.filter(s => s.itemId === itemId).reduce((sum, s) => sum + s.amount, 0);
}

function itemName(itemId: string) {
  return items.find(i => i.id === itemId)?.name ?? "Unknown";
}

function storageName(storageId: string) {
  return storage.find(s => s.id === storageId)?.name ?? "Unknown";
}

function layout(content: string) {
  app.innerHTML = `
    <div class="app">
      <header class="topbar">
        <button class="icon-btn" id="menu">☰</button>
        <h1>Inventory</h1>
        <button class="icon-btn" id="quick">＋</button>
      </header>
      <main class="content">${content}</main>
      <div id="overlay"></div>
    </div>`;
  document.querySelector("#menu")?.addEventListener("click", openMenu);
  document.querySelector("#quick")?.addEventListener("click", () => openAddRemove());
}

function render() {
  if (currentView === "dashboard") renderDashboard();
  else if (currentView === "inventory") renderInventory();
  else if (currentView === "storage") renderStorage();
  else if (currentView === "reports") renderReports();
  else if (currentView === "shopping") renderShopping();
  else if (currentView === "settings") renderSettings();
  else if (currentView === "addremove") renderAddRemovePage();
}

function renderDashboard() {
  const expiring = stock.filter(s => daysUntil(s.bestBefore) <= 7).sort((a,b) => daysUntil(a.bestBefore)-daysUntil(b.bestBefore));
  const under = items.filter(i => totalForItem(i.id) < i.minimum);
  layout(`
    <section class="hero">
      <h2>Expiry report</h2>
      <p class="muted">${expiring.length} stock entries expire within 7 days.</p>
      <button class="primary" id="addRemove">Add / Remove Items</button>
    </section>
    <section class="section">
      <div class="grid">
        <div class="card"><h3>${items.length}</h3><div class="muted">Products</div></div>
        <div class="card"><h3>${stock.reduce((n,s)=>n+s.amount,0)}</h3><div class="muted">Units in stock</div></div>
        <div class="card"><h3>${under.length}</h3><div class="muted">Below minimum</div></div>
      </div>
    </section>
    <section class="section">
      <h2>Expiring soon</h2>
      <div class="list">${expiring.length ? expiring.map(stockRow).join("") : `<div class="empty">Nothing expiring within 7 days.</div>`}</div>
    </section>`);
  document.querySelector("#addRemove")?.addEventListener("click", () => openAddRemove());
  bindStockActions();
}

function stockRow(s: Stock) {
  const days = daysUntil(s.bestBefore);
  const cls = days < 0 ? "danger" : days <= 3 ? "warning" : "";
  return `<div class="item">
    <div><strong>${esc(itemName(s.itemId))}</strong><div class="small">${esc(storageName(s.storageId))} · ${s.amount} · ${s.bestBefore ?? "No date"}</div></div>
    <span class="badge ${cls}">${days === Infinity ? "No date" : days < 0 ? "Expired" : `${days}d`}</span>
  </div>`;
}

function renderAddRemovePage() {
  layout(`
    <section class="hero"><h2>Add / Remove Items</h2><p class="muted">Scan a barcode, add manually, or search manually.</p>
      <div class="row"><button class="primary" id="scan">Scan Barcode</button><button class="secondary" id="addManual">Add manually</button></div>
    </section>
    <div class="search"><input id="manualSearch" placeholder="Search by name or barcode"></div>
    <div class="list" id="searchResults"></div>`);
  document.querySelector("#scan")?.addEventListener("click", openScanner);
  document.querySelector("#addManual")?.addEventListener("click", () => newItemForm());
  const input = document.querySelector<HTMLInputElement>("#manualSearch")!;
  const update = () => {
    const q = input.value.toLowerCase();
    const matches = items.filter(i => i.name.toLowerCase().includes(q) || i.barcode.includes(q));
    document.querySelector("#searchResults")!.innerHTML = matches.map(i => `
      <div class="item"><div><strong>${esc(i.name)}</strong><div class="small">Stock: ${totalForItem(i.id)} · ${esc(i.barcode)}</div></div>
      <div class="row"><button class="secondary" data-add="${i.id}">Add</button><button class="secondary" data-remove="${i.id}">Remove</button></div></div>`).join("") || `<div class="empty">No matching items.</div>`;
    document.querySelectorAll<HTMLElement>("[data-add]").forEach(b => b.onclick = () => adjustItem(b.dataset.add!, 1));
    document.querySelectorAll<HTMLElement>("[data-remove]").forEach(b => b.onclick = () => adjustItem(b.dataset.remove!, -1));
  };
  input.addEventListener("input", update); update();
}

function renderInventory() {
  layout(`<section class="section"><h2>Inventory</h2><div class="tabs"><button data-filter="all">All</button>${storage.map(s=>`<button data-filter="${s.id}">${esc(s.name)}</button>`).join("")}</div><div class="list" id="inventoryList"></div></section>`);
  const renderList = (filter="all") => {
    const rows = items.filter(i => filter==="all" || stock.some(s=>s.itemId===i.id && s.storageId===filter)).map(i => {
      const rows = stock.filter(s=>s.itemId===i.id && (filter==="all" || s.storageId===filter));
      return `<div class="item"><div><strong>${esc(i.name)}</strong><div class="small">${rows.map(s=>`${esc(storageName(s.storageId))}: ${s.amount}${s.bestBefore ? ` · ${s.bestBefore}`:""}`).join(" | ") || "No stock"}</div></div><span class="badge">${totalForItem(i.id)}</span></div>`;
    }).join("");
    document.querySelector("#inventoryList")!.innerHTML = rows || `<div class="empty">No inventory.</div>`;
  };
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(b => b.onclick=()=>renderList(b.dataset.filter));
  renderList();
}

function renderStorage() {
  layout(`<section class="section"><h2>Storage</h2><button class="primary" id="newStorage">Add storage place</button><div class="list" style="margin-top:12px">${storage.map(s=>`
    <div class="item"><strong>${esc(s.name)}</strong><div class="row"><button class="secondary" data-edit="${s.id}">Edit</button><button class="danger-btn" data-delete="${s.id}">Delete</button></div></div>`).join("") || `<div class="empty">No storage places.</div>`}</div></section>`);
  document.querySelector("#newStorage")?.addEventListener("click",()=>storageForm());
  document.querySelectorAll<HTMLElement>("[data-edit]").forEach(b=>b.onclick=()=>storageForm(b.dataset.edit));
  document.querySelectorAll<HTMLElement>("[data-delete]").forEach(b=>b.onclick=async()=>{if(confirm("Delete storage place?")){await db.deleteStorage(b.dataset.delete!); await load();}});
}

function renderReports() {
  const expiring = stock.filter(s => daysUntil(s.bestBefore) <= 7);
  const under = items.filter(i => totalForItem(i.id) < i.minimum);
  layout(`<section class="section"><h2>Reports</h2>
    <h3>Best-Before expiring</h3><div class="list">${expiring.map(stockRow).join("") || `<div class="empty">None.</div>`}</div>
    <h3>Under minimum</h3><div class="list">${under.map(i=>`<div class="item"><div><strong>${esc(i.name)}</strong><div class="small">Current: ${totalForItem(i.id)} · Minimum: ${i.minimum}</div></div><button class="secondary" data-shop="${i.id}">Shopping list</button></div>`).join("") || `<div class="empty">None.</div>`}</div>
  </section>`);
  document.querySelectorAll<HTMLElement>("[data-shop]").forEach(b=>b.onclick=async()=>{const i=items.find(x=>x.id===b.dataset.shop)!;await db.putShopping({id:uid(),itemId:i.id,name:i.name,amount:Math.max(i.minimum-totalForItem(i.id),1),checked:false});await load();});
}

function renderShopping() {
  layout(`<section class="section"><h2>Shopping List</h2><div class="list">${shopping.map(s=>`<div class="item"><label><input type="checkbox" data-check="${s.id}" ${s.checked?"checked":""}> ${esc(s.name)} × ${s.amount}</label><button class="danger-btn" data-shop-delete="${s.id}">Delete</button></div>`).join("") || `<div class="empty">Shopping list is empty.</div>`}</div></section>`);
  document.querySelectorAll<HTMLInputElement>("[data-check]").forEach(x=>x.onchange=async()=>{const s=shopping.find(y=>y.id===x.dataset.check)!;s.checked=x.checked;await db.putShopping(s);await load();});
  document.querySelectorAll<HTMLElement>("[data-shop-delete]").forEach(x=>x.onclick=async()=>{await db.deleteShopping(x.dataset.shopDelete!);await load();});
}

function renderSettings() {
  layout(`<section class="section"><h2>Settings</h2><div class="card"><h3>Appearance</h3><button class="secondary" id="toggleTheme">Toggle light/dark</button></div>
  <div class="card" style="margin-top:12px"><h3>CSV</h3><div class="row"><button class="secondary" id="export">Export CSV</button><label class="secondary">Import CSV<input id="import" type="file" accept=".csv,text/csv" hidden></label></div><p class="small muted">Import expects columns: name,amount,category,storage,itemSize,itemSizeUnit,minimum,bestBefore,barcode,notes,recipeRef.</p></div></section>`);
  document.querySelector("#toggleTheme")?.addEventListener("click",()=>document.body.classList.toggle("dark"));
  document.querySelector("#export")?.addEventListener("click",exportCsv);
  document.querySelector<HTMLInputElement>("#import")?.addEventListener("change", e=>importCsv((e.target as HTMLInputElement).files?.[0]));
}

function openMenu() {
  const overlay = document.querySelector("#overlay")!;
  overlay.innerHTML = `<div class="drawer"><div class="drawer-panel"><h2>Navigation</h2>
    ${[
      ["dashboard","Dashboard"],["addremove","Add / Remove Items"],["inventory","Inventory"],["storage","Storage"],["reports","Reports"],["shopping","Shopping List"],["settings","Settings"]
    ].map(([id,label])=>`<button data-nav="${id}">${label}</button>`).join("")}
    <hr><button disabled>Recipes — future release</button><button disabled>Wishlist — future release</button>
  </div></div>`;
  overlay.querySelector(".drawer")?.addEventListener("click",e=>{if(e.target===e.currentTarget)overlay.innerHTML=""});
  overlay.querySelectorAll<HTMLElement>("[data-nav]").forEach(b=>b.onclick=()=>{currentView=b.dataset.nav!;overlay.innerHTML="";render();});
}

function openAddRemove() {
  currentView="addremove"; renderAddRemovePage();
}

function storageForm(id?: string) {
  const existing = storage.find(s=>s.id===id);
  showModal(`<h2>${existing?"Edit":"Add"} storage place</h2><div class="field"><label>Name</label><input id="storageName" value="${esc(existing?.name??"")}"></div>
  <div class="actions"><button class="secondary" id="cancel">Cancel</button><button class="primary" id="save">Save</button></div>`, async()=>{
    const name=document.querySelector<HTMLInputElement>("#storageName")!.value.trim();
    if(!name)return;
    await db.putStorage({id:id??uid(),name}); await load();
  });
}

function showModal(html:string,onSave?:()=>Promise<void>) {
  const overlay=document.querySelector("#overlay")!;
  overlay.innerHTML=`<div class="modal"><div class="modal-box">${html}</div></div>`;
  overlay.querySelector("#cancel")?.addEventListener("click",()=>overlay.innerHTML="");
  overlay.querySelector("#save")?.addEventListener("click",async()=>{await onSave?.();overlay.innerHTML="";});
}

async function adjustItem(itemId:string, delta:number) {
  const item=items.find(i=>i.id===itemId)!;
  if(delta>0) {
    if(storage.length===0){alert("Create a storage place first.");currentView="storage";render();return;}
    const options=storage.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("");
    showModal(`<h2>Add ${esc(item.name)}</h2><div class="field"><label>Storage place</label><select id="s">${options}</select></div><div class="field"><label>Best-Before</label><input id="bb" type="date"></div><div class="field"><label>Amount</label><input id="amt" type="number" min="1" value="1"></div><div class="actions"><button class="secondary" id="cancel">Cancel</button><button class="primary" id="save">Add</button></div>`,async()=>{
      const sid=document.querySelector<HTMLSelectElement>("#s")!.value;
      const amount=Number(document.querySelector<HTMLInputElement>("#amt")!.value)||1;
      const bb=document.querySelector<HTMLInputElement>("#bb")!.value||undefined;
      const existing=stock.find(s=>s.itemId===itemId&&s.storageId===sid&&s.bestBefore===bb);
      if(existing){existing.amount+=amount;await db.putStock(existing)}
      else await db.putStock({id:uid(),itemId,storageId:sid,amount,bestBefore:bb});
      await load();
    });
  } else {
    const candidates=stock.filter(s=>s.itemId===itemId&&s.amount>0);
    if(!candidates.length){alert("No stock available.");return;}
    const options=candidates.map(s=>`<option value="${s.id}">${esc(storageName(s.storageId))} — ${s.amount}${s.bestBefore?` · ${s.bestBefore}`:""}</option>`).join("");
    showModal(`<h2>Remove ${esc(item.name)}</h2><div class="field"><label>Storage place</label><select id="s">${options}</select></div><div class="field"><label>Amount</label><input id="amt" type="number" min="1" value="1"></div><div class="actions"><button class="secondary" id="cancel">Cancel</button><button class="primary" id="save">Remove</button></div>`,async()=>{
      const sid=document.querySelector<HTMLSelectElement>("#s")!.value;
      const amount=Number(document.querySelector<HTMLInputElement>("#amt")!.value)||1;
      const s=stock.find(x=>x.id===sid)!;
      s.amount=Math.max(0,s.amount-amount);
      if(s.amount===0)await db.deleteStock(s.id);else await db.putStock(s);
      await load();
    });
  }
}

function openScanner() {
  const overlay=document.querySelector("#overlay")!;
  overlay.innerHTML=`<div class="modal"><div class="modal-box"><h2>Scan barcode</h2><video id="video" class="scanner" autoplay muted playsinline></video><p class="small muted">Point the camera at a barcode. Chrome's BarcodeDetector is used when available.</p><div class="actions"><button class="secondary" id="cancel">Cancel</button></div></div></div>`;
  overlay.querySelector("#cancel")?.addEventListener("click",()=>{stopCamera();overlay.innerHTML=""});
  startCamera();
}

let cameraStream:MediaStream|null=null;
async function startCamera(){
  const video=document.querySelector<HTMLVideoElement>("#video");
  if(!video)return;
  if(!("BarcodeDetector" in window)){alert("Barcode scanning is not supported by this browser. Use manual barcode entry.");return;}
  try{
    cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}});
    video.srcObject=cameraStream;
    const Detector=(window as any).BarcodeDetector;
    const detector=new Detector({formats:["ean_13","ean_8","upc_a","upc_e","code_128","code_39","itf"]});
    const scan=async()=>{
      if(!document.querySelector("#video"))return;
      try{
        const codes=await detector.detect(video);
        if(codes.length){stopCamera();document.querySelector("#overlay")!.innerHTML="";handleBarcode(codes[0].rawValue);}
        else requestAnimationFrame(scan);
      }catch{requestAnimationFrame(scan);}
    };
    requestAnimationFrame(scan);
  }catch{alert("Camera permission was denied or the camera is unavailable.");}
}
function stopCamera(){cameraStream?.getTracks().forEach(t=>t.stop());cameraStream=null;}

function handleBarcode(barcode:string){
  const item=items.find(i=>i.barcode===barcode);
  if(item)adjustItem(item.id,1);
  else newItemForm(barcode);
}

function newItemForm(barcode=""){
  const options=storage.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("");
  showModal(`<h2>New item</h2>
    ${[
      ["name","Name","text"],["category","Category","text"],["itemSize","Item size","number"],["minimum","Minimum","number"],["barcode","Barcode","text"]
    ].map(([id,label,type])=>`<div class="field"><label>${label}</label><input id="${id}" type="${type}" value="${id==="barcode"?esc(barcode):""}"></div>`).join("")}
    <div class="field"><label>Item size unit</label><select id="itemSizeUnit"><option>g</option><option>ml</option><option>amount</option></select></div>
    <div class="field"><label>Storage place</label><select id="storage">${options}</select></div>
    <div class="field"><label>Amount</label><input id="amount" type="number" min="1" value="1"></div>
    <div class="field"><label>Best-Before</label><input id="bestBefore" type="date"></div>
    <div class="field"><label>Notes</label><textarea id="notes"></textarea></div>
    <div class="field"><label>Recipe Cross reference</label><input id="recipeRef"></div>
    <div class="actions"><button class="secondary" id="cancel">Cancel</button><button class="primary" id="save">Create</button></div>`,async()=>{
      const name=document.querySelector<HTMLInputElement>("#name")!.value.trim();
      if(!name)return;
      const item:Item={id:uid(),name,category:document.querySelector<HTMLInputElement>("#category")!.value.trim(),itemSize:Number(document.querySelector<HTMLInputElement>("#itemSize")!.value)||0,itemSizeUnit:document.querySelector<HTMLSelectElement>("#itemSizeUnit")!.value as Item["itemSizeUnit"],barcode:document.querySelector<HTMLInputElement>("#barcode")!.value.trim(),notes:document.querySelector<HTMLTextAreaElement>("#notes")!.value,recipeRef:document.querySelector<HTMLInputElement>("#recipeRef")!.value,minimum:Number(document.querySelector<HTMLInputElement>("#minimum")!.value)||0};
      await db.putItem(item);
      const sid=document.querySelector<HTMLSelectElement>("#storage")?.value;
      const amount=Number(document.querySelector<HTMLInputElement>("#amount")!.value)||1;
      const bb=document.querySelector<HTMLInputElement>("#bestBefore")!.value||undefined;
      if(sid)await db.putStock({id:uid(),itemId:item.id,storageId:sid,amount,bestBefore:bb});
      await load();
    });
}

function bindStockActions(){}

function csvCell(v:string|number){return `"${String(v).replaceAll('"','""')}"`;}
function exportCsv(){
  const rows=[["name","amount","category","storage","itemSize","itemSizeUnit","minimum","bestBefore","barcode","notes","recipeRef"]];
  for(const s of stock){
    const i=items.find(x=>x.id===s.itemId)!;
    rows.push([i.name,s.amount,i.category,storageName(s.storageId),i.itemSize,i.itemSizeUnit,i.minimum,s.bestBefore??"",i.barcode,i.notes,i.recipeRef]);
  }
  const blob=new Blob([rows.map(r=>r.map(csvCell).join(",")).join("\n")],{type:"text/csv"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="inventory.csv";a.click();URL.revokeObjectURL(a.href);
}

async function importCsv(file?:File){
  if(!file)return;
  const text=await file.text();
  const lines=text.split(/\r?\n/).filter(Boolean);
  const headers=lines.shift()!.split(",").map(x=>x.replace(/^"|"$/g,""));
  for(const line of lines){
    const values=line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v=>v.replace(/^"|"$/g,"").replaceAll('""','"'))??[];
    const row=Object.fromEntries(headers.map((h,i)=>[h,values[i]??""]));
    let item=items.find(i=>i.barcode===row.barcode&&row.barcode)||items.find(i=>i.name.toLowerCase()===row.name.toLowerCase());
    if(!item){
      item={id:uid(),name:row.name,category:row.category,itemSize:Number(row.itemSize)||0,itemSizeUnit:(row.itemSizeUnit||"amount") as Item["itemSizeUnit"],barcode:row.barcode,notes:row.notes||"",recipeRef:row.recipeRef||"",minimum:Number(row.minimum)||0};
      await db.putItem(item);
    }
    let sid=storage.find(s=>s.name.toLowerCase()===row.storage.toLowerCase())?.id;
    if(!sid&&row.storage){sid=uid();await db.putStorage({id:sid,name:row.storage});}
    if(sid)await db.putStock({id:uid(),itemId:item.id,storageId:sid,amount:Number(row.amount)||1,bestBefore:row.bestBefore||undefined});
  }
  await load();
}

load().catch(error=>{console.error(error);app.innerHTML="<div class='content'><div class='card'><h2>Database error</h2><p>Could not initialize local storage.</p></div></div>";});