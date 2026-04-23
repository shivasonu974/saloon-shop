export interface ServiceRecord {
  id: string;
  category: string;
  title: string;
  description: string;
  price?: string;
  image: string;
}

export interface ServicePayload {
  category: string;
  title: string;
  description: string;
  price?: string;
  image?: string;
}

const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function fetchServices(): Promise<ServiceRecord[]> {
  const response = await fetch('/api/services');
  return parseResponse<ServiceRecord[]>(response);
}

export async function createService(payload: ServicePayload, adminToken: string): Promise<ServiceRecord> {
  const response = await fetch('/api/services', {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<ServiceRecord>(response);
}

export async function updateService(id: string, payload: ServicePayload, adminToken: string): Promise<ServiceRecord> {
  const response = await fetch(`/api/services/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<ServiceRecord>(response);
}

export async function deleteService(id: string, adminToken: string): Promise<void> {
  const response = await fetch(`/api/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  await parseResponse<{ message: string }>(response);
}

export function getOrderedCategories(services: ServiceRecord[]): string[] {
  const preferredOrder = ['Basic Services', 'Styling', 'Coloring', 'Treatments', 'Care'];
  const existingCategories = Array.from(new Set(services.map((service) => service.category)));

  return existingCategories.sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(left);
    const rightIndex = preferredOrder.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;

    return leftIndex - rightIndex;
  });
}
