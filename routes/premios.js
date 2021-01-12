var express = require('express');
var PremiosControler = require('../controllers/premios');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/premios'});


api.post('/crear-sorteo', md_auth.ensureAuth, PremiosControler.crearSorteo);
api.post('/crear-recompensa', md_auth.ensureAuth, PremiosControler.crearRecompensa);
api.get('/generar-boletos/:id/:can', md_auth.ensureAuth, PremiosControler.generarBoletos);
api.put('/actualizar-imagen-sorteo/:id/:tipo', [md_auth.ensureAuth, md_upload], PremiosControler.actualizarImagenSorteo);
api.post('/actualizar-sorteo', md_auth.ensureAuth, PremiosControler.actualizarSorteo);
api.post('/actualizar-recompensa', md_auth.ensureAuth, PremiosControler.actualizarRecompensa);
api.get('/asignar-boleto/:id/:prem', md_auth.ensureAuth, PremiosControler.asignarUsuarioABoleto);
api.get('/obtener-imagen-sorteo/:imageFile', PremiosControler.obtenerImagenSorteo);
api.get('/obtener-sorteos/:page', PremiosControler.obtenerSorteos);
api.get('/obtener-boletos/:tel/:page', PremiosControler.obtenerBoletos);
api.get('/obtener-recompensas/:page', PremiosControler.obtenerRecompensas);
api.get('/obtener-sorteo/:id', PremiosControler.obtenerSorteo);
api.get('/obtener-boleto/:id/:num', PremiosControler.obtenerBoleto);
api.get('/obtener-recompensa/:id', PremiosControler.obtenerRecompensa);
api.delete('/eliminar-recompensa/:id', md_auth.ensureAuth, PremiosControler.eliminarRecompensa);


module.exports = api;