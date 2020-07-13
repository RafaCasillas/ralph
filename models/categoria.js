'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    nombre: String,
    icono: String,
    click: Number
});

module.exports = mongoose.model('Categoria', CategoriaSchema);