var express = require('express');
var ProductoControler = require('../controllers/producto');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/productos'})


api.post('/crear-producto', md_auth.ensureAuth, ProductoControler.crearProducto);
api.put('/actualizar-producto/:res/:prod', md_auth.ensureAuth, ProductoControler.actualizarProducto);
api.put('/actualizar-imagen-producto/:res/:prod', [md_auth.ensureAuth, md_upload], ProductoControler.actualizarImagenProducto);
api.get('/obtener-imagen-producto/:imageFile', ProductoControler.obtenerImagenProducto);
api.get('/producto/:id', ProductoControler.obtenerProducto);
api.get('/productos/:res?/:cat?/:sec?/:nom?/:page?', ProductoControler.obtenerProductos);
api.get('/productos-random/:res?/:cat?/:sec?/:nom?', ProductoControler.obtenerProductosRandom);
api.delete('/producto/:id', md_auth.ensureAuth, ProductoControler.eliminarProducto);

module.exports = api;