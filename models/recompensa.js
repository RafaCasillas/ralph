'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecompensaSchema = Schema({
    nombre: String,
    descripcion: String,
    imagen: String,
    puntosNecesarios: Number,
    status: String
    
    // tipo/categoria
},{
    versionKey: false
});

module.exports = mongoose.model('Recompensa', RecompensaSchema);