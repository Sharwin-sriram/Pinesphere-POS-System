export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning';

export type OrderItemStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  section: string;
  notes?: string;
  status: TableStatus;
  waiter?: string;
  seated_at?: string;
  reserved_at?: string;
}

export interface OrderItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  notes?: string;
  price: number;
  status: OrderItemStatus;
}

export interface Bill {
  subtotal: number;
  tax: number;
  total: number;
  items: OrderItem[];
}

export interface Restaurant {
  id: string;
  name: string;
}
