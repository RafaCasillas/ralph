'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();


// Cargar rutas
var usuario_routes = require('./routes/usuario');
var municipio_routes = require('./routes/municipio');
var restaurante_routes = require('./routes/restaurante');
var producto_routes = require('./routes/producto');
var pedido_routes = require('./routes/pedido');
var notificaciones_routes = require('./routes/notificacion');
var stats_routes = require('./routes/stats');
var cupon_routes = require('./routes/cupon');
var premios_routes = require('./routes/premios');


// Cargar middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});

// rutas
app.use('/', express.static('client', {redirect: false}));
app.use('/api', usuario_routes);
app.use('/api', municipio_routes);
app.use('/api', restaurante_routes);
app.use('/api', producto_routes);
app.use('/api', pedido_routes);
app.use('/api', notificaciones_routes);
app.use('/api', stats_routes);
app.use('/api', cupon_routes);
app.use('/api', premios_routes);

  
// Para que funcione en produccion
app.get('*', function(req, res, next){
    res.sendFile(path.resolve('client/index.html'));
});


// Exportar
module.exports = app;