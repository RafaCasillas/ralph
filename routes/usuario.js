'use strict'

var express = require('express');
var UsuarioControler = require('../controllers/usuario');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/usuarios'})


api.post('/registro', UsuarioControler.registrarUsuario);
api.post('/login', UsuarioControler.logearUsuario);
api.get('/obtener-usuario/:id', md_auth.ensureAuth, UsuarioControler.obtenerUsuario);
// api.put('/actualizar-usuario/:id', md_auth.ensureAuth, UsuarioControler.actualizarUsuario);
api.put('/actualizar-imagen-usuario/:id', [md_auth.ensureAuth, md_upload], UsuarioControler.actualizarImagenUsuario);
api.get('/obtener-imagen-usuario/:imageFile', UsuarioControler.obtenerImagenUsuario);


module.exports = api;