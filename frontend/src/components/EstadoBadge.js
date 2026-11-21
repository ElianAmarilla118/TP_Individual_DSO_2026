import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORES_ESTADO = {
  PENDIENTE: { bg: '#FEF3C7', text: '#92400E' },
  CONFIRMADA: { bg: '#D1FAE5', text: '#065F46' },
  UTILIZADA: { bg: '#DBEAFE', text: '#1E40AF' },
  CANCELADA: { bg: '#FEE2E2', text: '#991B1B' },
  REEMBOLSADA: { bg: '#F3E8FF', text: '#6B21A8' },
};

export default function EstadoBadge({ estado }) {
  const estilo = COLORES_ESTADO[estado] || { bg: '#E5E7EB', text: '#374151' };
  return (
    <View style={[styles.badge, { backgroundColor: estilo.bg }]}>
      <Text style={[styles.text, { color: estilo.text }]}>{estado}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});