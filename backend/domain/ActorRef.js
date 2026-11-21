const TipoActor = Object.freeze({
  COMPRADOR: 'COMPRADOR',
  ORGANIZADOR: 'ORGANIZADOR',
});

class ActorRef {
  constructor({ id, tipo, nombre }) {
    if (!Object.values(TipoActor).includes(tipo)) {
      throw new Error(`Tipo de actor inválido: ${tipo}`);
    }
    this.id = id;
    this.tipo = tipo;
    this.nombre = nombre;
  }
}

module.exports = { ActorRef, TipoActor };