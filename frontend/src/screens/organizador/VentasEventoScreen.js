import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import EstadoBadge from '../../components/EstadoBadge';

export default function VentasEventoScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const { actorActivo } = useAuth();
  const [evento, setEvento] = useState(null);
  const [ventas, setVentas] = useState([]);

  const cargarTodo = async () => {
    try {
      const [evDet, comprasEv] = await Promise.all([
        api.getEventoDetalle(eventoId),
        api.getCompras({ eventoId }),
      ]);
      setEvento(evDet);
      setVentas(comprasEv);
    } catch (e) {
      console.error(e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarTodo();
    }, [eventoId])
  );

  const cambiarEstado = async (compraId, nuevoEstado) => {
    try {
      await api.cambiarEstadoCompra(compraId, {
        nuevoEstado,
        actorId: actorActivo.id,
        actorTipo: actorActivo.tipo,
      });
      cargarTodo();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cupos disponibles por tipo de entrada (CU2) */}
      {evento && (
        <View style={styles.cuposCard}>
          <Text style={styles.cuposTitle}>Disponibilidad de Entradas</Text>
          {evento.tiposEntrada.map((te) => (
            <Text key={te.id} style={styles.cupoItem}>
              • {te.nombre}: <Text style={{ fontWeight: '800' }}>{te.cupoDisponible}</Text> / {te.cupoTotal} disponibles
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.subTitle}>Compras Asociadas ({ventas.length})</Text>
      <FlatList
        data={ventas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.buyer}>{item.comprador.nombreCompleto}</Text>
              <EstadoBadge estado={item.estado} />
            </View>
            <Text style={styles.detail}>
              {item.cantidad}x {item.tipoEntrada.nombre} — ${item.total.toLocaleString()}
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() =>
                  navigation.navigate('ChatCompra', {
                    compraId: item.id,
                    titulo: `Chat con ${item.comprador.nombreCompleto}`,
                  })
                }
              >
                <Text style={styles.chatBtnText}>💬 Responder ({item.mensajes.length})</Text>
              </TouchableOpacity>

              {item.estado === 'PENDIENTE' && (
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => cambiarEstado(item.id, 'CONFIRMADA')}
                >
                  <Text style={styles.confirmBtnText}>Confirmar Pago</Text>
                </TouchableOpacity>
              )}

              {item.estado === 'CONFIRMADA' && (
                <TouchableOpacity
                  style={styles.useBtn}
                  onPress={() => cambiarEstado(item.id, 'UTILIZADA')}
                >
                  <Text style={styles.useBtnText}>Marcar Utilizada</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 12 },
  cuposCard: { backgroundColor: '#ECFDF5', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  cuposTitle: { fontWeight: '800', color: '#065F46', marginBottom: 4 },
  cupoItem: { fontSize: 13, color: '#047857' },
  subTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 10, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buyer: { fontWeight: '800', fontSize: 15 },
  detail: { fontSize: 13, color: '#4B5563', marginVertical: 4 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chatBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  chatBtnText: { color: '#1D4ED8', fontWeight: '700', fontSize: 12 },
  confirmBtn: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  confirmBtnText: { color: '#065F46', fontWeight: '700', fontSize: 12 },
  useBtn: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  useBtnText: { color: '#1E40AF', fontWeight: '700', fontSize: 12 },
});