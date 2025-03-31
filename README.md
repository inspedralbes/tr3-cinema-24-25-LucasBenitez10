# Cinema Application

## Descripción del Proyecto

Este proyecto es una aplicación completa para la gestión de un cine, que permite a los usuarios ver la cartelera, comprar entradas, seleccionar asientos y realizar pagos. La aplicación está dividida en dos partes principales:

1. **Backend**: API RESTful desarrollada con Node.js y Express.js
2. **Frontend**: Aplicación web desarrollada con Next.js 15+ y React 19+

## Estructura del Proyecto

```
tr3-transversal-2/
├── backend/               # Servidor API RESTful
│   ├── config/            # Configuración de la base de datos
│   ├── controllers/       # Lógica de negocio
│   ├── middleware/        # Middleware de autenticación y otros
│   ├── models/            # Modelos de datos (MongoDB)
│   ├── routes/            # Rutas de la API
│   ├── seeders/           # Scripts para poblar la base de datos
│   ├── utils/             # Utilidades y helpers
│   ├── .env               # Variables de entorno (no en repositorio)
│   ├── .env.example       # Ejemplo de variables de entorno
│   └── server.js          # Punto de entrada del servidor
│
└── cinema-app/            # Aplicación frontend Next.js
    ├── app/               # Rutas y páginas de la aplicación
    ├── components/        # Componentes React reutilizables
    ├── hooks/             # Custom hooks de React
    ├── lib/               # Utilidades y configuraciones
    ├── public/            # Archivos estáticos
    ├── services/          # Servicios para comunicación con API
    ├── store/             # Estado global (Redux/Context)
    ├── .env               # Variables de entorno (no en repositorio)
    ├── .env.example       # Ejemplo de variables de entorno
    ├── next.config.js     # Configuración de Next.js
    ├── postcss.config.js  # Configuración de PostCSS
    └── tailwind.config.js # Configuración de Tailwind CSS
```

## Requisitos Previos

- Node.js 18.x o superior
- MongoDB (se utiliza MongoDB Atlas en producción)
- NPM o Yarn
- Cuenta en Stripe para procesamiento de pagos

## Instalación y Configuración

### Backend

1. Navegar al directorio del backend:
   ```bash
   cd backend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear archivo `.env` basado en `.env.example`:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   TMDB_API_KEY=your_tmdb_api_key
   CORS_ORIGIN=http://localhost:3001
   PORT=4321
   NODE_ENV=development
   ```

4. Iniciar el servidor:
   ```bash
   npm run dev
   ```

### Frontend

1. Navegar al directorio del frontend:
   ```bash
   cd cinema-app
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear archivo `.env` basado en `.env.example`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4321/api
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue con Docker

La aplicación está configurada para ser desplegada con Docker. Se ha solucionado un problema de compatibilidad con Tailwind CSS en Docker mediante:

1. Uso de Node 18 Bookworm (Debian) en lugar de Alpine
2. Instalación de dependencias de compilación (build-essential, python3)
3. Configuración explícita de postcss.config.js
4. Simplificación del next.config.mjs
5. Configuración de volumes para permitir hot reloading
6. Variables de entorno específicas (TAILWIND_MODE=watch)

## Documentación de la API

### Autenticación

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/api/auth/register` | Registrar un nuevo usuario | Público |
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/logout` | Cerrar sesión | Público |
| GET | `/api/auth/check` | Verificar autenticación | Público |

### Películas

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/movies` | Obtener todas las películas activas | Público |
| GET | `/api/movies/:id` | Obtener detalles de una película por ID | Público |
| POST | `/api/movies/sync` | Sincronizar películas desde TMDB | Privado (Admin) |
| PATCH | `/api/movies/:id/status` | Actualizar estado de una película | Privado (Admin) |

#### Parámetros para GET `/api/movies`

- `search`: Búsqueda por título
- `genre`: Filtrar por género
- `limit`: Limitar número de resultados
- `page`: Número de página para paginación

### Salas

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/rooms` | Obtener todas las salas | Público |
| GET | `/api/rooms/:id` | Obtener detalles de una sala | Público |
| POST | `/api/rooms` | Crear una nueva sala | Privado (Admin) |
| PUT | `/api/rooms/:id` | Actualizar una sala | Privado (Admin) |
| DELETE | `/api/rooms/:id` | Eliminar una sala | Privado (Admin) |

### Proyecciones (Screenings)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/screenings` | Obtener todas las proyecciones | Público |
| GET | `/api/screenings/filters` | Filtrar proyecciones | Público |
| GET | `/api/screenings/movie/:movieId` | Obtener proyecciones por película | Público |
| GET | `/api/screenings/date/:date` | Obtener proyecciones por fecha | Público |
| POST | `/api/screenings` | Crear una nueva proyección | Privado (Admin) |
| GET | `/api/screenings/available-times/:roomId/:date` | Obtener horarios disponibles | Privado (Admin) |
| PUT | `/api/screenings/cancel/:id` | Cancelar una proyección | Privado (Admin) |
| DELETE | `/api/screenings/delete/:id` | Eliminar una proyección | Privado (Admin) |

#### Parámetros para GET `/api/screenings/filters`

- `movieId`: ID de la película
- `roomId`: ID de la sala
- `date`: Fecha de la proyección
- `status`: Estado de la proyección

### Estado de Asientos

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/seat-status/screening/:screeningId` | Obtener estado de asientos por proyección | Público |
| POST | `/api/seat-status/reserve` | Reservar asientos temporalmente | Público |
| POST | `/api/seat-status/release` | Liberar asientos reservados | Público |

### Entradas (Tickets)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/api/tickets` | Comprar entradas | Público |
| GET | `/api/tickets/screening/:screeningId` | Obtener entradas por proyección | Privado (Admin) |
| GET | `/api/tickets/customer/:email` | Obtener entradas por cliente | Privado (Usuario) |
| GET | `/api/tickets/verify/:ticketCode` | Verificar una entrada por código | Público |
| POST | `/api/tickets/:id/cancel` | Cancelar una entrada | Privado (Usuario) |
| PUT | `/api/tickets/cancel-by-screening/:screeningId` | Cancelar todas las entradas de una proyección | Privado (Admin) |
| DELETE | `/api/tickets/delete-by-screening/:screeningId` | Eliminar todas las entradas de una proyección | Privado (Admin) |

### Tipos de Entradas

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/ticket-types` | Obtener todos los tipos de entradas | Público |
| POST | `/api/ticket-types` | Crear un nuevo tipo de entrada | Privado (Admin) |

### Pagos

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/api/payments/create-payment-intent` | Crear intención de pago | Público |
| POST | `/api/payments/webhook` | Webhook para confirmación de pagos | Público |

#### Parámetros para POST `/api/payments/create-payment-intent`

- `amount`: Monto a pagar (requerido)
- `currency`: Moneda (default: 'mxn')
- `metadata`: Metadatos adicionales

### Usuarios

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/users/profile` | Obtener perfil del usuario actual | Privado (Usuario) |
| PUT | `/api/users/profile` | Actualizar perfil del usuario | Privado (Usuario) |
| GET | `/api/users` | Obtener todos los usuarios | Privado (Admin) |
| GET | `/api/users/:id` | Obtener usuario por ID | Privado (Admin) |
| PUT | `/api/users/:id/role` | Actualizar rol de usuario | Privado (Admin) |

## Tecnologías Utilizadas

### Backend
- Node.js y Express.js
- MongoDB y Mongoose
- JWT para autenticación
- Stripe para procesamiento de pagos
- TMDB API para información de películas

### Frontend
- Next.js 15+
- React 19+
- Tailwind CSS para estilos
- Stripe Elements para integración de pagos
- Redux/Context para gestión de estado

## Contribución

1. Hacer fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Hacer commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
