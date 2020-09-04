'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
   restaurante: String,
   nombre: String,
   descripcion: String,
   imagen: String,
   precio: Number,
   tiempoEntrega: Number,
   categoria: String,
   seccion: String,
   status: String,
   ingredientes: Array
});

module.exports = mongoose.model('Producto', ProductoSchema);