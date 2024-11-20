require('dotenv').config()
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Asegúrate de que la ruta al modelo sea correcta
const products = require('./products.json'); // Archivo JSON con productos

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

const loadProducts = async () => {
  try {
    await Product.deleteMany(); // Opcional: Limpia la colección antes de cargar
    await Product.insertMany(products);
    console.log('Productos cargados exitosamente');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error al cargar productos:', err);
    mongoose.connection.close();
  }
};

loadProducts();
