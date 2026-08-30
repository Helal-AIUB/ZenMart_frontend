"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import {
  X,
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Truck,
  ShieldAlert,
  CheckCircle2,
  User,
  Phone,
  Plus,
  Minus,
  Trash2,
  Copy,
  Search,
  PlusCircle,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

// --- Types ---
interface OrderItem {
  id: number;
  product: { id: number; title: string; unit_price: number };
  unit_price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer: number;
  placed_at: string;
  payment_status: "P" | "C" | "F";
  delivery_status:
    | "Placed"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Canceled";
  first_name?: string;
  last_name?: string;
  street?: string;
  city?: string;
  zip_code?: string;
  phone?: string;
  delivery_charge?: string | number;
  payment_method?: string;
  transaction_id?: string;
  items: OrderItem[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdate: (updatedOrder: Order) => void;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onUpdate,
}: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"P" | "C" | "F">("P");
  const [deliveryStatus, setDeliveryStatus] = useState<string>("Placed");
  const [localItems, setLocalItems] = useState<OrderItem[]>([]);

  // 🟢 Product Search States
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.payment_status);
      setDeliveryStatus(order.delivery_status || "Placed");
      setLocalItems(order.items || []);
      setIsAddingProduct(false);
      setSearchQuery("");
    }
  }, [order]);

  // 🟢 Debounced Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.get(
          `/store/products/?search=${searchQuery}`,
        );
        setSearchResults(res.data.results || res.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen || !order) return null;

  const itemsTotal = localItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const deliveryCharge = Number(order.delivery_charge || 0);
  const totalAmount = itemsTotal + deliveryCharge;

  const handleCopyTrxId = () => {
    if (order.transaction_id) {
      navigator.clipboard.writeText(order.transaction_id);
      toast.success("Transaction ID Copied!");
    }
  };

  // --- Add New Item to Order ---
  const handleAddNewItem = async (product: any) => {
    if (localItems.find((i) => i.product.id === product.id)) {
      return toast.error("This product is already in the order!");
    }

    setIsUpdating(true);
    try {
      const res = await apiClient.post(`/store/orders/${order.id}/add_item/`, {
        product_id: product.id,
        quantity: 1,
      });

      const newLocalItem = {
        id: res.data.id,
        product: {
          id: product.id,
          title: product.title,
          unit_price: product.unit_price,
        },
        unit_price: product.unit_price,
        quantity: 1,
      };

      const updatedItems = [...localItems, newLocalItem];
      setLocalItems(updatedItems);
      onUpdate({ ...order, items: updatedItems });

      toast.success("Product added successfully!");
      setIsAddingProduct(false);
      setSearchQuery("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to add product to order.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await apiClient.patch(`/store/orders/${order.id}/`, {
        payment_status: paymentStatus,
        delivery_status: deliveryStatus,
      });

      onUpdate({
        ...order,
        payment_status: paymentStatus,
        delivery_status: deliveryStatus as Order["delivery_status"],
        items: localItems,
      });
      toast.success("Order statuses updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityChange = async (
    itemId: number,
    currentQty: number,
    change: number,
  ) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    setUpdatingItemId(itemId);
    try {
      await apiClient.patch(`/store/orders/${order.id}/items/${itemId}/`, {
        quantity: newQty,
      });
      const updatedItems = localItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item,
      );
      setLocalItems(updatedItems);
      onUpdate({ ...order, items: updatedItems });
    } catch (error) {
      toast.error("Failed to update item quantity.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this item from the order?",
      )
    )
      return;
    setUpdatingItemId(itemId);
    try {
      await apiClient.delete(`/store/orders/${order.id}/items/${itemId}/`);
      const filteredItems = localItems.filter((item) => item.id !== itemId);
      setLocalItems(filteredItems);
      onUpdate({ ...order, items: filteredItems });
      toast.success("Item removed from order!");
    } catch (error) {
      toast.error("Failed to remove item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "C":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
            <CheckCircle size={14} /> Paid
          </span>
        );
      case "P":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
            <Clock size={14} /> Pending
          </span>
        );
      case "F":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">
            <XCircle size={14} /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case "Placed":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
            <Package size={14} /> Placed
          </span>
        );
      case "Processing":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
            <Clock size={14} /> Processing
          </span>
        );
      case "Shipped":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
            <Truck size={14} /> Shipped
          </span>
        );
      case "Delivered":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
            <CheckCircle2 size={14} /> Delivered
          </span>
        );
      case "Canceled":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">
            <ShieldAlert size={14} /> Canceled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* 🟢 Main Order Details Modal (z-50) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Order #{order.id.toString().padStart(4, "0")}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {new Date(order.placed_at).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-slate-50/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Customer ID
                </p>
                <p className="text-lg font-black text-slate-800">
                  #{order.customer}
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Payment
                </p>
                <div>{getPaymentBadge(order.payment_status)}</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Delivery
                </p>
                <div>{getDeliveryBadge(order.delivery_status || "Placed")}</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Total Amount
                </p>
                <p className="text-lg font-black text-emerald-600">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <MapPin size={16} className="text-emerald-500" /> Shipping
                  Details
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User size={14} className="text-slate-400" />{" "}
                    <span className="font-bold">
                      {order.first_name || "N/A"} {order.last_name || ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone size={14} className="text-slate-400" />{" "}
                    <span>{order.phone || "N/A"}</span>
                  </div>
                  <div className="text-slate-600 pl-6 mt-1 border-l-2 border-slate-100">
                    <p>{order.street || "Address not provided"}</p>
                    <p>
                      {order.city ? `${order.city}, ` : ""}
                      {order.zip_code || ""}
                    </p>
                    <p className="font-medium text-slate-400 mt-1">
                      Bangladesh
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <ShieldAlert size={16} className="text-blue-500" /> Payment
                    Verification
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium">
                        Payment Method
                      </span>
                      <span className="text-sm font-bold text-slate-800 px-3 py-1 bg-slate-100 rounded-md">
                        {order.payment_method || "COD"}
                      </span>
                    </div>
                    {order.payment_method !== "COD" && (
                      <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <span className="text-sm text-slate-500 font-medium">
                          Transaction ID
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-slate-800 tracking-wider">
                            {order.transaction_id || "Not Provided"}
                          </span>
                          {order.transaction_id && (
                            <button
                              onClick={handleCopyTrxId}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                              title="Copy TrxID"
                            >
                              <Copy size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Order Items ({localItems.length})
                </h3>

                {/* 🟢 Add Product Button */}
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(true)}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <PlusCircle size={14} /> Add Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-slate-500 bg-white">
                    <tr>
                      <th className="px-5 py-3 font-semibold border-b border-slate-100">
                        Product
                      </th>
                      <th className="px-5 py-3 font-semibold text-center border-b border-slate-100">
                        Unit Price
                      </th>
                      <th className="px-5 py-3 font-semibold text-center border-b border-slate-100">
                        Qty
                      </th>
                      <th className="px-5 py-3 font-semibold text-right border-b border-slate-100">
                        Subtotal
                      </th>
                      <th className="px-5 py-3 font-semibold text-center border-b border-slate-100">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-slate-400"
                        >
                          No items remaining in this order.
                        </td>
                      </tr>
                    ) : (
                      localItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 font-medium text-slate-800">
                            {item.product.title}
                          </td>
                          <td className="px-5 py-4 text-slate-600 text-center">
                            ${item.unit_price}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    -1,
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 ||
                                  updatingItemId === item.id
                                }
                                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md disabled:opacity-50 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center font-bold text-slate-800">
                                {updatingItemId === item.id ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin mx-auto text-emerald-500"
                                  />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    1,
                                  )
                                }
                                disabled={updatingItemId === item.id}
                                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md disabled:opacity-50 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800 text-right">
                            ${(item.unit_price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={updatingItemId === item.id}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Remove Item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/80 z-10">
            <form
              onSubmit={handleStatusUpdate}
              className="flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Payment:
                  </span>
                  <select
                    value={paymentStatus}
                    onChange={(e) =>
                      setPaymentStatus(e.target.value as "P" | "C" | "F")
                    }
                    className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="P">Pending</option>
                    <option value="C">Complete</option>
                    <option value="F">Failed</option>
                  </select>
                </div>
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Delivery:
                  </span>
                  <select
                    value={deliveryStatus}
                    onChange={(e) => setDeliveryStatus(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isUpdating ||
                    (paymentStatus === order.payment_status &&
                      deliveryStatus === order.delivery_status)
                  }
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 🟢 Floating Command Palette for Adding Product (z-60) */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-top-4 duration-300 border border-slate-100">
            {/* Search Input Area */}
            <div className="relative flex items-center px-4 border-b border-slate-100 bg-white">
              <Search className="text-slate-400 shrink-0" size={20} />
              <input
                type="text"
                autoFocus
                placeholder="Search products by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-5 focus:outline-none text-slate-700 bg-transparent text-base"
              />
              {isSearching && (
                <Loader2
                  size={18}
                  className="animate-spin text-emerald-500 absolute right-14"
                />
              )}
              <button
                onClick={() => {
                  setIsAddingProduct(false);
                  setSearchQuery("");
                }}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[50vh] overflow-y-auto bg-slate-50/50 p-2 custom-scrollbar">
              {!searchQuery ? (
                <div className="px-6 py-12 text-center flex flex-col items-center justify-center text-slate-400">
                  <ShoppingBag size={40} className="mb-3 opacity-20" />
                  <p className="text-sm font-medium">
                    Type a product name to search...
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((prod) => {
                    const isAlreadyAdded = localItems.some(
                      (i) => i.product.id === prod.id,
                    );
                    return (
                      <button
                        key={prod.id}
                        onClick={() =>
                          !isAlreadyAdded && handleAddNewItem(prod)
                        }
                        disabled={isAlreadyAdded || isUpdating}
                        className={`w-full text-left px-4 py-3 rounded-xl flex justify-between items-center group transition-all ${
                          isAlreadyAdded
                            ? "opacity-50 cursor-not-allowed bg-slate-100"
                            : "hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 bg-transparent cursor-pointer"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-sm font-bold ${isAlreadyAdded ? "text-slate-500" : "text-slate-700 group-hover:text-emerald-600 transition-colors"}`}
                          >
                            {prod.title}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            ID: {prod.id} <span className="mx-1">•</span> Stock:{" "}
                            {prod.inventory}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-slate-700">
                            ${prod.unit_price}
                          </p>
                          {isAlreadyAdded ? (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-500"
                            />
                          ) : (
                            <Plus
                              size={18}
                              className="text-slate-300 group-hover:text-emerald-500 transition-colors"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : !isSearching ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No products found for "
                  <span className="font-bold text-slate-700">
                    {searchQuery}
                  </span>
                  "
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
