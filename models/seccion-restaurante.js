'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SeccionSchema = Schema({
    restaurante: String,
    nombre: String,
    posicion: Number
});

module.exports = mongoose.model('Seccion', SeccionSchema);