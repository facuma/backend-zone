const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // URL de la imagen
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  discount: { type: String }, // Ejemplo: "10% OFF"
  category: { type: String },
  stock: { type: Number, required: true },
});

module.exports = mongoose.model('Product', productSchema);
