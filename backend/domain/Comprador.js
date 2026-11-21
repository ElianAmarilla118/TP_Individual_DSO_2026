const { ActorRef, TipoActor } = require('./ActorRef');

class Comprador {
  constructor({ id, nombre, apellido, email, favoritos = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.favoritos = favoritos; // Array de Evento
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }

  toggleFavorito(evento) {
    const index = this.favoritos.findIndex((e) => e.id === evento.id);
    if (index === -1) {
      this.favoritos.push(evento);
      return true;
    }
    this.favoritos.splice(index, 1);
    return false;
  }

  esFavorito(eventoId) {
    return this.favoritos.some((e) => e.id === eventoId);
  }

  comoActor() {
    return new ActorRef({
      id: this.id,
      tipo: TipoActor.COMPRADOR,
      nombre: this.nombreCompleto,
    });
  }
}

module.exports = Comprador;