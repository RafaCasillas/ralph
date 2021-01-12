'use sctrict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SorteoSchema = Schema({
    nombre: String,
    descripcion: String,
    imagen: String,
    boletos: Number,
    status: String,
    fechaRealizacion: String,
    ganador: {type: Schema.ObjectId, ref: 'Usuario'}
},{
    versionKey: false
});

module.exports = mongoose.model('Sorteo', SorteoSchema);