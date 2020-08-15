'use strict'

var express = require('express');
var NotificacionesControler = require('../controllers/notificacion');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');


api.post('/subscribe', md_auth.ensureAuth, NotificacionesControler.saveSubscripcion);
api.get('/key', md_auth.ensureAuth, NotificacionesControler.key);
api.post('/push', md_auth.ensureAuth, NotificacionesControler.pushNotifications);
api.get('/push-notification/:id', md_auth.ensureAuth, NotificacionesControler.pushNotification);
api.get('/logo', NotificacionesControler.obtenerLogo);
api.get('/codigo/:tel', NotificacionesControler.codigoVerificacion);
api.get('/verificacion/:tel/:cod', NotificacionesControler.verificarTelefono);
api.get('/sms/:tel/', NotificacionesControler.mensajeSMS);
api.get('/llamada/:usuario/', md_auth.ensureAuth, NotificacionesControler.llamada);

module.exports = api;