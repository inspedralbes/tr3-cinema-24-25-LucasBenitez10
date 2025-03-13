const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Verificar si existe una sesión de usuario
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'No autorizado, inicia sesión primero' });
    }
    
    // Buscar usuario por ID
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      // Si no se encuentra el usuario, limpiar la sesión
      req.session.destroy();
      return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
    }
    
    // Añadir usuario a la solicitud para acceder desde los controladores
    req.user = user;
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error en la autenticación', error: error.message });
  }
};

module.exports = { protect };