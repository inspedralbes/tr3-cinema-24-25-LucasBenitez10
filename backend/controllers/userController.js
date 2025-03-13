const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const getUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
  };

  const getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
  };

  const createUser = async (req, res) => {
    try {
      const { name, lastname, age, email, password } = req.body;
      
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
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      
      const userResponse = {
        _id: savedUser._id,
        name: savedUser.name,
        lastname: savedUser.lastname,
        age: savedUser.age,
        email: savedUser.email
      };
      
      res.status(201).json(userResponse);
    } catch (error) {
      res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const { name, lastname, age, email, password } = req.body;
      const userId = req.params.id;
      
      // Crear objeto con los datos a actualizar
      const updateData = {};
      if (name) updateData.name = name;
      if (lastname) updateData.lastname = lastname;
      if (age) updateData.age = age;
      if (email) updateData.email = email;
      
      // Si se actualiza la contraseña, encriptarla
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      // Actualizar usuario y devolver la versión actualizada
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true }
      ).select('-password');
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
  };
  
  const getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
    }
  };


  module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserProfile
  };