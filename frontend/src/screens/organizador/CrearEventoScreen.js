import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet,
} from 'react-native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function CrearEventoScreen({ navigation }) {
  const { actorActivo } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [diasEnFuturo, setDiasEnFuturo] = useState('15');
  const [tiposEntrada, setTiposEntrada] = useState([
    { nombre: 'General', descripcion: 'Acceso general', precio: '10000', cupo: '100' },
  ]);

  useEffect(() => {
    api.getCategorias().then((cats) => {
      setCategorias(cats);
      if (cats.length > 0) setCategoriaId(cats[0].id);
    });
  }, []);

  const agregarTipoEntrada = () => {
    setTiposEntrada([...tiposEntrada, { nombre: '', descripcion: '', precio: '', cupo: '' }]);
  };

  const actualizarTipo = (index, campo, valor) => {
    const copia = [...tiposEntrada];
    copia[index][campo] = valor;
    setTiposEntrada(copia);
  };

  const handleGuardar = async () => {
    try {
      const fechaEvento = new Date(Date.now() + Number(diasEnFuturo) * 24 * 60 * 60 * 1000).toISOString();
      await api.crearEvento({
        organizadorId: actorActivo.id,
        nombre,
        descripcion,
        categoriaId,
        fecha: fechaEvento,
        tiposEntrada: tiposEntrada.map((t) => ({
          nombre: t.nombre,
          descripcion: t.descripcion,
          precio: Number(t.precio),
          cupo: Number(t.cupo),
        })),
      });
      Alert.alert('Éxito', 'Evento publicado correctamente.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error al crear evento', e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre del Evento</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Festival Electrónico" />

      <Text style={styles.label}>Descripción</Text>
      <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} placeholder="Detalle del espectáculo" multiline />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.catRow}>
        {categorias.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catChip, categoriaId === c.id && styles.catChipActive]}
            onPress={() => setCategoriaId(c.id)}
          >
            <Text style={{ color: categoriaId === c.id ? '#FFF' : '#374151', fontWeight: '600' }}>{c.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Días hasta el evento (desde hoy)</Text>
      <TextInput style={styles.input} value={diasEnFuturo} onChangeText={setDiasEnFuturo} keyboardType="numeric" />

      <Text style={styles.sectionTitle}>Tipos de Entrada</Text>
      {tiposEntrada.map((te, idx) => (
        <View key={idx} style={styles.ticketBox}>
          <TextInput
            style={styles.input}
            placeholder="Nombre (Ej. VIP, Platea)"
            value={te.nombre}
            onChangeText={(v) => actualizarTipo(idx, 'nombre', v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={te.descripcion}
            onChangeText={(v) => actualizarTipo(idx, 'descripcion', v)}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Precio ($)"
              keyboardType="numeric"
              value={te.precio}
              onChangeText={(v) => actualizarTipo(idx, 'precio', v)}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Cupo"
              keyboardType="numeric"
              value={te.cupo}
              onChangeText={(v) => actualizarTipo(idx, 'cupo', v)}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addTicketBtn} onPress={agregarTipoEntrada}>
        <Text style={styles.addTicketText}>+ Agregar otro tipo de entrada</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleGuardar}>
        <Text style={styles.submitBtnText}>Publicar Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  label: { fontWeight: '700', fontSize: 14, color: '#374151', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 12 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E5E7EB' },
  catChipActive: { backgroundColor: '#16A34A' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginVertical: 8 },
  ticketBox: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  addTicketBtn: { padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#16A34A', borderRadius: 8, marginBottom: 16 },
  addTicketText: { color: '#16A34A', fontWeight: '700' },
  submitBtn: { backgroundColor: '#16A34A', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});