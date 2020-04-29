'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SeccionSchema = Schema({
    restaurante: String,
    nombre: String
});

module.exports = mongoose.model('Seccion', SeccionSchema);