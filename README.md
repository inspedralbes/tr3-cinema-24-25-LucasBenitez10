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

## Despliegue con Docker (Recomendado)

La forma más rápida de desplegar la aplicación es utilizando Docker y Docker Compose:

### Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Pasos para el Despliegue

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/inspedralbes/tr3-cinema-24-25-LucasBenitez10.git
   cd tr3-cinema-24-25-LucasBenitez10
   ```

2. (Opcional) Configurar variables de entorno para Stripe y TMDB:
   ```bash
   # Exportar variables para Stripe y TMDB (reemplaza con tus propias claves)
   export STRIPE_SECRET_KEY=sk_test_your_key
   export STRIPE_PUBLIC_KEY=pk_test_your_key
   export STRIPE_WEBHOOK_SECRET=whsec_your_key
   export TMDB_API_KEY=your_tmdb_key
   ```

3. Iniciar los contenedores:
   ```bash
   docker-compose up -d
   ```

4. Acceder a la aplicación:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4321
   - MongoDB: mongodb://localhost:27017 (usuario: cinema, contraseña: cinema123)

5. Para detener los contenedores:
   ```bash
   docker-compose down
   ```

### Notas sobre Docker

- Los datos de MongoDB se persisten en un volumen Docker llamado `mongodb_data`
- Los cambios en el código se reflejarán automáticamente gracias a los volúmenes montados
- Para reconstruir las imágenes después de cambios en los Dockerfile:
  ```bash
  docker-compose up -d --build
  ```

## Instalación Manual (Alternativa)

Si prefieres no usar Docker, puedes instalar y configurar manualmente:

### Requisitos Previos

- Node.js 18.x o superior
- MongoDB (se utiliza MongoDB Atlas en producción)
- NPM o Yarn
- Cuenta en Stripe para procesamiento de pagos

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
- Express-session para autenticación basada en sesiones
- Connect-mongo para almacenamiento de sesiones
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
