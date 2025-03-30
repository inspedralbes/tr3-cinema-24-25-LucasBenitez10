const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const { loadUser } = require('./middleware/authMiddleware');

// Cargar variables de entorno
dotenv.config();

// Inicializar Stripe
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Inicializar Express
const app = express();

// Conectar a la base de datos
connectDB();

// Middleware de seguridad y optimización
app.use(helmet());
app.use(compression());

// Middleware para webhook de Stripe (necesita el body sin procesar)
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), require('./routes/paymentRoutes'));

// Middleware estándar
app.use(express.json());
app.use(cookieParser());

// Configuración de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Configuración de sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'desarrollo_local_secreto',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    }
  })
);

// Middleware para cargar usuario en cada solicitud
app.use(loadUser);

// Endpoint de health check para monitoreo
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/screenings', require('./routes/screeningRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/seat-status', require('./routes/seatStatusRoutes'));
app.use('/api/ticket-types', require('./routes/ticketTypeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error del servidor',
    error: process.env.NODE_ENV === 'production' ? 'Error interno' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, function () {
  console.log(`Servidor iniciado en modo ${process.env.NODE_ENV || 'desarrollo'} en puerto ${PORT}`);
});