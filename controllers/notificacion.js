'use strict'
 
var moment = require('moment');
const vapid = require('../vapid.json');
const webpush = require('web-push');
const urlsafeBase64 = require('urlsafe-base64');
var path = require('path');
const fs = require('fs');

const twilio = require('../twilio');
const twilio2 = require('../code');
const client = require('twilio')(twilio.accountSID, twilio.authToken);
const client2 = require('twilio')(twilio2.account, twilio2.token);
var Usuario = require('../models/usuario');
var Restaurante = require('../models/restaurante');
var Pedido = require('../models/pedido');


const api = 'https://ralph.com.mx/api/';
// const api = 'http://localhost:3000/api/';

var Notificacion = require('../models/notificacion');


webpush.setVapidDetails(
  'mailto:rafaelcasillas100@hotmail.com',
  vapid.publicKey,
  vapid.privateKey
);

function getKey(){
  return urlsafeBase64.decode(vapid.publicKey);
};

function key(req, res){
  const key = getKey();
  res.send(key);
};


function saveSubscripcion(req, res){
    const suscripcion = req.body;
    var notificacion = new Notificacion();

    notificacion.usuario = req.usuario.sub;
    notificacion.municipio = req.usuario.municipio;
    notificacion.fecha = moment().unix();
    notificacion.subscripcion = suscripcion;
    
    if(req.usuario.restaurante != null){
      notificacion.restaurante = req.usuario.restaurante;
    }

    notificacion.save((err, notificacionStored) => {
          if(err) return res.status(500).send({message: 'Error al guardar la publicación'});
    
          if(!notificacionStored) return res.status(404).send({message: 'La publicación no se guardó'});
    
          if(notificacionStored){
            NotificacionUsuario('Ralph', 'Has activado correctamente las notificaciones', req.usuario.sub);
            return res.status(200);
          }
      })  
};


function NotificacionRestaurante(title, body, restaurante, url){
    const post = {
      "notification": {
        title: title,
        body: body,
        icon: api + 'logo',
        badge: api + 'logo',
        requireInteraction: true,
        data: {
          url: url
        },
        webpush: {
          headers: {
            Urgency: 'high'
          }
        },
        android: {
          priority: 'high'
        },
        priority: 10
      }
    };

    Notificacion.find({restaurante: restaurante}).exec((err, notificaciones) => {
      if(err) res.status(500).send({ message: 'Error en el servidor' });
    
      if(!notificaciones) return res.status(404).send({message: 'No hay notificaciones'});

      if(notificaciones){
        return sendPush(post, notificaciones);
      }
    });
}

function NotificacionUsuario(title, body, usuario, url){
    const post = {
      "notification": {
        title: title,
        body: body,
        icon: api + 'logo',
        badge: api + 'logo',
        data: {
          url: url
        }
      }
    };

    Notificacion.find({usuario: usuario}).exec((err, notificaciones) => {
      if(err) res.status(500).send({ message: 'Error en el servidor' });
    
      if(!notificaciones) return res.status(404).send({message: 'No hay notificaciones'});

      if(notificaciones){
        return sendPush(post, notificaciones);
      }
    });
}

function NotificacionRepartidor(title, restauranteId){

  Restaurante.findById(restauranteId, (err, restaurante) => {
    if(err) return
    if(!restaurante) return

    if(restaurante.servicioDomicilio == false){
      const post = {
        "notification": {
          title: title,
          icon: api + 'logo',
          badge: api + 'logo',
          data: {
            url: '/repartidor/inicio'
          },
          webpush: {
            headers: {
              Urgency: 'high'
            }
          },
          android: {
            priority: 'high'
          },
          priority: 10
        }
      };

      if(restaurante.municipio == '5ea75e0f006fd271928efe33'){
        var usuarioId = '5f43476ceabb406c7dfbe4eb';
      } else {
        var usuarioId = '5f4a7b4b5156bd72401fd99a';
      }
    
      Notificacion.find({usuario: usuarioId}).exec((err, notificaciones) => {
        if(err) res.status(500).send({ message: 'Error en el servidor' });
        if(!notificaciones) return res.status(404).send({message: 'No hay notificaciones'});
    
        if(notificaciones){
          return sendPush(post, notificaciones);
        }
      });
    }
  })
}

function NotificacionAdmin(title, body){
    const post = {
      "notification": {
        title: title,
        body: body,
        icon: api + 'logo',
        badge: api + 'logo',
        requireInteraction: true,
        data: {
          url: '/admin/inicio'
        },
        webpush: {
          headers: {
            Urgency: 'high'
          }
        },
        android: {
          priority: 'high'
        },
        priority: 10
      }
    };

    Notificacion.find({usuario: '5eaaefea7fdccd3336b9711c'}).exec((err, notificaciones) => {
      if(err) res.status(500).send({ message: 'Error en el servidor' });
    
      if(!notificaciones) return res.status(404).send({message: 'No hay notificaciones'});

      if(notificaciones){
        return sendPush(post, notificaciones);
      }
    });
}


function pushNotifications(req, res){

    const post = {
        "notification": {
          title: req.body.title,
          body: req.body.body,
          icon: api + 'logo',
          badge: api + 'logo',
          requireInteraction: true,
          data: {
            url: req.body.url
          }
        }
    };

    if(req.body.restaurantes != null){
      var params = { restaurante: { $gt: 1 } }
    }

    // if(req.body.usuario != null && req.body.restaurante != null){
    //     var params ={$or: [{usuario: req.body.usuario},{restaurante: req.body.restaurante}]}

    // } else if(req.body.usuario != null){
    //     var params = {usuario: req.body.usuario}

    // } else if(req.body.restaurante != null){
    //     var params = {restaurante: req.body.restaurante}

    // } 
    else {
      return
    }

    Notificacion.find(params).exec((err, notificaciones) => {
      if(err) res.status(500).send({ message: 'Error en el servidor' });
  
      if(!notificaciones) return res.status(404).send({message: 'No hay notificaciones'});
        
      if(notificaciones){
        sendPush(post, notificaciones);
        return res.status(200).send({notificaciones: notificaciones});
      }
    });
};


function pushNotification(req, res){

  if(req.usuario.rol != 'ADMIN'){
    return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
  }

    const post = {
        "notification": {
          title: 'Ralph',
          body: 'Notificación de prueba',
          icon: api + 'logo',
          badge: api + 'logo',
          requireInteraction: true,
          // data: {
          //   url: req.body.url
          // }
        }
    };

    var usuarioId = req.params.id;

    Notificacion.find({usuario: usuarioId}).exec((err, notificaciones) => {
      if(err) res.status(500).send({ message: 'Error en el servidor' });
  
      if(!notificaciones) return res.status(404).send({message: 'No hay notificaciones'});
        
      if(notificaciones){
        sendPush(post, notificaciones);
        return res.status(200).send({notificaciones: notificaciones});
      }
    });
};


function sendPush(post, notificaciones){
  notificaciones.forEach((notificacion) => {
      webpush.sendNotification(notificacion.subscripcion, JSON.stringify(post))
  });
};


function obtenerLogo(req, res){
  var path_file = './icono.png';

  fs.exists(path_file, (exists) => {
      if(exists){
          res.sendFile(path.resolve(path_file));
      } else {
          res.status(200).send({message: 'No existe la imagen'});
      }
  });
}


function codigoVerificacion(req, res){
  var telefono = 52 + req.params.tel;

    client2.verify.services(twilio2.serviceID).verifications.create({
        to: `+${telefono}`,
        channel: 'sms'
      })
      .then((data) => {
        return res.status(200).send(data)
      })
}


function verificarTelefono(req, res){
  var tel = req.params.tel;
  var telefono = 52 + req.params.tel;
  var codigo = req.params.cod;

    client2.verify.services(twilio2.serviceID).verificationChecks.create({
        to: `+${telefono}`,
        code: codigo
      })
      .then((data) => {
        res.status(200).send(data);

        if(data.status == "approved"){
            Usuario.find(({telefono: tel}), (err, usuario) => {
                if(err) return          
                if(!usuario) return     
                if(usuario[0] && usuario[0]._id && usuario[0].nombre){
                    Usuario.findByIdAndUpdate(usuario[0]._id, {status: 'activo'}, {new:true}, (err, usuarioUpdated) =>{
                      if(err) return            
                      if(!usuarioUpdated) return            
                      if(usuarioUpdated) return                   
                    })
                } else {return}
            })
        } else {return}
      })
}


function mensajeSMS(req, res){
  var tel = req.params.tel;
  var telefono = 52 + req.params.tel;
  var mensaje = 'Hola ralph.com.mx';

  if(req.usuario.rol != 'ADMIN'){
    return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
  }

// function mensajeSMS(telefono, mensaje){
    client.messages.create({
        to: `+${telefono}`,
        // from: '+12057843526' este es el de la cuenta ralphaplication,
        from: '+18053011198',
        body: mensaje
    })
    .then((message) => {
      console.log(message);
      return res.status(200).send(message);
    });
}


function llamada(req, res){
  var usuarioId = req.params.usuario;

  if(req.usuario.rol != 'ADMIN'){
    return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
  }

  Usuario.findById((usuarioId), (err, usuario) => {
    if(err) return          
    if(!usuario) return     
    if(usuario && usuario._id){
      var telefono = 52 + usuario.telefono;

        client.calls.create({
          url: 'http://demo.twilio.com/docs/voice.xml',
          // url: 'https://demo.twilio.com/welcome/voice/',
          to: telefono,
          from: '+18053011198'
        })
        .then(call => {
          console.log(call.sid)
          return res.status(200).send(call);
        })
        .done();
    } else {return}
  });
}


function llamadaPedido(pedidoId, restauranteId){

  setTimeout(() => {
    Usuario.findById('5eaaefea7fdccd3336b9711c', (err, admin) => {
      if(admin.imagen == 'b'){
        Pedido.findById(pedidoId, (err, pedido) => {
          if(err) return          
          if(!pedido) return     
          if(pedido && pedido.status == 'En espera'){
            llamadaAdmin();
          }
        })
      }
    })
  },240000);


  var time = 180000;

  Restaurante.findById(restauranteId, (err, restaurante) => {
    if(err) return          
    if(!restaurante) return     
    if(restaurante && restaurante.llamadas[0]){
      llamadaLocal(restaurante.llamadas[0]);

      setTimeout(() => {
        Pedido.findById(pedidoId, (err, pedido) => {
          if(err) return          
          if(!pedido) return     
          if(pedido && pedido.status == 'En espera'){
            if(restaurante.llamadas[1]){
              llamadaLocal(restaurante.llamadas[1]);
              
            } else {
              llamadaLocal(restaurante.llamadas[0]);
            }

            setTimeout(() => {
              Pedido.findById(pedidoId, (err, pedido) => {
                if(err) return          
                if(!pedido) return     
                if(pedido && pedido.status == 'En espera'){
                  if(restaurante.llamadas[2]){
                    llamadaLocal(restaurante.llamadas[2]);
                    
                  } else {
                    llamadaLocal(restaurante.llamadas[0]);
                  }

                  setTimeout(() => {
                    Pedido.findById(pedidoId, (err, pedido) => {
                      if(err) return          
                      if(!pedido) return     
                      if(pedido && pedido.status == 'En espera'){
                        llamadaLocal(restaurante.llamadas[0]);

                        setTimeout(() => {
                          Pedido.findById(pedidoId, (err, pedido) => {
                            if(err) return          
                            if(!pedido) return     
                            if(pedido && pedido.status == 'En espera'){
                              if(restaurante.llamadas[1]){
                                llamadaLocal(restaurante.llamadas[1]);
                                
                              } else {
                                llamadaLocal(restaurante.llamadas[0]);
                              }
                            } else {return}
                          })
                        }, time);            
                      } else {return}
                    })
                  }, time);      
                } else {return}
              })
            }, time);
          } else {return}
        })
      }, time);
    } else {return}
  });
}


function llamadaLocal(tel){
  var telefono = 52 + tel;

  client.calls.create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    // url: 'https://demo.twilio.com/welcome/voice/',
    to: telefono,
    from: '+18053011198' 
  })
  .then(call => {
  })
  .done();
}


function llamadaAdmin(){
  client.calls.create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    // url: 'https://demo.twilio.com/welcome/voice/',
    to: '523921231871',
    // to: '523929284097',
    from: '+18053011198'
  })
  .then(call => {
  })
  .done();
}



module.exports = {
  saveSubscripcion,
  key,
  pushNotification,
  pushNotifications,
  NotificacionRestaurante,
  NotificacionUsuario,
  NotificacionRepartidor,
  NotificacionAdmin,
  obtenerLogo,
  codigoVerificacion,
  verificarTelefono,
  mensajeSMS,
  llamada,
  llamadaPedido
}