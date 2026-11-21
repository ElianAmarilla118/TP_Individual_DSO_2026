const { store } = require('../persistence/memoryStore');
const Evento = require('../domain/Evento');
const TipoEntrada = require('../domain/TipoEntrada');
const Compra = require('../domain/Compra');
const Resenia = require('../domain/Resenia');
const EstadoCompra = require('../domain/EstadoCompra');
const { TipoActor } = require('../domain/ActorRef');

function resolverActor(actorId, actorTipo) {
  if (actorTipo === TipoActor.COMPRADOR) {
    const comp = store.compradores.find((c) => c.id === actorId);
    if (!comp) throw new Error('Comprador no encontrado.');
    return comp.comoActor();
  }
  if (actorTipo === TipoActor.ORGANIZADOR) {
    const org = store.organizadores.find((o) => o.id === actorId);
    if (!org) throw new Error('Organizador no encontrado.');
    return org.comoActor();
  }
  throw new Error('Tipo de actor inválido.');
}

function serializarEvento(evento) {
  const puntajeOrganizador = evento.organizador.calcularPuntajePromedio(store.resenias);
  return {
    id: evento.id,
    nombre: evento.nombre,
    descripcion: evento.descripcion,
    categoria: evento.categoria,
    fecha: evento.fecha,
    multimedia: evento.multimedia,
    precioMinimo: evento.obtenerPrecioMinimo(),
    yaSeRealizo: evento.yaSeRealizo(),
    organizador: {
      id: evento.organizador.id,
      nombreComercial: evento.organizador.nombreComercial,
      descripcion: evento.organizador.descripcion,
      puntajePromedio: puntajeOrganizador,
    },
    tiposEntrada: evento.tiposEntrada.map((te) => ({
      id: te.id,
      nombre: te.nombre,
      descripcion: te.descripcion,
      precio: te.precio,
      cupoTotal: te.cupoTotal,
      cupoDisponible: te.cupoDisponible,
    })),
  };
}

function serializarCompra(compra) {
  const yaReseniada = store.resenias.some((r) => r.compraId === compra.id);
  return {
    id: compra.id,
    comprador: {
      id: compra.comprador.id,
      nombreCompleto: compra.comprador.nombreCompleto,
      email: compra.comprador.email,
    },
    evento: {
      id: compra.evento.id,
      nombre: compra.evento.nombre,
      fecha: compra.evento.fecha,
      organizadorId: compra.evento.organizador.id,
      organizadorNombre: compra.evento.organizador.nombreComercial,
    },
    tipoEntrada: {
      id: compra.tipoEntrada.id,
      nombre: compra.tipoEntrada.nombre,
      precio: compra.tipoEntrada.precio,
    },
    cantidad: compra.cantidad,
    total: compra.total,
    estado: compra.estado,
    diasRestantes: compra.diasRestantesParaEvento(),
    puedeCancelarse: compra.puedeCancelarse(),
    puedeSerReseniada: compra.puedeSerReseniada() && !yaReseniada,
    yaReseniada,
    mensajes: compra.mensajes,
    historialEstados: compra.historialEstados,
  };
}

const ticketItService = {
  obtenerActores() {
    return {
      compradores: store.compradores.map((c) => ({
        id: c.id,
        nombreCompleto: c.nombreCompleto,
        email: c.email,
        favoritosIds: c.favoritos.map((f) => f.id),
      })),
      organizadores: store.organizadores.map((o) => ({
        id: o.id,
        nombreComercial: o.nombreComercial,
        descripcion: o.descripcion,
        puntajePromedio: o.calcularPuntajePromedio(store.resenias),
      })),
    };
  },

  obtenerCategorias() {
    return store.categorias;
  },

  buscarEventos({ q, categoriaId, organizadorId, ordenarPor }) {
    let resultado = [...store.eventos];

    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      resultado = resultado.filter(
        (e) =>
          e.nombre.toLowerCase().includes(term) ||
          e.descripcion.toLowerCase().includes(term)
      );
    }

    if (categoriaId) {
      resultado = resultado.filter((e) => e.categoria.id === categoriaId);
    }

    if (organizadorId) {
      resultado = resultado.filter((e) => e.organizador.id === organizadorId);
    }

    // CU11: Ordenamiento por precio, fecha y puntaje del organizador
    switch (ordenarPor) {
      case 'precio_asc':
        resultado.sort((a, b) => a.obtenerPrecioMinimo() - b.obtenerPrecioMinimo());
        break;
      case 'precio_desc':
        resultado.sort((a, b) => b.obtenerPrecioMinimo() - a.obtenerPrecioMinimo());
        break;
      case 'fecha_asc':
        resultado.sort((a, b) => a.fecha - b.fecha);
        break;
      case 'fecha_desc':
        resultado.sort((a, b) => b.fecha - a.fecha);
        break;
      case 'puntaje_desc':
        resultado.sort(
          (a, b) =>
            b.organizador.calcularPuntajePromedio(store.resenias) -
            a.organizador.calcularPuntajePromedio(store.resenias)
        );
        break;
      default:
        resultado.sort((a, b) => a.fecha - b.fecha);
    }

    return resultado.map(serializarEvento);
  },

  obtenerEventoDetalle(eventoId) {
    const evento = store.eventos.find((e) => e.id === eventoId);
    if (!evento) {
      const err = new Error('Evento no encontrado.');
      err.status = 404;
      throw err;
    }

    // CU10: Reseñas históricas de todos los eventos del organizador
    const reseniasHistoricas = evento.organizador
      .obtenerReseniasHistoricas(store.resenias)
      .map((r) => ({
        id: r.id,
        compradorNombre: r.comprador.nombreCompleto,
        eventoNombre: r.evento.nombre,
        puntuacion: r.puntuacion,
        detalle: r.detalle,
        fecha: r.fecha,
      }));

    return {
      ...serializarEvento(evento),
      reseniasHistoricas,
    };
  },

  crearEvento({ organizadorId, nombre, descripcion, categoriaId, fecha, multimedia = [], tiposEntrada = [] }) {
    const organizador = store.organizadores.find((o) => o.id === organizadorId);
    if (!organizador) throw new Error('Organizador no encontrado.');

    const categoria = store.categorias.find((c) => c.id === categoriaId);
    if (!categoria) throw new Error('Categoría no encontrada.');

    const entradasInstanciadas = tiposEntrada.map(
      (te, idx) =>
        new TipoEntrada({
          id: `te-${Date.now()}-${idx}`,
          nombre: te.nombre,
          descripcion: te.descripcion || '',
          precio: te.precio,
          cupo: te.cupo,
        })
    );

    const nuevoEvento = new Evento({
      id: `ev-${Date.now()}`,
      nombre,
      descripcion,
      categoria,
      fecha,
      multimedia: multimedia.length > 0 ? multimedia : ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'],
      tiposEntrada: entradasInstanciadas,
      organizador,
    });

    store.eventos.push(nuevoEvento);
    return serializarEvento(nuevoEvento);
  },

  toggleFavorito(compradorId, eventoId) {
    const comprador = store.compradores.find((c) => c.id === compradorId);
    if (!comprador) throw new Error('Comprador no encontrado.');

    const evento = store.eventos.find((e) => e.id === eventoId);
    if (!evento) throw new Error('Evento no encontrado.');

    const esFavorito = comprador.toggleFavorito(evento);
    return {
      esFavorito,
      favoritosIds: comprador.favoritos.map((f) => f.id),
    };
  },

  realizarCompra({ compradorId, eventoId, tipoEntradaId, cantidad }) {
    const comprador = store.compradores.find((c) => c.id === compradorId);
    if (!comprador) throw new Error('Comprador no encontrado.');

    const evento = store.eventos.find((e) => e.id === eventoId);
    if (!evento) throw new Error('Evento no encontrado.');

    if (evento.yaSeRealizo()) {
      throw new Error('No se pueden comprar entradas para un evento que ya finalizó.');
    }

    const tipoEntrada = evento.obtenerTipoEntradaPorId(tipoEntradaId);
    if (!tipoEntrada) throw new Error('Tipo de entrada no encontrado.');

    // CU12: Validar y descontar cupo
    tipoEntrada.descontarCupo(Number(cantidad));

    const nuevaCompra = new Compra({
      id: `comp-ord-${Date.now()}`,
      comprador,
      evento,
      tipoEntrada,
      cantidad: Number(cantidad),
      estado: EstadoCompra.CONFIRMADA,
    });

    store.compras.push(nuevaCompra);
    return serializarCompra(nuevaCompra);
  },

  listarCompras({ compradorId, eventoId }) {
    let compras = [...store.compras];
    if (compradorId) {
      compras = compras.filter((c) => c.comprador.id === compradorId);
    }
    if (eventoId) {
      compras = compras.filter((c) => c.evento.id === eventoId);
    }
    return compras.map(serializarCompra);
  },

  cambiarEstadoCompra(compraId, { nuevoEstado, actorId, actorTipo }) {
    const compra = store.compras.find((c) => c.id === compraId);
    if (!compra) throw new Error('Compra no encontrada.');

    const actorRef = resolverActor(actorId, actorTipo);
    compra.actualizarEstado(nuevoEstado, actorRef);
    return serializarCompra(compra);
  },

  cancelarCompra(compraId, { actorId, actorTipo }) {
    const compra = store.compras.find((c) => c.id === compraId);
    if (!compra) throw new Error('Compra no encontrada.');

    const actorRef = resolverActor(actorId, actorTipo);
    compra.cancelarYReembolsar(actorRef);
    return serializarCompra(compra);
  },

  obtenerMensajes(compraId) {
    const compra = store.compras.find((c) => c.id === compraId);
    if (!compra) throw new Error('Compra no encontrada.');
    return compra.mensajes;
  },

  enviarMensaje(compraId, { actorId, actorTipo, mensaje }) {
    const compra = store.compras.find((c) => c.id === compraId);
    if (!compra) throw new Error('Compra no encontrada.');

    const esCompradorDeCompra = actorTipo === TipoActor.COMPRADOR && compra.comprador.id === actorId;
    const esOrganizadorDeEvento = actorTipo === TipoActor.ORGANIZADOR && compra.evento.organizador.id === actorId;

    if (!esCompradorDeCompra && !esOrganizadorDeEvento) {
      throw new Error('No tenés permisos para escribir en el chat de esta compra.');
    }

    const actorRef = resolverActor(actorId, actorTipo);
    return compra.agregarMensaje(actorRef, mensaje);
  },

  crearResenia({ compraId, compradorId, puntuacion, detalle }) {
    const compra = store.compras.find((c) => c.id === compraId);
    if (!compra) throw new Error('Compra no encontrada.');

    if (compra.comprador.id !== compradorId) {
      throw new Error('Solo el titular de la compra puede calificar el evento.');
    }

    if (!compra.puedeSerReseniada()) {
      throw new Error('Solo podés reseñar eventos cuya entrada ya haya sido utilizada.');
    }

    if (store.resenias.some((r) => r.compraId === compraId)) {
      throw new Error('Ya dejaste una reseña para esta compra.');
    }

    const nuevaResenia = new Resenia({
      id: `res-${Date.now()}`,
      comprador: compra.comprador,
      evento: compra.evento,
      compraId: compra.id,
      puntuacion,
      detalle,
    });

    store.resenias.push(nuevaResenia);
    return {
      id: nuevaResenia.id,
      puntuacion: nuevaResenia.puntuacion,
      detalle: nuevaResenia.detalle,
      fecha: nuevaResenia.fecha,
    };
  },
};

module.exports = ticketItService;