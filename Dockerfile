# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Install system dependencies required by node-canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
# Use --ignore-scripts to prevent any post-install scripts from running before the code is present
RUN npm install --ignore-scripts

# Copy app source
COPY . .

# Rebuild any native modules if necessary and run build
RUN npm rebuild && npm run build

# Your app binds to port 3000, so expose it
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
