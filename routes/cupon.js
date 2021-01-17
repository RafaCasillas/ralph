'use strict'

var express = require('express');
var CuponControler = require('../controllers/cupon');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');


api.get('/cupon/:codigo', md_auth.ensureAuth, CuponControler.nuevoCupon);
api.get('/obtener-cupones/:n', md_auth.ensureAuth, CuponControler.obtenerCupones);
api.post('/actualizar-cupon', md_auth.ensureAuth, CuponControler.actualizarCupon);
api.get('/actualizar-cupon2/:id/:x', md_auth.ensureAuth, CuponControler.actualizarCupon2);
api.delete('/eliminar-cupon/:id', md_auth.ensureAuth, CuponControler.eliminarCupon);
api.get('/todos-los-cupones', md_auth.ensureAuth, CuponControler.todosLosCupones);
// api.get('/desactivarlo-sTodos-los-cupone', md_auth.ensureAuth, CuponControler.desactivarlosTodos);


module.exports = api;