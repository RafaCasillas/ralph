'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BoletoSchema = Schema({
    numBoleto: Number,
    premio: {type: Schema.ObjectId, ref: 'Sorteo'},
    usuario: {type: Schema.ObjectId, ref: 'Usuario'}
},{
    versionKey: false
});

module.exports = mongoose.model('Boleto', BoletoSchema);