import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import EstadoBadge from '../../components/EstadoBadge';

export default function MisComprasScreen({ navigation }) {
  const { actorActivo } = useAuth();
  const [compras, setCompras] = useState([]);
  const [modalResenia, setModalResenia] = useState(null); // compra seleccionada
  const [puntuacion, setPuntuacion] = useState(5);
  const [detalle, setDetalle] = useState('');

  const cargarCompras = async () => {
    try {
      const data = await api.getCompras({ compradorId: actorActivo.id });
      setCompras(data);
    } catch (e) {
      console.error(e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCompras();
    }, [actorActivo])
  );

  const handleCancelar = (compra) => {
    Alert.alert(
      'Cancelar Compra',
      '¿Confirmás la cancelación? Se reembolsará el importe y se liberarán las entradas.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar y Reembolsar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.cancelarCompra(compra.id, {
                actorId: actorActivo.id,
                actorTipo: actorActivo.tipo,
              });
              cargarCompras();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const handleEnviarResenia = async () => {
    try {
      await api.crearResenia({
        compraId: modalResenia.id,
        compradorId: actorActivo.id,
        puntuacion,
        detalle,
      });
      setModalResenia(null);
      setDetalle('');
      setPuntuacion(5);
      Alert.alert('¡Gracias!', 'Tu reseña fue publicada.');
      cargarCompras();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={compras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <EstadoBadge estado={item.estado} />
              {/* CU1: Días faltantes si está CONFIRMADA */}
              {item.estado === 'CONFIRMADA' && item.diasRestantes !== null && (
                <Text style={styles.countdown}>
                  ⏳ Faltan {item.diasRestantes} día(s)
                </Text>
              )}
            </View>

            <Text style={styles.eventName}>{item.evento.nombre}</Text>
            <Text style={styles.info}>
              {item.cantidad}x {item.tipoEntrada.nombre} • Total: ${item.total.toLocaleString()}
            </Text>
            <Text style={styles.date}>Fecha: {new Date(item.evento.fecha).toLocaleDateString()}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('ChatCompra', { compraId: item.id, titulo: item.evento.nombre })}
              >
                <Text style={styles.chatBtnText}>💬 Chat ({item.mensajes.length})</Text>
              </TouchableOpacity>

              {item.puedeCancelarse && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelar(item)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
              )}

              {item.puedeSerReseniada && (
                <TouchableOpacity style={styles.reviewBtn} onPress={() => setModalResenia(item)}>
                  <Text style={styles.reviewBtnText}>★ Calificar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      {/* Modal de Reseña (CU9) */}
      <Modal visible={!!modalResenia} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calificar Evento</Text>
            <Text style={styles.modalSub}>{modalResenia?.evento.nombre}</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity key={num} onPress={() => setPuntuacion(num)}>
                  <Text style={[styles.star, num <= puntuacion && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Contá tu experiencia con el evento y el organizador..."
              multiline
              numberOfLines={4}
              value={detalle}
              onChangeText={setDetalle}
            />

            <View style={styles.rowBetween}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalResenia(null)}>
                <Text>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={handleEnviarResenia}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Publicar Reseña</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 12 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countdown: { fontSize: 13, fontWeight: '700', color: '#059669' },
  eventName: { fontSize: 17, fontWeight: '800', color: '#111827', marginTop: 8 },
  info: { fontSize: 14, color: '#374151', marginTop: 2 },
  date: { fontSize: 12, color: '#6B7280', marginTop: 2, marginBottom: 10 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  chatBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  chatBtnText: { color: '#1D4ED8', fontWeight: '700', fontSize: 13 },
  cancelBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  cancelBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  reviewBtn: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  reviewBtnText: { color: '#B45309', fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 14, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalSub: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 14, gap: 10 },
  star: { fontSize: 34, color: '#D1D5DB' },
  starActive: { color: '#F59E0B' },
  textArea: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, height: 90, textAlignVertical: 'top', marginBottom: 14 },
  modalCancel: { padding: 12 },
  modalSubmit: { backgroundColor: '#16A34A', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
});