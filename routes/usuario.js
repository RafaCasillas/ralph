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
api.get('/obtener-usuarios/:id', md_auth.ensureAuth, UsuarioControler.obtenerUsuarios);
api.put('/actualizar-imagen-usuario/:id', [md_auth.ensureAuth, md_upload], UsuarioControler.actualizarImagenUsuario);
api.get('/obtener-imagen-usuario/:imageFile', UsuarioControler.obtenerImagenUsuario);
api.put('/actualizar-usuario', md_auth.ensureAuth, UsuarioControler.actualizarUsuario);
api.get('/actualizar-permisos-usuario/:id/:permiso', md_auth.ensureAuth, UsuarioControler.actualizarPermisosUsuario);
api.get('/usuario-activar/:id/:status', md_auth.ensureAuth, UsuarioControler.activarUsuario);
api.get('/usuario-contar/:status/:parametro', md_auth.ensureAuth, UsuarioControler.contarUsuarios);
api.get('/todos-los-usuarios', md_auth.ensureAuth, UsuarioControler.todosLosUsuarios);


module.exports = api;