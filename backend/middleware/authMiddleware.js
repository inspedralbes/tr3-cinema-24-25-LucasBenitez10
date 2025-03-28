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
    console.error('❌ Error en middleware protect:', error);
    res.status(500).json({ message: 'Error en la autenticación', error: error.message });
  }
};


// Middleware para verificar que el usuario es administrador
const isAdmin = async (req, res, next) => {
  try {
    // Primero verificar que esté autenticado usando el middleware protect
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'No autorizado, inicia sesión primero' });
    }

    // Buscar usuario por ID
    const user = await User.findById(req.session.userId);
    if (!user) {
      // Si no se encuentra el usuario, limpiar la sesión
      req.session.destroy();
      return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
    }

    // Verificar rol de administrador
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso prohibido, se requieren permisos de administrador' });
    }

    // Añadir usuario a la solicitud para acceder desde los controladores
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error en la verificación de rol', error: error.message });
  }
};

// Middleware opcional para cargar el usuario actual en cada solicitud, incluso si no es requerido
const loadUser = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Error al cargar usuario:', error);
    next(); // Continuamos aunque haya un error para no interrumpir el flujo
  }
};

module.exports = {
  protect,
  isAdmin,
  loadUser
};