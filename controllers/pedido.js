'use strict'

var Pedido = require('../models/pedido');
var Usuario = require('../models/usuario');

var mongoosePaginate = require('mongoose-pagination');
var moment = require('moment');
var notificacion = require('./notificacion')


function crearPedido(req, res){
    var params = req.body;

    if( params.contenido && params.direccion && params.total && params.comision && params.restaurante){
        var pedido = new Pedido();

        pedido.restaurante = params.restaurante;
        pedido.contenido = params.contenido;
        pedido.direccion = params.direccion;
        pedido.total = params.total;
        pedido.comision = params.comision;
        pedido.cupon = params.cupon;
        pedido.envio = params.envio;

        pedido.usuario = req.usuario.sub;
        pedido.fecha = moment().unix();
        pedido.status = 'En espera';


        Usuario.findById((pedido.usuario), (err, usuario) => {
            if(err) return res.status(500).send({message: 'Error al guardar el pedido'});

            if(!usuario) return res.status(404).send({message: 'Tu cuenta no existe'});
            
            if(usuario._id && usuario.nombre){
                if(usuario.status == 'inactivo') return res.status(404).send({message: 'No se puede completar el pedido. Tu cuenta ha sido bloqueada temporalmente'});
                
                pedido.save((err, pedidoStored) => {
                    if(err) return res.status(500).send({message: 'Error al guardar el pedido'});
        
                    if(!pedidoStored) return res.status(404).send({message: 'No se ha registrado el pedido'});
        
                    if(pedidoStored) {
                        notificacion.NotificacionAdmin('Hay un nuevo pedido', '');
                        notificacion.NotificacionRestaurante('Tienes un nuevo pedido', '', pedidoStored.restaurante, '/restaurante/inicio');
                        notificacion.NotificacionUsuario('Tu pedido está en proceso', '', pedidoStored.usuario, '/mis-pedidos');
                        return res.status(200).send({pedido: pedidoStored});
                    }
                });
            }

        })
                                
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}

function actualizarPedido(req, res){
    var pedido_id = req.params.id;
    var usuario_id = req.params.usuario;

    if(req.params.status == 1){
        var update = { status: 'En preparacion' }
        if(usuario_id != 0){
            notificacion.NotificacionUsuario('Tu pedido está en preparación', '', usuario_id, '/mis-pedidos');
        }
    }

    if(req.params.status == 2){
        var update = { status: 'En camino' }
        if(usuario_id != 0){
            notificacion.NotificacionUsuario('Tu pedido está en camino', '', usuario_id, '/mis-pedidos');
        }
    }

    if(req.params.status == 3){
        var update = { status: 'Completado' }
    }

    if(req.params.status == 4){
        var update = { status: 'Cancelado' }
    }

    Pedido.findByIdAndUpdate(pedido_id, update, {new:true}, (err, pedidoUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!pedidoUpdated) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        return res.status(200).send({pedido: pedidoUpdated});
    });
}

function obtenerPedido(req, res){
    var pedidoId = req.params.id;

    if(req.params.who == 1){
        var who = 'usuario'
    }

    if(req.params.who == 2){
        var who = 'restaurante'
    }

    let page = 1;
    let itemsPerPage = 1;

    Pedido.findById(pedidoId).populate(who).paginate(page, itemsPerPage, (err, pedido) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

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
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!pedidos) return res.status(404).send({message: 'No hay pedidos disponibles'});

        return res.status(200).send({
            pedidos,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}

function obtenerPedidosUsuario(req, res){

    var itemsPerPage = 5;

    var parametro = {status: ['En espera', 'En preparacion', 'En camino'], usuario: req.params.id};

    if(req.params.stats && req.params.stats == 1){
        var parametro = {status: ['Completado', 'Cancelado'], usuario: req.params.id};
    }

    if(req.params.stats && req.params.stats == 2){
        var parametro = {usuario: req.params.id};
    }

    if(req.params.stats && req.params.stats == 3){
        var parametro = {};
        var itemsPerPage = 10;
    }
    
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    

    Pedido.find(parametro).sort('-fecha').populate('restaurante').paginate(page, itemsPerPage, (err, pedidos, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!pedidos) return res.status(404).send({message: 'No hay pedidos disponibles'});

        return res.status(200).send({
            pedidos,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}

function contarPedidos(req, res){
    var id = req.params.id;

    if(req.params.who == 1){
        var who = {usuario: id, status: ['En espera', 'En preparacion', 'En camino']}
    }

    if(req.params.who == 2){
        var who = {restaurante: id, status: ['En espera', 'En preparacion']}
    }

    Pedido.countDocuments(who).exec((err, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        return res.status(200).send({total: total});
    })
}

function eliminarPedido(req, res){
    var pedido_id = req.params.id;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(200).send({message: 'No tienes permiso para actualizar los datos'});
    }

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
    obtenerPedidosUsuario,
    contarPedidos,
    eliminarPedido
}