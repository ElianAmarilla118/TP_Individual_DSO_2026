const store = {
  compradores: [],
  organizadores: [],
  categorias: [],
  eventos: [],
  compras: [],
  resenias: [],
};

function resetStore() {
  store.compradores = [];
  store.organizadores = [];
  store.categorias = [];
  store.eventos = [];
  store.compras = [];
  store.resenias = [];
}

module.exports = { store, resetStore };