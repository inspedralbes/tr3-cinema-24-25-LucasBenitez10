const User = require('../models/User');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
  try {
    const { name, lastname, age, email, password, role } = req.body;
    
    if (!name || !lastname || !age || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      lastname,
      age,
      email,
      password: hashedPassword,
      role: role,
    });
    
    const savedUser = await newUser.save();
    
    req.session.userId = savedUser._id;
    
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      lastname: savedUser.lastname,
      email: savedUser.email,
      role: savedUser.role
    };
    
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el registro', error: error.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    req.session.userId = user._id;

    res.json({
      message: 'Login exitoso',
      user: {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error: error.message });
  }
};


const logoutUser = async (req, res) => {
  try {
    // Destruir la sesión
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al cerrar sesión', error: err.message });
      }
      
      // Limpiar la cookie de sesión
      res.clearCookie('connect.sid');
      res.json({ message: 'Sesión cerrada correctamente' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
  }
};

const checkAuth = async (req, res) => {
  try {

    if (!req.session.userId) {
      return res.status(401).json({ isAuthenticated: false });
    }
    

    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(401).json({ isAuthenticated: false });
    }
    
    res.json({
      isAuthenticated: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar autenticación', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth
};
