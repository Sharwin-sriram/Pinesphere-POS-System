import { httpClient } from "../../../lib/authService";
import { Table, OrderItem, Bill } from "../types";

export const tableApi = {
  async getTables(restaurantId: string): Promise<Table[]> {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/tables/`);
    return response.data;
  },

  async createTable(
    restaurantId: string,
    payload: { number: number; capacity: number; section: string; notes?: string }
  ): Promise<Table> {
    const response = await httpClient.post(`/api/restaurant/${restaurantId}/tables/`, payload);
    return response.data;
  },

  async deleteTable(restaurantId: string, tableId: string): Promise<boolean> {
    const response = await httpClient.delete(`/api/restaurant/${restaurantId}/tables/${tableId}/`);
    return response.data.success || response.status === 200;
  },

  async updateTable(
    restaurantId: string,
    tableId: string,
    payload: { status?: string; waiter?: string; notes?: string; fail?: boolean }
  ): Promise<Table> {
    const response = await httpClient.patch(`/api/restaurant/${restaurantId}/tables/${tableId}/`, payload);
    return response.data;
  },

  async getTableOrders(restaurantId: string, tableId: string): Promise<OrderItem[]> {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/tables/${tableId}/orders/`);
    return response.data;
  },

  async addOrderItem(
    restaurantId: string,
    tableId: string,
    payload: { item_id: string; quantity: number; notes?: string }
  ): Promise<OrderItem> {
    const response = await httpClient.post(`/api/restaurant/${restaurantId}/tables/${tableId}/orders/`, payload);
    return response.data;
  },

  async updateOrderItemStatus(
    restaurantId: string,
    tableId: string,
    orderItemId: string,
    status: string,
    fail?: boolean
  ): Promise<OrderItem> {
    const response = await httpClient.patch(
      `/api/restaurant/${restaurantId}/tables/${tableId}/orders/${orderItemId}/`,
      { status },
      { params: fail ? { fail: true } : {} }
    );
    return response.data;
  },

  async bulkServeOrderItems(restaurantId: string, tableId: string): Promise<boolean> {
    const response = await httpClient.patch(`/api/restaurant/${restaurantId}/tables/${tableId}/orders/`, {
      status: "Served",
    });
    return response.data.success || response.status === 200;
  },

  async deleteOrderItem(restaurantId: string, tableId: string, orderItemId: string): Promise<boolean> {
    const response = await httpClient.delete(`/api/restaurant/${restaurantId}/tables/${tableId}/orders/${orderItemId}/`);
    return response.data.success || response.status === 200;
  },

  async getTableBill(restaurantId: string, tableId: string): Promise<Bill> {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/tables/${tableId}/bill/`);
    return response.data;
  },

  // Pull menu items for the table drawer '+ Add Item' searchable select dropdown list
  async getMenuItems(restaurantId: string): Promise<any[]> {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/menu/`);
    return response.data;
  },
};
