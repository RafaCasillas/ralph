'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CobroSchema = Schema({
    restaurante: {type: Schema.ObjectId, ref: 'Restaurante'},
    cantidad: Number,
    nota: String,
    fecha: String
});

module.exports = mongoose.model('Cobro', CobroSchema);