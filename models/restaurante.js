'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RestauranteSchema = Schema({
    propietario: {type: Schema.ObjectId, ref: 'Usuario'},
    nombre: String,
    ubicacion: Array,
    municipio: String,
    imagen: String,
    telefono: Number,
    horario: Array,
    status: String,
    credito: Number,
    debe: Number,
    servicioDomicilio: Boolean,
    visitas: Number
});

module.exports = mongoose.model('Restaurante', RestauranteSchema);