var express = require('express');
var RestauranteControler = require('../controllers/restaurante');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/restaurantes'})


api.post('/registrar-restaurante', md_auth.ensureAuth, RestauranteControler.registrarRestaurante);
api.put('/actualizar-restaurante/:id', md_auth.ensureAuth, RestauranteControler.actualizarRestaurante);
api.put('/actualizar-imagen-restaurante/:id', [md_auth.ensureAuth, md_upload], RestauranteControler.actualizarImagenRestaurante);
api.get('/obtener-imagen-restaurante/:imageFile', RestauranteControler.obtenerImagenRestaurante);
api.get('/restaurante/:id', RestauranteControler.obtenerRestaurante);
api.get('/restaurantes/:id/:page?', RestauranteControler.obtenerRestaurantes);
api.post('/crear-seccion-restaurante/:id', md_auth.ensureAuth, RestauranteControler.crearSeccion);
api.put('/actualizar-seccion-restaurante/:res/:sec', md_auth.ensureAuth, RestauranteControler.actualizarSeccion);
api.get('/obtener-seccion-restaurante/:id', RestauranteControler.obtenerSeccion);
api.get('/obtener-secciones-restaurantes/:id/:who/:page?', RestauranteControler.obtenerSecciones);

module.exports = api;