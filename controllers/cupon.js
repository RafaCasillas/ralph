'use strict'
 
var Cupon = require('../models/cupon');
var moment = require('moment');


                //           CUPONES
                //    Nombre          Valor
                //  Bienvenido         100


                //  VALORES EN TIEMPO UNIX
                //     un día = 86400
                //     una semana (7 dias) = 604800
                //     xDias (20 dias) = 1728000
                //     un mes (30 días) = 2592000

                        const xDias = 1728000;
                        const unMes = 2592000;



function nuevoCupon(req, res){
    var codigoActivacion = req.params.codigo.toLowerCase();
    var usuarioId = req.usuario.sub;

    res.status(200).send({message: 'Los cupones han sido inhabilitados'});

    // Cupón Bienvenido
    // if(codigoActivacion == 'noerapenal' || codigoActivacion == 'ralph2020' || codigoActivacion == 'ralphesfelicidad'){
    //     Cupon.find({usuario: usuarioId, nombre: 'Bienvenido'}, (err, cupones) => {

    //         if(err) return res.status(500).send({message: 'Error en la petición'});

    //         if(!cupones) return res.status(404).send({message: 'El cupón no existe'});

    //         if(cupones.length == 0){
    //             cuponBienvenido(usuarioId);
    //             return res.status(200).send({message: 'Cupón creado correctamente'});

    //         } else{
    //             return res.status(200).send({message: 'Ya has usado este cupón'});
    //         }            
    //     });

    // } else if(codigoActivacion == 'ralphmeencanta' || codigoActivacion == 'yousoralph'){
    //     Cupon.find({usuario: usuarioId, nombre: 'Envío gratis'}, (err, cupones) => {

    //         if(err) return res.status(500).send({message: 'Error en la petición'});

    //         if(!cupones) return res.status(404).send({message: 'El cupón no existe'});

    //         if(cupones.length == 0){
    //             cuponEnvioGratis(usuarioId);
    //             return res.status(200).send({message: 'Cupón creado correctamente'});

    //         } else{
    //             return res.status(200).send({message: 'Ya has usado este cupón'});
    //         }
    //     });

    // } else {
    //     return res.status(200).send({message: 'Código inválido'});
    // }
}


function cuponBienvenido(usuarioId){
    var cupon = new Cupon();

    cupon.usuario = usuarioId;
    cupon.nombre = 'Bienvenido';
    cupon.cupones = [40, 30, 30];
    cupon.compraMinima = 100;
    cupon.fechaVencimiento = (moment().unix() + xDias);
    cupon.status = 'Vigente';

    cupon.save((err, cuponStored) => {
        if(err) return

        if(cuponStored) return

        else return
    });
}


function cuponEnvioGratis(usuarioId){
    var cupon = new Cupon();

    cupon.usuario = usuarioId;
    cupon.nombre = 'Envío gratis';
    cupon.cupones = [20, 20, 20];
    cupon.compraMinima = 20;
    cupon.fechaVencimiento = (moment().unix() + xDias);
    cupon.status = 'Vigente';

    cupon.save((err, cuponStored) => {
        if(err) return

        if(cuponStored) return

        else return
    });
}


function obtenerCupones(req, res){    
    var usuarioId = req.usuario.sub;

    if(req.params.n == 1){
        var parametro = {usuario: usuarioId, status: 'Vigente'};

    } else if (req.params.n == 2){
        var parametro = {usuario: usuarioId, nombre: 'Bienvenido'};

    } else {
        return
    }
    
    Cupon.find(parametro, (err, cupones) => {
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


function actualizarCupon2(req, res){
    var cupon_id = req.params.id;
    
    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }
    
    // if(req.params.x.charAt(0) == '['){
    //     var parametro = {cupones: req.params.x};

    // } else {
        var tiempo = (moment().unix() + (req.params.x * 86400))
        var parametro = {fechaVencimiento: tiempo};
    // }

    Cupon.findByIdAndUpdate(cupon_id, parametro, {new:true}, (err, cuponUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!cuponUpdated) return res.status(404).send({message: 'No se ha podido actualizar el cupon'});
        
        return res.status(200).send({cupon: cuponUpdated});
    });
}


function eliminarCupon(req, res){
    var cupon_id = req.params.id;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Cupon.find({_id: cupon_id}).deleteOne((err, cuponRemoved) => {
        if(err) return res.status(500).send({message: 'Error al borrar el cupon'});

        if(!cuponRemoved) return res.status(404).send({message: 'No se ha borrado el cupon'});

        return res.status(200).send({cupon: cuponRemoved});
    })
}


function todosLosCupones(req, res){
    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }
    
    Cupon.find((err, cupones) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!cupones) return res.status(404).send({message: 'El cupones no existe'});
        
        return res.status(200).send({cupones: cupones});
    });
}


// function desactivarlosTodos(req, res){
//     if(req.usuario.rol != 'ADMIN'){
//         return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
//     }
    
//     Cupon.find({status: "Vigente"},(err, cupones) => {

//         if(cupones[0]){
//             cupones.forEach(cupon => {
//                 cupon.status = "Vencido";

//                 Cupon.findByIdAndUpdate(cupon.id, cupon, {new:true}, (err, cuponUpdated) => {
//                     if(err) return res.status(500).send({message: 'Error en la petición'});
                    
//                     if(!cuponUpdated) return res.status(404).send({message: 'No se ha podido actualizar el cupon'});
                    
//                     return res.status(200).send({cupon: cuponUpdated});
//                 });
//             });
//         }
//     });
// }


module.exports = {
    nuevoCupon,
    obtenerCupones,
    actualizarCupon,
    actualizarCupon2,
    eliminarCupon,
    todosLosCupones,
    // desactivarlosTodos
}