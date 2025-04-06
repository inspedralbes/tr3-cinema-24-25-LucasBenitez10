FROM node:18-bullseye

WORKDIR /app

# Instalar dependencias necesarias para compilación
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Exponer el puerto que usa el servidor
EXPOSE 4321

# Comando para iniciar el servidor
CMD ["node", "server.js"]
