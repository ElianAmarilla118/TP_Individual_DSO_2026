import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function MisEventosScreen({ navigation }) {
  const { actorActivo } = useAuth();
  const [eventos, setEventos] = useState([]);

  const cargarMisEventos = async () => {
    try {
      const data = await api.getEventos({ organizadorId: actorActivo.id });
      setEventos(data);
    } catch (e) {
      console.error(e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarMisEventos();
    }, [actorActivo])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate('CrearEvento')}
      >
        <Text style={styles.createBtnText}>+ Publicar Nuevo Evento</Text>
      </TouchableOpacity>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VentasEvento', { eventoId: item.id, eventoNombre: item.nombre })}
          >
            <Text style={styles.cat}>{item.categoria.nombre}</Text>
            <Text style={styles.title}>{item.nombre}</Text>
            <Text style={styles.date}>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>

            <View style={styles.stockBox}>
              {item.tiposEntrada.map((te) => (
                <Text key={te.id} style={styles.stockLine}>
                  • {te.nombre}: {te.cupoDisponible} disponibles de {te.cupoTotal} (${te.precio})
                </Text>
              ))}
            </View>

            <Text style={styles.link}>Administrar ventas y chats →</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 12 },
  createBtn: { backgroundColor: '#16A34A', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  createBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cat: { fontSize: 11, fontWeight: '700', color: '#16A34A', textTransform: 'uppercase' },
  title: { fontSize: 17, fontWeight: '800', color: '#111827', marginVertical: 3 },
  date: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  stockBox: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 8 },
  stockLine: { fontSize: 13, color: '#374151', marginBottom: 2 },
  link: { color: '#1D4ED8', fontWeight: '700', fontSize: 13 },
});