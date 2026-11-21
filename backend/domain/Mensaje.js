class Mensaje {
  constructor({ id, autor, mensaje, enviado = new Date() }) {
    this.id = id;
    this.autor = autor; // Instancia de ActorRef
    this.mensaje = mensaje;
    this.enviado = new Date(enviado);
  }
}

module.exports = Mensaje;