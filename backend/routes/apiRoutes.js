const express = require('express');
const router = express.Router();
const ticketItService = require('../services/ticketItService');

// Actores y Categorías
router.get('/actores', (req, res, next) => {
  try {
    res.json(ticketItService.obtenerActores());
  } catch (e) { next(e); }
});

router.get('/categorias', (req, res, next) => {
  try {
    res.json(ticketItService.obtenerCategorias());
  } catch (e) { next(e); }
});

// Eventos
router.get('/eventos', (req, res, next) => {
  try {
    res.json(ticketItService.buscarEventos(req.query));
  } catch (e) { next(e); }
});

router.get('/eventos/:id', (req, res, next) => {
  try {
    res.json(ticketItService.obtenerEventoDetalle(req.params.id));
  } catch (e) { next(e); }
});

router.post('/eventos', (req, res, next) => {
  try {
    const creado = ticketItService.crearEvento(req.body);
    res.status(201).json(creado);
  } catch (e) { next(e); }
});

// Favoritos
router.post('/compradores/:compradorId/favoritos/:eventoId', (req, res, next) => {
  try {
    const resultado = ticketItService.toggleFavorito(req.params.compradorId, req.params.eventoId);
    res.json(resultado);
  } catch (e) { next(e); }
});

// Compras
router.post('/compras', (req, res, next) => {
  try {
    const compra = ticketItService.realizarCompra(req.body);
    res.status(201).json(compra);
  } catch (e) { next(e); }
});

router.get('/compras', (req, res, next) => {
  try {
    res.json(ticketItService.listarCompras(req.query));
  } catch (e) { next(e); }
});

router.patch('/compras/:id/estado', (req, res, next) => {
  try {
    const compra = ticketItService.cambiarEstadoCompra(req.params.id, req.body);
    res.json(compra);
  } catch (e) { next(e); }
});

router.post('/compras/:id/cancelar', (req, res, next) => {
  try {
    const compra = ticketItService.cancelarCompra(req.params.id, req.body);
    res.json(compra);
  } catch (e) { next(e); }
});

// Chat en Compras
router.get('/compras/:id/mensajes', (req, res, next) => {
  try {
    res.json(ticketItService.obtenerMensajes(req.params.id));
  } catch (e) { next(e); }
});

router.post('/compras/:id/mensajes', (req, res, next) => {
  try {
    const msg = ticketItService.enviarMensaje(req.params.id, req.body);
    res.status(201).json(msg);
  } catch (e) { next(e); }
});

// Reseñas
router.post('/resenias', (req, res, next) => {
  try {
    const resenia = ticketItService.crearResenia(req.body);
    res.status(201).json(resenia);
  } catch (e) { next(e); }
});

module.exports = router;