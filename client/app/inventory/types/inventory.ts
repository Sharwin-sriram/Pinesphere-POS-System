export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  mobile: string;
  email: string;
  gst_number?: string;
  is_active: boolean;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit_type: string;
  current_stock: string;
  reorder_level: string;
  purchase_price: string;
  expiry_date?: string;
  is_active: boolean;
  supplier?: Supplier;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  status:
    | "DRAFT"
    | "SENT"
    | "RECEIVED"
    | "CANCELLED";

  total: string;

  supplier: Supplier;
}