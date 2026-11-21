import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function EventoDetalleScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const { actorActivo } = useAuth();
  const [evento, setEvento] = useState(null);
  const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [comprando, setComprando] = useState(false);

  const cargarDetalle = async () => {
    try {
      const data = await api.getEventoDetalle(eventoId);
      setEvento(data);
      if (data.tiposEntrada.length > 0 && !tipoSeleccionadoId) {
        setTipoSeleccionadoId(data.tiposEntrada[0].id);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [eventoId]);

  if (!evento) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#16A34A" />;

  const tipoActual = evento.tiposEntrada.find((t) => t.id === tipoSeleccionadoId);

  const handleComprar = async () => {
    if (!tipoActual) return;
    setComprando(true);
    try {
      await api.realizarCompra({
        compradorId: actorActivo.id,
        eventoId: evento.id,
        tipoEntradaId: tipoActual.id,
        cantidad,
      });
      Alert.alert('¡Compra Confirmada!', `Adquiriste ${cantidad} entrada(s) ${tipoActual.nombre}.`, [
        { text: 'Ir a Mis Compras', onPress: () => navigation.navigate('MisComprasTab') },
      ]);
      cargarDetalle();
    } catch (e) {
      Alert.alert('No se pudo realizar la compra', e.message);
    } finally {
      setComprando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: evento.multimedia[0] }} style={styles.banner} />
      <View style={styles.content}>
        <Text style={styles.cat}>{evento.categoria.nombre}</Text>
        <Text style={styles.title}>{evento.nombre}</Text>
        <Text style={styles.date}>Fecha: {new Date(evento.fecha).toLocaleString()}</Text>
        <Text style={styles.desc}>{evento.descripcion}</Text>

        {/* Información del Organizador y Reputación */}
        <View style={styles.orgBox}>
          <Text style={styles.orgTitle}>Organiza: {evento.organizador.nombreComercial}</Text>
          <Text style={styles.orgScore}>
            Reputación histórica: ★ {evento.organizador.puntajePromedio || 'Sin calificaciones aún'}
          </Text>
        </View>

        {/* Selección de Tipo de Entrada y Cantidad (CU12) */}
        <Text style={styles.sectionTitle}>Seleccioná tu Entrada</Text>
        {evento.tiposEntrada.map((te) => {
          const selected = te.id === tipoSeleccionadoId;
          return (
            <TouchableOpacity
              key={te.id}
              style={[styles.ticketCard, selected && styles.ticketSelected]}
              onPress={() => { setTipoSeleccionadoId(te.id); setCantidad(1); }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.ticketName}>{te.nombre}</Text>
                <Text style={styles.ticketDesc}>{te.descripcion}</Text>
                <Text style={styles.ticketCupo}>Disponibles: {te.cupoDisponible} / {te.cupoTotal}</Text>
              </View>
              <Text style={styles.ticketPrice}>${te.precio.toLocaleString()}</Text>
            </TouchableOpacity>
          );
        })}

        {!evento.yaSeRealizo && tipoActual && (
          <View style={styles.buyPanel}>
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Cantidad:</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setCantidad(Math.max(1, cantidad - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{cantidad}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setCantidad(Math.min(tipoActual.cupoDisponible, cantidad + 1))}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.buyBtn, (comprando || tipoActual.cupoDisponible === 0) && styles.disabledBtn]}
              disabled={comprando || tipoActual.cupoDisponible === 0}
              onPress={handleComprar}
            >
              <Text style={styles.buyBtnText}>
                {tipoActual.cupoDisponible === 0
                  ? 'Agotado'
                  : `Comprar por $${(tipoActual.precio * cantidad).toLocaleString()}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reseñas Históricas del Organizador (CU10) */}
        <Text style={styles.sectionTitle}>
          Reseñas de Eventos Anteriores del Organizador ({evento.reseniasHistoricas.length})
        </Text>
        {evento.reseniasHistoricas.length === 0 ? (
          <Text style={styles.emptyText}>Este organizador aún no tiene reseñas registradas.</Text>
        ) : (
          evento.reseniasHistoricas.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.reviewAuthor}>{r.compradorNombre}</Text>
                <Text style={styles.reviewStars}>{'★'.repeat(r.puntuacion)}</Text>
              </View>
              <Text style={styles.reviewEvent}>Evento: {r.eventoNombre}</Text>
              <Text style={styles.reviewText}>"{r.detalle}"</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  banner: { width: '100%', height: 200 },
  content: { padding: 16 },
  cat: { color: '#16A34A', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginVertical: 4 },
  date: { fontSize: 14, color: '#4B5563', marginBottom: 8 },
  desc: { fontSize: 15, color: '#374151', lineHeight: 21, marginBottom: 14 },
  orgBox: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 10, marginBottom: 16 },
  orgTitle: { fontWeight: '700', fontSize: 15, color: '#111827' },
  orgScore: { fontSize: 13, color: '#D97706', fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 12, marginBottom: 8 },
  ticketCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, marginBottom: 8 },
  ticketSelected: { borderColor: '#16A34A', backgroundColor: '#F0FDF4', borderWidth: 2 },
  ticketName: { fontWeight: '700', fontSize: 15 },
  ticketDesc: { fontSize: 12, color: '#6B7280' },
  ticketCupo: { fontSize: 12, color: '#15803D', marginTop: 4, fontWeight: '600' },
  ticketPrice: { fontWeight: '800', fontSize: 16, color: '#111827' },
  buyPanel: { backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, marginVertical: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  qtyLabel: { fontSize: 15, fontWeight: '600', marginRight: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: '700' },
  qtyVal: { fontSize: 16, fontWeight: '700', marginHorizontal: 14 },
  buyBtn: { backgroundColor: '#16A34A', padding: 14, borderRadius: 10, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#9CA3AF' },
  buyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  reviewCard: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 10, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewAuthor: { fontWeight: '700', fontSize: 14 },
  reviewStars: { color: '#F59E0B', fontWeight: '700' },
  reviewEvent: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  reviewText: { fontSize: 13, color: '#374151', fontStyle: 'italic' },
  emptyText: { color: '#6B7280', fontStyle: 'italic' },
});