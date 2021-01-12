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
    ralphDebe: Number,
    servicioDomicilio: Boolean,
    visitas: Number,
    llamadas: Array,
    pedidoMinimo: Number,
    envio: Array,
    FBads: Boolean
});

module.exports = mongoose.model('Restaurante', RestauranteSchema);