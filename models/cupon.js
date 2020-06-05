'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CuponSchema = Schema({
    usuario: {type: Schema.ObjectId, ref: 'Usuario'},
    nombre: String,
    cupones: Array,
    compraMinima: Number,
    fechaVencimiento: String,
    status: String
    //codigoActivacion: String,
    //total: Number,
});

module.exports = mongoose.model('Cupon', CuponSchema);