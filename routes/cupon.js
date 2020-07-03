'use strict'

var express = require('express');
var CuponControler = require('../controllers/cupon');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');


api.get('/cupon/:codigo', md_auth.ensureAuth, CuponControler.nuevoCupon);
api.get('/obtener-cupones/:n', md_auth.ensureAuth, CuponControler.obtenerCupones);
api.post('/actualizar-cupon', md_auth.ensureAuth, CuponControler.actualizarCupon);


module.exports = api;