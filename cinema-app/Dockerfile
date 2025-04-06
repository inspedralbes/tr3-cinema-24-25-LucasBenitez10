FROM node:18-bullseye

WORKDIR /app

# Instalar dependencias necesarias para compilación
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con flags específicos para arquitectura
ENV npm_config_arch=x64
RUN npm install --platform=linux --arch=x64

# Copiar el resto de archivos
COPY . .

# Configurar variables para Tailwind CSS
ENV TAILWIND_MODE=watch

# Construir la aplicación
RUN npm run build

# Exponer el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
