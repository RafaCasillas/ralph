'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificacionSchema = Schema({
    usuario: String,
    restaurante: String,
    municipio: String,
    fecha: String,
    subscripcion: Object
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);