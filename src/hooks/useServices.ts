import { useEffect, useState } from 'react';
import { fetchServices, ServiceRecord } from '../services/serviceService';

export function useServices() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    void loadServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch: loadServices,
  };
}
