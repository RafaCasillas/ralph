'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HorarioSchema = Schema({
    restaurante: {type: Schema.ObjectId, ref: 'Restaurante'},
    nombre: String,
    apertura: Array,
    cierre: Array
});

module.exports = mongoose.model('Horario', HorarioSchema);