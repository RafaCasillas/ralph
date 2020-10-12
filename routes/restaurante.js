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
api.get('/restaurantes-admin/:status', md_auth.ensureAuth, RestauranteControler.obtenerRestaurantesAdmin);
api.get('/restaurantes/:id/:who', RestauranteControler.obtenerRestaurantes);
api.post('/crear-seccion-restaurante/:id', md_auth.ensureAuth, RestauranteControler.crearSeccion);
api.put('/actualizar-seccion-restaurante/:res/:sec', md_auth.ensureAuth, RestauranteControler.actualizarSeccion);
api.get('/obtener-seccion-restaurante/:id', RestauranteControler.obtenerSeccion);
api.get('/obtener-secciones-restaurantes/:id/:who/:page?', RestauranteControler.obtenerSecciones);
api.delete('/eliminar-seccion/:id', RestauranteControler.eliminarSeccion);
api.get('/credito/:id/:num/:can', md_auth.ensureAuth, RestauranteControler.actualizarCredito);
api.get('/alta-restaurante/:id/:status', md_auth.ensureAuth, RestauranteControler.darDeAltaRestaurante);
api.post('/crear-horario', md_auth.ensureAuth, RestauranteControler.crearHorario);
api.get('/abrirrestaurantes/:con', md_auth.ensureAuth, RestauranteControler.abrirRestaurantes);
api.get('/obtener-horario/:res', md_auth.ensureAuth, RestauranteControler.obtenerHorario);
api.get('/agregar-telefono/:id/:tel', md_auth.ensureAuth, RestauranteControler.agregarTelefono);
api.get('/opciones-restaurante/:id/:op', md_auth.ensureAuth, RestauranteControler.opcionesRestaurante);
api.post('/crear-deposito', md_auth.ensureAuth, RestauranteControler.crearDeposito);
api.get('/obtener-deposito/:id', md_auth.ensureAuth, RestauranteControler.obtenerDeposito);
api.get('/obtener-depositos/:id/:page?', md_auth.ensureAuth, RestauranteControler.obtenerDepositos);
api.post('/crear-cobro', md_auth.ensureAuth, RestauranteControler.crearCobro);
api.get('/obtener-cobro/:id', md_auth.ensureAuth, RestauranteControler.obtenerCobro);
api.get('/obtener-cobros/:id/:page?', md_auth.ensureAuth, RestauranteControler.obtenerCobros);


module.exports = api;