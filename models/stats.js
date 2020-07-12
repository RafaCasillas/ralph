'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatsSchema = Schema({
    visitas: Number,
    nombre: String,
    contenido: Object
});

module.exports = mongoose.model('Stats', StatsSchema);