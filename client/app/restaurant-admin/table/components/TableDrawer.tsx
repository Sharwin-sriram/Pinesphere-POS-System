import React, { useState, useEffect, useMemo, useRef } from "react";
import { Table, OrderItem, Bill } from "../types";
import { tableApi } from "../services/tableApi";
import { X, Plus, Trash2, Printer, CheckCircle, User, ArrowLeft, RefreshCw, Minus } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import toast from "react-hot-toast";

interface TableDrawerProps {
  table: Table | null;
  onClose: () => void;
  restaurantId: string;
  onStatusChange: (tableId: string, status: any, waiter?: string) => Promise<boolean>;
  onWaiterReassign: (tableId: string, waiter: string) => Promise<boolean>;
}

const MOCK_WAITERS = ["Sarah Jenkins", "Michael Chang", "John Doe", "Emily Stone"];
const STATUS_ORDER: Record<string, number> = { Pending: 0, Preparing: 1, Ready: 2, Served: 3 };

export default function TableDrawer({
  table,
  onClose,
  restaurantId,
  onStatusChange,
  onWaiterReassign,
}: TableDrawerProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [bill, setBill] = useState<Bill | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Waiter reassign state
  const [isReassigning, setIsReassigning] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState("");

  // Add Item secondary panel states
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState("");
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Confirmation Modals
  const [showCloseTableConfirm, setShowCloseTableConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const searchTimeoutRef = useRef<any>(null);

  // Fetch orders and bill details lazily when the table is selected
  const fetchOrderDetails = async () => {
    if (!table) return;
    setLoadingOrders(true);
    try {
      const orderList = await tableApi.getTableOrders(restaurantId, table.id);
      setOrders(orderList);
      if (orderList.length > 0) {
        const billData = await tableApi.getTableBill(restaurantId, table.id);
        setBill(billData);
      } else {
        setBill(null);
      }
    } catch {
      toast.error("Could not retrieve active table orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (table) {
      fetchOrderDetails();
      setIsReassigning(false);
      setIsAddingItem(false);
    } else {
      setOrders([]);
      setBill(null);
    }
  }, [table, restaurantId]);

  // Load menu items when Add Item panel is opened
  const loadMenu = async () => {
    setLoadingMenu(true);
    try {
      const items = await tableApi.getMenuItems(restaurantId);
      setMenuItems(items);
    } catch {
      toast.error("Failed to load restaurant menu.");
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (isAddingItem) {
      loadMenu();
      setSelectedItemId("");
      setItemQuantity(1);
      setItemNotes("");
      setSearchQuery("");
      setDebouncedSearch("");
    }
  }, [isAddingItem]);

  // Search Debounce at 400ms (Task 9 constraint)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [menuItems, debouncedSearch]);

  if (!table) return null;

  const handleWaiterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const waiter = e.target.value;
    if (!waiter) return;
    const success = await onWaiterReassign(table.id, waiter);
    if (success) {
      setIsReassigning(false);
    }
  };

  // Add Item to active Order
  const handleAddItemToOrder = async () => {
    if (!selectedItemId) return;
    try {
      const added = await tableApi.addOrderItem(restaurantId, table.id, {
        item_id: selectedItemId,
        quantity: itemQuantity,
        notes: itemNotes.trim(),
      });
      setOrders((prev) => [...prev, added]);
      // Refetch bill
      const billData = await tableApi.getTableBill(restaurantId, table.id);
      setBill(billData);

      // If table status was available or cleaning, promote to occupied
      if (table.status === "Available" || table.status === "Cleaning") {
        await onStatusChange(table.id, "Occupied", MOCK_WAITERS[0]);
      }

      toast.success("Item added to active order.");
      setIsAddingItem(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add item to order");
    }
  };

  // Update specific order item status
  const handleOrderItemStatusChange = async (orderItemId: string, newStatus: string) => {
    const previousOrders = [...orders];
    const previousBill = bill ? { ...bill } : null;
    const item = orders.find((o) => o.id === orderItemId);
    if (!item) return;

    // Check transition guard (cannot revert backwards!)
    const currentIdx = STATUS_ORDER[item.status];
    const newIdx = STATUS_ORDER[newStatus];

    if (newIdx < currentIdx) {
      toast.error(`Transition Guard: Cannot demote item status from ${item.status} to ${newStatus}.`);
      return;
    }

    // Optimistically update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderItemId ? { ...o, status: newStatus as any } : o))
    );

    try {
      await tableApi.updateOrderItemStatus(restaurantId, table.id, orderItemId, newStatus);
      toast.success(`Order item status updated to ${newStatus}.`);
    } catch {
      // Rollback on failure
      setOrders(previousOrders);
      setBill(previousBill);
      toast.error("Failed to update status on server. Rolled back.");
    }
  };

  // Mark all served
  const handleMarkAllServed = async () => {
    try {
      const success = await tableApi.bulkServeOrderItems(restaurantId, table.id);
      if (success) {
        setOrders((prev) => prev.map((o) => ({ ...o, status: "Served" })));
        toast.success("All items marked as Served.");
      }
    } catch {
      toast.error("Failed to mark items as served.");
    }
  };

  // Delete Pending order item
  const handleDeleteOrderItem = async (orderItemId: string) => {
    try {
      const success = await tableApi.deleteOrderItem(restaurantId, table.id, orderItemId);
      if (success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderItemId));
        const billData = await tableApi.getTableBill(restaurantId, table.id);
        setBill(billData.items.length > 0 ? billData : null);
        toast.success("Order item removed.");
      }
    } catch {
      toast.error("Failed to delete order item.");
    }
  };

  // Close table & clear orders
  const handleCloseTable = async () => {
    const success = await onStatusChange(table.id, "Available");
    if (success) {
      setShowCloseTableConfirm(false);
      onClose();
    }
  };

  // Print invoice and trigger native print (Task 6 constraint)
  const handlePrintBill = async () => {
    try {
      const billData = await tableApi.getTableBill(restaurantId, table.id);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Pop-up blocker is preventing invoice printing.");
        return;
      }
      printWindow.document.write(`
        <html>
          <head>
            <title>Table ${table.number} Invoice</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #0f172a; max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 25px; }
              .header h2 { margin: 0; font-size: 22px; font-weight: bold; }
              .header p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
              .divider { border-bottom: 2px dashed #e2e8f0; margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 10px 0; text-align: left; font-size: 13px; }
              th { border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569; }
              .right { text-align: right; }
              .totals { margin-top: 15px; }
              .totals div { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
              .totals .grand { font-size: 16px; font-weight: bold; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 5px; }
              .footer { margin-top: 35px; text-align: center; font-size: 11px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>PINESPHERE POS</h2>
              <p>Table Management System Receipt</p>
              <p>Table: ${table.number} | Zone: ${table.section}</p>
              <p>Seated: ${table.seated_at ? new Date(table.seated_at).toLocaleString() : new Date().toLocaleString()}</p>
            </div>
            <div class="divider"></div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="right">Qty</th>
                  <th class="right">Price</th>
                  <th class="right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${billData.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.item_name} ${item.notes ? `<br><small style="color: #64748b; font-style: italic;">* ${item.notes}</small>` : ""}</td>
                    <td class="right">${item.quantity}</td>
                    <td class="right">$${item.price.toFixed(2)}</td>
                    <td class="right">$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="divider"></div>
            <div class="totals">
              <div><span>Subtotal:</span><span>$${billData.subtotal.toFixed(2)}</span></div>
              <div><span>Tax (5.00%):</span><span>$${billData.tax.toFixed(2)}</span></div>
              <div class="totals grand"><span>Grand Total:</span><span>$${billData.total.toFixed(2)}</span></div>
            </div>
            <div class="footer">
              Thank you for dining with us!<br>
              Powered by Pinesphere POS
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      toast.error("Failed to generate print invoice.");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "W";
    const parts = name.split(" ");
    return parts.map((p) => p[0]).join("").toUpperCase();
  };

  return (
    <>
      <aside
        className="fixed top-0 right-0 h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] shadow-2xl z-40 transition-transform duration-300 transform w-full max-sm:bottom-0 max-sm:top-auto max-sm:h-[85vh] max-sm:rounded-t-3xl max-sm:border-t lg:w-[420px] flex flex-col translate-x-0"
        style={{ zIndex: 100 }}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-full hover:bg-[var(--color-bg-tertiary)]"
              aria-label="Back to grid"
            >
              <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                Table {table.number}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5">
                Seats {table.capacity} • {table.section} Zone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                table.status === "Available"
                  ? "bg-green-50 text-green-600 dark:bg-green-950/20"
                  : table.status === "Occupied"
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                  : "bg-blue-50 text-blue-600 dark:bg-blue-950/20"
              }`}
            >
              {table.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] max-sm:hidden"
              aria-label="Close panel"
            >
              <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Waiter Assignment section */}
          {(table.status === "Occupied" || table.status === "Reserved") && (
            <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)] font-bold rounded-full flex items-center justify-center text-sm shadow-inner">
                  {getInitials(table.waiter)}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)] tracking-wider">
                    Assigned Waiter
                  </p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">
                    {table.waiter || "Unassigned"}
                  </p>
                </div>
              </div>

              <div>
                {isReassigning ? (
                  <select
                    value={selectedWaiter}
                    onChange={handleWaiterChange}
                    className="h-8 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] rounded-md text-xs font-semibold text-[var(--color-text-primary)] px-2 focus:outline-none"
                  >
                    <option value="">Choose Waiter</option>
                    {MOCK_WAITERS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedWaiter(table.waiter || "");
                      setIsReassigning(true);
                    }}
                    className="text-xs font-bold text-[var(--color-accent-green)] hover:underline"
                  >
                    Reassign
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Orders Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                Current Orders
              </h4>
              <button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center gap-1 text-xs font-bold text-[var(--color-accent-green)] hover:underline bg-[var(--color-accent-green-subtle)] px-2.5 py-1.5 rounded-lg transition-transform active:scale-95 duration-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-[var(--color-text-secondary)]">
                <RefreshCw className="h-6 w-6 animate-spin text-[var(--color-accent-green)]" />
                <span className="text-xs">Synchronizing active orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] text-xs">
                No active orders on this table. Click "+ Add Item" to order.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] rounded-xl p-4 flex flex-col gap-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-xs font-bold text-[var(--color-text-primary)]">
                          {item.item_name}
                        </h5>
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                          Qty: {item.quantity} • ${item.price.toFixed(2)} each
                        </p>
                        {item.notes && (
                          <p className="text-[10px] italic text-[var(--color-text-muted)] font-semibold mt-1">
                            * {item.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status dropdown with transition checks built in */}
                        <select
                          value={item.status}
                          onChange={(e) => handleOrderItemStatusChange(item.id, e.target.value)}
                          className="h-7 border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] rounded-md text-[10px] font-bold text-[var(--color-text-primary)] px-2 focus:outline-none cursor-pointer"
                        >
                          <option value="Pending" disabled={STATUS_ORDER[item.status] > 0}>
                            Pending
                          </option>
                          <option value="Preparing" disabled={STATUS_ORDER[item.status] > 1}>
                            Preparing
                          </option>
                          <option value="Ready" disabled={STATUS_ORDER[item.status] > 2}>
                            Ready
                          </option>
                          <option value="Served">Served</option>
                        </select>

                        {/* Remove order item trash icon: Only available if status is Pending */}
                        <button
                          onClick={() => {
                            if (item.status === "Pending") {
                              setItemToDelete(item.id);
                            }
                          }}
                          disabled={item.status !== "Pending"}
                          className={`p-1.5 rounded-lg border ${
                            item.status === "Pending"
                              ? "border-[var(--color-danger)]/20 hover:bg-red-50 text-[var(--color-danger)] cursor-pointer"
                              : "border-[var(--color-border)] text-[var(--color-text-disabled)] cursor-not-allowed"
                          }`}
                          title={item.status !== "Pending" ? "Only pending items can be removed" : "Remove item"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bulk mark all served CTA */}
                {orders.some((o) => o.status !== "Served") && (
                  <button
                    onClick={handleMarkAllServed}
                    className="w-full mt-4 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200"
                  >
                    Mark All Served
                  </button>
                )}

                {/* Subtotals & Totals Invoice block */}
                {bill && (
                  <div className="mt-6 border-t border-[var(--color-border)] pt-4 space-y-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${bill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%):</span>
                      <span>${bill.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[var(--color-text-primary)] border-t border-[var(--color-border)] pt-2 mt-1">
                      <span>Total Invoice:</span>
                      <span>${bill.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-6 border-t border-[var(--color-border)] grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={() => setShowCloseTableConfirm(true)}>
            Close Table
          </Button>
          <Button
            variant="success"
            onClick={handlePrintBill}
            disabled={orders.length === 0}
            className="flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print Bill</span>
          </Button>
        </div>
      </aside>

      {/* Add Item Nested Drawer Overlay Panel */}
      {isAddingItem && (
        <div
          className="fixed top-0 right-0 h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] shadow-2xl z-50 transition-transform duration-300 w-full lg:w-[400px] flex flex-col p-6 space-y-5"
          style={{ zIndex: 110 }}
        >
          <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
            <h4 className="text-md font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
              Add Item to Table {table.number}
            </h4>
            <button
              onClick={() => setIsAddingItem(false)}
              className="p-1 rounded-full hover:bg-[var(--color-bg-tertiary)]"
            >
              <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
            </button>
          </div>

          {/* Search bar inside panel */}
          <div className="relative">
            <Input
              label="Search Menu Item"
              placeholder="e.g. Zinger Burger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Items selector */}
          <div className="flex-1 overflow-y-auto space-y-2 border border-[var(--color-border)] rounded-xl p-3 bg-[var(--color-bg-tertiary)]">
            {loadingMenu ? (
              <div className="text-center py-10 text-xs">Loading items...</div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center py-10 text-xs text-[var(--color-text-muted)]">
                No matching menu items found.
              </div>
            ) : (
              filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-colors ${
                    selectedItemId === item.id
                      ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-slate-50 text-[var(--color-text-primary)]"
                  }`}
                >
                  <div className="text-xs">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                      ${item.price} each • {item.category}
                    </p>
                  </div>
                  {selectedItemId === item.id && (
                    <CheckCircle className="h-4 w-4 text-[var(--color-accent-green)]" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quantity Stepper with min 44x44px touch targets */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setItemQuantity((prev) => Math.max(1, prev - 1))}
                className="h-11 w-11 border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] rounded-lg flex items-center justify-center text-lg active:scale-90 font-bold transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm">{itemQuantity}</span>
              <button
                type="button"
                onClick={() => setItemQuantity((prev) => prev + 1)}
                className="h-11 w-11 border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] rounded-lg flex items-center justify-center text-lg active:scale-90 font-bold transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Optional notes input */}
          <Input
            label="Cooking notes (Optional)"
            placeholder="e.g. Extra spicy, no lettuce..."
            value={itemNotes}
            onChange={(e) => setItemNotes(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
            <Button variant="secondary" onClick={() => setIsAddingItem(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleAddItemToOrder} disabled={!selectedItemId}>
              Add to Order
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Close Table */}
      <Modal
        open={showCloseTableConfirm}
        onClose={() => setShowCloseTableConfirm(false)}
        title="Close Table and Clear Orders?"
        description="This will clear all current active order listings and mark this table as Available."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCloseTableConfirm(false)}>
              Keep Open
            </Button>
            <Button variant="danger" onClick={handleCloseTable}>
              Close Table
            </Button>
          </>
        }
        size="md"
      />

      {/* Confirmation Dialog: Delete Order Item */}
      <Modal
        open={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        title="Remove Order Item?"
        description="Are you sure you want to delete this pending order item?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (itemToDelete) {
                  handleDeleteOrderItem(itemToDelete);
                  setItemToDelete(null);
                }
              }}
            >
              Remove
            </Button>
          </>
        }
        size="md"
      />
    </>
  );
}
