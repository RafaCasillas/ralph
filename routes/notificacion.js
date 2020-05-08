'use strict'

var express = require('express');
var NotificacionesControler = require('../controllers/notificacion');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');


api.post('/subscribe', md_auth.ensureAuth, NotificacionesControler.saveSubscripcion);
api.get('/key', md_auth.ensureAuth, NotificacionesControler.key);
api.post('/push', md_auth.ensureAuth, NotificacionesControler.pushNotification);
api.get('/logo', NotificacionesControler.obtenerLogo);


module.exports = api;