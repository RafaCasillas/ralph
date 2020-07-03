'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PedidoSchema = Schema({
    usuario: {type: Schema.ObjectId, ref: 'Usuario'},
    restaurante: {type: Schema.ObjectId, ref: 'Restaurante'},
    fecha: String,
    total: Number,
    comision: Number,
    contenido: Array,
    status: String,
    direccion: String,
    envio: Number,
    cupon: Number
});

module.exports = mongoose.model('Pedido', PedidoSchema);