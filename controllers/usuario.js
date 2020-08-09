'use strict'

var bcrypt = require('bcrypt-nodejs');
var Usuario = require('../models/usuario');

var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var path = require('path');
const fs = require('fs');

const notificacion = require('./notificacion');


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
        usuario.plataforma = params.plataforma;
        usuario.rol = 'USUARIO';
        usuario.status = 'por activar';
        usuario.visitas = 0;


        // return res.status(200).send({
        //     message: 'Estamos en mantenimiento, vuelve a intentarlo mañana'
        // });

        if(params.status != 0){
            return res.status(200).send({
                message: 'Estamos en mantenimiento, vuelve a intentarlo más tarde'
            });
        }

        // Comprobar y controlar usuarios duplicados
        Usuario.find({$or: [
            {telefono: usuario.telefono},
            {correo: usuario.correo.toLowerCase()}
        ]}).exec((err, usuarios) => {
            if(err){ 
                return res.status(500).send({message: 'Error al guardar el usuario'});
            }

            var emailDoble = 0;
            var telefonoDoble = 0;
            usuarios.forEach((user) => {
                if(user && user.telefono == usuario.telefono) telefonoDoble = 1;
                if(user && user.correo == usuario.correo) emailDoble = 1;
            });

            if(emailDoble == 1 && telefonoDoble == 1) return res.status(404).send({message: 'Este correo y este teléfono ya están en uso, intenta con unos diferentes'});
            if(emailDoble == 1) return res.status(404).send({message: 'Este correo ya está en uso, intenta con uno diferente'});
            if(telefonoDoble == 1) return res.status(404).send({message: 'Este teléfono ya está en uso, intenta con uno diferente'});


            if(usuarios.length == 0){

                // Cifra la contraseña y guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    usuario.password = hash;
                
                    usuario.save((err, usuarioStored) => {
                        if(err){ 
                            return res.status(500).send({message: 'Error al guardar el usuario'});
                        }

                        if(usuarioStored){
                            return res.status(200).send({usuario: usuarioStored});

                        } else {
                            return res.status(404).send({message: 'No se ha registrado el usuario'})
                        }
                    });
                });
            }
        });

    } else {
        res.status(200).send({
            message: 'Envía todos los campos necesarios'
        });
    }
}

// Login
function logearUsuario(req, res){
    var params = req.body;

    var correo = params.correo.toLowerCase();
    var password = params.password;

    Usuario.findOne({correo: correo}, (err, usuario) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(usuario){
            if(usuario.status != 'activo'){
                return res.status(404).send({message: 'No has sido dado de alta'});
            } else {
                bcrypt.compare(password, usuario.password, (err, check) => {
                    if(check){                    
                        if(params.gettoken){
                            return res.status(200).send({
                                token: jwt.createToken(usuario)
                            });
                        } else {
                            usuario.password = undefined;
                            return res.status(200).send({usuario});
                        }
                    } else {
                        // Devolver error
                        return res.status(404).send({message: 'Contraseña incorrecta'});
                    }
                });
            }
        } else {
            return res.status(404).send({message: 'El usuario no existe'});
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

// Conseguir datos de varios usuarios
function obtenerUsuarios(req, res){
    var restauranteId = req.params.id;

    Usuario.find({restaurante: restauranteId}, (err, usuarios) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuarios) return res.status(404).send({message: 'El usuarios no existe'});
        
        return res.status(200).send({usuarios: usuarios});
    });
}

// Edición de datos de usuario
function actualizarUsuario(req, res){
    var usuarioId = req.usuario.sub;
    var update = req.body;

    delete update.password;

    // if(usuarioId != req.usuario.sub){
    //     return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    // }

    if(req.usuario.rol =! 'ADMIN'){
        return res.status(500).send({message: 'Error en el servidor'});
    }

    Usuario.findByIdAndUpdate(usuarioId, update, {new:true}, (err, usuarioUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuarioUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
        
        return res.status(200).send({usuario: usuarioUpdated});
    });
};

// Edición de datos de usuario
function actualizarPermisosUsuario(req, res){
    var usuarioId = req.params.id;

    if(req.usuario.rol =! 'ADMIN'){
        return res.status(500).send({message: 'Error en el servidor'});
    }

    
    if(req.params.permiso == 1){
        var update = {rol: 'RESTAURANTE'};

    } else if(req.params.permiso == 2){
        var update = {rol: 'EMPLEADO'};

    } else {

        var correo = req.params.permiso;
        var restauranteId = req.params.id;

        return Usuario.find({correo: correo.toLowerCase()}).exec((err, usuario) => {
            if(err){ 
                return res.status(500).send({message: 'Error al guardar el restaurante'});
            }
        
            if(usuario && usuario.length >= 1) {
                    
                Usuario.findByIdAndUpdate(usuario[0]._id, {rol: 'RESTAURANTE', restaurante: restauranteId}, {new:true}, (err, userUpdated) =>{
                    if(err) return res.status(500).send({message: 'Error en la petición'});
                
                    if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                
                    return res.status(200).send({usuario: userUpdated});                                
                })                                        
                .catch(err => {
                    // console.log(err);
                    return res.status(500).send({message: 'Error al guardar el restaurante'});
                });
            } else {
                return res.status(404).send({message: 'El correo con el que intentas registrar no existe'});
            }
        });
    }

    Usuario.findByIdAndUpdate(usuarioId, update, {new:true}, (err, usuarioUpdated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuarioUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
        
        return res.status(200).send({usuario: usuarioUpdated});
    });
};


// // Subir archivos de imagen/avatar de usuario
function actualizarImagenUsuario(req, res){

    try{    var usuarioId = req.params.id;
            var file_path = req.files.image.path;

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
            return res.status(500).send({message: 'Error en el servidor'});
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


// function contarUsuarios(req, res){
//     var restauranteId = req.params.id;

//     Usuario.countDocuments({restaurante: restauranteId}, (err, usuarios) => {
//         if(err) return res.status(500).send({message: 'Error en la petición'});

//         if(!usuarios) return res.status(404).send({message: 'El usuarios no existe'});
        
//         return res.status(200).send({usuarios: usuarios});
//     });
// }


function activarUsuario(req, res){
    var usuarioId = req.params.id;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    if(req.params.status == 1){
        var parametro = 'activo';

    } else if(req.params.status == 2){
        var parametro = 'inactivo';

    } else {
        return
    }

    Usuario.findByIdAndUpdate(usuarioId, {status: parametro}, {new:true}, (err, usuario) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuario) return res.status(404).send({message: 'El usuario no existe'});
        
        return res.status(200).send({usuario: usuario});
    });
}


function contarUsuarios(req, res){
    var status = req.params.status;
    var x = req.params.parametro;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    if(status == 1){
        var parametro = {municipio: x};

    } else if(status == 2){
        var parametro = {rol: x};

    } else {
        var parametro = {municipio: status, rol: x};
    }
    console.log(parametro);

    Usuario.countDocuments(parametro, (err, usuarios) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuarios) return res.status(404).send({message: 'El usuarios no existe'});
        
        return res.status(200).send({usuarios: usuarios});
    });
}


function todosLosUsuarios(req, res){
    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }
    
    Usuario.find({status: 'activo', municipio: {$ne: '5ea75e24006fd271928efe35'}}, (err, usuarios) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuarios) return res.status(404).send({message: 'El usuarios no existe'});
        
        return res.status(200).send({usuarios: usuarios});
    });
}


function todosLosUsuarios2(req, res){
    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }
    var itemsPerPage = 10;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    
    Usuario.find({status: 'activo', municipio: {$ne: '5ea75e24006fd271928efe35'}}).sort('-_id').paginate(page, itemsPerPage, (err, usuarios, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuarios) return res.status(404).send({message: 'El usuarios no existe'});
        
        return res.status(200).send({usuarios: 
            usuarios,
            total,
            pages: Math.ceil(total/itemsPerPage)});
    });
}


function usuariosSinActivar(req, res){
    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    var itemsPerPage = 10;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    
    Usuario.find({status: 'por activar', municipio: {$ne: '5ea75e24006fd271928efe35'}}).sort('-_id').paginate(page, itemsPerPage, (err, usuarios, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuarios) return res.status(404).send({message: 'El usuarios no existe'});
        
        return res.status(200).send({usuarios: 
            usuarios,
            total,
            pages: Math.ceil(total/itemsPerPage)});
    });
}


function todosEmpleados(req, res){
    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    var itemsPerPage = 1000;
    var page = 1;
    
    Usuario.find({$or: [{rol: 'RESTAURANTE'}, {rol: 'EMPLEADO'}]}).paginate(page, itemsPerPage, (err, usuarios) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!usuarios) return res.status(404).send({message: 'El usuarios no existe'});
        
        return res.status(200).send({usuarios: usuarios});
    })
}


function eliminarUsuario(req, res){
    var usuario_id = req.params.id;

    if(req.params.con != 'notelasabes'){
        return res.status(200).send({message: 'Usuario eliminado correctamente'});
    }

    if(req.usuario.rol != 'ADMIN'){
        // return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
        return res.status(200).send({message: 'Usuario eliminado correctamente'});
    }

    Usuario.find({_id: usuario_id}).deleteOne((err, usuarioRemoved) => {
        if(err) return res.status(500).send({message: 'Error al borrar el usuario'});

        if(!usuarioRemoved) return res.status(404).send({message: 'No se ha borrado el usuario'});

        return res.status(200).send({usuario: usuarioRemoved});
    })
}



module.exports = {
    registrarUsuario,
    logearUsuario,
    obtenerUsuario,
    obtenerUsuarios,
    actualizarUsuario,
    actualizarPermisosUsuario,
    actualizarImagenUsuario,
    obtenerImagenUsuario,
    activarUsuario,
    contarUsuarios,
    todosLosUsuarios,
    todosLosUsuarios2,
    usuariosSinActivar,
    todosEmpleados,
    eliminarUsuario
}