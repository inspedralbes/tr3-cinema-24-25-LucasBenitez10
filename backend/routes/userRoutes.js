const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para el perfil del usuario actual
router.get('/profile/me', authMiddleware.protect, async (req, res) => {
  try {
    // Como el middleware protect ya cargó el usuario en req.user, lo podemos usar directamente
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
});

// Ruta para actualizar el perfil del usuario actual
router.put('/profile/update', authMiddleware.protect, async (req, res) => {
  try {
    // Obtener los datos del cuerpo de la petición
    const { name, lastname, phone } = req.body;

    // Encontrar y actualizar el usuario actual usando req.user._id
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        lastname,
        phone
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error en actualización de perfil:', error);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
});

// Ruta para obtener los tickets del usuario actual
router.get('/profile/tickets', authMiddleware.protect, async (req, res) => {
  try {
    // Obtener tickets usando el controlador de tickets
    const ticketController = require('../controllers/ticketController');
    const tickets = await ticketController.getTicketsByCustomer(req.user.email);

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tickets', error: error.message });
  }
});

// Ruta para actualizar teléfono
router.put('/profile/updatePhone', authMiddleware.protect, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'El número de teléfono es requerido' });
    }

    // Ya tenemos acceso al usuario a través de req.user gracias al middleware protect
    const user = await require('../models/User').findById(req.user._id);

    // Actualizamos solo el campo de teléfono
    user.phone = phone;
    await user.save();

    // Devolvemos el usuario actualizado sin la contraseña
    const userResponse = {
      _id: user._id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    res.json({
      message: 'Número de teléfono actualizado correctamente',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar teléfono', error: error.message });
  }
});

// Rutas públicas
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

// Rutas protegidas - solo administradores
router.post('/', authMiddleware.isAdmin, userController.createUser);
router.delete('/:id', authMiddleware.isAdmin, userController.deleteUser);

// Rutas protegidas - cualquier usuario autenticado
// Pero solo puede modificar su propio perfil
router.put('/:id', authMiddleware.protect, userController.updateUser);



module.exports = router;