"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { 
  X, Loader2, Package, CheckCircle, XCircle, Clock, 
  MapPin, Truck, ShieldAlert, CheckCircle2, User, Phone,
  Plus, Minus, Trash2
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
  payment_status: 'P' | 'C' | 'F';
  delivery_status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';
  first_name?: string;
  last_name?: string;
  street?: string;
  city?: string;
  zip_code?: string;
  phone?: string;
  items: OrderItem[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdate: (updatedOrder: Order) => void;
}

export default function OrderDetailsModal({ isOpen, onClose, order, onUpdate }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'P' | 'C' | 'F'>('P');
  const [deliveryStatus, setDeliveryStatus] = useState<string>('Placed');
  const [localItems, setLocalItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.payment_status);
      setDeliveryStatus(order.delivery_status || 'Placed');
      setLocalItems(order.items || []);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const totalAmount = localItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  // --- Update Order Status ---
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await apiClient.patch(`/store/orders/${order.id}/`, {
        payment_status: paymentStatus,
        delivery_status: deliveryStatus
      });
      
      onUpdate({ 
        ...order, 
        payment_status: paymentStatus, 
        delivery_status: deliveryStatus as Order['delivery_status'],
        items: localItems 
      });
      
      toast.success("Order statuses updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Update Item Quantity ---
  const handleQuantityChange = async (itemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return; // Prevent quantity less than 1

    setUpdatingItemId(itemId);
    try {
      // Assuming DRF nested router: /store/orders/{order_pk}/items/{id}/
      await apiClient.patch(`/store/orders/${order.id}/items/${itemId}/`, {
        quantity: newQty
      });

      const updatedItems = localItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQty } : item
      );
      setLocalItems(updatedItems);
      
      // Update parent in real-time to reflect new total amount
      onUpdate({ ...order, items: updatedItems });
      toast.success("Quantity updated!");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update item quantity.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // --- Delete Item ---
  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm("Are you sure you want to remove this item from the order?")) return;
    
    setUpdatingItemId(itemId);
    try {
      await apiClient.delete(`/store/orders/${order.id}/items/${itemId}/`);
      
      const filteredItems = localItems.filter(item => item.id !== itemId);
      setLocalItems(filteredItems);
      
      // Update parent in real-time
      onUpdate({ ...order, items: filteredItems });
      toast.success("Item removed from order!");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to remove item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'C': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold"><CheckCircle size={14} /> Paid</span>;
      case 'P': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold"><Clock size={14} /> Pending</span>;
      case 'F': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold"><XCircle size={14} /> Failed</span>;
      default: return null;
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'Placed': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"><Package size={14} /> Placed</span>;
      case 'Processing': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold"><Clock size={14} /> Processing</span>;
      case 'Shipped': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"><Truck size={14} /> Shipped</span>;
      case 'Delivered': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold"><CheckCircle2 size={14} /> Delivered</span>;
      case 'Canceled': return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold"><ShieldAlert size={14} /> Canceled</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Order #{order.id.toString().padStart(4, '0')}</h2>
              <p className="text-xs text-slate-500 font-medium">{new Date(order.placed_at).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-slate-50/30">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Customer ID</p>
              <p className="text-lg font-black text-slate-800">#{order.customer}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Payment</p>
              <div>{getPaymentBadge(order.payment_status)}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Delivery</p>
              <div>{getDeliveryBadge(order.delivery_status || 'Placed')}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-lg font-black text-emerald-600">${totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Shipping Info Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin size={16} className="text-emerald-500" /> Shipping Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 text-slate-600">
                <p className="flex items-center gap-2"><User size={14} className="text-slate-400" /> <span className="font-bold text-slate-800">{order.first_name || 'N/A'} {order.last_name || ''}</span></p>
                <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> <span>{order.phone || 'N/A'}</span></p>
              </div>
              <div className="space-y-1 text-slate-600">
                <p>{order.street || 'Address not provided'}</p>
                <p>{order.city ? `${order.city}, ` : ''}{order.zip_code || ''}</p>
                <p className="font-medium text-slate-500">Bangladesh</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Order Items ({localItems.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-slate-500 bg-white">
                  <tr>
                    <th className="px-5 py-3 font-semibold border-b border-slate-100">Product</th>
                    <th className="px-5 py-3 font-semibold text-center border-b border-slate-100">Unit Price</th>
                    <th className="px-5 py-3 font-semibold text-center border-b border-slate-100">Qty</th>
                    <th className="px-5 py-3 font-semibold text-right border-b border-slate-100">Subtotal</th>
                    <th className="px-5 py-3 font-semibold text-center border-b border-slate-100">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        No items remaining in this order.
                      </td>
                    </tr>
                  ) : (
                    localItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-800">{item.product.title}</td>
                        <td className="px-5 py-4 text-slate-600 text-center">${item.unit_price}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              disabled={item.quantity <= 1 || updatingItemId === item.id}
                              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md disabled:opacity-50 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center font-bold text-slate-800">
                              {updatingItemId === item.id ? <Loader2 size={14} className="animate-spin mx-auto text-emerald-500" /> : item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              disabled={updatingItemId === item.id}
                              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md disabled:opacity-50 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800 text-right">${(item.unit_price * item.quantity).toFixed(2)}</td>
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

        {/* Footer with Action Form */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/80">
          <form onSubmit={handleStatusUpdate} className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="w-full sm:w-auto flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment:</span>
                <select 
                  value={paymentStatus} 
                  onChange={(e) => setPaymentStatus(e.target.value as 'P' | 'C' | 'F')}
                  className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="P">Pending</option>
                  <option value="C">Complete</option>
                  <option value="F">Failed</option>
                </select>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery:</span>
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
                disabled={isUpdating || (paymentStatus === order.payment_status && deliveryStatus === order.delivery_status)}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdating ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Save Changes'}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}