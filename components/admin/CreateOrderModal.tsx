"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { X, Loader2, Plus, Trash2, ShoppingBag, MapPin } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: number;
  title: string;
  unit_price: number;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<{ product: Product; quantity: number }[]>([]);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", street: "", city: "", zipCode: ""
  });

  // Fetch available products for admin to choose
  useEffect(() => {
    if (isOpen) {
      apiClient.get("/store/products/")
        .then(res => setProducts(res.data.results || res.data))
        .catch(() => toast.error("Failed to load products"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) return;
    const product = products.find(p => p.id.toString() === selectedProduct);
    if (!product) return;

    setOrderItems(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
    setQuantity(1);
  };

  const handleRemoveItem = (id: number) => {
    setOrderItems(prev => prev.filter(item => item.product.id !== id));
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.product.unit_price * item.quantity), 0);

  // 🟢 Create Order Magic (3-Step API Call)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return toast.error("Please add at least one product!");

    setIsSubmitting(true);
    try {
      // 1. Create an empty cart
      const cartRes = await apiClient.post("/store/carts/");
      const cartId = cartRes.data.id;

      // 2. Add items to the cart
      for (const item of orderItems) {
        await apiClient.post(`/store/carts/${cartId}/items/`, {
          product_id: item.product.id,
          quantity: item.quantity
        });
      }

      // 3. Place the order
      await apiClient.post("/store/orders/", {
        cart_id: cartId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        street: formData.street,
        city: formData.city,
        zip_code: formData.zipCode,
        phone: formData.phone
      });

      toast.success("Order created successfully!");
      setFormData({ firstName: "", lastName: "", phone: "", street: "", city: "", zipCode: "" });
      setOrderItems([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Create New Order</h2>
              <p className="text-xs text-slate-500 font-medium">Place an order manually for a customer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="createOrderForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Shipping Info */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin size={16} className="text-emerald-500" /> Shipping Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">First Name</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Last Name</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Phone Number</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Street Address</label>
                <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">City</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Zip Code</label>
                  <input required type="text" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Right Column: Order Items */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShoppingBag size={16} className="text-emerald-500" /> Order Items
              </h3>

              <div className="flex gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-500">Select Product</label>
                  <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none cursor-pointer">
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title} (${p.unit_price})</option>
                    ))}
                  </select>
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-xs font-bold text-slate-500">Qty</label>
                  <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none text-center" />
                </div>
                <button type="button" onClick={handleAddItem} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">Add</button>
              </div>

              {/* Added Items List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white min-h-[150px]">
                {orderItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No items added yet.</div>
                ) : (
                  <ul className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {orderItems.map((item) => (
                      <li key={item.product.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-bold text-slate-800 truncate">{item.product.title}</p>
                          <p className="text-xs text-slate-500">${item.product.unit_price} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-600 text-sm">${(item.product.unit_price * item.quantity).toFixed(2)}</span>
                          <button type="button" onClick={() => handleRemoveItem(item.product.id)} className="text-slate-400 hover:text-rose-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Total Amount:</span>
                <span className="text-xl font-black text-emerald-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" form="createOrderForm" disabled={isSubmitting || orderItems.length === 0} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2">
            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}