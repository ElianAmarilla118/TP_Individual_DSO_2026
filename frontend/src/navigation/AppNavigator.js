import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import ExplorarScreen from '../screens/comprador/ExplorarScreen';
import EventoDetalleScreen from '../screens/comprador/EventoDetalleScreen';
import MisComprasScreen from '../screens/comprador/MisComprasScreen';
import MisEventosScreen from '../screens/organizador/MisEventosScreen';
import CrearEventoScreen from '../screens/organizador/CrearEventoScreen';
import VentasEventoScreen from '../screens/organizador/VentasEventoScreen';
import ChatCompraScreen from '../screens/compartido/ChatCompraScreen';
import PerfilSelectorScreen from '../screens/compartido/PerfilSelectorScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ExplorarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Explorar" component={ExplorarScreen} options={{ title: 'AI Ticket It — Eventos' }} />
      <Stack.Screen name="EventoDetalle" component={EventoDetalleScreen} options={{ title: 'Detalle del Evento' }} />
    </Stack.Navigator>
  );
}

function ComprasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MisCompras" component={MisComprasScreen} options={{ title: 'Mis Entradas' }} />
      <Stack.Screen
        name="ChatCompra"
        component={ChatCompraScreen}
        options={({ route }) => ({ title: route.params?.titulo || 'Chat' })}
      />
    </Stack.Navigator>
  );
}

function OrganizadorStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MisEventos" component={MisEventosScreen} options={{ title: 'Panel Organizador' }} />
      <Stack.Screen name="CrearEvento" component={CrearEventoScreen} options={{ title: 'Nuevo Evento' }} />
      <Stack.Screen
        name="VentasEvento"
        component={VentasEventoScreen}
        options={({ route }) => ({ title: route.params?.eventoNombre || 'Ventas' })}
      />
      <Stack.Screen
        name="ChatCompra"
        component={ChatCompraScreen}
        options={({ route }) => ({ title: route.params?.titulo || 'Chat' })}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { actorActivo } = useAuth();
  const esOrganizador = actorActivo?.tipo === 'ORGANIZADOR';

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#16A34A',
          tabBarInactiveTintColor: '#6B7280',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = 'ellipse-outline';

            if (route.name === 'ExplorarTab') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'MisComprasTab') {
              iconName = focused ? 'ticket' : 'ticket-outline';
            } else if (route.name === 'GestionTab') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'PerfilTab') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        {!esOrganizador ? (
          <>
            <Tab.Screen name="ExplorarTab" component={ExplorarStack} options={{ headerShown: false, title: 'Explorar' }} />
            <Tab.Screen name="MisComprasTab" component={ComprasStack} options={{ headerShown: false, title: 'Mis Compras' }} />
          </>
        ) : (
          <Tab.Screen name="GestionTab" component={OrganizadorStack} options={{ headerShown: false, title: 'Mis Eventos' }} />
        )}
        <Tab.Screen name="PerfilTab" component={PerfilSelectorScreen} options={{ title: 'Cambiar Rol' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}