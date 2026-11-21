const { ActorRef, TipoActor } = require('./ActorRef');

class Organizador {
  constructor({ id, nombreComercial, descripcion = '', email }) {
    this.id = id;
    this.nombreComercial = nombreComercial;
    this.descripcion = descripcion;
    this.email = email;
  }

  // CU10: Obtiene las reseñas históricas de todos los eventos organizados por este organizador
  obtenerReseniasHistoricas(todasLasResenias) {
    return todasLasResenias.filter(
      (resenia) => resenia.evento.organizador.id === this.id
    );
  }

  // CU11: Calcula puntaje promedio para ordenamiento de eventos en el catálogo
  calcularPuntajePromedio(todasLasResenias) {
    const reseniasPropias = this.obtenerReseniasHistoricas(todasLasResenias);
    if (reseniasPropias.length === 0) return 0;
    const suma = reseniasPropias.reduce((acc, r) => acc + r.puntuacion, 0);
    return Number((suma / reseniasPropias.length).toFixed(1));
  }

  comoActor() {
    return new ActorRef({
      id: this.id,
      tipo: TipoActor.ORGANIZADOR,
      nombre: this.nombreComercial,
    });
  }
}

module.exports = Organizador;