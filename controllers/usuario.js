'use strict'

var bcrypt = require('bcrypt-nodejs');
var Usuario = require('../models/usuario');

var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var path = require('path');
const fs = require('fs');


// Registro
function registrarUsuario(req, res){
    var params = req.body;

    if(params.nombre && params.apellido && params.telefono && params.correo && params.password && params.municipio != 0){
        var usuario = new Usuario();
        usuario.nombre = params.nombre;
        usuario.apellido = params.apellido;
        usuario.telefono = params.telefono;
        usuario.municipio = params.municipio;
        usuario.correo = params.correo.toLowerCase();
        usuario.rol = 'USUARIO';
        usuario.status = 'activo';
        usuario.restaurante = null;
        usuario.imagen = null;
        usuario.domicilio = null;


        // Comprobar y controlar usuarios duplicados
        Usuario.find({correo: usuario.correo.toLowerCase()}
                    ).exec((err, usuarios) => {
                        if(err){ 
                            return res.status(500).send({
                                message: '35 - Error al guardar el usuario'
                            });
                        }

                        if(usuarios && usuarios.length >= 1) {
                            return res.status(200).send({
                                message: 'El correo que intentas registrar ya existe'
                            });
                        } else {
                            // Cifra la contraseña y guarda los datos
                            bcrypt.hash(params.password, null, null, (err, hash) => {
                                usuario.password = hash;
                            
                                usuario.save((err, usuarioStored) => {
                                    if(err){ 
                                        console.log(err);
                                        return res.status(500).send({
                                        message: '50 - Error al guardar el usuario'
                                    });
                                    }
                                    if(usuarioStored){
                                        return res.status(200).send({
                                            usuario: usuarioStored
                                        });
                                    } else {
                                        return res.status(404).send({
                                            message: 'No se ha registrado el usuario'
                                        })
                                    }
                                });
                            });

                        }
                    });

    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}

// Login
function logearUsuario(req, res){
    var params = req.body;

    var correo = params.correo;
    var password = params.password;

    Usuario.findOne({correo: correo}, (err, usuario) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(usuario){
            bcrypt.compare(password, usuario.password, (err, check) => {
                if(check){
                    
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(usuario)
                        });
                    } else {
                        usuario.password = undefined;
                        return res.status(200).send({usuario});}

                } else {
                    // Devolver error
                    return res.status(404).send({message: 'El usuario no se ha podido logear'});
                }
            });
        } else {
            return res.status(404).send({message: 'El usuario no se ha podido identificar'});
        }
    })
}

// Conseguir datos de un usuario
function obtenerUsuario(req, res){
    var usuarioId = req.params.id;

    Usuario.findById(usuarioId, (err, usuario) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuario) return res.status(404).send({message: 'El usuario no existe'});
        
        usuario.password = undefined;
        return res.status(200).send({usuario: usuario});
    });
}

// Edición de datos de usuario
function actualizarUsuario(req, res){
    var usuarioId = req.params.id;
    var update = req.body;

    delete update.password;

    if(usuarioId != req.usuario.sub){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    // Comprobar y controlar usuarios duplicados
        Usuario.find({correo: update.correo.toLowerCase()}).exec((err, usuarios) => {
            if(err){ 
                return res.status(500).send({
                    message: 'Error en el servidor'
                });
            }
            
        var emailDoble = 0;
        usuarios.forEach((usuario) => {
            if(usuario && usuario._id != usuarioId && usuario.email == update.email) emailDoble = 1;
        });

        if(emailDoble == 1) return res.status(404).send({message: 'Este email ya está en uso, intenta con uno diferente'});

        Usuario.findByIdAndUpdate(usuarioId, update, {new:true}, (err, usuarioUpdated) => {
            if(err) return res.status(500).send({message: 'Error en la petición'});

            if(!usuarioUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

            return res.status(200).send({usuario: usuarioUpdated});
        });
    });
};


// // Subir archivos de imagen/avatar de usuario
function actualizarImagenUsuario(req, res){

    try{    var usuarioId = req.params.id;
            var file_path = req.files.imagen.path;

            if(req.files.image && req.files.image.type != null){
                var file_split = file_path.split('/');
                var file_name = file_split[2];
                var ext_split = file_name.split('\.');
                var file_ext = ext_split[1];

                if(usuarioId != req.usuario.sub){
                    return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos');
                }

                if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
                    // Actualizar documento de usuario loggeado

                    // Borrar la imagen anterior que ya tenia el usuario
                    Usuario.findById(req.usuario.sub, (err, usuario) => {
                        if(err) return res.status(500).send({message: 'Error en la petición'});

                        if(usuario.imagen && usuario.imagen != null){
                            var old_image = usuario.imagen
                            var path_old_file = './uploads/usuarios/'+old_image;
                            fs.unlink(path_old_file, (err) => {
                                if (err) return err;
                            });
                        }
                    })
                    Usuario.findByIdAndUpdate(usuarioId, {imagen: file_name}, {new:true}, (err, usuarioUpdated) =>{
                        if(err) return res.status(500).send({message: 'Error en la petición'});

                        if(!usuarioUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                
                        return res.status(200).send({usuario: usuarioUpdated});
                    })
                } else {
                    return removeFilesOfUploads(res, file_path, 'Extensión no válida');
                }

            } else {
                return removeFilesOfUploads(res, file_path, 'No mandaste ninguna imágen');
            }

    }   catch(err) {
            return res.status(500).send({message: '212 - Error en el servidor'});
        }
    } 

function removeFilesOfUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        if (err) return error;
        return res.status(200).send({message: message});
    });
}


function obtenerImagenUsuario(req, res){
    var image_file = req.params.imageFile;
    var path_file = './uploads/usuarios/'+image_file;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}



module.exports = {
    registrarUsuario,
    logearUsuario,
    obtenerUsuario,
    actualizarUsuario,
    actualizarImagenUsuario,
    obtenerImagenUsuario
}