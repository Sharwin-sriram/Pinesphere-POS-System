import { httpClient } from "../../lib/authService";

export type KDSOrder = {
 id: string;
 backendId: string;
 table: string;
 items: number;
 status: string;
 time: string;
 priority: string;
 kotNumber?: string;
 rawStatus?: string;
};


type KitchenDisplaySystem = {
 id: string;
 preparation_time_default?: number;
 kitchens?: Array<{
 id: string;
 name: string;
 }>;
};

type KitchenTicket = {
 id: string;
 order: string;
 kitchen: string;
 department?: string | null;
 kot_number?: string;
 status: string;
 item_count?: number;
 special_instructions?: string | null;
 created_at?: string;
};

type KdsBootstrap = {
 kitchenId: string | null;
 kitchenName: string | null;
 systemId: string | null;
 preparationTimeDefault: number;
 orders: KDSOrder[];
 stats: {
 totalOrders: number;
 preparing: number;
 ready: number;
 delayed: number;
 };
};

const DEFAULT_PREPARATION_MINUTES = 15;

function shortId(value: string) {
 return value.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function buildPriority(itemCount: number) {
 if (itemCount >= 6) {
 return "High";
 }

 if (itemCount >= 3) {
 return "Medium";
 }

 return "Low";
}

function buildTimeLabel(preparationTimeDefault: number) {
 return `${preparationTimeDefault || DEFAULT_PREPARATION_MINUTES} mins`;
}

function mapTicket(
 ticket: KitchenTicket,
 statusLabel: string,
 preparationTimeDefault: number,
): KDSOrder {
 const itemCount = ticket.item_count ?? 0;

 return {
 id: ticket.kot_number || shortId(ticket.order),
 backendId: ticket.order,
 table: `Order ${shortId(ticket.order)}`,
 items: itemCount,
 status: statusLabel,
 time: buildTimeLabel(preparationTimeDefault),
 priority: buildPriority(itemCount),
 kotNumber: ticket.kot_number,
 rawStatus: ticket.status,
 };
}

async function getFirstKitchenContext() {
 const systemsResponse = await httpClient.get("/api/kitchen/systems/");

type KdsOrder = {
 id: string;
 backendId: string;
 table: string;
 items: number;
 status: string;
 time: string;
 priority: string;
 customer?: string;
 amount?: string;
 payment?: string;
 chef?: string;
 kotNumber?: string;
 rawStatus?: string;
};

const DEFAULT_PREPARATION_MINUTES = 15;

function shortId(value: string) {
 return value.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function buildPriority(itemCount: number) {
 if (itemCount >= 6) return "High";
 if (itemCount >= 3) return "Medium";
 return "Low";
}

function buildTimeLabel(preparationTimeDefault: number) {
 return `${preparationTimeDefault || DEFAULT_PREPARATION_MINUTES} mins`;
}

function mapTicket(ticket: KitchenTicket, statusLabel: string, preparationTimeDefault: number): KdsOrder {
 const itemCount = ticket.item_count ?? 0;
 const tableLabel = `Order ${shortId(ticket.order)}`;

 return {
 id: ticket.kot_number || shortId(ticket.order),
 backendId: ticket.order,
 table: tableLabel,
 items: itemCount,
 status: statusLabel,
 time: buildTimeLabel(preparationTimeDefault),
 priority: buildPriority(itemCount),
 customer: "-",
 amount: "-",
 payment: "Pending",
 chef: ticket.kitchen,
 kotNumber: ticket.kot_number,
 rawStatus: ticket.status,
 };
}

async function getKitchenContext() {
 const systemsResponse = await httpClient.get("/api/kds/systems/").catch(async () => {
 return httpClient.get("/api/kitchen/systems/");
 });

 const systems = Array.isArray(systemsResponse.data)
 ? systemsResponse.data
 : systemsResponse.data?.results || [];

 const system = systems[0] || null;
 const kitchen = system?.kitchens?.[0] || null;

 return { system, kitchen };
}

export async function getKdsBootstrap(): Promise<KdsBootstrap> {
 try {
 const { system, kitchen } = await getFirstKitchenContext();

 if (!system || !kitchen) {
 return {
 kitchenId: null,
 kitchenName: null,
 systemId: system?.id || null,
 preparationTimeDefault: system?.preparation_time_default || DEFAULT_PREPARATION_MINUTES,
 orders: [],
 stats: {
 totalOrders: 0,
 preparing: 0,
 ready: 0,
 delayed: 0,
 },
 };
 }

 const summaryResponse = await httpClient.get("/api/kitchen/dashboard/summary/", {
 params: {
 kitchen_id: kitchen.id,
 },
 });

 const summary = summaryResponse.data || {};
 const preparationTimeDefault =
 system.preparation_time_default || DEFAULT_PREPARATION_MINUTES;

 const orders = [
 ...(summary.pending_orders || []).map((ticket: KitchenTicket) =>
 mapTicket(ticket, "Preparing", preparationTimeDefault),
 ),
 ...(summary.preparing_orders || []).map((ticket: KitchenTicket) =>
 mapTicket(ticket, "Preparing", preparationTimeDefault),
 ),
 ...(summary.ready_orders || []).map((ticket: KitchenTicket) =>
 mapTicket(ticket, "Ready", preparationTimeDefault),
 ),
 ...(summary.delayed_orders || []).map((ticket: KitchenTicket) =>
 mapTicket(ticket, "Delayed", preparationTimeDefault),
 ),
 ];

 return {
 kitchenId: kitchen.id,
 kitchenName: kitchen.name,
 systemId: system.id,
 preparationTimeDefault,
 orders,
 stats: {
 totalOrders:
 (summary.total_pending || 0) +
 (summary.total_preparing || 0) +
 (summary.total_ready || 0) +
 (summary.total_delayed || 0),
 preparing: (summary.total_preparing || 0) + (summary.total_pending || 0),
 ready: summary.total_ready || 0,
 delayed: summary.total_delayed || 0,
 },
 };
 } catch (error) {
 console.log("KDS backend not connected yet", error);

 return {
 kitchenId: null,
 kitchenName: null,
 systemId: null,
 preparationTimeDefault: DEFAULT_PREPARATION_MINUTES,
 orders: [],
 stats: {
 totalOrders: 0,
 preparing: 0,
 ready: 0,
 delayed: 0,
 },
 };
 }
}

export async function getOrders() {
 const bootstrap = await getKdsBootstrap();
 return bootstrap.orders;
}

function normalizeStatus(status: string) {
 const map: Record<string, string> = {
 Preparing: "preparing",
 Ready: "ready",
 Delayed: "delayed",
 Served: "served",
 };

 return map[status] || status.toLowerCase();
}

function getSocketUrl(kitchenId: string) {
 const apiBaseUrl =
 process.env.NEXT_PUBLIC_KDS_SOCKET_URL ||
 process.env.NEXT_PUBLIC_SOCKET_URL ||
 process.env.NEXT_PUBLIC_API_BASE_URL ||
 process.env.NEXT_PUBLIC_API_URL ||
 "http://127.0.0.1:8000";

 const url = new URL(apiBaseUrl);
 url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
 url.pathname = `/ws/kitchen/${kitchenId}/`;
 url.search = "";
 return url.toString();
}

// UPDATE ORDER STATUS THROUGH THE DJANGO WEBSOCKET
export const updateOrderStatusAPI = async (
 kitchenId: string,
 orderId: string,
 status: string,
) => {
 if (!kitchenId) {
 throw new Error("Kitchen ID is required to update order status");
 }

 const socketUrl = getSocketUrl(kitchenId);

 return new Promise<void>((resolve, reject) => {
 const socket = new WebSocket(socketUrl);

 const system = systems[0] as KitchenDisplaySystem | undefined;
 const kitchen = system?.kitchens?.[0] || null;

 return {
 system,
 kitchen,
 preparationTimeDefault: system?.preparation_time_default || DEFAULT_PREPARATION_MINUTES,
 };
}

export async function getOrders(): Promise<KdsOrder[]> {
 try {
 const { kitchen, preparationTimeDefault } = await getKitchenContext();

 if (!kitchen) {
 return [];
 }

 const summaryResponse = await httpClient.get("/api/kds/dashboard/summary/", {
 params: {
 kitchen_id: kitchen.id,
 },
 }).catch(() => httpClient.get("/api/kitchen/dashboard/summary/", {
 params: {
 kitchen_id: kitchen.id,
 },
 }));

 const summary = summaryResponse.data || {};

 return [
 ...(summary.pending_orders || []).map((ticket: KitchenTicket) => mapTicket(ticket, "Preparing", preparationTimeDefault)),
 ...(summary.preparing_orders || []).map((ticket: KitchenTicket) => mapTicket(ticket, "Preparing", preparationTimeDefault)),
 ...(summary.ready_orders || []).map((ticket: KitchenTicket) => mapTicket(ticket, "Ready", preparationTimeDefault)),
 ...(summary.delayed_orders || []).map((ticket: KitchenTicket) => mapTicket(ticket, "Delayed", preparationTimeDefault)),
 ];
 } catch (error) {
 console.log("KDS backend not connected yet", error);
 return [];
 }
}

function normalizeStatus(status: string) {
 const map: Record<string, string> = {
 Preparing: "preparing",
 Ready: "ready",
 Delayed: "delayed",
 Served: "served",
 };

 return map[status] || status.toLowerCase();
}

function getSocketUrl(kitchenId: string) {
 const apiBaseUrl =
 process.env.NEXT_PUBLIC_KDS_SOCKET_URL ||
 process.env.NEXT_PUBLIC_SOCKET_URL ||
 process.env.NEXT_PUBLIC_API_BASE_URL ||
 process.env.NEXT_PUBLIC_API_URL ||
 "http://127.0.0.1:8000";

 const url = new URL(apiBaseUrl);
 url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
 url.pathname = `/ws/kitchen/${kitchenId}/`;
 url.search = "";
 return url.toString();
}

export const updateOrderStatusAPI = async (orderId: string, status: string) => {
 try {
 const { kitchen } = await getKitchenContext();

 if (!kitchen) {
 throw new Error("No kitchen is available for KDS updates");
 }

 const socketUrl = getSocketUrl(kitchen.id);

 return await new Promise<void>((resolve, reject) => {
 const socket = new WebSocket(socketUrl);
 const timeoutId = window.setTimeout(() => {
 try {
 socket.close();
 } catch {
 // Ignore close failures.
 }

 reject(new Error("KDS websocket connection timed out"));
 }, 5000);

 socket.onopen = () => {
 window.clearTimeout(timeoutId);

 socket.send(
 JSON.stringify({
 type: "order_status_update",
 order_id: orderId,
 status: normalizeStatus(status),
 }),
 );

 window.setTimeout(() => {
 try {
 socket.close();
 } catch {
 // Ignore close failures.
 }

 resolve();
 }, 150);
 };

 socket.onerror = () => {
 window.clearTimeout(timeoutId);
 reject(new Error("KDS websocket connection failed"));
 };

 socket.onclose = () => {
 window.clearTimeout(timeoutId);
 };
 });
 } catch (error) {
 console.log("Backend update unavailable", error);
 }
};