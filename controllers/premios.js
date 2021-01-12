'use strict'
 
var Sorteo = require('../models/sorteo');
var Boleto = require('../models/sorteo-boleto');
var Recompensa = require('../models/recompensa');
var Usuario = require('../models/usuario');

const mongoose = require("mongoose");
var path = require('path');
const fs = require('fs');

function crearSorteo(req, res){
    var params = req.body;

    if(params.nombre && params.descripcion && params.boletos && params.fechaRealizacion){
        var sorteo = new Sorteo();
        sorteo.nombre = params.nombre;
        sorteo.descripcion = params.descripcion;
        sorteo.boletos = params.boletos;
        sorteo.fechaRealizacion = params.fechaRealizacion;

        sorteo.status = 'Por realizarse';
        sorteo.imagen = null;
        sorteo.ganador = null;


        sorteo.save((err, sorteoStored) => {
            if(err){ 
                return res.status(500).send({message: 'Error al guardar el sorteo'});
            }

            if(sorteoStored){
                return res.status(200).send({
                    sorteo: sorteoStored
                });
                
            } else {
                return res.status(404).send({message: 'No se ha registrado el sorteo'});
            }
        });

    } else {
        res.status(200).send({message: 'Envia todos los campos necesarios'});
    }
}


function crearRecompensa(req, res){
    var params = req.body;

    if(params.nombre && params.descripcion && params.puntosNecesarios){
        var recompensa = new Recompensa();
        recompensa.nombre = params.nombre;
        recompensa.descripcion = params.descripcion;
        recompensa.puntosNecesarios = params.puntosNecesarios;

        recompensa.status = 'activo';
        recompensa.imagen = null;

        
        recompensa.save((err, recompensaStored) => {
            if(err){ 
                return res.status(500).send({message: 'Error al guardar el recompensa'});
            }

            if(recompensaStored){
                return res.status(200).send({
                    recompensa: recompensaStored
                });
                
            } else {
                return res.status(404).send({message: 'No se ha registrado el sorteo'});
            }
        });

    } else {
        res.status(200).send({message: 'Envia todos los campos necesarios'});
    }
}


function generarBoletos(req, res){
    var cantidad = parseInt(req.params.can);
    var sorteo_id = req.params.id;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Sorteo.findById(sorteo_id, (err, sorteo) => {
        if(err) return res.status(500).send({message: 'Ha ocurrido un error'});
        if(!sorteo) return res.status(404).send({message: 'No se ha encontrado el sorteo'});

        if(sorteo){
            Boleto.find({premio: sorteo_id}, (err, boletos) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!boletos[0]){
                    var inicio = 1;
                    var boletosAGenerar = cantidad;
                    generarBoletos2(inicio, boletosAGenerar, sorteo_id);

                } else {
                    var inicio = boletos.length + 1;
                    var boletosAGenerar = cantidad + inicio - 1;
                    generarBoletos2(inicio, boletosAGenerar, sorteo_id);
                }

                return res.status(200).send({message: 'Boletos generados correctamente'});
            });
        }
    });
}


function generarBoletos2(inicio, boletosAGenerar, sorteo_id){

    var n = inicio;

    var bol = setInterval(() => {
        var boleto = new Boleto();
        boleto.numBoleto = n;
        boleto.premio = sorteo_id;
        boleto.usuario = null;
        
        boleto.save((err, boletoStored) => {
            if(err){ return }
        });

        if(n == (boletosAGenerar)){
            clearInterval(bol)
        }
        n = n + 1;
    },10)
}


function actualizarImagenSorteo(req, res){

    try{    var sorteo_id = req.params.id;
            var file_path = req.files.image.path;

            if(req.params.tipo == 'sorteo'){
                var Tabla = Sorteo;
            } else {
                var Tabla = Recompensa;
            }

            if(req.files.image && req.files.image.type != null){
                var file_split = file_path.split('/');
                var file_name = file_split[2];
                var ext_split = file_name.split('\.');
                var file_ext = ext_split[1];

                if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

                    // Borrar la imagen anterior que ya tenia el usuario
                    Tabla.findById(sorteo_id, (err, sorteo) => {
                        if(err) return res.status(500).send({message: 'Error en la petición'});

                        if(sorteo.imagen && sorteo.imagen != null){
                            var old_image = sorteo.imagen
                            var path_old_file = './uploads/premios/'+old_image;
                            fs.unlink(path_old_file, (err) => {
                                if (err) return err;
                            });
                        }
                    });

                    Tabla.findByIdAndUpdate(sorteo_id, {imagen: file_name}, {new:true}, (err, sorteoUpdated) =>{
                        if(err) return res.status(500).send({message: 'Error en la petición'});

                        if(!sorteoUpdated) return res.status(404).send({message: 'No se ha podido actualizar el sorteo'});
                
                        return res.status(200).send({sorteo: sorteoUpdated});
                    })
                } else {
                    return removeFilesOfUploads(res, file_path, 'Extensión no válida');
                }

            } else {
                return removeFilesOfUploads(res, file_path, 'No mandaste ninguna imágen');
            }

    }   catch(err) {
    // console.log(err);
        return res.status(500).send({message: 'Error en el servidor'});
    }
} 

function removeFilesOfUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        if (err) return error;
        return res.status(200).send({message: message});
    });
}


function actualizarSorteo(req, res){
    var sorteo = req.body;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Sorteo.findByIdAndUpdate(sorteo._id, sorteo, {new:true}, (err, sorteoUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!sorteoUpdated) return res.status(404).send({message: 'No se ha podido actualizar el sorteo'});
        
        return res.status(200).send({sorteo: sorteoUpdated});
    });
}


function actualizarRecompensa(req, res){
    var recompensa = req.body;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Recompensa.findByIdAndUpdate(recompensa._id, recompensa, {new:true}, (err, recompensaUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!recompensaUpdated) return res.status(404).send({message: 'No se ha podido actualizar el recompensa'});
        
        return res.status(200).send({recompensa: recompensaUpdated});
    });
}


function asignarUsuarioABoleto(req, res){
    var usuario_id = req.params.id;
    var premio_id = req.params.prem;

    // if(req.usuario.rol != 'ADMIN'){
    //     return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    // }

    Boleto.aggregate([ { $match: {usuario: null, premio: new mongoose.Types.ObjectId(premio_id)}}, { $sample: { size: 1 } } ], (err, boletoLibre) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        
        if(!boletoLibre[0]) return res.status(404).send({message: 'Ya no hay boletos disponibles'});
        
        if(boletoLibre[0]){
            boletoLibre[0].usuario = usuario_id;

            Boleto.findByIdAndUpdate(boletoLibre[0]._id, boletoLibre[0], {new:true}, (err, boletoUpdated) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
                
                if(!boletoUpdated) return res.status(404).send({message: 'No se ha podido asignar el boleto'});
                
                return res.status(200).send({boleto: boletoUpdated});
            });
        }
    });
}


function obtenerImagenSorteo(req, res){
    var image_file = req.params.imageFile;
    var path_file = './uploads/premios/'+image_file;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}


function obtenerSorteos(req, res){
    var itemsPerPage = 10;
    var page = req.params.page;

    Sorteo.find().sort('status').paginate(page, itemsPerPage, (err, sorteos, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!sorteos) return res.status(404).send({message: 'El sorteos no existe'});
        
        return res.status(200).send({
            sorteos,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}


function obtenerBoletos(req, res){
    var itemsPerPage = 100;
    var page = req.params.page;
    var telefono = req.params.tel;


    Usuario.find({telefono: telefono}, (err, usuario) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuario) return res.status(404).send({message: 'El usuario no existe'});
        
        if(usuario[0]){
            Boleto.find({usuario: usuario[0]._id}).sort('premio').paginate(page, itemsPerPage, (err, boletos, total) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
        
                if(!boletos) return res.status(404).send({message: 'El boletos no existe'});
                
                return res.status(200).send({
                    boletos,
                    total,
                    pages: Math.ceil(total/itemsPerPage)
                })
            });
        }
    });
}


function obtenerRecompensas(req, res){
    var itemsPerPage = 10;
    var page = req.params.page;

    Recompensa.find({status: 'activo'}).sort('puntosNecesarios').paginate(page, itemsPerPage, (err, recompensas, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!recompensas) return res.status(404).send({message: 'El recompensas no existe'});
        
        return res.status(200).send({
            recompensas,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}


function obtenerSorteo(req, res){
    var sorteoId = req.params.id;

    Sorteo.findById(sorteoId, (err, sorteo) => {
        if(err) return res.status(500).send({message: err});

        if(!sorteo) return res.status(404).send({message: 'El sorteo no existe'});
        
        return res.status(200).send({sorteo: sorteo});
    });
}


function obtenerBoleto(req, res){
    var sorteo_id = req.params.id;
    var numeroBoleto = req.params.num;

    Boleto.find({premio: sorteo_id, numBoleto: numeroBoleto}, (err, boleto) => {
        if(err) return res.status(500).send({message: err});

        if(!boleto) return res.status(404).send({message: 'El boleto no existe'});
        
        return res.status(200).send({boleto: boleto});
    });
}


function obtenerRecompensa(req, res){
    var recompensaId = req.params.id;

    Recompensa.findById(recompensaId, (err, recompensa) => {
        if(err) return res.status(500).send({message: err});

        if(!recompensa) return res.status(404).send({message: 'El recompensa no existe'});
        
        return res.status(200).send({recompensa: recompensa});
    });
}


function eliminarRecompensa(req, res){
    var recompensa_id = req.params.id;

    Recompensa.findById(recompensa_id, (err, recompensa) => {
        if(err) return res.status(500).send({message: 'Error al borrar la recompensa'});

        if(!recompensa) return res.status(404).send({message: 'No se ha borrado la recompensa'});

        if(recompensa.imagen){
            var old_image = recompensa.imagen
            var path_old_file = './uploads/premios/'+old_image;
            fs.unlink(path_old_file, (err) => {
                if(err) return res.status(500).send({message: 'Error'});
            })
        }

        Recompensa.findById(recompensa_id).deleteOne((err, recompensaRemoved) => {
            if(err) return res.status(500).send({message: 'Error al borrar la recompensa'});
    
            if(!recompensaRemoved) return res.status(404).send({message: 'No se ha borrado la recompensa'});
    
            return res.status(200).send({recompensa: recompensaRemoved});
        })
    })

}


module.exports = {
    crearSorteo,
    crearRecompensa,
    generarBoletos,
    actualizarImagenSorteo,
    actualizarSorteo,
    actualizarRecompensa,
    asignarUsuarioABoleto,
    obtenerImagenSorteo,
    obtenerSorteos,
    obtenerBoletos,
    obtenerRecompensas,
    obtenerSorteo,
    obtenerBoleto,
    obtenerRecompensa,
    eliminarRecompensa
}