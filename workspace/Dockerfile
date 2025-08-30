# 1. Usa una imagen base oficial de Node.js
FROM node:20

# 2. Instala las dependencias de sistema que necesita `node-canvas`
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

# 3. Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# 4. Copia los archivos de dependencias e instálalas
# Esto aprovecha el caché de Docker. Las dependencias solo se reinstalarán si package.json cambia.
COPY package*.json ./
RUN npm install

# 5. Copia el resto del código de la aplicación
COPY . .

# 6. Construye la aplicación de Next.js para producción
RUN npm run build

# 7. Expone el puerto en el que corre la aplicación de Next.js
EXPOSE 3000

# 8. El comando para iniciar la aplicación cuando el contenedor se inicie
CMD ["npm", "start"]
