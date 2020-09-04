'use strict'

var Producto = require('../models/producto');

var mongoosePaginate = require('mongoose-pagination');
var path = require('path');
const fs = require('fs');

function crearProducto(req, res){
    var params = req.body;

    if( params.nombre && params.descripcion && params.precio && params.tiempoEntrega && params.categoria != 0 && params.seccion != 0){
        var producto = new Producto();

        producto.nombre = params.nombre;
        producto.descripcion = params.descripcion;
        producto.precio = params.precio;
        producto.tiempoEntrega = params.tiempoEntrega;
        producto.categoria = params.categoria;
        producto.seccion = params.seccion;
        
        if(params.ingredientes && params.ingredientes != []){
            producto.ingredientes = params.ingredientes;
        }

        producto.restaurante = req.usuario.restaurante;
        producto.status = 'activo';
        producto.imagen = null;
                                
        producto.save((err, productoStored) => {
            if(err){
                return res.status(500).send({
                    message: '33 - Error al guardar el producto'
                });
            }

            if(productoStored){
                return res.status(200).send({producto: productoStored});                    
            } else {
                return res.status(404).send({message: 'No se ha registrado el producto'});
            }
            });
    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}

function actualizarProducto(req, res){
    var update = req.body;
    var producto_id = req.params.prod;
    var restaurante_id = req.params.res;

    if(restaurante_id != req.usuario.restaurante){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
    }

    Producto.findByIdAndUpdate(producto_id, update, {new:true}, (err, productoUpdated) => {
        if(err) return res.status(500).send({message: '60 - Error en la petición'});
        
        if(!productoUpdated) return res.status(404).send({message: '62 - No se ha podido actualizar el producto'});
        
        return res.status(200).send({producto: productoUpdated});
    });
}

function actualizarImagenProducto(req, res){

    try{    var producto_id = req.params.prod;
            var restaurante_id = req.params.res;
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
                    Producto.findById(producto_id, (err, producto) => {
                        if(err) return res.status(500).send({message: '88 - Error en la petición'});

                        if(producto.imagen && producto.imagen != null){
                            var old_image = producto.imagen
                            var path_old_file = './uploads/productos/'+old_image;
                            fs.unlink(path_old_file, (err) => {
                                if (err) return err;
                            });
                        }
                    })
                    Producto.findByIdAndUpdate(producto_id, {imagen: file_name}, {new:true}, (err, productoUpdated) =>{
                        if(err) return res.status(500).send({message: 'Error en la petición'});

                        if(!productoUpdated) return res.status(404).send({message: 'No se ha podido actualizar el producto'});
                
                        return res.status(200).send({producto: productoUpdated});
                    })
                } else {
                    return removeFilesOfUploads(res, file_path, 'Extensión no válida');
                }

            } else {
                return removeFilesOfUploads(res, file_path, 'No mandaste ninguna imágen');
            }

    }   catch(err) {
    // console.log(err);
        return res.status(500).send({message: '115 - Error en el servidor'});
    }
} 

function removeFilesOfUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        if (err) return error;
        return res.status(200).send({message: message});
    });
}


function obtenerImagenProducto(req, res){
    var image_file = req.params.imageFile;
    var path_file = './uploads/productos/'+image_file;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}

function obtenerProducto(req, res){
    var productoId = req.params.id;

    Producto.findById(productoId, (err, producto) => {
        if(err) return res.status(500).send({message: err});

        if(!producto) return res.status(404).send({message: 'El producto no existe'});
        
        return res.status(200).send({producto: producto});
    });
}

function obtenerProductos(req, res){

    if(req.params.res && req.params.res != 0 && req.params.cat == 0){
        var parametro = {status: 'activo', restaurante: req.params.res, imagen: {$ne: null}}
        var itemsPerPage = 7;
    }
    
    if(req.params.cat && req.params.cat != 0){
        var parametro = {status: 'activo', restaurante: req.params.res, categoria: req.params.cat}
        var itemsPerPage = 10;
    }
    
    if(req.params.sec && req.params.sec != 0){
        var parametro = {status: 'activo', seccion: req.params.sec}
        var itemsPerPage = 10;
    }

    if(req.params.nom && req.params.nom != 0){
        var parametro = {status: 'activo', nombre: req.params.nom}
        // var parametro = {status: 'activo', $text: { $search: req.params.nom}}
        var itemsPerPage = 30;
    }

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    
    Producto.find(parametro).paginate(page, itemsPerPage, (err, productos, total) => {
        if(err) return res.status(500).send({message: err});

        if(!productos) return res.status(404).send({message: 'No hay productos disponibles'});

        return res.status(200).send({
            productos,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}

function obtenerProductosRestaurante(req, res){

    var itemsPerPage = 10;
    var page = 1;
    
    Producto.find({seccion: req.params.sec}).sort('status').paginate(page, itemsPerPage, (err, productos, total) => {
        if(err) return res.status(500).send({message: err});

        if(!productos) return res.status(404).send({message: 'No hay productos disponibles'});

        return res.status(200).send({
            productos,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}

function obtenerProductosRandom(req, res){

    if(req.params.res && req.params.res != 0  && req.params.cat == 0){
        var parametro = {status: 'activo', restaurante: req.params.res, imagen: {$ne: null}}
        var totalNumer = 7;
    }
    
    if(req.params.cat && req.params.cat != 0){
        var parametro = {status: 'activo', restaurante: req.params.res, categoria: req.params.cat}
        var totalNumer = 10;
    }
    
    if(req.params.sec && req.params.sec != 0){
        var parametro = {status: 'activo', seccion: req.params.sec}
        var totalNumer = 10;
    }

    if(req.params.nom && req.params.nom != 0){
        var parametro = {status: 'activo', nombre: req.params.nom}
        // var parametro = {status: 'activo', $text: { $search: req.params.nom}}
        var totalNumer = 30;
    }

    
    Producto.aggregate([ { $match: parametro}, { $sample: { size: totalNumer } } ], (err, productos) => {
        if(err) return res.status(500).send({message: err});

        if(!productos) return res.status(404).send({message: 'No hay productos disponibles'});

        return res.status(200).send({productos: productos});
    });
}

function activarProducto(req, res){
    var producto_id = req.params.id;

    if(req.params.status == 1){
        var parametro = {status: 'activo'};

    } else if(req.params.status == 2){
        var parametro = {status: 'inactivo'};

    } else {
        return
    }

    Producto.findByIdAndUpdate(producto_id, parametro, {new:true}, (err, productoUpdated) => {
        if(err) return res.status(500).send({message: 'Error al borrar la publicacion'});

        if(!productoUpdated) return res.status(404).send({message: 'No se ha borrado la publicación'});

        return res.status(200).send({producto: productoUpdated});
    })
}

function eliminarProducto(req, res){
    var producto_id = req.params.id;

    Producto.findById(producto_id, (err, producto) => {
        if(err) return res.status(500).send({message: 'Error al borrar la publicacion'});

        if(!producto) return res.status(404).send({message: 'No se ha borrado la publicación'});

        if(producto.imagen){
            var old_image = producto.imagen
            var path_old_file = './uploads/productos/'+old_image;
            fs.unlink(path_old_file, (err) => {
                if(err) return res.status(500).send({message: 'Error'});
            })
        }

        Producto.find({restaurante: req.usuario.restaurante, '_id': producto_id}).deleteOne((err, productoRemoved) => {
            if(err) return res.status(500).send({message: 'Error al borrar la publicacion'});
    
            if(!productoRemoved) return res.status(404).send({message: 'No se ha borrado la publicación'});
    
            return res.status(200).send({producto: productoRemoved});
        })
    })

}

function eliminarImagen(req, res){
    var producto_id = req.params.id; 

    Producto.findById(producto_id, (err, producto) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(producto.imagen && producto.imagen != null){

            var product = producto;

            Producto.findByIdAndUpdate(producto_id, {imagen: null}, {new:true}, (err, productoUpdated) => {
                if(err) return res.status(500).send({message: 'Error al actualizar la publicacion'});

                if(!productoUpdated) return res.status(404).send({message: 'No se ha borrado la publicación'});
    
                console.log(productoUpdated);
                return res.status(200).send({producto: productoUpdated});
            })

            var old_image = product.imagen
            var path_old_file = './uploads/productos/'+old_image;
            fs.unlink(path_old_file, (err) => {
                // if(err) return res.status(500).send({message: 'Error'});
            });
        }
    })
}



module.exports = {
    crearProducto,
    actualizarProducto,
    actualizarImagenProducto,
    obtenerImagenProducto,
    obtenerProducto,
    obtenerProductos,
    obtenerProductosRestaurante,
    obtenerProductosRandom,
    activarProducto,
    eliminarProducto,
    eliminarImagen
}