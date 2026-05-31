import axios from "axios";
import { authService } from "../../lib/authService";

type ApiCollection<T> = T[] | { results?: T[]; data?: T[] };

type InventoryScope = {
 restaurantId: string;
 branchId: string;
};

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
 created_at?: string;
 updated_at?: string;
};

type BackendPurchaseOrder = {
 id: number;
 quantity: number;
 total_amount: string;
 status: string;
 order_date: string;
 inventory_item: BackendInventoryItem | number;
};

const INVENTORY_API_BASE_URL =
 process.env.NEXT_PUBLIC_INVENTORY_API_URL ||
 process.env.NEXT_PUBLIC_NODE_API_URL ||
 // Default to local Django dev server (was previously Node on 5000)
 "http://127.0.0.1:8000";

const inventoryHttpClient = axios.create({
 baseURL: INVENTORY_API_BASE_URL,
 timeout: 10000,
 headers: {
 "Content-Type": "application/json",
 },
});

inventoryHttpClient.interceptors.request.use((config) => {
 if (typeof window !== "undefined") {
 const token = localStorage.getItem("pos_token");
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 }

 return config;
});

function extractCollection<T>(data: ApiCollection<T> | T) {
 if (Array.isArray(data)) {
 return data;
 }

 if (data && typeof data === "object") {
 if ("data" in data && Array.isArray(data.data)) {
 return data.data;
 }

 if ("results" in data && Array.isArray(data.results)) {
 return data.results;
 }
 }

 return [];
}

function getInventoryScope(): InventoryScope {
 const user = authService.getCurrentUser?.() || authService.getUserInfo?.() || {};

 const restaurantId =
 user.restaurant?.id ||
 user.restaurant_id ||
 user.restaurantId ||
 user.restaurant ||
 "r1";

 const branchId =
 user.branch?.id ||
 user.branch_id ||
 user.branchId ||
 "1";

 return {
 restaurantId: String(restaurantId),
 branchId: String(branchId),
 };
}

function getInventoryParams() {
 const scope = getInventoryScope();
 return {
 restaurantId: scope.restaurantId,
 branchId: scope.branchId,
 };
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
 address: supplier.address,
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
 const response = await inventoryHttpClient.get("/api/inventory/items/", {
 params: getInventoryParams(),
 });
 return extractCollection<BackendInventoryItem>(response.data?.data ?? response.data).map(mapInventoryItem);
};

export const getSuppliers = async () => {
 const response = await inventoryHttpClient.get("/api/inventory/suppliers/", {
 params: getInventoryParams(),
 });
 return extractCollection<BackendSupplier>(response.data?.data ?? response.data).map(mapSupplier);
};

export const getPurchaseOrders = async () => {
 try {
 const response = await inventoryHttpClient.get("/api/inventory/purchase-orders/", {
 params: getInventoryParams(),
 });
 return extractCollection<BackendPurchaseOrder>(response.data?.data ?? response.data).map(mapPurchaseOrder);
 } catch {
 return [];
 }
};

export const getLowStockItems = async () => {
 const response = await inventoryHttpClient.get("/api/inventory/items/stock/low-stock/", {
 params: getInventoryParams(),
 });
 return extractCollection<BackendInventoryItem>(response.data?.data ?? response.data).map(mapInventoryItem);
};