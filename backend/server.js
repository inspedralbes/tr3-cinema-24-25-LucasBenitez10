const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const { loadUser } = require('./middleware/authMiddleware');

dotenv.config();

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

connectDB();

app.post('/api/payments/webhook', express.raw({type: 'application/json'}), require('./routes/paymentRoutes'));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true 
}));

app.use(
    session({
      secret: 'tu_secreto_de_sesion', 
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: 'mongodb+srv://benitezsojo:sdzpiuaOmyRUyeCT@cluster0.zoqvi.mongodb.net/cinemabar?retryWrites=true&w=majority&appName=Cluster0', // Misma URL que en tu config/db.js
        ttl: 60 * 60 * 24, 
      }),
      cookie: {
        httpOnly: true, // No accesible por JavaScript del cliente
        secure: false, // Solo enviar por HTTPS en producción
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax' // Protección contra CSRF
      }
    })
);

// Middleware para cargar usuario en cada solicitud (opcional)
app.use(loadUser);

// Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/screenings', require('./routes/screeningRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/seat-status', require('./routes/seatStatusRoutes'));
app.use('/api/ticket-types', require('./routes/ticketTypeRoutes'));
app.use('/api/users', require('./routes/userRoutes')); // Nueva ruta de usuarios

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Error del servidor',
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
});

const PORT = 4000;
app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
});