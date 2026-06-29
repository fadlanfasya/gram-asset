import useAuthStore from '../stores/useAuthStore'

const BASE = import.meta.env.VITE_API_BASE_URL

const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${useAuthStore.getState().token}`,
})

const request = async (path, options = {}) => {
    const res = await fetch(`${BASE}${path}`, { ...options, headers: getHeaders() })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${res.status})`)
    }
    return res.status === 204 ? null : res.json()
}

export const resourcesApi = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString()
        return request(`/ats/resources${qs ? `?${qs}` : ''}`)
    },
    getById: (id) => request(`/ats/resources/${id}`),
    create: (data) => request('/ats/resources', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/ats/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/ats/resources/${id}`, { method: 'DELETE' }),
    updateAssets: (id, assetIds) =>
        request(`/ats/resources/${id}/assets`, { method: 'PUT', body: JSON.stringify({ assetIds }) }),
}

export const importApi = {
    uploadCsv: async (file) => {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${BASE}/ats/import`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
            body: form,
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || `Import failed (${res.status})`);
        }
        return res.json();
    },
};

export const costsApi = {
    getForResource: (resourceId) => request(`/ats/resources/${resourceId}/costs`),
    add: (resourceId, data) =>
        request(`/ats/resources/${resourceId}/costs`, { method: 'POST', body: JSON.stringify(data) }),
    update: (costId, data) => request(`/ats/costs/${costId}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (costId) => request(`/ats/costs/${costId}`, { method: 'DELETE' }),
}
