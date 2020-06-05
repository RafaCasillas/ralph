'use strict'
 
var Cupon = require('../models/cupon');
var moment = require('moment');


                //           CUPONES
                //    Nombre          Valor
                //  Bienvenido         100


                //  VALORES EN TIEMPO UNIX
                //     un día = 86400
                //     una semana (7 dias) = 604800
                //     un mes (30 días) = 2592000
                       const unMes = 2592000;



function nuevoCupon(req, res){
    var codigoActivacion = req.params.codigo.toLowerCase();
    var usuarioId = req.usuario.sub;


    // Cupón Bienvenido
    if(codigoActivacion == 'codigo' || codigoActivacion == 'cod'){
        Cupon.find({usuario: usuarioId, nombre: 'Bienvenido'}, (err, cupones) => {
            console.log(cupones);
            if(err) return res.status(500).send({message: 'Error en la petición'});

            if(!cupones) return res.status(404).send({message: 'El cupón no existe'});

            if(cupones.length == 0){
                cuponBienvenido(usuarioId);
                return res.status(200).send({message: 'Cupón creado correctamente'});

            } else{
                return res.status(200).send({message: 'Ya has usado este cupón'});
            }            
        });

    } else {
        return res.status(200).send({message: 'Código inválido'});
    }

}


function cuponBienvenido(usuarioId){
    var cupon = new Cupon();

    cupon.usuario = usuarioId;
    cupon.nombre = 'Bienvenido';
    cupon.cupones = [30, 30, 30, 10];
    cupon.compraMinima = 100;
    cupon.fechaVencimiento = (moment().unix() + unMes);
    cupon.status = 'Vigente';

    cupon.save((err, cuponStored) => {
        if(err) return 'Error al guardar el cupón';

        if(cuponStored) return 'Cupón creado correctamente';

        else return 'No se ha registrado el cupón';
    });
}


function obtenerCupones(req, res){    
    var usuarioId = req.usuario.sub;
    
    Cupon.find({usuario: usuarioId, status: 'Vigente'}, (err, cupones) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!cupones) return res.status(404).send({message: 'No hay ningún cupón'});
        
        return res.status(200).send({cupones: cupones});
    });
}


function actualizarCupon(req, res){
    var update = req.body;
    var cupon_id = req.body._id;

    Cupon.findByIdAndUpdate(cupon_id, update, {new:true}, (err, cuponUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!cuponUpdated) return res.status(404).send({message: 'No se ha podido actualizar el cupon'});
        
        return res.status(200).send({cupon: cuponUpdated});
    });
}


module.exports = {
    nuevoCupon,
    obtenerCupones,
    actualizarCupon
}