class TipoEntrada {
  constructor({ id, nombre, descripcion, precio, cupo }) {
    if (precio < 0) throw new Error('El precio no puede ser negativo.');
    if (cupo <= 0) throw new Error('El cupo inicial debe ser mayor a cero.');

    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = Number(precio);
    this.cupoTotal = Number(cupo);
    this.cupoDisponible = Number(cupo);
  }

  // Método del Diagrama Tentativo (CU12)
  hayCupoPara(cantidad) {
    return Number.isInteger(cantidad) && cantidad > 0 && this.cupoDisponible >= cantidad;
  }

  descontarCupo(cantidad) {
    if (!this.hayCupoPara(cantidad)) {
      throw new Error(`Cupo insuficiente para "${this.nombre}". Disponible: ${this.cupoDisponible}.`);
    }
    this.cupoDisponible -= cantidad;
  }

  reponerCupo(cantidad) {
    this.cupoDisponible = Math.min(this.cupoTotal, this.cupoDisponible + cantidad);
  }
}

module.exports = TipoEntrada;