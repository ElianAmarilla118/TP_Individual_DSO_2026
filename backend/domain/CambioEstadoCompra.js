class CambioEstadoCompra {
  constructor({ id, compraId, estado, quien, fechaHora = new Date() }) {
    this.id = id;
    this.compraId = compraId;
    this.estado = estado; // EstadoCompra
    this.quien = quien; // Instancia de ActorRef
    this.fechaHora = new Date(fechaHora);
  }
}

module.exports = CambioEstadoCompra;