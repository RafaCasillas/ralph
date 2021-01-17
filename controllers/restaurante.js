'use strict'
 
var Restaurante = require('../models/restaurante');
var Usuario = require('../models/usuario');
var Seccion = require('../models/seccion-restaurante');
var Horario = require('../models/horario');
var Deposito = require('../models/deposito');
var Cobro = require('../models/cobro');

var moment = require('moment');
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
        restaurante.envio = [];
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
        if(req.usuario.rol != 'ADMIN'){
            return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
        }
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


    if(req.params.status == 0){
        var parametro = {};

    } else if(req.params.status == 1){
        var parametro = {status: {$ne: 'por activar'}};

    } else if(req.params.status == 2){
        var parametro = {status: 'por activar'};
    }


    Restaurante.find(parametro).sort('nombre').paginate(page, itemsPerPage, (err, restaurantes, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!restaurantes) return res.status(404).send({message: 'El restaurantes no existe'});
        
        return res.status(200).send({restaurantes, total});
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
    
    if(params.nombre && params.posicion){
        var seccion = new Seccion();
        seccion.nombre = params.nombre;
        seccion.restaurante = req.params.id;
        seccion.posicion = req.params.posicion;
        seccion.posicion = params.posicion;

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
        var itemsPerPage = 50;
    }

    // Seccion.aggregate([ { $match: { restaurante: '5ea9f726110e020ee7e1c2a0' }}, { $sample: { size: 3 } } ], (err, secciones, total) => {

    Seccion.find({'restaurante': restaurante}).sort('posicion').paginate(page, itemsPerPage, (err, secciones, total) => {
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

function actualizarCredito(req, res){
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

    } else if(req.params.status == 3){
        var parametro = {status: 'por activar'};

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

    abrirRestaurantesLocal(1);

    if(req.params.horas != 0){
        abrirAnteriores(req.params.horas);
    }
    
    setTimeout(() => {
        var now = new Date();
        var date = new Date(now.getTime() - 21600000);

        var dia = date.getDay();
        var hora = date.getHours();
        var min = date.getMinutes();

        if(min >= 55 || min <= 5){
            var minuto = 0;
            if(min >= 55){
                hora = hora + 1;
            }
            
        } else if(min >= 25 && min <= 35){
            var minuto = 30;
        }

        abrirlos(dia, hora, minuto, min);

        // notificacion.NotificacionAdmin('Se activó el abrir restaurantes', 'El día ' + dia + ', a las ' + hora + ' : ' + minuto);
    }, 100);
}


function abrirRestaurantesLocal(n){

    // if(n == 1){
    //     notificacion.NotificacionAdmin('Se reactivó el abrir restaurantes', '');
    // }

    // Horario de verano = UTC - 5 = 18000000;
    // El hotro horario = UTC - 6 = 21600000;


    var miFuncion =  setInterval(() => {
        var now = new Date();
        var date = new Date(now.getTime() - 21600000);
    
        var dia = date.getDay();
        var hora = date.getHours();
        var min = date.getMinutes();
    
        if(min >= 55 || min <= 5){
            var minuto = 0;
            if(min >= 55){
                hora = hora + 1;
            }
            
        } else if(min >= 25 && min <= 35){
            var minuto = 30;
        }
    
    
        if(hora == 15){
            clearInterval(miFuncion);
            reactivarFuncion(100, 0);
        }

        if(hora == 0){
            clearInterval(miFuncion);
            reactivarFuncion(100, 1);
        }
        
        if(hora == 2){
            clearInterval(miFuncion);
            reactivarFuncion(100, 1);
        }
        
        if(hora == 4){
            clearInterval(miFuncion);
            reactivarFuncion(100, 1);
        }
        
        if(hora == 6){
            clearInterval(miFuncion);
            reactivarFuncion(100, 1);
        }
        
        // if(hora == 8){
        //     notificacion.NotificacionAdmin('Se activó el abrir restaurantes', 'El día ' + dia + ', a las ' + hora + ' : ' + minuto);
        // }
    
    
        abrirlos(dia, hora, minuto, min);
    
    }, 1800000);
}

function reactivarFuncion(tiempo, n){
    setTimeout(() => {
        abrirRestaurantesLocal(n);
    }, tiempo);
}


function abrirAnteriores(horas){

    var mediasHoras = 0;
    
    var timer = setInterval(() => {
        var now = new Date();
        var date = new Date((now.getTime() - (21600000 + horas*3600000) + (mediasHoras*1800000)));
    
        var dia = date.getDay();
        var hora = date.getHours();
        var min = date.getMinutes(); 
        
        if(min >= 55 || min <= 5){
            var minuto = 0;
            if(min >= 55){
                hora = hora + 1;
            }
            
        } else if(min >= 25 && min <= 35){
            var minuto = 30;
        }

        abrirlos(dia, hora, minuto, min);
        
        mediasHoras = mediasHoras + 1;

        if(mediasHoras == (horas*2)){
            clearInterval(timer);
        }
    }, 100)
}


function abrirlos(dia, hora, minuto, min){
    // Dias de la semana -> 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miercoles, 4 = Jueves, 5 = Viernes, 6 = Sabado

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
    });
}


function obtenerHorario(req, res){
    var restauranteId = req.params.res;

    var page = 1;
    var itemsPerPage = 10;

    Horario.find({restaurante: restauranteId}).sort('nombre').paginate(page, itemsPerPage, (err, horario) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!horario) return res.status(404).send({message: 'El horario no existe'});

        var now = new Date();
        var date = new Date(now.getTime() - 21600000);
        var dia = date.getDay();
        
        return res.status(200).send({horario: horario, dia});
    })
}


function agregarTelefono(req, res){
    var restauranteId = req.params.id;
    var telefono = req.params.tel;

    if(req.usuario.rol != 'ADMIN'){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Restaurante.findById(restauranteId, (err, restaurant) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!restaurant) return res.status(404).send({message: 'El restaurant no existe'});

        restaurant.llamadas.push(telefono);

        Restaurante.findByIdAndUpdate(restauranteId, restaurant, {new:true}, (err, restaurante) => {
            if(err) return res.status(500).send({message: 'Error en la petición'});
            if(!restaurante) return res.status(404).send({message: 'El restaurante no existe'});
            return res.status(200).send({restaurante: restaurante});
        });
    });
}


function opcionesRestaurante(req, res){
    var restauranteId = req.params.id
    var opcion = req.params.op

    if(opcion == 'true'){
        var params = {FBads: true};

    } else if (opcion == 'false'){
        var params = {FBads: false};

    } else {
        var params = {pedidoMinimo: Number(opcion)};
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


function servicioDom(req, res){
    var restauranteId = req.params.id
    var opcion = req.params.op

    if(opcion == 'true'){
        var params = {servicioDomicilio: true};

    } else if (opcion == 'false'){
        var params = {servicioDomicilio: false};

    } else {
        opcion = opcion.split(',');
        var arreglo = []
        opcion.forEach(element => {
            var element2 = parseInt(element)
            arreglo.push(element2);
        });

        var params = {envio: arreglo};
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


function crearDeposito(req, res){
    var params = req.body;

    if(params.restaurante && params.cantidad && params.metodoPago && params.credito && params.debe && params.ralphDebe){
        var deposito = new Deposito();
        deposito.restaurante = params.restaurante;
        deposito.cantidad = params.cantidad;
        deposito.metodoPago = params.metodoPago;
        deposito.credito = params.credito;
        deposito.debe = params.debe;
        deposito.ralphDebe = params.ralphDebe;
        deposito.fecha = moment().unix();

        if(params.nota){
            deposito.nota = params.nota;
        } else {
            deposito.nota = null;
        }
        
        deposito.save((err, depositoStored) => {
            if(err){ 
                return res.status(500).send({message: 'Error al guardar el deposito'});
            }

            if(depositoStored){
                return res.status(200).send({deposito: depositoStored});

            } else {
                return res.status(404).send({message: 'No se ha registrado el deposito'});
            }
        });
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}


function obtenerDeposito(req, res){
    var depositoId = req.params.id;

    Deposito.findById(depositoId, (err, deposito) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!deposito) return res.status(404).send({message: 'El deposito no existe'});
        
        return res.status(200).send({deposito: deposito});
    });
}



function obtenerDepositos(req, res){
    var itemsPerPage = 6;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    
    Deposito.find({restaurante: req.params.id}).sort('-fecha').paginate(page, itemsPerPage, (err, depositos, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!depositos) return res.status(404).send({message: 'No hay depositos disponibles'});

        return res.status(200).send({
            depositos,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}


// function crearCobroLocal(req, res){
//     var params = req.body;

//     if(params.restaurante && params.cantidad){
//         var cobro = new Cobro();
//         cobro.restaurante = params.restaurante;
//         cobro.cantidad = params.cantidad;
//         cobro.fecha = moment().unix();

//         if(params.nota){
//             cobro.nota = params.nota;
//         } else {
//             cobro.nota = null;
//         }
        
//         cobro.save((err, cobroStored) => {
//             if(err){ 
//                 return res.status(500).send({message: 'Error al guardar el cobro'});
//             }

//             if(cobroStored){
//                 return res.status(200).send({cobro: cobroStored});

//             } else {
//                 return res.status(404).send({message: 'No se ha registrado el cobro'});
//             }
//         });
//     } else {
//         res.status(200).send({
//             message: 'Envia todos los campos necesarios'
//         });
//     }
// }


function crearCobro(req, res){
    var params = req.body;

    if(params.restaurante && params.cantidad){
        var cobro = new Cobro();
        cobro.restaurante = params.restaurante;
        cobro.cantidad = params.cantidad;
        cobro.fecha = moment().unix();

        if(params.nota){
            cobro.nota = params.nota;
        } else {
            cobro.nota = null;
        }
        
        cobro.save((err, cobroStored) => {
            if(err){ 
                return res.status(500).send({message: 'Error al guardar el cobro'});
            }

            if(cobroStored){
                return res.status(200).send({cobro: cobroStored});

            } else {
                return res.status(404).send({message: 'No se ha registrado el cobro'});
            }
        });
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}


function obtenerCobro(req, res){
    var cobroId = req.params.id;

    Cobro.findById(cobroId, (err, cobro) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!cobro) return res.status(404).send({message: 'El cobro no existe'});
        
        return res.status(200).send({cobro: cobro});
    });
}


function obtenerCobros(req, res){
    var itemsPerPage = 6;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    
    Cobro.find({restaurante: req.params.id}).sort('-fecha').paginate(page, itemsPerPage, (err, cobros, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!cobros) return res.status(404).send({message: 'No hay cobros disponibles'});

        return res.status(200).send({
            cobros,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}


function eliminarHorario(req, res){
    var horario_id = req.params.id;

    Horario.find({_id: horario_id}).deleteOne((err, horarioRemoved) => {
        if(err) return res.status(500).send({message: 'Error al borrar el horario'});

        if(!horarioRemoved) return res.status(404).send({message: 'No se ha borrado el horario'});

        return res.status(200).send({horario: horarioRemoved});
    })
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
    actualizarCredito,
    darDeAltaRestaurante,
    crearHorario,
    abrirRestaurantes,
    obtenerHorario,
    agregarTelefono,
    opcionesRestaurante,
    servicioDom,
    crearDeposito,
    obtenerDeposito,
    obtenerDepositos,
    crearCobro,
    obtenerCobro,
    obtenerCobros,
    eliminarHorario
}