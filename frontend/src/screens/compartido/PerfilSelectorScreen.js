import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function PerfilSelectorScreen() {
  const { actores, actorActivo, seleccionarComprador, seleccionarOrganizador } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.currentBox}>
        <Text style={styles.currentLabel}>SESIÓN ACTIVA</Text>
        <Text style={styles.currentName}>{actorActivo?.nombre}</Text>
        <Text style={styles.currentRole}>Rol: {actorActivo?.tipo}</Text>
      </View>

      <Text style={styles.sectionTitle}>Cambiar a Perfil Comprador</Text>
      {actores.compradores.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[styles.card, actorActivo?.id === c.id && styles.selected]}
          onPress={() => seleccionarComprador(c)}
        >
          <Text style={styles.name}>{c.nombreCompleto}</Text>
          <Text style={styles.sub}>{c.email}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Cambiar a Perfil Organizador</Text>
      {actores.organizadores.map((o) => (
        <TouchableOpacity
          key={o.id}
          style={[styles.card, actorActivo?.id === o.id && styles.selected]}
          onPress={() => seleccionarOrganizador(o)}
        >
          <Text style={styles.name}>{o.nombreComercial}</Text>
          <Text style={styles.sub}>Reputación: ★ {o.puntajePromedio || 'S/C'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  currentBox: { backgroundColor: '#16A34A', padding: 16, borderRadius: 12, marginBottom: 16 },
  currentLabel: { color: '#DCFCE7', fontSize: 11, fontWeight: '700' },
  currentName: { color: '#FFF', fontSize: 20, fontWeight: '800', marginVertical: 2 },
  currentRole: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  selected: { borderColor: '#16A34A', borderWidth: 2, backgroundColor: '#F0FDF4' },
  name: { fontWeight: '700', fontSize: 15 },
  sub: { fontSize: 13, color: '#6B7280' },
});