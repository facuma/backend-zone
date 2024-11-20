const express = require('express');
const Product = require('../models/Product');
const Joi = require('joi');
const mongoose = require('mongoose');

const router = express.Router();

// Formatear respuesta
const formatResponse = (success, data = null, message = '') => {
  return { success, data, message };
};

// Validación de producto con Joi
const productSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().required(),
  image: Joi.string().uri().required(),
  originalPrice: Joi.number().positive().required(),
  discountedPrice: Joi.number().positive().required(),
  discount: Joi.string().allow(''),
  category: Joi.string().allow(''),
  stock: Joi.number().integer().min(0).required(),
});

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      image: { url: product.image },
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      discount: product.discount,
      category: product.category,
      stock: product.stock,
    }));

    res.json(formatResponse(true, formattedProducts));
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json(formatResponse(false, null, `Error al obtener productos: ${err.message}`));
  }
});

// Crear un producto
router.post('/', async (req, res) => {
  try {
    // Validar el cuerpo de la solicitud
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json(formatResponse(false, null, error.details[0].message));
    }

    // Crear el producto con los datos recibidos
    const productData = {
      name: req.body.name,
      description: req.body.description,
      image: req.body.image, // Se espera una URL de la imagen
      originalPrice: req.body.originalPrice,
      discountedPrice: req.body.discountedPrice,
      discount: req.body.discount,
      category: req.body.category,
      stock: req.body.stock,
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    // Formatear la respuesta con los datos del producto creado
    const formattedProduct = {
      _id: savedProduct._id,
      name: savedProduct.name,
      description: savedProduct.description,
      image: { url: savedProduct.image },
      originalPrice: savedProduct.originalPrice,
      discountedPrice: savedProduct.discountedPrice,
      discount: savedProduct.discount,
      category: savedProduct.category,
      stock: savedProduct.stock,
    };

    return res.status(201).json(formatResponse(true, formattedProduct, 'Producto creado con éxito.'));
  } catch (err) {
    console.error('Error al crear producto:', err.message);
    return res.status(500).json(formatResponse(false, null, `Error al crear producto: ${err.message}`));
  }
});


// Eliminar un producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Validar que el ID es un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(formatResponse(false, null, 'ID de producto inválido.'));
  }

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json(formatResponse(false, null, 'Producto no encontrado.'));
    }

    res.json(formatResponse(true, null, 'Producto eliminado exitosamente.'));
  } catch (err) {
    console.error('Error al eliminar el producto:', err);
    res.status(500).json(formatResponse(false, null, `Error interno al eliminar producto: ${err.message}`));
  }
});

module.exports = router;
