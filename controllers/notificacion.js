'use strict'
 
var moment = require('moment');
const vapid = require('../vapid.json');
const webpush = require('web-push');
const urlsafeBase64 = require('urlsafe-base64');
var path = require('path');
const fs = require('fs');
const url = 'https://ralph.com.mx/api/';
// const url = 'http://localhost:3000/api/';

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
            localNotification('Ralph', 'Has activado correctamente las notificaciones', req.usuario.restaurante);
            return res.status(200);
          }
      })  
};


function localNotification(title, body, restaurante){
    const post = {
      "notification": {
        title: title,
        body: body,
        icon: url + 'logo',
        badge: url + 'logo'
      }
    };

    Notificacion.find({restaurante: restaurante}).exec((err, notificaciones) => {
      if(err) res.status(500).send({ message: 'Error en el servidor' });
    
      if(!notificaciones) return res.status(404).send({message: 'No hay notificaciones'});

      if(notificaciones){
        sendPush(post, notificaciones);
      }
    });
}


function pushNotification(req){

    const post = {
        "notification": {
          title: req.body.title,
          body: req.body.body,
          icon: url + 'logo',
          badge: url + 'logo',
          data: {
            url: req.body.url
          }
        }
    };

    if(req.body.usuario != null && req.body.restaurante != null){
        var params ={$or: [{usuario: req.body.usuario},{restaurante: req.body.restaurante}]}

    } else if(req.body.usuario != null){
        var params = {usuario: req.body.usuario}

    } else if(req.body.restaurante != null){
        var params = {restaurante: req.body.restaurante}

    } else {
      return
    }

    Notificacion.find(params).exec((err, notificaciones) => {
      if(err) res.status(500).send({ message: 'Error en el servidor' });
  
      if(!notificaciones) return res.status(404).send({message: 'No hay notificaciones'});
        
      if(notificaciones){
        sendPush(post, notificaciones);
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



module.exports = {
    saveSubscripcion,
    key,
    pushNotification,
    obtenerLogo
}