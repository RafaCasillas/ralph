var express = require('express');
var PedidoControler = require('../controllers/pedido');

var api = express.Router();
var md_auth = require('../middlewares/autenticated');


api.post('/crear-pedido', md_auth.ensureAuth, PedidoControler.crearPedido);
api.get('/actualizar-pedido/:id/:status', md_auth.ensureAuth, PedidoControler.actualizarPedido);
api.get('/pedido/:id', md_auth.ensureAuth, PedidoControler.obtenerPedido);
api.get('/pedidos/:id/:page?/:stats?', md_auth.ensureAuth, PedidoControler.obtenerPedidos);
api.delete('/pedido/:id', md_auth.ensureAuth, PedidoControler.eliminarPedido);

module.exports = api;