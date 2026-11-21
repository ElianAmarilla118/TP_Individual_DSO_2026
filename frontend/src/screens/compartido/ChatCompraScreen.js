import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ChatCompraScreen({ route }) {
  const { compraId } = route.params;
  const { actorActivo } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');

  const cargarMensajes = async () => {
    try {
      const data = await api.getMensajes(compraId);
      setMensajes(data);
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, [compraId]);

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    try {
      await api.enviarMensaje(compraId, {
        actorId: actorActivo.id,
        actorTipo: actorActivo.tipo,
        mensaje: texto,
      });
      setTexto('');
      cargarMensajes();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={mensajes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const esMio = item.autor.id === actorActivo.id && item.autor.tipo === actorActivo.tipo;
          return (
            <View style={[styles.bubble, esMio ? styles.myBubble : styles.theirBubble]}>
              <Text style={styles.author}>
                {item.autor.nombre} ({item.autor.tipo})
              </Text>
              <Text style={styles.msgText}>{item.mensaje}</Text>
              <Text style={styles.time}>
                {new Date(item.enviado).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribí tu consulta o respuesta..."
          value={texto}
          onChangeText={setTexto}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleEnviar}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 8 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#DCFCE7' },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#FFF' },
  author: { fontSize: 11, fontWeight: '700', color: '#4B5563', marginBottom: 2 },
  msgText: { fontSize: 14, color: '#111827' },
  time: { fontSize: 10, color: '#6B7280', alignSelf: 'flex-end', marginTop: 4 },
  inputRow: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E5E7EB' },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  sendBtn: { justifyContent: 'center', backgroundColor: '#16A34A', borderRadius: 20, paddingHorizontal: 16, marginLeft: 8 },
  sendText: { color: '#FFF', fontWeight: '700' },
});