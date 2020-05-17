'use strict'
 
var Stats = require('../models/stats');
var Usuario = require('../models/usuario');
var Municipio = require('../models/municipio');
var Restaurante = require('../models/restaurante');

const visitasId = '5ec07ae95e9be11010231b76';


    function crearStats(req, res){
        var params = req.body;

        if(params.visitas){
            var stats = new Stats();
            stats.visitas = params.visitas;

            stats.save((err, statsStored) => {
                if(err){ 
                    return res.status(500).send({
                    message: '17 - Error al guardar el stats'
                    });
                }

                if(statsStored){
                    return res.status(200).send({
                        stats: statsStored
                    });
                } else {
                    return res.status(404).send({
                        message: '27 - No se ha registrado el stats'
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

    function nuevaVisitaMunicipio(municipioId){
    
        Municipio.findById((municipioId), (err, municipio) => {
            if(err) return
            
            if(!municipio) return
            
            if(municipio){
                var newVisitas = municipio.visitas + 1;

                Municipio.findByIdAndUpdate(municipioId, {visitas: newVisitas}, {new:true}, (err, municipio) => {
                    if(err) return
                    
                    if(!municipio) return
                    
                    return console.log(municipio);
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
                    
                    return console.log(usuario);
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

    module.exports = {
        crearStats,
        nuevaVisitaApp,
        nuevaVisitaRestaurante,
        obtenerVisitas
    }