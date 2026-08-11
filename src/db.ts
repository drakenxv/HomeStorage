export type Item = {
  id: string;
  name: string;
  category: string;
  itemSize: number;
  itemSizeUnit: "g" | "ml" | "amount";
  barcode: string;
  notes: string;
  recipeRef: string;
  minimum: number;
};

export type Stock = {
  id: string;
  itemId: string;
  storageId: string;
  amount: number;
  bestBefore?: string;
};

export type Storage = {
  id: string;
  name: string;
};

export type Shopping = {
  id: string;
  itemId?: string;
  name: string;
  amount: number;
  checked: boolean;
};

const DB_NAME = "inventory-pwa";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("items", { keyPath: "id" });
      db.createObjectStore("stock", { keyPath: "id" });
      db.createObjectStore("storage", { keyPath: "id" });
      db.createObjectStore("shopping", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function all<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function put<T>(storeName: string, value: T): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const db = {
  items: () => all<Item>("items"),
  stock: () => all<Stock>("stock"),
  storage: () => all<Storage>("storage"),
  shopping: () => all<Shopping>("shopping"),
  putItem: (x: Item) => put("items", x),
  putStock: (x: Stock) => put("stock", x),
  putStorage: (x: Storage) => put("storage", x),
  putShopping: (x: Shopping) => put("shopping", x),
  deleteStorage: (id: string) => remove("storage", id),
  deleteItem: (id: string) => remove("items", id),
  deleteStock: (id: string) => remove("stock", id),
  deleteShopping: (id: string) => remove("shopping", id),
};