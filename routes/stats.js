'use strict'
 
var express = require('express');
var StatsControler = require('../controllers/stats');

var api = express.Router();

api.post('/new-stats', StatsControler.crearStats);
api.get('/stats/:mun/:usuario', StatsControler.nuevaVisitaApp);
api.get('/stat/:res', StatsControler.nuevaVisitaRestaurante);
api.get('/visitas', StatsControler.obtenerVisitas);

module.exports = api;