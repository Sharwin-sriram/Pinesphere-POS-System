import { httpClient } from "../../lib/authService";

type ApiCollection<T> = T[] | { results?: T[] };

type BackendSupplier = {
 id: number;
 supplier_name: string;
 phone: string;
 email: string;
 address: string;
};

type BackendInventoryItem = {
 id: number;
 item_name: string;
 sku: string;
 category: string;
 unit_type: string;
 quantity: number;
 purchase_price: string;
 selling_price?: string;
 tax?: string;
 expiry_date: string;
 reorder_level: number;
 supplier?: BackendSupplier;
};

type BackendPurchaseOrder = {
 id: number;
 quantity: number;
 total_amount: string;
 status: string;
 order_date: string;
 inventory_item: BackendInventoryItem | number;
};

function extractCollection<T>(data: ApiCollection<T> | T) {
 if (Array.isArray(data)) {
 return data;
 }

 if (data && typeof data === "object" && "results" in data) {
 return data.results || [];
 }

 return [];
}

function mapSupplier(supplier?: BackendSupplier) {
 if (!supplier) {
 return undefined;
 }

 return {
 id: supplier.id,
 name: supplier.supplier_name,
 contact_person: supplier.supplier_name,
 mobile: supplier.phone,
 email: supplier.email,
 gst_number: "",
 is_active: true,
 };
}

function mapInventoryItem(item: BackendInventoryItem) {
 return {
 id: item.id,
 name: item.item_name,
 sku: item.sku,
 category: item.category,
 unit_type: item.unit_type,
 current_stock: String(item.quantity ?? 0),
 reorder_level: String(item.reorder_level ?? 0),
 purchase_price: String(item.purchase_price ?? "0"),
 expiry_date: item.expiry_date,
 is_active: true,
 supplier: mapSupplier(item.supplier),
 };
}

function mapPurchaseOrder(order: BackendPurchaseOrder) {
 const inventoryItem =
 typeof order.inventory_item === "object"
 ? order.inventory_item
 : null;

 return {
 id: order.id,
 po_number: `PO-${String(order.id).padStart(4, "0")}`,
 supplier: inventoryItem?.supplier ? mapSupplier(inventoryItem.supplier) : undefined,
 total: String(order.total_amount ?? "0"),
 status: order.status,
 };
}

export const getInventoryItems = async () => {
 const response = await httpClient.get("/api/inventory/items/");
 return extractCollection<BackendInventoryItem>(response.data).map(mapInventoryItem);
};

export const getSuppliers = async () => {
 const response = await httpClient.get("/api/inventory/suppliers/");
 return extractCollection<BackendSupplier>(response.data).map(mapSupplier);
};

export const getPurchaseOrders = async () => {
 const response = await httpClient.get("/api/inventory/purchase-orders/");
 return extractCollection<BackendPurchaseOrder>(response.data).map(mapPurchaseOrder);
};

export const getLowStockItems = async () => {
 const response = await httpClient.get("/api/inventory/low-stock/");
 return extractCollection<BackendInventoryItem>(response.data).map(mapInventoryItem);
};