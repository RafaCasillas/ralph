'use strict'
 
var Restaurante = require('../models/restaurante');
var Usuario = require('../models/usuario');
var Seccion = require('../models/seccion-restaurante');

var mongoosePaginate = require('mongoose-pagination');
var path = require('path');
const fs = require('fs');

// Registro
function registrarRestaurante(req, res){
    var params = req.body;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    if(params.propietario && params.municipio != 0 && params.servicioDomicilio != null){
        var restaurante = new Restaurante();

        restaurante.municipio = params.municipio;
        restaurante.servicioDomicilio = params.servicioDomicilio;
        restaurante.status = 'por activar';

        restaurante.nombre = null;
        restaurante.ubicacion = [];
        restaurante.imagen = null;
        restaurante.telefono = null;
        restaurante.credito = 30;
        restaurante.debe = 0;
        restaurante.horario = [];
        restaurante.visitas = 0;


        Usuario.find({correo: params.propietario.toLowerCase()}
                    ).exec((err, usuario) => {
                        if(err){ 
                            return res.status(500).send({
                                message: '34 - Error al guardar el restaurante'
                            });
                        }

                        if(usuario && usuario.length >= 1) {
                            restaurante.propietario = usuario[0]._id;

                            if(usuario[0].rol == 'RESTAURANTE'){
                                return res.status(200).send({
                                    message: 'Esta persona ya tiene un restaurante asignado'
                                });
                            }
                                
                            restaurante.save((err, RestauranteStored) => {
                                if(err){ 
                                    console.log(err);
                                    return res.status(500).send({
                                        message: '51 - Error al guardar el restaurnante'
                                    });
                                }                                
                                
                                if(RestauranteStored){
                                    Usuario.findByIdAndUpdate(usuario[0]._id, {rol: 'RESTAURANTE', restaurante: RestauranteStored._id}, {new:true}, (err, userUpdated) =>{
                                        if(err) return res.status(500).send({message: '57 - Error en la petición'});
                                    
                                        if(!userUpdated) return res.status(404).send({message: '59 - No se ha podido actualizar el usuario'});
                                    
                                        return res.status(200).send({restaurante: RestauranteStored, usuario: userUpdated});                                
                                    })                                        
                                    .catch(err => {
                                                console.log(err);
                                                return res.status(500).send({
                                                    message: '66 - Error al guardar el restaurnante'
                                                });
                                            });
                                } else {
                                    return res.status(404).send({
                                        message: 'No se ha registrado el restaurante'
                                    })
                                }
                            });
                        } else {
                            return res.status(200).send({
                                message: 'El correo con el que intentas registrar no existe'
                            });                       
                        }
                    });

    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}

function actualizarRestaurante(req, res){
    var update = req.body;
    var restaurante_id = req.params.id; //el id se almacena en el local storage del usuario: identity.restaurante

    if(restaurante_id != req.usuario.restaurante){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Restaurante.findByIdAndUpdate(restaurante_id, update, {new:true}, (err, restauranteUpdated) => {
        if(err) return res.status(500).send({message: '99 - Error en la petición'});
        
        if(!restauranteUpdated) return res.status(404).send({message: '101 - No se ha podido actualizar el restaurante'});
        
        return res.status(200).send({restaurante: restauranteUpdated});
    });
}

function actualizarImagenRestaurante(req, res){

    try{    var restaurante_id = req.params.id;
            var file_path = req.files.image.path;

            if(req.files.image && req.files.image.type != null){
                var file_split = file_path.split('/');
                var file_name = file_split[2];
                var ext_split = file_name.split('\.');
                var file_ext = ext_split[1];

                if(restaurante_id != req.usuario.restaurante){
                    return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
                }

                if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

                    // Borrar la imagen anterior que ya tenia el usuario
                    Restaurante.findById(req.params.id, (err, restaurante) => {
                        if(err) return res.status(500).send({message: '126 - Error en la petición'});

                        if(restaurante.imagen && restaurante.imagen != null){
                            var old_image = restaurante.imagen
                            var path_old_file = './uploads/restaurantes/'+old_image;
                            fs.unlink(path_old_file, (err) => {
                                if (err) return err;
                            });
                        }
                    })
                    Restaurante.findByIdAndUpdate(req.params.id, {imagen: file_name}, {new:true}, (err, restauranteUpdated) =>{
                        if(err) return res.status(500).send({message: 'Error en la petición'});

                        if(!restauranteUpdated) return res.status(404).send({message: 'No se ha podido actualizar el restaurante'});
                
                        return res.status(200).send({restaurante: restauranteUpdated});
                    })
                } else {
                    return removeFilesOfUploads(res, file_path, 'Extensión no válida');
                }

            } else {
                return removeFilesOfUploads(res, file_path, 'No mandaste ninguna imágen');
            }

    }   catch(err) {
        console.log(err);
            return res.status(500).send({message: '152 - Error en el servidor'});
        }
    } 

function removeFilesOfUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        if (err) return error;
        return res.status(200).send({message: message});
    });
}


function obtenerImagenRestaurante(req, res){
    var image_file = req.params.imageFile;
    var path_file = './uploads/restaurantes/'+image_file;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}

function obtenerRestaurante(req, res){
    var restauranteId = req.params.id;

    Restaurante.findById(restauranteId, (err, restaurante) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!restaurante) return res.status(404).send({message: 'El restaurante no existe'});
        
        return res.status(200).send({restaurante: restaurante});
    });
}

function obtenerRestaurantesAdmin(req, res){    
    
    var page = 1;
    var itemsPerPage = 100;

    Restaurante.find().sort('-nombre').paginate(page, itemsPerPage, (err, restaurantes) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!restaurantes) return res.status(404).send({message: 'El restaurantes no existe'});
        
        return res.status(200).send({restaurantes: restaurantes});
    });
}

function obtenerRestaurantes(req, res){
    
    var municipio = req.params.id;
    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Restaurante.find({status: 'activo', municipio: municipio}).sort().paginate(page, itemsPerPage, (err, restaurantes, total) => {
        if(err) return res.status(500).send({message: '202 - Error en la petición'});

        if(!restaurantes) return res.status(404).send({message: 'No hay restaurantes disponibles'});

        return res.status(200).send({
            restaurantes,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}
    
function crearSeccion(req, res){
    var params = req.body;
    var restaurante_id = req.params.id;

    if(restaurante_id != req.usuario.restaurante){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    if(params.nombre){
        var seccion = new Seccion();
        seccion.nombre = params.nombre;
        seccion.restaurante = req.params.id;

        seccion.save((err, seccionStored) => {
            if(err){ 
                return res.status(500).send({
                message: '227 - Error al guardar la seccion'
                });
            }

            if(seccionStored){
                return res.status(200).send({
                    seccion: seccionStored
                });
            } else {
                return res.status(404).send({
                    message: '237 - No se ha registrado la seccion'
                });
            }
        });
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}

function actualizarSeccion(req, res){
    var update = req.body;
    var seccion_id = req.params.sec;
    var restaurante_id = req.params.res;

    if(restaurante_id != req.usuario.restaurante){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Seccion.findByIdAndUpdate(seccion_id, update, {new:true}, (err, seccionUpdated) => {
        if(err) return res.status(500).send({message: '284 - Error en la petición'});
        
        if(!seccionUpdated) return res.status(404).send({message: '286 - No se ha podido actualizar la seccion'});
        
        return res.status(200).send({seccion: seccionUpdated});
    });
}

function obtenerSeccion(req, res){
    var seccionId = req.params.id;

    Seccion.findById(seccionId, (err, seccion) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!seccion) return res.status(404).send({message: 'El seccion no existe'});
        
        return res.status(200).send({seccion: seccion});
    });
}

function obtenerSecciones(req, res){
    var restaurante = req.params.id;
    var itemsPerPage = 3;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    if(req.params.who == 1){
        var itemsPerPage = 30;
    }

    // Seccion.aggregate([ { $match: { restaurante: '5ea9f726110e020ee7e1c2a0' }}, { $sample: { size: 3 } } ], (err, secciones, total) => {

    Seccion.find({'restaurante': restaurante}).paginate(page, itemsPerPage, (err, secciones, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!secciones) return res.status(404).send({message: 'Las secciones no existen'});
        
        return res.status(200).send({
            secciones,
            total,
            page,
            pages: Math.ceil(total/itemsPerPage)
        });
    });
}

function creditoa30(req, res){
    var restauranteId = req.params.id

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Restaurante.findByIdAndUpdate(restauranteId, {credito: 30}, {new:true}, (err, restaurante) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!restaurante) return res.status(404).send({message: 'El restaurante no existe'});

        return res.status(200).send({restaurante: restaurante});
    });
}

function darDeAltaRestaurante(req, res){
    var restauranteId = req.params.id

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Restaurante.findByIdAndUpdate(restauranteId, {status: 'inactivo'}, {new:true}, (err, restaurante) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!restaurante) return res.status(404).send({message: 'El restaurante no existe'});

        return res.status(200).send({restaurante: restaurante});
    });
}


module.exports = {
    registrarRestaurante,
    actualizarRestaurante,
    actualizarImagenRestaurante,
    obtenerImagenRestaurante,
    obtenerRestaurante,
    obtenerRestaurantesAdmin,
    obtenerRestaurantes,
    crearSeccion,
    actualizarSeccion,
    obtenerSeccion,
    obtenerSecciones,
    creditoa30,
    darDeAltaRestaurante
}