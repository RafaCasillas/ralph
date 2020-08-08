'use strict'
 
var Stats = require('../models/stats');
var Usuario = require('../models/usuario');
var Municipio = require('../models/municipio');
var Restaurante = require('../models/restaurante');
var Categoria = require('../models/categoria');
var Cupon = require('../models/cupon');
var Notificacion = require('../models/notificacion');
var Pedido = require('../models/pedido');
var Producto = require('../models/producto');
var Horario = require('../models/horario');

const visitasId = '5ec08bc14eb7f2219ca7ca92';


function crearStats(req, res){
    var params = req.body;
    var stats = new Stats();
    stats.nombre = params.nombre;
    stats.contenido = params.contenido;


    if(params){
        stats.save((err, statsStored) => {
            if(err){ 
                return res.status(500).send({
                message: 'Error al guardar el stats'
                });
            }

            if(statsStored){
                return res.status(200).send({
                    stats: statsStored
                });
            } else {
                return res.status(404).send({
                    message: 'No se ha registrado el stats'
                });
            }
        });
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}


function nuevaVisitaApp(req, res){
    var municipioId = req.params.mun;
        nuevaVisitaMunicipio(municipioId);

    var usuarioId = req.params.usuario;

    if(usuarioId != 0){
        nuevaVisitaUsuario(usuarioId);
    }

    var rol = req.params.rol.toLowerCase();
    nuevaVisita(rol);

    Stats.findById((visitasId), (err, stats) => {
        if(err) return
        
        if(!stats) return
    
        if(stats){
            var newVisitas = stats.visitas + 1;

            Stats.findByIdAndUpdate(visitasId, {visitas: newVisitas}, {new:true}, (err, stats) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(stats);
            });
        }
    });
}


function nuevaVisita12hr(req, res){

    var rol = req.params.rol.toLowerCase();

    Stats.findOne({nombre: 'visitas unicas por dia'}, (err, stat) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!stat) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        if(stat){
            if(rol == 0){
                stat.contenido.null = stat.contenido.null + 1;

            } else if(rol == 'usuario'){
                stat.contenido.usuario = stat.contenido.usuario + 1;

            } else if(rol == 'restaurante'){
                stat.contenido.restaurante = stat.contenido.restaurante + 1;

            } else if(rol == 'empleado'){
                stat.contenido.empleado = stat.contenido.empleado + 1;

            } else if(rol == 'repartidor'){
                stat.contenido.repartidor = stat.contenido.repartidor + 1;

            } else if(rol == 'admin'){
                stat.contenido.admin = stat.contenido.admin + 1;
            }


            Stats.findByIdAndUpdate(stat._id, stat, {new:true}, (err, stats) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(stats);
            });
        }
    });
}


function nuevaVisita(rol){

    Stats.findOne({nombre: 'visitas totales'}, (err, stat) => {
        if(err) return
        
        if(!stat) return
        
        if(stat){
            if(rol == 0){
                stat.contenido.null = stat.contenido.null + 1;

            } else if(rol == 'usuario'){
                stat.contenido.usuario = stat.contenido.usuario + 1;

            } else if(rol == 'restaurante'){
                stat.contenido.restaurante = stat.contenido.restaurante + 1;

            } else if(rol == 'empleado'){
                stat.contenido.empleado = stat.contenido.empleado + 1;

            } else if(rol == 'repartidor'){
                stat.contenido.repartidor = stat.contenido.repartidor + 1;

            } else if(rol == 'admin'){
                stat.contenido.admin = stat.contenido.admin + 1;
            }


            Stats.findByIdAndUpdate(stat._id, stat, {new:true}, (err, stats) => {
                if(err) return
        
                if(!stats) return
                
                return
            });
        }
    });
}


function nuevaVisitaMunicipio(municipioId){

    Municipio.findById((municipioId), (err, municipio) => {
        if(err) return
        
        if(!municipio) return
        
        if(municipio){
            var newVisitas = municipio.visitas + 1;

            Municipio.findByIdAndUpdate(municipioId, {visitas: newVisitas}, {new:true}, (err, municipio) => {
                if(err) return
                
                if(!municipio) return
                
                return
            });
        }
    });
}


function nuevaVisitaUsuario(usuarioId){

    Usuario.findById((usuarioId), (err, usuario) => {
        if(err) return
        
        if(!usuario) return
        
        if(usuario){
            var newVisitas = usuario.visitas + 1;

            Usuario.findByIdAndUpdate(usuarioId, {visitas: newVisitas}, {new:true}, (err, usuario) => {
                if(err) return
                
                if(!usuario) return
                
                return
            });
        }
    });
}


function nuevaVisitaRestaurante(req, res){

    var restauranteId = req.params.res;

    Restaurante.findById((restauranteId), (err, restaurante) => {
        if(err) return
        
        if(!restaurante) return
        
        if(restaurante){
            var newVisitas = restaurante.visitas + 1;

            Restaurante.findByIdAndUpdate(restauranteId, {visitas: newVisitas}, {new:true}, (err, restaurante) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!restaurante) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(restaurante);
            });
        }
    });
}


function obtenerVisitas(req, res){
    Stats.findById((visitasId), (err, stats) => { 
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!stats) return res.status(404).send({message: 'El stats no existe'});
        
        return res.status(200).send({stats: stats});
    });
}


function nuevavisitaFB(req, res){
    
    var campania = req.params.campania;
    var tipo = req.params.tipo;
    var numero = req.params.numero;
    var usuario = req.params.usuario;
    var name = 'visita fb ads ' + req.params.mun;

    Stats.findOne({nombre: name}, (err, stat) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!stat) return res.status(404).send({message: 'El stat no existe'});
        
        if(stat){
            if(usuario == 0){
                stat.contenido.visitanull = stat.contenido.visitanull + 1;

            } else if(usuario == 1){
                stat.contenido.visitausuario = stat.contenido.visitausuario + 1;
            }

            if(campania == 'conversiones'){
                if(tipo == 'anuncio'){
                    if(numero == 1 || numero == 'a'){
                        stat.contenido.conversiones.anuncio.a = stat.contenido.conversiones.anuncio.a + 1;

                    } else if(numero == 2 || numero == 'b'){
                        stat.contenido.conversiones.anuncio.b = stat.contenido.conversiones.anuncio.b + 1;

                    } else if(numero == 3 || numero == 'c'){
                        stat.contenido.conversiones.anuncio.c = stat.contenido.conversiones.anuncio.c + 1;

                    } else if(numero == 4 || numero == 'd'){
                        stat.contenido.conversiones.anuncio.d = stat.contenido.conversiones.anuncio.d + 1;

                    } else if(numero == 5 || numero == 'e'){
                        stat.contenido.conversiones.anuncio.e = stat.contenido.conversiones.anuncio.e + 1;

                    } else if(numero == 6 || numero == 'f'){
                        stat.contenido.conversiones.anuncio.f = stat.contenido.conversiones.anuncio.f + 1;
                    }

                } else if(tipo == 'historia'){
                    if(numero == 1 || numero == 'a'){
                        stat.contenido.conversiones.historia.a = stat.contenido.conversiones.historia.a + 1;

                    } else if(numero == 2 || numero == 'b'){
                        stat.contenido.conversiones.historia.b = stat.contenido.conversiones.historia.b + 1;

                    } else if(numero == 3 || numero == 'c'){
                        stat.contenido.conversiones.historia.c = stat.contenido.conversiones.historia.c + 1;

                    } else if(numero == 4 || numero == 'd'){
                        stat.contenido.conversiones.historia.d = stat.contenido.conversiones.historia.d + 1;

                    } else if(numero == 5 || numero == 'e'){
                        stat.contenido.conversiones.historia.e = stat.contenido.conversiones.historia.e + 1;

                    } else if(numero == 6 || numero == 'f'){
                        stat.contenido.conversiones.historia.f = stat.contenido.conversiones.historia.f + 1;
                    }
                }

            } else if(campania == 'alcance'){
                if(tipo == 'anuncio'){
                    if(numero == 1 || numero == 'a'){
                        stat.contenido.alcance.anuncio.a = stat.contenido.alcance.anuncio.a + 1;

                    } else if(numero == 2 || numero == 'b'){
                        stat.contenido.alcance.anuncio.b = stat.contenido.alcance.anuncio.b + 1;

                    } else if(numero == 3 || numero == 'c'){
                        stat.contenido.alcance.anuncio.c = stat.contenido.alcance.anuncio.c + 1;

                    } else if(numero == 4 || numero == 'd'){
                        stat.contenido.alcance.anuncio.d = stat.contenido.alcance.anuncio.d + 1;

                    } else if(numero == 5 || numero == 'e'){
                        stat.contenido.alcance.anuncio.e = stat.contenido.alcance.anuncio.e + 1;

                    } else if(numero == 6 || numero == 'f'){
                        stat.contenido.alcance.anuncio.f = stat.contenido.alcance.anuncio.f + 1;
                    }

                } else if(tipo == 'historia'){
                    if(numero == 1 || numero == 'a'){
                        stat.contenido.alcance.historia.a = stat.contenido.alcance.historia.a + 1;

                    } else if(numero == 2 || numero == 'b'){
                        stat.contenido.alcance.historia.b = stat.contenido.alcance.historia.b + 1;

                    } else if(numero == 3 || numero == 'c'){
                        stat.contenido.alcance.historia.c = stat.contenido.alcance.historia.c + 1;

                    } else if(numero == 4 || numero == 'd'){
                        stat.contenido.alcance.historia.d = stat.contenido.alcance.historia.d + 1;

                    } else if(numero == 5 || numero == 'e'){
                        stat.contenido.alcance.historia.e = stat.contenido.alcance.historia.e + 1;

                    } else if(numero == 6 || numero == 'f'){
                        stat.contenido.alcance.historia.f = stat.contenido.alcance.historia.f + 1;
                    }
                }
            }

            Stats.findByIdAndUpdate(stat._id, stat, {new:true}, (err, stats) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(stats);
            });
        }
    })
}


function nuevaVisitaPublicidad(req, res){

    var parametro = req.params.parametro;

    Stats.findOne({nombre: 'visita publicidad'}, (err, stat) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!stat) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        if(stat){
            if(parametro == 'volante'){
                stat.contenido.volantes = stat.contenido.volantes + 1;

            } else if(parametro == 'cartel'){
                stat.contenido.carteles = stat.contenido.carteles + 1;

            } else if(parametro == 'link'){
                stat.contenido.link = stat.contenido.link + 1;
            }

            Stats.findByIdAndUpdate(stat._id, stat, {new:true}, (err, stats) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(stats);
            });
        }
    });
}


function promoCupon(req, res){

    var status = req.params.status;

    Stats.findOne({nombre: 'promo cupon'}, (err, stat) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!stat) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        if(stat){
            if(status == 1){
                stat.contenido.vieronPromo = stat.contenido.vieronPromo + 1;

            } else if(status == 2){
                stat.contenido.noAprovecharon = stat.contenido.noAprovecharon + 1;

            } else if(status == 3){
                stat.contenido.dieronClick = stat.contenido.dieronClick + 1;

            } else if(status == 4){
                stat.contenido.obtuvieronCupon = stat.contenido.obtuvieronCupon + 1;
            }

            Stats.findByIdAndUpdate(stat._id, stat, {new:true}, (err, stats) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(stats);
            });
        }
    });
}


function nuevoClickCategoria(req, res){

    var categoriaId = req.params.id;

    Categoria.findById(categoriaId, (err, categoria) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!categoria) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        if(categoria){
            var newClick = categoria.click + 1;

            Categoria.findByIdAndUpdate(categoriaId, {click: newClick}, {new:true}, (err, categorias) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!categorias) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(categorias);
            });
        }
    });
}


function nuevoPedido(req, res){

    var status = req.params.status;

    Stats.findOne({nombre: 'pedidos'}, (err, stat) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!stat) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        if(stat){
            if(status == 0){
                stat.contenido.iniciados = stat.contenido.iniciados + 1;

            } else if(status == 1){
                stat.contenido.completados.sinCupon = stat.contenido.completados.sinCupon + 1;

            } else if(status == 2){
                stat.contenido.completados.cupon20 = stat.contenido.completados.cupon20 + 1;

            } else if(status == 3){
                stat.contenido.completados.cupon30 = stat.contenido.completados.cupon30 + 1;

            } else if(status == 4){
                stat.contenido.completados.cupon40 = stat.contenido.completados.cupon40 + 1;
            
            } else if(status == 5){
                stat.contenido.completados.cupon50 = stat.contenido.completados.cupon50 + 1;
            }
            

            Stats.findByIdAndUpdate(stat._id, stat, {new:true}, (err, stats) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(stats);
            });
        }
    });
}


function cuponExpirado(req, res){

    var status = req.params.status;

    Stats.findOne({nombre: 'cupones expirados'}, (err, stat) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!stat) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        if(stat){
            if(status == 0){
                stat.contenido.usadosTodos = stat.contenido.usadosTodos + 1;

            } else if(status == 1){
                stat.contenido.con1Cupon = stat.contenido.con1Cupon + 1;

            } else if(status == 2){
                stat.contenido.con2Cupones = stat.contenido.con2Cupones + 1;

            } else if(status == 3){
                stat.contenido.con3Cupones = stat.contenido.con3Cupones + 1;

            }


            Stats.findByIdAndUpdate(stat._id, stat, {new:true}, (err, stats) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
                
                return res.status(200).send(stats);
            });
        }
    });
}


function stats(req, res){
    Stats.find((err, stats) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        return res.status(200).send(stats);
    })
}


function getStats(req, res){
    var collection = req.params.collection;
    
    var page = req.params.page;
    var itemsPerPage = 10;


    if(collection == 1){
        var Parametro = Usuario;

    } else if(collection == 2){
        var Parametro = Municipio;

    } else if(collection == 3){
        var Parametro = Restaurante;

    } else if(collection == 4){
        var Parametro = Categoria;
        var itemsPerPage = 30;

    } else if(collection == 5){
        var Parametro = Cupon;
        var itemsPerPage = 1000;

    } else if(collection == 6){
        var Parametro = Notificacion;
        var itemsPerPage = 1000;

    } else if(collection == 7){
        var Parametro = Pedido;
        var itemsPerPage = 1000;

    } else if(collection == 8){
        var Parametro = Producto;
    
    } else if(collection == 9){
        var Parametro = Horario;
    }


    Parametro.find().sort('-_id').paginate(page, itemsPerPage, (err, stats, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!stats) return res.status(404).send({message: 'No se ha podido actualizar el pedido'});
        
        return res.status(200).send({
            stats,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    })
}


module.exports = {
    crearStats,
    nuevaVisitaApp,
    nuevaVisita12hr,
    nuevaVisita,
    nuevaVisitaRestaurante,
    obtenerVisitas,
    nuevavisitaFB,
    nuevaVisitaPublicidad,
    promoCupon,
    nuevoClickCategoria,
    nuevoPedido,
    cuponExpirado,
    stats,
    getStats
}