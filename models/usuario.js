'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    nombre: String,
    apellido: String,
    correo: String,
    password: String,
    telefono: String,
    imagen: String,
    domicilio: String,
    municipio: {type: Schema.ObjectId, ref: 'Municipio'},
    rol: String,
    restaurante: String,
    status: String
});

module.exports = mongoose.model('Usuario', UsuarioSchema);