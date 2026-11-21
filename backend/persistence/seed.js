const { store, resetStore } = require('./memoryStore');
const Comprador = require('../domain/Comprador');
const Organizador = require('../domain/Organizador');
const Categoria = require('../domain/Categoria');
const TipoEntrada = require('../domain/TipoEntrada');
const Evento = require('../domain/Evento');
const Compra = require('../domain/Compra');
const Resenia = require('../domain/Resenia');
const EstadoCompra = require('../domain/EstadoCompra');

function seedDatabase() {
  resetStore();

  // 1. Categorías
  const catMusica = new Categoria({ id: 'cat-1', nombre: 'Recitales', descripcion: 'Música en vivo y festivales' });
  const catTeatro = new Categoria({ id: 'cat-2', nombre: 'Teatro', descripcion: 'Obras teatrales y stand-up' });
  const catTech = new Categoria({ id: 'cat-3', nombre: 'Conferencias', descripcion: 'Tecnología, diseño y negocios' });
  store.categorias.push(catMusica, catTeatro, catTech);

  // 2. Organizadores
  const org1 = new Organizador({
    id: 'org-1',
    nombreComercial: 'Move Concerts AR',
    descripcion: 'Productora líder de shows internacionales y festivales.',
    email: 'contacto@moveconcerts.com',
  });
  const org2 = new Organizador({
    id: 'org-2',
    nombreComercial: 'Sala Teatro El Picadero',
    descripcion: 'Espacio cultural independiente en el corazón de Buenos Aires.',
    email: 'info@elpicadero.com',
  });
  store.organizadores.push(org1, org2);

  // 3. Compradores
  const comp1 = new Comprador({
    id: 'comp-1',
    nombre: 'Martín',
    apellido: 'Gómez',
    email: 'martin.gomez@email.com',
  });
  const comp2 = new Comprador({
    id: 'comp-2',
    nombre: 'Lucía',
    apellido: 'Fernández',
    email: 'lucia.f@email.com',
  });
  store.compradores.push(comp1, comp2);

  // 4. Eventos (2 futuros y 1 pasado para reseñas)
  const diasEnMs = (dias) => new Date(Date.now() + dias * 24 * 60 * 60 * 1000);

  const ev1 = new Evento({
    id: 'ev-1',
    nombre: 'Noche de Rock Sinfónico',
    descripcion: 'Orquesta en vivo interpretando clásicos del rock nacional.',
    categoria: catMusica,
    fecha: diasEnMs(12),
    organizador: org1,
    multimedia: ['https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'],
    tiposEntrada: [
      new TipoEntrada({ id: 'te-1', nombre: 'Campo General', descripcion: 'Acceso general de pie', precio: 15000, cupo: 100 }),
      new TipoEntrada({ id: 'te-2', nombre: 'Platea Preferencial', descripcion: 'Butaca numerada con buena vista', precio: 28000, cupo: 40 }),
      new TipoEntrada({ id: 'te-3', nombre: 'VIP Experience', descripcion: 'Acceso prioritario + consumición', precio: 45000, cupo: 10 }),
    ],
  });

  const ev2 = new Evento({
    id: 'ev-2',
    nombre: 'Stand Up: Código y Café',
    descripcion: 'Monólogos de humor sobre la vida en sistemas y startups.',
    categoria: catTeatro,
    fecha: diasEnMs(5),
    organizador: org2,
    multimedia: ['https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800'],
    tiposEntrada: [
      new TipoEntrada({ id: 'te-4', nombre: 'Entrada General', descripcion: 'Ubicación por orden de llegada', precio: 9500, cupo: 50 }),
      new TipoEntrada({ id: 'te-5', nombre: 'Mesa Front Row', descripcion: 'Primera fila frente al escenario', precio: 16000, cupo: 8 }),
    ],
  });

  const evPasado = new Evento({
    id: 'ev-3',
    nombre: 'Festival Indie Primavera (Edición Anterior)',
    descripcion: 'Bandas emergentes al aire libre.',
    categoria: catMusica,
    fecha: diasEnMs(-10),
    organizador: org1,
    multimedia: ['https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'],
    tiposEntrada: [
      new TipoEntrada({ id: 'te-6', nombre: 'Pase Único', descripcion: 'Acceso a todos los escenarios', precio: 12000, cupo: 200 }),
    ],
  });

  store.eventos.push(ev1, ev2, evPasado);

  // Favorito inicial para Martín
  comp1.toggleFavorito(ev1);

  // 5. Compras en distintos estados
  // Compra 1: CONFIRMADA (evento futuro -> muestra días restantes y permite cancelar)
  const te1 = ev1.obtenerTipoEntradaPorId('te-1');
  te1.descontarCupo(2);
  const compra1 = new Compra({
    id: 'comp-ord-1',
    comprador: comp1,
    evento: ev1,
    tipoEntrada: te1,
    cantidad: 2,
    estado: EstadoCompra.CONFIRMADA,
  });
  compra1.agregarMensaje(comp1.comoActor(), 'Hola, ¿a qué hora abren las puertas del estadio?');
  compra1.agregarMensaje(org1.comoActor(), '¡Hola Martín! Las puertas abren a las 19:00 hs.');

  // Compra 2: PENDIENTE (permite confirmar o cancelar)
  const te4 = ev2.obtenerTipoEntradaPorId('te-4');
  te4.descontarCupo(1);
  const compra2 = new Compra({
    id: 'comp-ord-2',
    comprador: comp1,
    evento: ev2,
    tipoEntrada: te4,
    cantidad: 1,
    estado: EstadoCompra.PENDIENTE,
  });

  // Compra 3: UTILIZADA en evento pasado (permite dejar reseña - CU9)
  const te6 = evPasado.obtenerTipoEntradaPorId('te-6');
  te6.descontarCupo(2);
  const compra3 = new Compra({
    id: 'comp-ord-3',
    comprador: comp1,
    evento: evPasado,
    tipoEntrada: te6,
    cantidad: 2,
    estado: EstadoCompra.UTILIZADA,
  });

  // Compra 4: UTILIZADA por Lucía con reseña ya cargada (alimenta CU10 y CU11)
  te6.descontarCupo(1);
  const compra4 = new Compra({
    id: 'comp-ord-4',
    comprador: comp2,
    evento: evPasado,
    tipoEntrada: te6,
    cantidad: 1,
    estado: EstadoCompra.UTILIZADA,
  });

  store.compras.push(compra1, compra2, compra3, compra4);

  // 6. Reseña inicial sobre org1
  const resenia1 = new Resenia({
    id: 'res-1',
    comprador: comp2,
    evento: evPasado,
    compraId: compra4.id,
    puntuacion: 5,
    detalle: 'Excelente sonido, puntualidad y muy buena organización en los accesos.',
    fecha: diasEnMs(-9),
  });
  store.resenias.push(resenia1);
}

module.exports = { seedDatabase };