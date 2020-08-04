'use strict'
 
var Restaurante = require('../models/restaurante');
var Usuario = require('../models/usuario');
var Seccion = require('../models/seccion-restaurante');
var Horario = require('../models/horario');

var notificacion = require('./notificacion')
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
        restaurante.credito = 0;
        restaurante.debe = 0;
        restaurante.ralphDebe = 0;
        restaurante.horario = [];
        restaurante.visitas = 0;


        Usuario.find({correo: params.propietario.toLowerCase()}
                    ).exec((err, usuario) => {
                        if(err){ 
                            return res.status(500).send({
                                message: 'Error al guardar el restaurante'
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
                                    // console.log(err);
                                    return res.status(500).send({
                                        message: 'Error al guardar el restaurnante'
                                    });
                                }                                
                                
                                if(RestauranteStored){
                                    Usuario.findByIdAndUpdate(usuario[0]._id, {rol: 'RESTAURANTE', restaurante: RestauranteStored._id}, {new:true}, (err, userUpdated) =>{
                                        if(err) return res.status(500).send({message: 'Error en la petición'});
                                    
                                        if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                                    
                                        return res.status(200).send({restaurante: RestauranteStored, usuario: userUpdated});                                
                                    })                                        
                                    .catch(err => {
                                        // console.log(err);
                                        return res.status(500).send({
                                            message: 'Error al guardar el restaurante'
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
        // console.log(err);
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

    if(req.params.who == 0){
        var peticion = { municipio: municipio, status: 'activo' };
    } else {
        var peticion = { municipio: municipio};
    }

    var totalNumer = 28;
    
    Restaurante.aggregate([ { $match: peticion}, { $sample: { size: totalNumer } } ], (err, restaurantes) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!restaurantes) return res.status(404).send({message: 'No hay restaurantes disponibles'});

        return res.status(200).send({restaurantes: restaurantes})
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
                message: '227 - Error al guardar la sección'
                });
            }

            if(seccionStored){
                return res.status(200).send({
                    seccion: seccionStored
                });
            } else {
                return res.status(404).send({
                    message: '237 - No se ha registrado la sección'
                });
            }
        });
    } else {
        res.status(200).send({
            message: 'Envía todos los campos necesarios'
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

function eliminarSeccion(req, res){
    var seccion_id = req.params.id;

    Seccion.find({_id: seccion_id}).deleteOne((err, seccionRemoved) => {
        if(err) return res.status(500).send({message: 'Error al borrar la seccion'});

        if(!seccionRemoved) return res.status(404).send({message: 'No se ha borrado la seccion'});

        return res.status(200).send({seccion: seccionRemoved});
    })
}

function ActualizarCredito(req, res){
    var restauranteId = req.params.id
    var cantidad = req.params.can
    var creditoOdebo = req.params.num

    if(creditoOdebo == 1){
        var params = {credito: cantidad};

    } else if (creditoOdebo == 2){
        var params = {debe: cantidad};

    } else if (creditoOdebo == 3){
        var params = {ralphDebe: cantidad};

    } else {
        return
    } 


    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Restaurante.findByIdAndUpdate(restauranteId, params, {new:true}, (err, restaurante) => {
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

    if(req.params.status == 1){
        var parametro = {status: 'inactivo'};
        
    } else if(req.params.status == 2){
        var parametro = {status: 'activo'};

    } else { return }

    Restaurante.findByIdAndUpdate(restauranteId, parametro, {new:true}, (err, restaurante) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!restaurante) return res.status(404).send({message: 'El restaurante no existe'});

        return res.status(200).send({restaurante: restaurante});
    });
}


function crearHorario(req, res){
    var params = req.body;
    var horario = new Horario();
    horario.restaurante = params.restaurante;
    horario.nombre = params.nombre;
    horario.apertura = params.apertura;
    horario.cierre = params.cierre;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(200).send({message: 'funcion activada'});
    }

    if(params){
        horario.save((err, horarioStored) => {
            if(err){ 
                return res.status(500).send({message: 'Error al guardar el horario'});
            }

            if(horarioStored){
                return res.status(200).send({horario: horarioStored});

            } else {
                return res.status(404).send({message: 'No se ha registrado el horario'});
            }
        });
    } else {
        res.status(200).send({message: 'Envia todos los campos necesarios'});
    }
}


function abrirRestaurantes(req, res){
    if(req.params.con != 'estaesmicontrasena'){
        return res.status(200).send('funcion activada');
    };

    if(req.usuario.rol != 'ADMIN'){
        return res.status(200).send({message: 'funcion activada'});
    }
    
    res.status(200).send('Función activada correctamente');


    var miFuncion =  setInterval(() => {
        var now = new Date();
        var date = new Date(now.getTime() - 18000000);

        var dia = date.getDay();
        var hora = date.getHours();
        var min = date.getMinutes();
    
        if(min >= 0 && min < 10){
            var minuto = 0;
            
        } else if(min >= 25 && min < 35){
            var minuto = 30;
        }


        if(hora == 0){
            clearInterval(miFuncion);
        }


        abrirlos(dia, hora, minuto, min);

    }, 1800000);
    
    setTimeout(() => {
        var now = new Date();
        var date = new Date(now.getTime() - 18000000);

        var dia = date.getDay();
        var hora = date.getHours();
        var min = date.getMinutes();
    
        if(min >= 0 && min < 10){
            var minuto = 0;
            
        } else if(min >= 25 && min < 35){
            var minuto = 30;
        }

        abrirlos(dia, hora, minuto, min);

        notificacion.NotificacionAdmin('Se activó el abrir restaurantes', 'El día ' + dia + ', a las ' + hora + ' : ' + minuto);
    }, 100);
}


function abrirlos(dia, hora, minuto, min){
    // Dias de la semana => 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miercoles, 4 = Jueves, 5 = Viernes, 6 = Sabado

    Horario.find((err, restaurantes) => {
        if(err) return
        if(!restaurantes) return

        restaurantes.forEach((restaurante) => {
            // Abrir restaurantes
            if(restaurante.apertura[dia] >= hora && restaurante.apertura[dia] < (hora+1)){
                // Comprobacion de si abren a la media y si estamos en la media
                if(restaurante.apertura[dia].toString().length >= 3){
                    if(minuto == 30){
                        activarDesactivar(restaurante.restaurante, 2);
                    }
                } else {
                    if(minuto != 30){
                        activarDesactivar(restaurante.restaurante, 2);
                    }
                }
            }

            // Cerrar restaurantes
            if(restaurante.cierre[dia] >= hora && restaurante.cierre[dia] < (hora+1)){
                // Comprobacion de si abren a la media y si estamos en la media
                if(restaurante.cierre[dia].toString().length >= 3){
                    if(minuto == 30){
                        activarDesactivar(restaurante.restaurante, 1);
                    }
                } else {
                    if(minuto != 30){
                        activarDesactivar(restaurante.restaurante, 1);
                    }
                }
            }
        });
    })
}

function activarDesactivar(restauranteId, status){
    if(status == 1){
        var parametro = {status: 'inactivo'};
        
    } else if(status == 2){
        var parametro = {status: 'activo'};
    }

    Restaurante.findByIdAndUpdate(restauranteId, parametro, {new:true}, (err, restaurante) => {
        if(err) return
        if(!restaurante) return
        notificacion.NotificacionUnica('Se ' + status +' el restaurante: ', restaurante.nombre);
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
    eliminarSeccion,
    ActualizarCredito,
    darDeAltaRestaurante,
    crearHorario,
    abrirRestaurantes
}




// https://ralph.com.mx/api/crear-horario


// {
//     "restaurante" : "5ee7b6dc06de0d53a65623cd",
//     "nombre" : "El Sazón de la Abuela",
//     "apertura" : [null,8,8,8,8,8,8],
//     "cierre" :  [null,15.5,15.5,15.5,15.5,15.5,15.5]
// }


// {
//     "restaurante" : "5eb4ac7db1739471c9b7b9eb",
//     "nombre" : "Azotea",
//     "apertura" : [9,9,9,9,9,9,9],
//     "cierre" :  [23,23,23,23,23,23,23]
// }


// {
//     "restaurante" : "5f0612faef8bca480c1d22bb",
//     "nombre" : "Subway",
//     "apertura" : [11.5,9,9,9,9,9,9],
//     "cierre" :  [19.5,21,21,21,21,21,19]
// }


// {
//     "restaurante" : "5efe49355a48f417a322ea3c",
//     "nombre" : "Salaatti",
//     "apertura" : [13,13,10,10,10,10,10],
//     "cierre" :  [19.5,19.5,19.5,19.5,19.5,19.5,19.5]
// }


// {
//     "restaurante" : "5edeb94106de0d53a6562377",
//     "nombre" : "Sushi Sai",
//     "apertura" : [13,13,13,13,13,13,13],
//     "cierre" :  [23,23,23,23,23,23,23]
// }


// {
//     "restaurante" : "5eacb494b1739471c9b7b932",
//     "nombre" : "Bull Dogos",
//     "apertura" : [14.5,14.5,14.5,14.5,14.5,14.5,14.5],
//     "cierre" :  [22.5,22.5,22.5,22.5,22.5,22.5,22.5]
// }


// {
//     "restaurante" : "5edaa7be0158fd557164144c",
//     "nombre" : "Social",
//     "apertura" : [null,null,15,15,15,15,15],
//     "cierre" :  [null,null,23,23,23,23,23]
// }


// {
//     "restaurante" : "5ebb3c181a1d6a45ec2e81ad",
//     "nombre" : "La Boloneza Restaurant",
//     "apertura" : [8,null,8,8,8,8,8],
//     "cierre" :  [18,null,18,18,18,18,18]
// }


// {
//     "restaurante" : "5eac9667b1739471c9b7b913",
//     "nombre" : "POLOMO",
//     "apertura" : [9,9,9,9,9,9,9],
//     "cierre" :  [12,12,12,12,12,12,12]
// }


// {
//     "restaurante" : "5eb44150b1739471c9b7b9cf",
//     "nombre" : "Los Portales",
//     "apertura" : [9,9,9,null,9,9,9],
//     "cierre" :  [18,18,18,null,18,18,18]
// }


// {
//     "restaurante" : "5eac9627b1739471c9b7b912",
//     "nombre" : "Salad Green",
//     "apertura" : [10,10,null,10,10,10,10],
//     "cierre" :  [18,18,null,18,18,18,18]
// }


// {
//     "restaurante" : "5f04ba2a4f468f35845ea0e4",
//     "nombre" : "El chiguilo",
//     "apertura" : [11,11,11,11,11,11,11],
//     "cierre" :  [19,19,19,19,19,19,19]
// }


// {
//     "restaurante" : "5ee51ad106de0d53a65623ba",
//     "nombre" : "Mariscos el Cangrejito",
//     "apertura" : [11,null,11,11,11,11,11],
//     "cierre" :  [19,null,19,19,19,19,19]
// }


// {
//     "restaurante" : "5eb45078b1739471c9b7b9da",
//     "nombre" : "CafeCalli",
//     "apertura" : [8.5,null,8.5,8.5,8.5,8.5,8.5],
//     "cierre" :  [10.5,null,10.5,10.5,10.5,10.5,10.5]
// }


// {
//     "restaurante" : "5ee39bb506de0d53a65623b3",
//     "nombre" : "La casa de pekin",
//     "apertura" : [10,10,10,10,10,10,10],
//     "cierre" :  [18.5,18.5,18.5,18.5,18.5,18.5,18.5]
// }


// {
//     "restaurante" : "5ee16b4f06de0d53a656237f",
//     "nombre" : "Bodeguita de Krusty",
//     "apertura" : [13,13,13,13,13,13,13],
//     "cierre" :  [23,18,23,23,23,23,23]
// }


// {
//     "restaurante" : "5f0368ad4f468f35845ea0d1",
//     "nombre" : "Mazter pizza",
//     "apertura" : [13,13,13,13,13,13,13],
//     "cierre" :  [23,23,23,23,23,23,23]
// }


// {
//     "restaurante" : "5eb0c638b1739471c9b7b99d",
//     "nombre" : "Postrecitos con amor",
//     "apertura" : [null,16,16,16,16,16,null],
//     "cierre" :  [21,21,21,21,21,21,21]
// }


// {
//     "restaurante" : "5efd19285a48f417a322e9f7",
//     "nombre" : "Los molcajetes",
//     "apertura" : [10,10,null,10,10,10,10],
//     "cierre" :  [18.5,18.5,null,18.5,18.5,18.5,18.5]
// }


// {
//     "restaurante" : "5f187d44431e9c4328947b96",
//     "nombre" : "Loncheria Yazid 1",
//     "apertura" : [8.5,8.5,8.5,8.5,8.5,8.5,8.5],
//     "cierre" :  [14,14,14,14,14,14,14]
// }


// {
//     "restaurante" : "5f187d44431e9c4328947b96",
//     "nombre" : "Loncheria Yazid 2",
//     "apertura" : [19.5,null,19.5,19.5,19.5,19.5,19.5],
//     "cierre" :  [23,null,23,23,23,23,23]
// }