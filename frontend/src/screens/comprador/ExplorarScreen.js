import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ExplorarScreen({ navigation }) {
  const { actorActivo, actualizarFavoritosLocal } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha_asc');
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  const cargarDatos = async () => {
    try {
      const [evs, cats] = await Promise.all([
        api.getEventos({ q: busqueda, categoriaId, ordenarPor }),
        api.getCategorias(),
      ]);
      setEventos(evs);
      setCategorias(cats);
    } catch (e) {
      console.error(e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [busqueda, categoriaId, ordenarPor])
  );

  const handleToggleFavorito = async (eventoId) => {
    try {
      const res = await api.toggleFavorito(actorActivo.id, eventoId);
      actualizarFavoritosLocal(res.favoritosIds);
    } catch (e) {
      alert(e.message);
    }
  };

  const eventosMostrados = soloFavoritos
    ? eventos.filter((e) => actorActivo?.favoritosIds?.includes(e.id))
    : eventos;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar eventos por nombre o descripción..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Filtro por Categorías y Favoritos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, categoriaId === '' && !soloFavoritos && styles.chipActive]}
          onPress={() => { setCategoriaId(''); setSoloFavoritos(false); }}
        >
          <Text style={[styles.chipText, categoriaId === '' && !soloFavoritos && styles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, soloFavoritos && styles.chipActive]}
          onPress={() => setSoloFavoritos(!soloFavoritos)}
        >
          <Text style={[styles.chipText, soloFavoritos && styles.chipTextActive]}>♥ Favoritos</Text>
        </TouchableOpacity>

        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, categoriaId === cat.id && styles.chipActive]}
            onPress={() => { setSoloFavoritos(false); setCategoriaId(cat.id); }}
          >
            <Text style={[styles.chipText, categoriaId === cat.id && styles.chipTextActive]}>{cat.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ordenamiento (CU11): Fecha, Precio y Puntaje del Organizador */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {[
          { key: 'fecha_asc', label: 'Fecha ↑' },
          { key: 'precio_asc', label: 'Menor Precio' },
          { key: 'precio_desc', label: 'Mayor Precio' },
          { key: 'puntaje_desc', label: 'Mejor Puntaje ★' },
        ].map((ord) => (
          <TouchableOpacity
            key={ord.key}
            style={[styles.sortChip, ordenarPor === ord.key && styles.sortChipActive]}
            onPress={() => setOrdenarPor(ord.key)}
          >
            <Text style={[styles.sortText, ordenarPor === ord.key && styles.sortTextActive]}>{ord.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={eventosMostrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const esFav = actorActivo?.favoritosIds?.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('EventoDetalle', { eventoId: item.id })}
            >
              <Image source={{ uri: item.multimedia[0] }} style={styles.image} />
              <View style={styles.cardBody}>
                <View style={styles.rowBetween}>
                  <Text style={styles.categoria}>{item.categoria.nombre}</Text>
                  <TouchableOpacity onPress={() => handleToggleFavorito(item.id)}>
                    <Text style={{ fontSize: 20, color: esFav ? '#EF4444' : '#9CA3AF' }}>
                      {esFav ? '♥' : '♡'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.title}>{item.nombre}</Text>
                <Text style={styles.meta}>
                  {new Date(item.fecha).toLocaleDateString()} • {item.organizador.nombreComercial} (★ {item.organizador.puntajePromedio || 'S/C'})
                </Text>
                <Text style={styles.price}>Desde ${item.precioMinimo.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 12 },
  searchInput: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8 },
  chipsRow: { flexGrow: 0, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E5E7EB', marginRight: 8 },
  chipActive: { backgroundColor: '#16A34A' },
  chipText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#FFF' },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', marginRight: 8, backgroundColor: '#FFF' },
  sortChipActive: { borderColor: '#16A34A', backgroundColor: '#DCFCE7' },
  sortText: { fontSize: 12, color: '#4B5563' },
  sortTextActive: { color: '#15803D', fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  image: { width: '100%', height: 140 },
  cardBody: { padding: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoria: { fontSize: 12, fontWeight: '700', color: '#16A34A', textTransform: 'uppercase' },
  title: { fontSize: 17, fontWeight: '700', color: '#111827', marginVertical: 4 },
  meta: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  price: { fontSize: 15, fontWeight: '700', color: '#111827' },
});