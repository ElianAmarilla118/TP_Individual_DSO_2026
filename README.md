# 🎟️ AI Ticket It — Plataforma de Venta de Entradas para Eventos

**Trabajo Práctico Individual — 2C 2026**  
**Cátedra Desarrollo de Software — UTN FRBA**

---

## 📋 Descripción del Proyecto

**AI Ticket It** es una aplicación mobile *full-stack* diseñada para conectar a organizadores de eventos con espectadores. Permite a productores y salas publicar eventos con múltiples tipos de entrada (con precios y cupos diferenciados) y administrar sus ventas, mientras que los compradores pueden explorar el catálogo, filtrar, ordenar, gestionar favoritos, adquirir entradas, chatear con el organizador, cancelar compras con reembolso y calificar eventos finalizados.

---

## 🛠️ Stack Tecnológico y Arquitectura

El proyecto está estructurado en dos módulos independientes bajo una arquitectura cliente-servidor:

* **Back-End (`backend/`):** Node.js + Express (JavaScript ES6+), API RESTful y **persistencia en memoria** con precarga inicial de escenarios de prueba (*seeding*).
* **Front-End (`frontend/`):** React Native + Expo (JavaScript), navegación mediante React Navigation (Bottom Tabs + Native Stack) y gestión de estado global con React Context.

### Estructura del Repositorio

```text
TP_Individual_DSO_2026/
├── backend/
│   ├── domain/                  # Entidades, enums y reglas de negocio puras
│   │   ├── ActorRef.js
│   │   ├── CambioEstadoCompra.js
│   │   ├── Categoria.js
│   │   ├── Compra.js
│   │   ├── Comprador.js
│   │   ├── EstadoCompra.js
│   │   ├── Evento.js
│   │   ├── Mensaje.js
│   │   ├── Organizador.js
│   │   ├── Resenia.js
│   │   └── TipoEntrada.js
│   ├── persistence/
│   │   ├── memoryStore.js       # Almacén en memoria
│   │   └── seed.js              # Datos precargados para pruebas
│   ├── routes/
│   │   └── apiRoutes.js         # Endpoints REST
│   ├── services/
│   │   └── ticketItService.js   # Orquestación y serialización
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/                 # Cliente HTTP (fetch)
    │   ├── components/          # Componentes reutilizables (EstadoBadge)
    │   ├── context/             # AuthContext (selector de rol/actor activo)
    │   ├── navigation/          # AppNavigator (Tabs dinámicos por rol)
    │   └── screens/
    │       ├── compartido/      # ChatCompraScreen, PerfilSelectorScreen
    │       ├── comprador/       # ExplorarScreen, EventoDetalleScreen, MisComprasScreen
    │       └── organizador/     # MisEventosScreen, CrearEventoScreen, VentasEventoScreen
    ├── App.js
    └── package.json
```

Para ver el diagrama UML completo de entidades y relaciones, consultá /docs/DIAGRAM.mmd

---

## 🧠 Decisiones de Diseño (Modelo de Dominio)

Partiendo del diagrama tentativo propuesto por la cátedra, se tomaron las siguientes decisiones arquitectónicas para mejorar la cohesión y escalabilidad del dominio:

1. **Separación de Actores (`Comprador` y `Organizador`):** En lugar de utilizar una única clase polimórfica `Usuario`, se modelaron `Comprador` y `Organizador` como entidades independientes. Esto evita que un organizador exponga comportamientos propios de un espectador (como guardar favoritos o comprar entradas) y aísla el cálculo de reputación histórica en `Organizador`.
2. **Desacoplamiento mediante `ActorRef`:** Dado que tanto compradores como organizadores participan en el chat de una compra y ejecutan transiciones de estado, `Mensaje` y `CambioEstadoCompra` referencian un *Value Object* `ActorRef` (`{ id, tipo, nombre }`), conservando la trazabilidad completa sin acoplar ambas entidades.
3. **Encapsulamiento de Reglas de Negocio:**
   * **Control de cupos (`TipoEntrada`):** Validación y descuento/reposición atómica (`hayCupoPara`, `descontarCupo`, `reponerCupo`).
   * **Ciclo de vida de compra (`Compra`):** Máquina de estados (`PENDIENTE` → `CONFIRMADA` → `UTILIZADA` / `CANCELADA` → `REEMBOLSADA`) con auditoría en `CambioEstadoCompra`.
   * **Política de cancelación:** Solo habilitada si la entrada no está `UTILIZADA` y la fecha del evento es futura, disparando automáticamente el reembolso y la liberación de cupo.
   * **Reseñas post-evento:** Habilitadas únicamente cuando la compra alcanza el estado `UTILIZADA`, impactando en tiempo real en el puntaje promedio del organizador.

---

## ✅ Funcionalidades de la aplicación

* **Catálogo y Búsqueda:** Búsqueda textual por nombre/descripción, filtrado por categoría y favoritos, y ordenamiento dinámico por precio, fecha y puntaje del organizador.
* **Detalle y Reputación:** Visualización de reseñas históricas del organizador y compra de entradas seleccionando tipo y cantidad sin exceder el cupo disponible.
* **Seguimiento y Cancelación:** Visualización clara de estados, cálculo de días restantes para compras confirmadas y cancelación con reembolso automático.
* **Gestión del Organizador:** Publicación de nuevos eventos con múltiples tipos de entrada, monitoreo de cupos disponibles y administración de estados de venta.
* **Chat Bidireccional y Reseñas:** Mensajería integrada dentro de cada compra entre comprador y organizador, y sistema de calificación numérica (1 a 5) con comentario tras asistir al evento.

---

## 🔌 Endpoints Principales de la API REST (`/api`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/actores` | Lista compradores y organizadores precargados para alternar perfiles |
| `GET` | `/categorias` | Obtiene las categorías disponibles |
| `GET` | `/eventos` | Lista eventos con filtros (`q`, `categoriaId`, `organizadorId`) y orden (`ordenarPor`) |
| `GET` | `/eventos/:id` | Detalle del evento, cupos por tipo de entrada y reseñas históricas del organizador |
| `POST` | `/eventos` | Crea un nuevo evento con sus tipos de entrada |
| `POST` | `/compradores/:id/favoritos/:eventoId` | Agrega o quita un evento de favoritos |
| `POST` | `/compras` | Registra una compra validando y descontando el cupo disponible |
| `GET` | `/compras` | Lista compras filtradas por `compradorId` o `eventoId` |
| `PATCH` | `/compras/:id/estado` | Actualiza el estado de una compra (`CONFIRMADA`, `UTILIZADA`) |
| `POST` | `/compras/:id/cancelar` | Cancela la compra, repone el cupo y registra el estado `REEMBOLSADA` |
| `GET / POST` | `/compras/:id/mensajes` | Obtiene o envía mensajes en el chat de una compra |
| `POST` | `/resenias` | Registra una puntuación y comentario sobre una entrada utilizada |

---

## 🚀 Instalación y Ejecución Local

### Requisitos Previos
* **Node.js** (v18 o superior)
* **Android Studio** (con un Emulador Android configurado) o dispositivo físico con la app **Expo Go**

### 1. Levantar el Back-End
```bash
cd backend
npm install
npm start
```
El servidor quedará escuchando en `http://0.0.0.0:3000` con los datos iniciales precargados en memoria.

### 2. Configurar Conexión y Levantar el Front-End
1. Verificá la constante `HOST` en `frontend/src/api/client.js`:
   * Para **Emulador de Android**: usar `'10.0.2.2'` (configurado por defecto).
   * Para **Expo Go en celular físico**: reemplazar por la IPv4 local de tu PC en la misma red Wi-Fi (ej. `'192.168.1.X'`).
2. Iniciá la aplicación mobile:
```bash
cd frontend
npm install
npx expo start --android
```

---

## 🧪 Escenarios Precargados para Pruebas

Al iniciar el servidor, se cargan automáticamente datos listos para probar todos los flujos sin carga manual:
* **Compradores:** *Martín Gómez* y *Lucía Fernández*.
* **Organizadores:** *Move Concerts AR* (con reseña histórica precargada) y *Sala Teatro El Picadero*.
* **Eventos:** *Noche de Rock Sinfónico* (futuro), *Stand Up: Código y Café* (futuro) y *Festival Indie Primavera* (pasado, con entrada en estado `UTILIZADA` lista para calificar).
* **Cambio rápido de rol:** Desde la pestaña **Cambiar Rol** en la barra inferior se puede alternar en vivo entre cualquier comprador u organizador.