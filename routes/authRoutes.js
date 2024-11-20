const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const Joi = require('joi');

const SECRET_KEY = process.env.SECRET_KEY;

// Esquema de validación para login y registro
const userSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Generar token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
});

// Ruta para registrar un usuario
// router.post('/register', async (req, res) => {
//   const { error } = userSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }

//   const { username, password } = req.body;

//   try {
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: 'El usuario ya existe' });
//     }

//     const user = new User({ username, password });
//     await user.save();

//     res.status(201).json({ message: 'Usuario creado exitosamente' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error al crear usuario', error: err.message });
//   }
// });

// Ruta para verificar el token
router.get('/verify', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ valid: true, userId: decoded.id });
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
});

module.exports = router;
