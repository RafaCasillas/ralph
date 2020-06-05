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
    municipio: String,
    rol: String,
    restaurante: String,
    status: String,
    visitas: Number,
    plataforma: String
});

module.exports = mongoose.model('Usuario', UsuarioSchema);