import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Trash2, Edit2, Plus, X, RefreshCw } from 'lucide-react';
import {
  createService,
  deleteService,
  fetchServices,
  getOrderedCategories,
  ServicePayload,
  ServiceRecord,
  updateService,
} from '../../services/serviceService';

const emptyForm: ServicePayload = {
  title: '',
  category: '',
  description: '',
  price: '',
  image: '',
};

export default function AdminServices() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServicePayload>(emptyForm);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchServices();
      setServices(data);
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const token = localStorage.getItem('adminToken') || '';
      const payload: ServicePayload = {
        ...formData,
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        price: formData.price?.trim() || '',
        image: formData.image?.trim() || '',
      };

      const savedService = editingId
        ? await updateService(editingId, payload, token)
        : await createService(payload, token);

      setServices((current) => {
        if (editingId) {
          return current.map((service) => (service.id === editingId ? savedService : service));
        }

        return [...current, savedService];
      });

      setNotice(editingId ? 'Service updated.' : 'Service added.');
      resetForm();
    } catch (err: any) {
      console.error('Failed to save service:', err);
      setError(err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    setError(null);
    setNotice(null);

    try {
      const token = localStorage.getItem('adminToken') || '';
      await deleteService(id, token);
      setServices((current) => current.filter((service) => service.id !== id));
      setNotice('Service deleted.');
    } catch (err: any) {
      console.error('Failed to delete service:', err);
      setError(err.message || 'Failed to delete service');
    }
  };

  const startEdit = (service: ServiceRecord) => {
    setFormData({
      title: service.title,
      category: service.category,
      description: service.description || '',
      price: service.price || '',
      image: service.image || '',
    });
    setEditingId(service.id);
    setShowForm(true);
    setNotice(null);
    setError(null);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const categories = getOrderedCategories(services);

  if (loading) {
    return <div className="text-center py-12 text-zinc-400">Loading services...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold mb-2">Services</h2>
          <p className="text-zinc-500">Manage the services shown on the website and booking flow.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void loadServices()}
            className="px-4 py-2.5 bg-zinc-800 text-white font-bold rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} /> Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Service
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm">
          {notice}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-zinc-900 border border-gold/20 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{editingId ? 'Edit Service' : 'Add New Service'}</h3>
            <button onClick={resetForm}>
              <X className="text-zinc-400 hover:text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Service name"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                required
              />
              <input
                type="text"
                placeholder="Category"
                list="service-categories"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
                required
              />
            </div>

            <datalist id="service-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Price (optional)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">No services found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="p-6 bg-zinc-900 border border-gold/10 rounded-xl hover:border-gold/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold mb-2">{service.category}</p>
                  <h3 className="text-lg font-bold">{service.title}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(service)}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400"
                    title="Edit service"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => void handleDelete(service.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                    title="Delete service"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-zinc-400 mb-4 min-h-12">{service.description || 'No description added yet.'}</p>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <p className="text-xl font-bold text-gold">{service.price || 'Price on request'}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">{service.id}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
