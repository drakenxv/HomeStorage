import "./style.css";
import { db, Item, Stock, Storage, Shopping, Category } from "./db";

type Lang = "en" | "de";

const app = document.querySelector<HTMLDivElement>("#app")!;

let items: Item[] = [];
let stock: Stock[] = [];
let storage: Storage[] = [];
let shopping: Shopping[] = [];
let categories: Category[] = [];
let sizeUnits: string[] = JSON.parse(localStorage.getItem("sizeUnits") || '["g","ml","amount"]');
let currentView = "dashboard";
let currentLanguage: Lang = (localStorage.getItem("lang") as Lang) || "en";
let currentTheme: "light" | "dark" = (localStorage.getItem("theme") as "light" | "dark") || "light";

const saveSizeUnits = () => localStorage.setItem("sizeUnits", JSON.stringify(sizeUnits));
const applyTheme = () => {
  document.body.classList.toggle("dark", currentTheme === "dark");
  localStorage.setItem("theme", currentTheme);
};

const parseBestBefore = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const digits = trimmed.replace(/\D/g, "");
  if (/^\d{4}$/.test(digits)) {
    const month = Number(digits.slice(0, 2));
    const year = Number("20" + digits.slice(2));
    if (month >= 1 && month <= 12) return `${year.toString().padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;
  }
  if (/^\d{6}$/.test(digits)) {
    const month = Number(digits.slice(0, 2));
    const year = Number(digits.slice(2));
    if (month >= 1 && month <= 12) return `${year.toString().padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;
  }
  if (/^\d{8}$/.test(digits)) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return undefined;
};

const formatBestBefore = (value?: string) => {
  if (!value) return tr("noDate");
  const m = value.slice(5, 7);
  const y = value.slice(0, 4).slice(2);
  if (m && y) return `${m}/${y}`;
  return value;
};

const translations: Record<Lang, Record<string, string>> = {
  en: {
    appTitle: "HomeStorage",
    dashboardTitle: "Expiry report",
    dashboardDescription: "{count} stock entries expire within 7 days.",
    addRemoveTitle: "Add / Remove Items",
    addRemoveHint: "Scan a barcode, add manually, or search manually.",
    searchPlaceholder: "Search by name or category",
    scanBarcode: "Scan Barcode",
    homeStorageTitle: "HomeStorage",
    // recipes and unit management translations are defined later
    addManual: "＋",
    noMatches: "No matching items.",
    storageTitle: "Storage",
    addStoragePlace: "Add storage place",
    parentLabel: "Parent",
    viewListings: "≡",
    newItemTitle: "New Item",
    changeItemLabel: "Change item",
    createNewLabel: "Create new",
    edit: "✎",
    delete: "🗑",
    reportsTitle: "Reports",
    expiringTitle: "Best-Before expiring",
    none: "None.",
    underMinimumTitle: "Under minimum",
    shoppingListTitle: "Shopping List",
    shoppingListEmpty: "Shopping list is empty.",
    addByBarcode: "＋ Barcode",
    addByName: "＋ Name",
    settingsTitle: "Settings",
    appearanceTitle: "Appearance",
    toggleTheme: "Toggle light/dark",
    languageTitle: "Language",
    languageLabel: "Language",
    english: "English",
    german: "Deutsch",
    csvTitle: "CSV",
    exportCsv: "Export CSV",
    importCsv: "Import CSV",
    importNote: "Import expects columns: name,amount,category,storage,itemSize,itemSizeUnit,minimum,bestBefore,barcode,notes,recipeRef.",
    categoriesTitle: "Categories",
    addCategory: "Add category",
    categoryName: "Category name",
    cancel: "Cancel",
    save: "Save",
    create: "Create",
    add: "＋",
    remove: "−",
    nameLabel: "Name",
    categoryLabel: "Category",
    itemSizeLabel: "Item size",
    minimumLabel: "Minimum",
    barcodeLabel: "Barcode",
    itemSizeUnitLabel: "Item size unit",
    storagePlaceLabel: "Storage place",
    amountLabel: "Amount",
    bestBeforeLabel: "Best-Before",
    notesLabel: "Notes",
    recipeRefLabel: "Recipe Cross reference",
    noStoragePlaces: "No storage places.",
    inventoryTitle: "≡",
    allTitle: "All",
    noInventory: "No inventory.",
    noExpiry: "Nothing expiring within 7 days.",
    expiredLabel: "Expired",
    noDate: "No date",
    scanModalTitle: "Scan barcode",
    scanModalHint: "Point the camera at a barcode. Chrome's BarcodeDetector is used when available.",
    recipesLabel: "Recipes",
    noRecipes: "No recipes yet.",
    manageUnits: "Manage item size units",
    addUnit: "Add unit",
    unitNameLabel: "Unit name",
    categoriesNav: "Categories",
    dashboardNav: "Dashboard",
    addremoveNav: "Add / Remove Items",
    inventoryNav: "≡",
    storageNav: "Storage",
    reportsNav: "Reports",
    shoppingNav: "Shopping List",
    settingsNav: "Settings",
    expiryReportLabel: "Expiry report",
    storageLabel: "Storage",
    productsLabel: "Products",
    unitsInStockLabel: "Units in stock",
    belowMinimumLabel: "Below minimum",
  },
  de: {
    appTitle: "HomeStorage",
    dashboardTitle: "Ablaufbericht",
    dashboardDescription: "{count} Lager-Einträge laufen innerhalb von 7 Tagen ab.",
    addRemoveTitle: "Hinzufügen / Entfernen",
    addRemoveHint: "Barcode scannen, manuell hinzufügen oder suchen.",
    searchPlaceholder: "Suche nach Name oder Kategorie",
    scanBarcode: "Barcode scannen",
    addManual: "Manuell hinzufügen",
    noMatches: "Keine passenden Einträge.",
    storageTitle: "Lager",
    addStoragePlace: "Lagerplatz hinzufügen",
    parentLabel: "Eltern",
    viewListings: "Alle Einträge anzeigen",
    newItemTitle: "Neuer Artikel",
    changeItemLabel: "Artikel ändern",
    createNewLabel: "Neu erstellen",
    edit: "Bearbeiten",
    delete: "Löschen",
    reportsTitle: "Berichte",
    expiringTitle: "Ablaufende Bestände",
    none: "Keine.",
    underMinimumTitle: "Unter Minimum",
    shoppingListTitle: "Einkaufsliste",
    shoppingListEmpty: "Einkaufsliste ist leer.",
    addByBarcode: "＋ Barcode",
    addByName: "＋ Name",
    settingsTitle: "Einstellungen",
    appearanceTitle: "Darstellung",
    toggleTheme: "Hell/Dunkel umschalten",
    languageTitle: "Sprache",
    languageLabel: "Sprache",
    english: "Englisch",
    german: "Deutsch",
    csvTitle: "CSV",
    exportCsv: "CSV exportieren",
    importCsv: "CSV importieren",
    importNote: "Import erwartet Spalten: name,amount,category,storage,itemSize,itemSizeUnit,minimum,bestBefore,barcode,notes,recipeRef.",
    categoriesTitle: "Kategorien",
    addCategory: "Kategorie hinzufügen",
    categoryName: "Kategorie-Name",
    cancel: "Abbrechen",
    save: "Speichern",
    create: "Erstellen",
    add: "＋",
    remove: "−",
    nameLabel: "Name",
    categoryLabel: "Kategorie",
    itemSizeLabel: "Größe",
    minimumLabel: "Minimum",
    barcodeLabel: "Barcode",
    itemSizeUnitLabel: "Größeneinheit",
    storagePlaceLabel: "Lagerplatz",
    amountLabel: "Menge",
    bestBeforeLabel: "Haltbar bis",
    notesLabel: "Notizen",
    recipeRefLabel: "Rezept-Referenz",
    noStoragePlaces: "Keine Lagerplätze.",
    inventoryTitle: "≡",
    allTitle: "Alle",
    noInventory: "Kein Bestand.",
    noExpiry: "Keine Einträge laufen innerhalb von 7 Tagen ab.",
    expiredLabel: "Abgelaufen",
    noDate: "Kein Datum",
    scanModalTitle: "Barcode scannen",
    scanModalHint: "Richte die Kamera auf einen Barcode. Chrome verwendet den BarcodeDetector.",
    // recipes and unit management translations are defined later
    categoriesNav: "Kategorien",
    dashboardNav: "Übersicht",
    addremoveNav: "Hinzufügen / Entfernen",
    inventoryNav: "≡",
    storageNav: "Lager",
    reportsNav: "Berichte",
    shoppingNav: "Einkaufsliste",
    settingsNav: "Einstellungen",
    expiryReportLabel: "Ablaufbericht",
    storageLabel: "Lager",
    productsLabel: "Produkte",
    unitsInStockLabel: "Einheiten im Bestand",
    belowMinimumLabel: "Unter Minimum",
  },
};

const tr = (key: string, vars?: Record<string, string>) => {
  let text = translations[currentLanguage][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
};

const setLanguage = (lang: Lang) => {
  currentLanguage = lang;
  localStorage.setItem("lang", lang);
  render();
};

const storagePath = (storageId: string): string => {
  const item = storage.find(s => s.id === storageId);
  if (!item) return "";
  return item.parentId ? `${storagePath(item.parentId)}/${item.name}` : item.name;
};

const categoryPath = (categoryId: string): string => {
  const item = categories.find(c => c.id === categoryId);
  if (!item) return "";
  return item.parentId ? `${categoryPath(item.parentId)}/${item.name}` : item.name;
};

const getCategoryByValue = (value: string) => categories.find(c => c.id === value) || categories.find(c => c.name.toLowerCase() === value.toLowerCase());
const getCategoryId = (value: string) => getCategoryByValue(value)?.id;
const getCategoryLabel = (value: string) => {
  const category = getCategoryByValue(value);
  return category ? categoryPath(category.id) : value;
};

const itemCategoryLabel = (item: Item) => {
  const category = getCategoryByValue(item.category);
  return category ? categoryPath(category.id) : item.category;
};

const uid = () => crypto.randomUUID();
const esc = (value: string) => value.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]!));
const today = () => new Date().toISOString().slice(0,10);
const daysUntil = (date?: string) => date ? Math.ceil((new Date(date).getTime() - new Date(today()).getTime()) / 86400000) : Infinity;

async function load() {
  [items, stock, storage, categories, shopping] = await Promise.all([db.items(), db.stock(), db.storage(), db.categories(), db.shopping()]);
  applyTheme();
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
        <h1><button class="icon-btn" id="homeLink">${tr("inventoryTitle")}</button></h1>
        <button class="icon-btn" id="quick">＋</button>
      </header>
      <main class="content">${content}</main>
      <div id="overlay"></div>
    </div>`;
  document.querySelector("#menu")?.addEventListener("click", openMenu);
  document.querySelector("#quick")?.addEventListener("click", () => openAddRemove());
  document.querySelector("#homeLink")?.addEventListener("click", e => { e.preventDefault(); currentView = "dashboard"; render(); });
}

function render() {
  if (currentView === "dashboard") renderDashboard();
  else if (currentView === "inventory") renderInventory();
  else if (currentView === "storage") renderStorage();
  else if (currentView === "reports") renderReports();
  else if (currentView === "reports-expiring") renderReports("expiring");
  else if (currentView === "reports-under") renderReports("under");
  else if (currentView === "shopping") renderShopping();
  else if (currentView === "settings") renderSettings();
  else if (currentView === "categories") renderCategories();
  else if (currentView === "addremove") renderAddRemovePage();
}

function renderCategories() {
  layout(`<section class="section"><h2>${tr("categoriesTitle")}</h2><button class="primary" id="newCategory">${tr("addCategory")}</button><div class="list" style="margin-top:12px">${categories.map(c=>`
    <div class="item"><strong>${esc(categoryPath(c.id))}</strong><div class="row"><button class="secondary" data-edit-category="${c.id}">${tr("edit")}</button><button class="danger-btn" data-delete-category="${c.id}">${tr("delete")}</button></div></div>`).join("") || `<div class="empty">${tr("none")}</div>`}</div></section>`);
  document.querySelector("#newCategory")?.addEventListener("click", () => categoryForm());
  document.querySelectorAll<HTMLElement>("[data-edit-category]").forEach(b=>b.onclick=()=>categoryForm(b.dataset.editCategory));
  document.querySelectorAll<HTMLElement>("[data-delete-category]").forEach(b=>b.onclick=async()=>{if(confirm(`${tr("delete")}?`)){await db.deleteCategory(b.dataset.deleteCategory!); await load();}});
}

function categoryForm(id?: string) {
  const existing = categories.find(c=>c.id===id);
  const parentOptions = `<option value="">—</option>` + categories.filter(c=>c.id!==id).map(c=>`<option value="${esc(c.id)}" ${c.id===existing?.parentId?`selected`:``}>${esc(categoryPath(c.id))}</option>`).join("");
  showModal(`<h2>${existing ? tr("edit") : tr("addCategory")}</h2><div class="field"><label>${tr("categoryName")}</label><input id="categoryName" value="${esc(existing?.name ?? "")}"></div>
  <div class="field"><label>${tr("parentLabel")}</label><select id="parent">${parentOptions}</select></div>
  <div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button><button class="primary" id="save">${tr("save")}</button></div>`, async()=>{
    const name = document.querySelector<HTMLInputElement>("#categoryName")!.value.trim();
    const parent = document.querySelector<HTMLSelectElement>('#parent')!.value || undefined;
    if(!name) return;
    await db.putCategory({id: id ?? uid(), name, parentId: parent});
    await load();
  });
}

function renderDashboard() {
  const expiring = stock.filter(s => daysUntil(s.bestBefore) <= 7).sort((a,b) => daysUntil(a.bestBefore)-daysUntil(b.bestBefore));
  layout(`
    <section class="hero">
      <h2>${tr("dashboardTitle")}</h2>
      <p class="muted">${tr("dashboardDescription", { count: String(expiring.length) })}</p>
    </section>
    <section class="section">
      <h2>${tr("expiringTitle")}</h2>
      <div class="list">${expiring.length ? expiring.map(stockRow).join("") : `<div class="empty">${tr("noExpiry")}</div>`}</div>
    </section>`);
  bindStockActions();
}

function stockRow(s: Stock) {
  const days = daysUntil(s.bestBefore);
  const cls = days < 0 ? "danger" : days <= 3 ? "warning" : "";
  return `<div class="item">
    <div><strong>${esc(itemName(s.itemId))}</strong><div class="small">${esc(storageName(s.storageId))} · ${s.amount} · ${formatBestBefore(s.bestBefore)}</div></div>
    <span class="badge ${cls}">${days === Infinity ? "No date" : days < 0 ? "Expired" : `${days}d`}</span>
  </div>`;
}

function renderAddRemovePage() {
  layout(`
    <section class="hero"><h2>${tr("addRemoveTitle")}</h2><p class="muted">${tr("addRemoveHint")}</p>
      <div class="row equal-buttons"><button class="primary" id="scan">${tr("scanBarcode")}</button><button class="secondary" id="addManual">${tr("addManual")}</button></div>
    </section>
    <div class="search"><input id="manualSearch" placeholder="${tr("searchPlaceholder")}"></div>
    <div class="list" id="searchResults"></div>`);
  document.querySelector("#scan")?.addEventListener("click", openScanner);
  document.querySelector("#addManual")?.addEventListener("click", () => newItemForm());
  const input = document.querySelector<HTMLInputElement>("#manualSearch")!;
  const update = () => {
    const q = input.value.toLowerCase();
    const matches = items.filter(i => i.name.toLowerCase().includes(q) || itemCategoryLabel(i).toLowerCase().includes(q));
    document.querySelector("#searchResults")!.innerHTML = matches.map(i => `
      <div class="item"><div><strong>${esc(i.name)}</strong><div class="small">Stock: ${totalForItem(i.id)} · ${esc(itemCategoryLabel(i))}</div></div>
      <div class="row"><button class="secondary" data-add="${i.id}">${tr("add")}</button><button class="secondary" data-remove="${i.id}">${tr("remove")}</button></div></div>`).join("") || `<div class="empty">${tr("noMatches")}</div>`;
    document.querySelectorAll<HTMLElement>("[data-add]").forEach(b => b.onclick = () => adjustItem(b.dataset.add!, 1));
    document.querySelectorAll<HTMLElement>("[data-remove]").forEach(b => b.onclick = () => adjustItem(b.dataset.remove!, -1));
  };
  input.addEventListener("input", update); update();
}

function renderInventory(initialFilter?: string) {
  const categoryOptions = categories.map(c=>`<option value="${esc(c.id)}">${esc(categoryPath(c.id))}</option>`).join("");
  layout(`<section class="section"><h2>${tr("inventoryTitle")}</h2>
    <div class="row"><select id="categoryFilter"><option value="all">${tr("allTitle")}</option>${categoryOptions}</select>
    <input id="inventorySearch" placeholder="${tr("searchPlaceholder")}"></div>
    <div class="tabs"><button data-filter="all">All</button>${storage.map(s=>`<button data-filter="${s.id}">${esc(storagePath(s.id))}</button>`).join("")}</div>
    <div class="list" id="inventoryList"></div></section>`);
  const renderList = (filter="all") => {
    const q = (document.querySelector<HTMLInputElement>("#inventorySearch")?.value || "").toLowerCase();
    const cat = document.querySelector<HTMLSelectElement>("#categoryFilter")!.value;
    const rows = items.filter(i => {
      const categoryId = getCategoryId(i.category);
      return (filter==="all" || stock.some(s=>s.itemId===i.id && s.storageId===filter))
        && (cat==="all" || categoryId === cat)
        && (i.name.toLowerCase().includes(q) || itemCategoryLabel(i).toLowerCase().includes(q));
    }).map(i => {
      const rows = stock.filter(s=>s.itemId===i.id && (filter==="all" || s.storageId===filter));
      return `<div class="item"><div><strong>${esc(i.name)}</strong><div class="small">${rows.map(s=>`${esc(storagePath(s.storageId))}: ${s.amount}${s.bestBefore ? ` · ${formatBestBefore(s.bestBefore)}`:""}`).join(" | ") || "No stock"} · ${esc(itemCategoryLabel(i))}</div></div><div class="row"><button class="secondary" data-listings="${i.id}">${tr("viewListings")}</button><button class="secondary" data-edit-item="${i.id}">${tr("edit")}</button><button class="danger-btn" data-delete-item="${i.id}">${tr("delete")}</button></div><span class="badge">${totalForItem(i.id)}</span></div>`;
    }).join("");
    document.querySelector("#inventoryList")!.innerHTML = rows || `<div class="empty">${tr("noInventory")}</div>`;
    document.querySelectorAll<HTMLElement>("[data-listings]").forEach(b=>b.onclick=()=>showItemListings(b.dataset.listings!));
    document.querySelectorAll<HTMLElement>("[data-edit-item]").forEach(b=>b.onclick=()=>{
      const id = b.dataset.editItem!; const it = items.find(x=>x.id===id)!; newItemForm("",{name:it.name,category:getCategoryLabel(it.category),itemSize:String(it.itemSize),itemSizeUnit:it.itemSizeUnit,minimum:String(it.minimum),barcode:it.barcode,notes:it.notes,storage:storage.find(s=>stock.filter(x=>x.itemId===id&&x.storageId===s.id).reduce((sum,x)=>sum+x.amount,0) > 0 ? s.id : "")}, id);
    });
    document.querySelectorAll<HTMLElement>("[data-delete-item]").forEach(b=>b.onclick=async()=>{
      const id = b.dataset.deleteItem!;
      if (totalForItem(id) > 0) { alert("Cannot delete item while it has stock."); return; }
      if (confirm(`${tr("delete")}?`)) { await db.deleteItem(id); await load(); }
    });
  };
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(b => b.onclick=()=>renderList(b.dataset.filter));
  document.querySelector<HTMLInputElement>("#inventorySearch")?.addEventListener("input",()=>renderList(initialFilter||"all"));
  document.querySelector<HTMLSelectElement>("#categoryFilter")?.addEventListener("change",()=>renderList(initialFilter||"all"));
  renderList(initialFilter||"all");
}

function renderStorage() {
  const buildTree = (parentId?: string, level = 0) => {
    return storage.filter(s => s.parentId === parentId).map(s => `
      <div class="tree-item" style="margin-left:${level * 18}px"><div class="item"><div><strong>${esc(s.name)}</strong><div class="small">${esc(storagePath(s.id))}</div></div><div class="row"><button class="secondary" data-view="${s.id}">${tr("inventoryTitle")}</button><button class="secondary" data-edit="${s.id}">${tr("edit")}</button><button class="danger-btn" data-delete="${s.id}">${tr("delete")}</button></div></div></div>${buildTree(s.id, level + 1).join("")}`);
  };
  const treeHtml = buildTree().join("") || `<div class="empty">${tr("noStoragePlaces")}</div>`;
  layout(`<section class="section"><h2>${tr("storageTitle")}</h2><button class="primary" id="newStorage">${tr("addStoragePlace")}</button><div class="list" style="margin-top:12px">${treeHtml}</div></section>`);
  document.querySelector("#newStorage")?.addEventListener("click",()=>storageForm());
  document.querySelectorAll<HTMLElement>("[data-view]").forEach(b=>b.onclick=()=>{currentView="inventory"; renderInventory(b.dataset.view);});
  document.querySelectorAll<HTMLElement>("[data-edit]").forEach(b=>b.onclick=()=>storageForm(b.dataset.edit));
  document.querySelectorAll<HTMLElement>("[data-delete]").forEach(b=>b.onclick=async()=>{
    const id = b.dataset.delete!;
    if (stock.some(s => s.storageId === id)) {alert("Cannot delete storage place while it has stock."); return;}
    if(confirm(`${tr("delete")}?`)){await db.deleteStorage(id); await load();}
  });
}

function renderReports(section: "expiring" | "under" = "expiring") {
  const expiring = stock.filter(s => daysUntil(s.bestBefore) <= 7);
  const under = items.filter(i => totalForItem(i.id) < i.minimum);
  layout(`<section class="section"><h2>${tr("reportsTitle")}</h2>
    <div class="row"><button class="secondary" data-report="expiring">${tr("expiringTitle")}</button><button class="secondary" data-report="under">${tr("underMinimumTitle")}</button></div>
    ${section === "expiring" ? `<div class="list">${expiring.map(stockRow).join("") || `<div class="empty">${tr("none")}</div>`}</div>` : `<div class="list">${under.map(i=>`<div class="item"><div><strong>${esc(i.name)}</strong><div class="small">${tr("shoppingListTitle")}: ${totalForItem(i.id)} · ${tr("minimumLabel")}: ${i.minimum}</div></div><button class="secondary" data-shop="${i.id}">${tr("shoppingListTitle")}</button></div>`).join("") || `<div class="empty">${tr("none")}</div>`}</div>`}
  </section>`);
  document.querySelectorAll<HTMLElement>("[data-report]").forEach(b=>b.onclick=()=>{currentView = b.dataset.report === "under" ? "reports-under" : "reports-expiring"; render();});
  document.querySelectorAll<HTMLElement>("[data-shop]").forEach(b=>b.onclick=async()=>{const i=items.find(x=>x.id===b.dataset.shop)!;await db.putShopping({id:uid(),itemId:i.id,name:i.name,amount:Math.max(i.minimum-totalForItem(i.id),1),checked:false});await load();});
}

function renderShopping() {
  layout(`<section class="section"><h2>${tr("shoppingListTitle")}</h2><div class="row equal-buttons"><button class="primary" id="addShoppingBarcode">${tr("addByBarcode")}</button><button class="secondary" id="addShoppingName">${tr("addByName")}</button></div><div class="list">${shopping.map(s=>`<div class="item"><label><input type="checkbox" data-check="${s.id}" ${s.checked?"checked":""}> ${esc(s.name)} × ${s.amount}</label><button class="danger-btn" data-shop-delete="${s.id}">${tr("delete")}</button></div>`).join("") || `<div class="empty">${tr("shoppingListEmpty")}</div>`}</div></section>`);
  document.querySelectorAll<HTMLInputElement>("[data-check]").forEach(x=>x.onchange=async()=>{const s=shopping.find(y=>y.id===x.dataset.check)!;s.checked=x.checked;await db.putShopping(s);await load();});
  document.querySelectorAll<HTMLElement>("[data-shop-delete]").forEach(x=>x.onclick=async()=>{await db.deleteShopping(x.dataset.shopDelete!);await load();});
  document.querySelector("#addShoppingBarcode")?.addEventListener("click",()=>openShoppingBarcode());
  document.querySelector("#addShoppingName")?.addEventListener("click",()=>openShoppingName());
}

function openShoppingBarcode() {
  showModal(`<h2>${tr("scanBarcode")}</h2><div class="field"><label>${tr("barcodeLabel")}</label><input id="shoppingBarcode" type="text"></div><div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button><button class="primary" id="save">${tr("add")}</button></div>`, async()=>{
    const value = document.querySelector<HTMLInputElement>("#shoppingBarcode")!.value.trim();
    if(!value) return;
    const item = items.find(i=>i.barcode===value);
    if(item){ await db.putShopping({id:uid(),itemId:item.id,name:item.name,amount:1,checked:false}); }
    else{ await db.putShopping({id:uid(),name:value,amount:1,checked:false}); }
    await load();
  });
}

function openShoppingName() {
  showModal(`<h2>${tr("addByName")}</h2><div class="field"><label>${tr("nameLabel")}</label><input id="shoppingName" type="text"></div><div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button><button class="primary" id="save">${tr("add")}</button></div>`, async()=>{
    const value = document.querySelector<HTMLInputElement>("#shoppingName")!.value.trim();
    if(!value) return;
    const item = items.find(i=>i.name.toLowerCase()===value.toLowerCase());
    if(item){ await db.putShopping({id:uid(),itemId:item.id,name:item.name,amount:1,checked:false}); }
    else{ await db.putShopping({id:uid(),name:value,amount:1,checked:false}); }
    await load();
  });
}

function renderSettings() {
  layout(`<section class="section"><h2>${tr("settingsTitle")}</h2>
    <div class="card"><h3>${tr("appearanceTitle")}</h3><button class="secondary" id="toggleTheme">${tr("toggleTheme")}</button></div>
    <div class="card" style="margin-top:12px"><h3>${tr("languageTitle")}</h3><div class="field"><label>${tr("languageLabel")}</label><select id="languageSelect"><option value="en">${tr("english")}</option><option value="de">${tr("german")}</option></select></div></div>
    <div class="card" style="margin-top:12px"><h3>${tr("itemSizeUnitLabel")}</h3><button class="secondary" id="newUnit">${tr("addUnit")}</button><div class="list" style="margin-top:12px">${sizeUnits.map(u=>`<div class="item"><strong>${esc(u)}</strong><div class="row"><button class="secondary" data-edit-unit="${esc(u)}">${tr("edit")}</button><button class="danger-btn" data-delete-unit="${esc(u)}">${tr("delete")}</button></div></div>`).join("")}</div></div>
    <div class="card" style="margin-top:12px"><h3>${tr("csvTitle")}</h3><div class="row"><button class="secondary" id="export">${tr("exportCsv")}</button><label class="secondary">${tr("importCsv")}<input id="import" type="file" accept=".csv,text/csv" hidden></label></div><p class="small muted">${tr("importNote")}</p></div>
  </section>`);
  document.querySelector("#toggleTheme")?.addEventListener("click",()=>{ currentTheme = currentTheme === "dark" ? "light" : "dark"; applyTheme(); });
  const languageSelect = document.querySelector<HTMLSelectElement>("#languageSelect");
  if(languageSelect){languageSelect.value = currentLanguage; languageSelect.addEventListener("change",()=>setLanguage(languageSelect.value as Lang));}
  document.querySelector("#newUnit")?.addEventListener("click",()=>unitForm());
  document.querySelectorAll<HTMLElement>("[data-edit-unit]").forEach(b=>b.onclick=()=>unitForm(b.dataset.editUnit));
  document.querySelectorAll<HTMLElement>("[data-delete-unit]").forEach(b=>b.onclick=async()=>{if(confirm(`${tr("delete")}?`)){sizeUnits = sizeUnits.filter(u=>u!==b.dataset.deleteUnit); saveSizeUnits(); renderSettings();}});
  document.querySelector("#export")?.addEventListener("click",exportCsv);
  document.querySelector<HTMLInputElement>("#import")?.addEventListener("change", e=>importCsv((e.target as HTMLInputElement).files?.[0]));
}

function openMenu() {
  const overlay = document.querySelector("#overlay")!;
  overlay.innerHTML = `<div class="drawer"><div class="drawer-panel"><h2>${tr("homeStorageTitle")}</h2>
    ${[
      ["dashboard",tr("dashboardNav")],["addremove",tr("addremoveNav")],["inventory",tr("inventoryNav")],["storage",tr("storageNav")],["reports-expiring",tr("reportsNav")],["shopping",tr("shoppingNav")],["categories",tr("categoriesNav")],["settings",tr("settingsNav")]
    ].map(([id,label])=>`<button data-nav="${id}">${label}</button>`).join("")}
    <hr><button disabled>Recipes — future release</button><button disabled>Wishlist — future release</button>
  </div></div>`;
  overlay.querySelector(".drawer")?.addEventListener("click",e=>{if(e.target===e.currentTarget)overlay.innerHTML=""});
  overlay.querySelectorAll<HTMLElement>("[data-nav]").forEach(b=>b.onclick=()=>{currentView=b.dataset.nav!;overlay.innerHTML="";render();});
}

function openAddRemove() {
  currentView="addremove"; renderAddRemovePage();
}

function storageForm(id?: string, onComplete?: ()=>Promise<void>, onCancel?: ()=>Promise<void>) {
  const existing = storage.find(s=>s.id===id);
  const parentOptions = `<option value="">—</option>` + storage.filter(s=>s.id!==id).map(s=>`<option value="${esc(s.id)}" ${s.id===existing?.parentId?`selected`:``}>${esc(storagePath(s.id))}</option>`).join("");
  showModal(`<h2>${existing?tr("edit"):tr("addStoragePlace")}</h2><button class="icon-btn close-button" id="closeX" aria-label="${tr("cancel")}">×</button><div class="field"><label>${tr("nameLabel")}</label><input id="storageName" value="${esc(existing?.name??"")}"></div>
  <div class="field"><label>${tr("parentLabel")}</label><select id="parent">${parentOptions}</select></div>
  <div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button><button class="primary" id="save">${tr("save")}</button></div>`, async()=>{
    const name=document.querySelector<HTMLInputElement>("#storageName")!.value.trim();
    const parent=document.querySelector<HTMLSelectElement>('#parent')!.value || undefined;
    if(!name)return;
    await db.putStorage({id:id??uid(),name,parentId:parent});
    await load();
    if(onComplete) await onComplete();
  }, onCancel);
}

function showModal(html:string,onSave?:()=>Promise<void>,onCancel?:()=>Promise<void>) {
  const overlay=document.querySelector("#overlay")!;
  overlay.innerHTML=`<div class="modal"><div class="modal-box">${html}</div></div>`;
  overlay.querySelector("#cancel")?.addEventListener("click",async()=>{if(onCancel){await onCancel();}else{overlay.innerHTML="";}});
  overlay.querySelector("#closeX")?.addEventListener("click",async()=>{if(onCancel){await onCancel();}else{overlay.innerHTML="";}});
  overlay.querySelector("#save")?.addEventListener("click",async()=>{await onSave?.();overlay.innerHTML="";});
}

function unitForm(name?: string) {
  const existing = name ?? "";
  showModal(`<h2>${existing ? tr("edit") : tr("addUnit")}</h2><button class="icon-btn close-button" id="closeX" aria-label="${tr("cancel")}">×</button><div class="field"><label>${tr("unitNameLabel")}</label><input id="unitName" value="${esc(existing)}"></div>
    <div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button><button class="primary" id="save">${tr("save")}</button></div>`, async()=>{
    const value = document.querySelector<HTMLInputElement>("#unitName")!.value.trim();
    if(!value) return;
    const existingIndex = sizeUnits.findIndex(u=>u===existing);
    if(existingIndex >= 0) sizeUnits[existingIndex] = value;
    else if(!sizeUnits.includes(value)) sizeUnits.push(value);
    saveSizeUnits();
    renderSettings();
  });
}

async function adjustItem(itemId:string, delta:number) {
  const item=items.find(i=>i.id===itemId)!;
  const itemStock = stock.filter(s=>s.itemId===itemId);
  const majorityStorage = itemStock.reduce((best, s) => {
    const current = itemStock.filter(x=>x.storageId===s.storageId).reduce((sum,x)=>sum+x.amount,0);
    const bestAmt = best ? itemStock.filter(x=>x.storageId===best.storageId).reduce((sum,x)=>sum+x.amount,0) : 0;
    return current > bestAmt ? s : best;
  }, itemStock[0]);
  if(delta>0) {
    if(storage.length===0){alert("Create a storage place first.");currentView="storage";render();return;}
    const defaultStorage = majorityStorage?.storageId || storage[0].id;
    const options=storage.map(s=>`<option value="${s.id}"${s.id===defaultStorage?` selected`:``}>${esc(s.name)}</option>`).join("");
    showModal(`<h2>Add ${esc(item.name)}</h2><div class="field"><label>${tr("storagePlaceLabel")}</label><select id="s">${options}</select></div><div class="field"><label>${tr("bestBeforeLabel")}</label><input id="bb" type="text" placeholder="mmyy"></div><div class="field"><label>${tr("amountLabel")}</label><div class="amount-row"><button class="secondary small" type="button" id="decrementAmount">-</button><input id="amt" type="number" min="1" value="1"><button class="secondary small" type="button" id="incrementAmount">+</button></div></div><div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button><button class="primary" id="save">${tr("add")}</button></div>`,async()=>{
      const sid=document.querySelector<HTMLSelectElement>("#s")!.value;
      const amount=Number(document.querySelector<HTMLInputElement>("#amt")!.value)||1;
      const bb=parseBestBefore(document.querySelector<HTMLInputElement>("#bb")!.value);
      const existing=stock.find(s=>s.itemId===itemId&&s.storageId===sid&&s.bestBefore===bb);
      if(existing){existing.amount+=amount;await db.putStock(existing)}
      else await db.putStock({id:uid(),itemId,storageId:sid,amount,bestBefore:bb});
      await load();
    });
    document.querySelector<HTMLButtonElement>("#incrementAmount")?.addEventListener("click",()=>{
      const amt=document.querySelector<HTMLInputElement>("#amt")!;
      amt.value=String((Number(amt.value)||0)+1);
    });
    document.querySelector<HTMLButtonElement>("#decrementAmount")?.addEventListener("click",()=>{
      const amt=document.querySelector<HTMLInputElement>("#amt")!;
      amt.value=String(Math.max(1,(Number(amt.value)||1)-1));
    });
  } else {
    const candidates=stock.filter(s=>s.itemId===itemId&&s.amount>0);
    if(!candidates.length){alert("No stock available.");return;}
    const options=candidates.map(s=>`<option value="${s.id}">${esc(storageName(s.storageId))} — ${s.amount}${s.bestBefore?` · ${s.bestBefore}`:""}</option>`).join("");
    showModal(`<h2>Remove ${esc(item.name)}</h2><div class="field"><label>${tr("storagePlaceLabel")}</label><select id="s">${options}</select></div><div class="field"><label>${tr("amountLabel")}</label><div class="amount-row"><button class="secondary small" type="button" id="decrementAmount">-</button><input id="amt" type="number" min="1" value="1"><button class="secondary small" type="button" id="incrementAmount">+</button></div></div><div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button><button class="primary" id="save">${tr("remove")}</button></div>`,async()=>{
      const sid=document.querySelector<HTMLSelectElement>("#s")!.value;
      const amount=Number(document.querySelector<HTMLInputElement>("#amt")!.value)||1;
      const s=stock.find(x=>x.id===sid)!;
      s.amount=Math.max(0,s.amount-amount);
      if(s.amount===0)await db.deleteStock(s.id);else await db.putStock(s);
      await load();
    });
    document.querySelector<HTMLButtonElement>("#incrementAmount")?.addEventListener("click",()=>{
      const amt=document.querySelector<HTMLInputElement>("#amt")!;
      amt.value=String((Number(amt.value)||0)+1);
    });
    document.querySelector<HTMLButtonElement>("#decrementAmount")?.addEventListener("click",()=>{
      const amt=document.querySelector<HTMLInputElement>("#amt")!;
      amt.value=String(Math.max(1,(Number(amt.value)||1)-1));
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
  if(item){
    if(totalForItem(item.id)===0){
      showModal(`<h2>${tr("nameLabel")}: ${esc(item.name)}</h2><p class="muted">${tr("noInventory")}</p><div class="actions"><button class="secondary" id="createNew">${tr("add")}</button><button class="primary" id="changeItem">${tr("edit")}</button></div>`, async()=>{});
      document.querySelector<HTMLButtonElement>('#createNew')?.addEventListener('click',()=>{document.querySelector('#overlay')!.innerHTML=''; adjustItem(item.id,1)});
      document.querySelector<HTMLButtonElement>('#changeItem')?.addEventListener('click',()=>{document.querySelector('#overlay')!.innerHTML=''; newItemForm('',{},item.id)});
    } else adjustItem(item.id,1);
  } else newItemForm(barcode);
}

function showItemListings(itemId: string){
  const i = items.find(x=>x.id===itemId)!;
  const rows = stock.filter(s=>s.itemId===itemId).map(s=>`<div class="item"><div><strong>${esc(storageName(s.storageId))}</strong><div class="small">${s.amount} · ${s.bestBefore?formatBestBefore(s.bestBefore):tr('noDate')}</div></div></div>`).join("") || `<div class="empty">${tr("noInventory")}</div>`;
  showModal(`<h2>${esc(i.name)}</h2><div class="list">${rows}</div><div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button></div>`, async()=>{});
}

function newItemForm(barcode="", prefill: Partial<Record<string,string>> = {}, editId?: string){
  const options=storage.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
  const unitOptions=sizeUnits.map(u=>`<option value="${esc(u)}">${esc(u)}</option>`).join("");
  const defaultAmount = prefill.amount || "1";
  const defaultCategory = prefill.category ? getCategoryLabel(prefill.category) : "";
  const defaultItemSize = prefill.itemSize || "";
  const defaultItemSizeUnit = prefill.itemSizeUnit || sizeUnits[0] || "amount";
  const defaultMinimum = prefill.minimum || "0";
  const defaultBarcode = barcode || prefill.barcode || "";
  const defaultBestBefore = prefill.bestBefore || "";
  const defaultNotes = prefill.notes || "";
  const defaultName = prefill.name || "";
  const defaultStorage = prefill.storage || (storage[0]?.id ?? "");
  const storageOptions = storage.map(s => `<option value="${esc(s.id)}"${s.id===defaultStorage ? " selected" : ""}>${esc(s.name)}</option>`).join("");
  const unitOptionsWithSelected = sizeUnits.map(u=>`<option value="${esc(u)}"${u===defaultItemSizeUnit ? " selected" : ""}>${esc(u)}</option>`).join("");
  showModal(`<h2>${editId ? tr("edit") : tr("newItemTitle")}</h2><button class="icon-btn close-button" id="closeX" aria-label="${tr("cancel")}">×</button>
    <div class="field"><label>${tr("nameLabel")}</label><input id="name" type="text" value="${esc(defaultName)}"></div>
    <div class="field"><label>${tr("amountLabel")}</label><div class="amount-row"><button class="secondary small" type="button" id="decrementAmount">-</button><input id="amount" type="number" min="1" value="${esc(defaultAmount)}"><button class="secondary small" type="button" id="incrementAmount">+</button></div></div>
    <div class="field"><label>${tr("categoryLabel")}</label><input list="categoryOptions" id="category" type="text" value="${esc(defaultCategory)}"></div>
    <datalist id="categoryOptions">${categories.map(c=>`<option value="${esc(c.name)}"></option>`).join("")}</datalist>
    <div class="field"><label>${tr("storagePlaceLabel")}</label><div class="field-row"><select id="storage">${storageOptions}</select><button class="secondary" type="button" id="newStorageFromItem">+ ${tr("addStoragePlace")}</button></div></div>
    <div class="field"><label>${tr("itemSizeLabel")}</label><div class="field-row"><input id="itemSize" type="number" min="0" step="any" value="${esc(defaultItemSize)}"><select id="itemSizeUnit">${unitOptionsWithSelected}</select></div></div>
    <div class="field"><label>${tr("bestBeforeLabel")}</label><input id="bestBefore" type="text" placeholder="mmyy" value="${esc(defaultBestBefore)}"></div>
    <div class="field"><label>${tr("minimumLabel")}</label><input id="minimum" type="number" min="0" value="${esc(defaultMinimum)}"></div>
    <div class="field"><label>${tr("barcodeLabel")}</label><input id="barcode" type="text" value="${esc(defaultBarcode)}"></div>
    <div class="field"><label>${tr("notesLabel")}</label><textarea id="notes">${esc(defaultNotes)}</textarea></div>
    <div class="field"><label>${tr("recipesLabel")}</label><div class="recipes-list">${tr("noRecipes")}</div></div>
    <div class="actions"><button class="secondary" id="cancel">${tr("cancel")}</button><button class="primary" id="save">${editId ? tr("save") : tr("create")}</button></div>`,async()=>{
      const name=document.querySelector<HTMLInputElement>("#name")!.value.trim();
      if(!name)return;
      const categoryValue = document.querySelector<HTMLInputElement>("#category")!.value.trim();
      const bestBeforeValue = parseBestBefore(document.querySelector<HTMLInputElement>("#bestBefore")!.value);
      const categoryId = getCategoryId(categoryValue) || categoryValue;
      const item:Item={id: editId ?? uid(),name,category:categoryId,itemSize:Number(document.querySelector<HTMLInputElement>("#itemSize")!.value)||0,itemSizeUnit:document.querySelector<HTMLSelectElement>("#itemSizeUnit")!.value as Item["itemSizeUnit"],barcode:document.querySelector<HTMLInputElement>("#barcode")!.value.trim(),notes:document.querySelector<HTMLTextAreaElement>("#notes")!.value,recipeRef:"",minimum:Number(document.querySelector<HTMLInputElement>("#minimum")!.value)||0};
      if(categoryValue && !getCategoryByValue(categoryValue)){
        await db.putCategory({id:uid(),name:categoryValue});
      }
      await db.putItem(item);
      const sid=document.querySelector<HTMLSelectElement>("#storage")?.value || defaultStorage;
      const amount=Number(document.querySelector<HTMLInputElement>("#amount")!.value)||1;
      if(sid)await db.putStock({id:uid(),itemId:item.id,storageId:sid,amount,bestBefore:bestBeforeValue});
      await load();
    });
  document.querySelector<HTMLButtonElement>("#incrementAmount")?.addEventListener("click",()=>{
    const amt = document.querySelector<HTMLInputElement>("#amount")!;
    amt.value = String((Number(amt.value)||0) + 1);
  });
  document.querySelector<HTMLButtonElement>("#decrementAmount")?.addEventListener("click",()=>{
    const amt = document.querySelector<HTMLInputElement>("#amount")!;
    const value = Math.max(1, (Number(amt.value)||1) - 1);
    amt.value = String(value);
  });
  document.querySelector<HTMLButtonElement>("#newStorageFromItem")?.addEventListener("click",async()=>{
    const state: Partial<Record<string,string>> = {
      name: document.querySelector<HTMLInputElement>("#name")!.value,
      amount: document.querySelector<HTMLInputElement>("#amount")!.value,
      category: document.querySelector<HTMLInputElement>("#category")!.value,
      storage: document.querySelector<HTMLSelectElement>("#storage")!.value,
      itemSize: document.querySelector<HTMLInputElement>("#itemSize")!.value,
      itemSizeUnit: document.querySelector<HTMLSelectElement>("#itemSizeUnit")!.value,
      bestBefore: document.querySelector<HTMLInputElement>("#bestBefore")!.value,
      minimum: document.querySelector<HTMLInputElement>("#minimum")!.value,
      barcode: document.querySelector<HTMLInputElement>("#barcode")!.value,
      notes: document.querySelector<HTMLTextAreaElement>("#notes")!.value,
    };
    await storageForm(undefined, async()=>{ await load(); newItemForm(barcode, state, editId); }, async()=>{ await load(); newItemForm(barcode, state, editId); });
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