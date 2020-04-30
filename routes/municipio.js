'use strict'

var express = require('express');
var MunicipioControler = require('../controllers/municipio');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');

api.post('/m-registro', md_auth.ensureAuth, MunicipioControler.registrarMunicipio);
api.post('/c-registro', md_auth.ensureAuth, MunicipioControler.registrarCategoriaMunicipio);
api.get('/municipios', MunicipioControler.obtenerMunicipios);
api.get('/categorias-municipios', MunicipioControler.obtenerCategorias);

module.exports = api;