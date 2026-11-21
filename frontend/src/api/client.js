import { Platform } from 'react-native';

// Cambiar TU_IP_LOCAL por la IPv4 de tu PC (ej. 192.168.0.15) para Expo Go
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const BASE_URL = `http://${HOST}:3000/api`;

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error en la solicitud al servidor');
  }
  return data;
}

export const api = {
  getActores: () => request('/actores'),
  getCategorias: () => request('/categorias'),
  getEventos: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    ).toString();
    return request(`/eventos${query ? `?${query}` : ''}`);
  },
  getEventoDetalle: (id) => request(`/eventos/${id}`),
  crearEvento: (payload) => request('/eventos', { method: 'POST', body: JSON.stringify(payload) }),
  toggleFavorito: (compradorId, eventoId) =>
    request(`/compradores/${compradorId}/favoritos/${eventoId}`, { method: 'POST' }),
  realizarCompra: (payload) => request('/compras', { method: 'POST', body: JSON.stringify(payload) }),
  getCompras: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/compras?${query}`);
  },
  cambiarEstadoCompra: (compraId, payload) =>
    request(`/compras/${compraId}/estado`, { method: 'PATCH', body: JSON.stringify(payload) }),
  cancelarCompra: (compraId, payload) =>
    request(`/compras/${compraId}/cancelar`, { method: 'POST', body: JSON.stringify(payload) }),
  getMensajes: (compraId) => request(`/compras/${compraId}/mensajes`),
  enviarMensaje: (compraId, payload) =>
    request(`/compras/${compraId}/mensajes`, { method: 'POST', body: JSON.stringify(payload) }),
  crearResenia: (payload) => request('/resenias', { method: 'POST', body: JSON.stringify(payload) }),
};