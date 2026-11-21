import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [actores, setActores] = useState({ compradores: [], organizadores: [] });
  const [actorActivo, setActorActivo] = useState(null); // { id, tipo: 'COMPRADOR' | 'ORGANIZADOR', nombre, favoritosIds? }
  const [cargando, setCargando] = useState(true);

  const cargarActores = async () => {
    try {
      const data = await api.getActores();
      setActores(data);
      if (!actorActivo && data.compradores.length > 0) {
        const primero = data.compradores[0];
        setActorActivo({
          id: primero.id,
          tipo: 'COMPRADOR',
          nombre: primero.nombreCompleto,
          favoritosIds: primero.favoritosIds || [],
        });
      }
    } catch (err) {
      console.error('Error cargando actores:', err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarActores();
  }, []);

  const seleccionarComprador = (comp) => {
    setActorActivo({
      id: comp.id,
      tipo: 'COMPRADOR',
      nombre: comp.nombreCompleto,
      favoritosIds: comp.favoritosIds || [],
    });
  };

  const seleccionarOrganizador = (org) => {
    setActorActivo({
      id: org.id,
      tipo: 'ORGANIZADOR',
      nombre: org.nombreComercial,
    });
  };

  const actualizarFavoritosLocal = (favoritosIds) => {
    setActorActivo((prev) => (prev ? { ...prev, favoritosIds } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        actores,
        actorActivo,
        cargando,
        seleccionarComprador,
        seleccionarOrganizador,
        actualizarFavoritosLocal,
        recargarActores: cargarActores,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);