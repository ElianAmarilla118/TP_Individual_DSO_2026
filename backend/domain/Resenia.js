class Resenia {
  constructor({ id, comprador, evento, compraId, detalle, puntuacion, fecha = new Date() }) {
    const score = Number(puntuacion);
    if (Number.isNaN(score) || score < 1 || score > 5) {
      throw new Error('La puntuación debe ser un valor numérico entre 1 y 5.');
    }
    if (!detalle || !detalle.trim()) {
      throw new Error('El comentario de la reseña no puede estar vacío.');
    }

    this.id = id;
    this.comprador = comprador; // Instancia de Comprador
    this.evento = evento; // Instancia de Evento
    this.compraId = compraId;
    this.detalle = detalle.trim();
    this.puntuacion = score;
    this.fecha = new Date(fecha);
  }
}

module.exports = Resenia;