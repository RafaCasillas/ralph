'use strict'

var Pedido = require('../models/pedido');

var mongoosePaginate = require('mongoose-pagination');
var moment = require('moment');


function crearPedido(req, res){
    var params = req.body;

    if( params.contenido && params.direccion && params.total && params.comision && params.ganancia && params.restaurante){
        var pedido = new Pedido();

        pedido.restaurante = params.restaurante;
        pedido.contenido = params.contenido;
        pedido.direccion = params.direccion;
        pedido.total = params.total;
        pedido.comision = params.comision;
        pedido.ganancia = params.ganancia;

        pedido.usuario = req.usuario.sub;
        pedido.fecha = moment().unix();
        pedido.status = 'En espera';
                                
        pedido.save((err, pedidoStored) => {
            if(err){
                console.log(err);
                return res.status(500).send({
                    message: '35 - Error al guardar el pedido'
                });
            }

            if(pedidoStored){
                return res.status(200).send({pedido: pedidoStored});                    
            } else {
                return res.status(404).send({message: 'No se ha registrado el pedido'});
            }
            });
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}

function actualizarPedido(req, res){
    var pedido_id = req.params.id;

    if(req.params.status == 1){
        var update = { status: 'En preparacion' }
    }

    if(req.params.status == 2){
        var update = { status: 'En camino' }
    }

    if(req.params.status == 3){
        var update = { status: 'Completado' }
    }

    if(req.params.status == 4){
        var update = { status: 'Cancelado' }
    }

    Pedido.findByIdAndUpdate(pedido_id, update, {new:true}, (err, pedidoUpdated) => {
        if(err) return res.status(500).send({message: '52 - Error en la petición'});
        
        if(!pedidoUpdated) return res.status(404).send({message: '54 - No se ha podido actualizar el pedido'});
        
        return res.status(200).send({pedido: pedidoUpdated});
    });
}

function obtenerPedido(req, res){
    var pedidoId = req.params.id;

    let page = 1;
    let itemsPerPage = 1;

    Pedido.findById(pedidoId).populate('usuario').paginate(page, itemsPerPage, (err, pedido) => {
        if(err) return res.status(500).send({message: '64 - Error en la petición'});

        if(!pedido) return res.status(404).send({message: 'El pedido no existe'});
        
        return res.status(200).send({pedido: pedido});
    });
}

function obtenerPedidos(req, res){

    var parametro = {status: ['En espera', 'En preparacion'], restaurante: req.params.id};
    var fecha = 'fecha';
    var itemsPerPage = 10;

    if(req.params.stats && req.params.stats == 1){
        var parametro = {status: ['En camino', 'Completado', 'Cancelado'], restaurante: req.params.id};
        var fecha = '-fecha';
        var itemsPerPage = 5;
    }

    if(req.params.stats && req.params.stats == 2){
        var parametro = {restaurante: req.params.id};
        var fecha = '-fecha';
        var itemsPerPage = 5;
    }
    
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    

    Pedido.find(parametro).sort(fecha).populate('usuario').paginate(page, itemsPerPage, (err, pedidos, total) => {
        if(err) return res.status(500).send({message: '202 - Error en la petición'});

        if(!pedidos) return res.status(404).send({message: 'No hay pedidos disponibles'});

        return res.status(200).send({
            pedidos,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}

function eliminarPedido(req, res){
    var pedido_id = req.params.id;

    Pedido.find({_id: pedido_id}).deleteOne((err, pedidoRemoved) => {
        if(err) return res.status(500).send({message: 'Error al borrar la publicacion'});

        if(!pedidoRemoved) return res.status(404).send({message: 'No se ha borrado la publicación'});

        return res.status(200).send({pedido: pedidoRemoved});
    })
}


module.exports = {
    crearPedido,
    actualizarPedido,
    obtenerPedido,
    obtenerPedidos,
    eliminarPedido
}