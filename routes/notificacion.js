'use strict'

var express = require('express');
var NotificacionesControler = require('../controllers/notificacion');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');


api.post('/subscribe', md_auth.ensureAuth, NotificacionesControler.saveSubscripcion);
api.get('/key', md_auth.ensureAuth, NotificacionesControler.key);
api.post('/push', md_auth.ensureAuth, NotificacionesControler.pushNotification);
api.get('/logo', NotificacionesControler.obtenerLogo);
api.get('/codigo/:tel', NotificacionesControler.codigoVerificacion);
api.get('/verificacion/:tel/:cod', NotificacionesControler.verificarTelefono);


module.exports = api;