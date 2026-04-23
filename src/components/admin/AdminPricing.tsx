import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, X } from 'lucide-react';

interface PricingItem {
  id: string;
  service: string;
  basePrice: string;
  discountPrice?: string;
  discount?: number;
}

export default function AdminPricing() {
  const [pricings, setPricings] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<PricingItem | null>(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/pricing', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPricings(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      // Mock data
      setPricings([
        {
          id: '1',
          service: 'Bridal Makeover',
          basePrice: '5000',
          discountPrice: '4500',
          discount: 10,
        },
        {
          id: '2',
          service: 'Hair Styling & Spa',
          basePrice: '2500',
        },
        {
          id: '3',
          service: 'Skin Aesthetics',
          basePrice: '3000',
          discountPrice: '2700',
          discount: 10,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (pricing: PricingItem) => {
    setEditingId(pricing.id);
    setEditValues({ ...pricing });
  };

  const savePrice = async (id: string) => {
    if (!editValues) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/pricing/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editValues),
      });

      if (response.ok) {
        setPricings(pricings.map((p) => (p.id === id ? editValues : p)));
        setEditingId(null);
        setEditValues(null);
      }
    } catch (error) {
      console.error('Failed to save pricing:', error);
    }
  };

  const calculateDiscount = (base: string, discount: string) => {
    const baseNum = parseFloat(base);
    const discountNum = parseFloat(discount);
    if (!baseNum || !discountNum) return 0;
    return Math.round(((baseNum - discountNum) / baseNum) * 100);
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-400">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Pricing Management</h2>
        <p className="text-zinc-500">Update prices and manage discounts for services</p>
      </div>

      {pricings.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">No pricing found</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {pricings.map((pricing, idx) => (
            <motion.div
              key={pricing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 bg-zinc-900 border border-gold/10 rounded-xl hover:border-gold/30 transition-colors"
            >
              {editingId === pricing.id && editValues ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-zinc-400 mb-2 block">Service Name</label>
                      <input
                        type="text"
                        value={editValues.service}
                        onChange={(e) =>
                          setEditValues({ ...editValues, service: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Base Price (₹)</label>
                      <input
                        type="number"
                        value={editValues.basePrice}
                        onChange={(e) =>
                          setEditValues({ ...editValues, basePrice: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">
                        Discount Price (₹)
                      </label>
                      <input
                        type="number"
                        value={editValues.discountPrice || ''}
                        onChange={(e) => {
                          const discountPrice = e.target.value;
                          const discount =
                            discountPrice && editValues.basePrice
                              ? calculateDiscount(editValues.basePrice, discountPrice)
                              : 0;
                          setEditValues({
                            ...editValues,
                            discountPrice,
                            discount,
                          });
                        }}
                        placeholder="Leave empty for no discount"
                        className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  {editValues.discount ? (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 text-sm">
                        <strong>{editValues.discount}% Discount Applied</strong>
                      </p>
                    </div>
                  ) : null}

                  <div className="flex gap-3">
                    <button
                      onClick={() => savePrice(pricing.id)}
                      className="px-4 py-2 bg-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-3">{pricing.service}</h3>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Base Price</p>
                        <p className="text-2xl font-bold text-gold">₹{pricing.basePrice}</p>
                      </div>
                      {pricing.discountPrice && (
                        <>
                          <div className="h-12 w-px bg-zinc-700"></div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Discount Price</p>
                            <p className="text-2xl font-bold text-green-400">
                              ₹{pricing.discountPrice}
                            </p>
                          </div>
                          <div className="h-12 w-px bg-zinc-700"></div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Discount</p>
                            <p className="text-2xl font-bold text-yellow-400">
                              -{pricing.discount}%
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(pricing)}
                    className="px-6 py-2.5 bg-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 bg-gold/5 border border-gold/20 rounded-xl"
      >
        <h4 className="font-bold text-gold mb-2">💡 How to Set Discounts</h4>
        <p className="text-sm text-zinc-300">
          Simply enter the discounted price and the system will automatically calculate the
          discount percentage. For example, if base price is ₹5,000 and discount price is
          ₹4,500, the system will show a 10% discount.
        </p>
      </motion.div>
    </div>
  );
}
