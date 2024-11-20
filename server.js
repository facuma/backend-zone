require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const authenticate = require('./routes/middleware/authMiddleware');

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*', // URL del frontend
    credentials: true, // Si necesitas cookies o cabeceras específicas
  })
);
app.use(express.json());

// Conexión a MongoDB
mongoose
.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Tiempo de espera más alto
  socketTimeoutMS: 45000,         // Tiempo de espera del socket
})
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Rutas
app.use('/api/products', productRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Proteger las rutas de productos
app.use('/api/products', authenticate, productRoutes);