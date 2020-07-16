'use strict'
 
var express = require('express');
var StatsControler = require('../controllers/stats');

var api = express.Router();

api.post('/new-stats', StatsControler.crearStats);
api.get('/stats/:mun/:usuario/:rol', StatsControler.nuevaVisitaApp);
api.get('/nueva-visita/:rol', StatsControler.nuevaVisita12hr);
api.get('/stat/:res', StatsControler.nuevaVisitaRestaurante);
api.get('/visitas', StatsControler.obtenerVisitas);
api.get('/visitafb/:campania/:tipo/:numero/:mun/:usuario', StatsControler.nuevavisitaFB);
api.get('/visitapub/:parametro', StatsControler.nuevaVisitaPublicidad);
api.get('/promo-cupon/:status', StatsControler.promoCupon);
api.get('/click-categoria/:id', StatsControler.nuevoClickCategoria);
api.get('/nuevo-pedido/:status', StatsControler.nuevoPedido);
api.get('/cupon-expirado/:status', StatsControler.cuponExpirado);
api.get('/allstats', StatsControler.stats);
api.get('/get-stats/:collection/:page', StatsControler.getStats);

module.exports = api;