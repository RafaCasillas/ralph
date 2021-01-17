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
api.get('/obtener-usuario2/:id', md_auth.ensureAuth, UsuarioControler.obtenerUsuario2);
api.get('/obtener-usuarios/:id', md_auth.ensureAuth, UsuarioControler.obtenerUsuarios);
api.put('/actualizar-imagen-usuario/:id', [md_auth.ensureAuth, md_upload], UsuarioControler.actualizarImagenUsuario);
api.get('/obtener-imagen-usuario/:imageFile', UsuarioControler.obtenerImagenUsuario);
api.put('/actualizar-usuario', md_auth.ensureAuth, UsuarioControler.actualizarUsuario);
api.get('/actualizar-permisos-usuario/:id/:permiso', md_auth.ensureAuth, UsuarioControler.actualizarPermisosUsuario);
api.get('/usuario-activar/:id/:status', md_auth.ensureAuth, UsuarioControler.activarUsuario);
api.get('/usuario-contar/:status/:parametro', md_auth.ensureAuth, UsuarioControler.contarUsuarios);
api.get('/todos-los-usuarios', md_auth.ensureAuth, UsuarioControler.todosLosUsuarios);
api.get('/todos-los-usuarios2/:page', md_auth.ensureAuth, UsuarioControler.todosLosUsuarios2);
api.get('/usuarios-sin-activar/:page', md_auth.ensureAuth, UsuarioControler.usuariosSinActivar);
api.get('/todos-los-empleados', md_auth.ensureAuth, UsuarioControler.todosEmpleados);
api.delete('/eliminar-usuario/:id/:con', md_auth.ensureAuth, UsuarioControler.eliminarUsuario);
api.get('/preparar-contra/:con/:id', md_auth.ensureAuth, UsuarioControler.prepararContra);
api.post('/actualizar-usuario-contra', md_auth.ensureAuth, UsuarioControler.actualizarContraseña);
api.get('/buscar-usuario/:parametro', md_auth.ensureAuth, UsuarioControler.buscarUsuario);


module.exports = api;