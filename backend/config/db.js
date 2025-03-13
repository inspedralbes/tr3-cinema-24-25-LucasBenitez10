const mongoose = require('mongoose');

const uri = "mongodb+srv://benitezsojo:sdzpiuaOmyRUyeCT@cluster0.zoqvi.mongodb.net/cinemabar?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
          console.log("Conexión exitosa a MongoDB usando Mongoose");
      })
      .catch((err) => {
          console.error("Error al conectar a MongoDB:", err);
      });
};

module.exports = connectDB;