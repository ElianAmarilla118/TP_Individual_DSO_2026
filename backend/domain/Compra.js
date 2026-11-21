const EstadoCompra = require('./EstadoCompra');
const CambioEstadoCompra = require('./CambioEstadoCompra');
const Mensaje = require('./Mensaje');

class Compra {
  constructor({
    id,
    comprador,
    evento,
    tipoEntrada,
    cantidad,
    estado = EstadoCompra.PENDIENTE,
    mensajes = [],
    historialEstados = [],
  }) {
    this.id = id;
    this.comprador = comprador; // Instancia de Comprador
    this.evento = evento; // Instancia de Evento
    this.tipoEntrada = tipoEntrada; // Instancia de TipoEntrada
    this.cantidad = Number(cantidad);
    this.total = this.tipoEntrada.precio * this.cantidad;
    this.estado = estado;
    this.mensajes = mensajes;
    this.historialEstados = historialEstados;

    if (this.historialEstados.length === 0) {
      this._registrarCambioEstado(this.estado, comprador.comoActor());
    }
  }

  _registrarCambioEstado(nuevoEstado, actorRef) {
    const cambio = new CambioEstadoCompra({
      id: `cec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      compraId: this.id,
      estado: nuevoEstado,
      quien: actorRef,
    });
    this.historialEstados.push(cambio);
  }

  // Método del Diagrama Tentativo
  actualizarEstado(nuevoEstado, actorRef) {
    if (!Object.values(EstadoCompra).includes(nuevoEstado)) {
      throw new Error(`Estado inválido: ${nuevoEstado}`);
    }
    this.estado = nuevoEstado;
    this._registrarCambioEstado(nuevoEstado, actorRef);
  }

  // CU1: Días faltantes únicamente si está CONFIRMADA
  diasRestantesParaEvento(fechaReferencia = new Date()) {
    if (this.estado !== EstadoCompra.CONFIRMADA) return null;
    const diffMs = this.evento.fecha - fechaReferencia;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  // CU7 y CU8: Cancelable solo si no fue utilizada (ni cancelada/reembolsada) y el evento es futuro
  puedeCancelarse(fechaReferencia = new Date()) {
    const estadosBloqueados = [
      EstadoCompra.UTILIZADA,
      EstadoCompra.CANCELADA,
      EstadoCompra.REEMBOLSADA,
    ];
    return (
      !estadosBloqueados.includes(this.estado) &&
      !this.evento.yaSeRealizo(fechaReferencia)
    );
  }

  cancelarYReembolsar(actorRef, fechaReferencia = new Date()) {
    if (!this.puedeCancelarse(fechaReferencia)) {
      throw new Error(
        'No es posible cancelar esta compra: la entrada ya fue utilizada, cancelada o el evento ya ocurrió.'
      );
    }
    this.actualizarEstado(EstadoCompra.CANCELADA, actorRef);
    this.tipoEntrada.reponerCupo(this.cantidad);
    this.actualizarEstado(EstadoCompra.REEMBOLSADA, actorRef);
  }

  // CU5 y CU6: Envío y respuesta de mensajes dentro de la compra
  agregarMensaje(actorRef, texto) {
    if (!texto || !texto.trim()) {
      throw new Error('El contenido del mensaje no puede estar vacío.');
    }
    const nuevoMensaje = new Mensaje({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      autor: actorRef,
      mensaje: texto.trim(),
    });
    this.mensajes.push(nuevoMensaje);
    return nuevoMensaje;
  }

  // CU9: Solo habilitada una vez utilizada la entrada
  puedeSerReseniada() {
    return this.estado === EstadoCompra.UTILIZADA;
  }
}

module.exports = Compra;