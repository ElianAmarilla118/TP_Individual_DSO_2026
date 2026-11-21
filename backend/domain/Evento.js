class Evento {
  constructor({
    id,
    nombre,
    descripcion,
    categoria,
    fecha,
    tiposEntrada = [],
    multimedia = [],
    organizador,
  }) {
    if (!tiposEntrada || tiposEntrada.length === 0) {
      throw new Error('Un evento debe tener al menos un tipo de entrada.');
    }

    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria; // Instancia de Categoria
    this.fecha = new Date(fecha);
    this.tiposEntrada = tiposEntrada; // Array de TipoEntrada
    this.multimedia = multimedia; // Array de Strings (URLs)
    this.organizador = organizador; // Instancia de Organizador
  }

  // Método del Diagrama Tentativo
  tuPrecioEstaEntre(min, max) {
    return this.tiposEntrada.some((te) => te.precio >= min && te.precio <= max);
  }

  // CU11: Precio base para ordenar el catálogo
  obtenerPrecioMinimo() {
    return Math.min(...this.tiposEntrada.map((te) => te.precio));
  }

  // CU8: Verifica si el evento ya ocurrió
  yaSeRealizo(fechaReferencia = new Date()) {
    return fechaReferencia >= this.fecha;
  }

  obtenerTipoEntradaPorId(tipoEntradaId) {
    return this.tiposEntrada.find((te) => te.id === tipoEntradaId) || null;
  }
}

module.exports = Evento;