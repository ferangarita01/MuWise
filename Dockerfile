# Use a Node.js 20 base image, which aligns with the project's runtime.
# Using 'bookworm' as it's a stable Debian release.
FROM node:20-bookworm-slim

# Install system libraries required by node-canvas for compilation.
# build-essential: Provides tools like make, gcc, g++
# libcairo2-dev, libpango1.0-dev: Core graphics libraries for Pango and Cairo
# libjpeg-dev, libgif-dev, librsvg2-dev: Support for various image formats
# pkg-config: Helps node-gyp find the installed system libraries
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config && \
    # Clean up apt cache to keep the final image smaller
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's cache.
# This step will only be re-run if these files change.
COPY package*.json ./

# Install Node.js dependencies using 'npm ci' for reproducible builds
# This is the step where 'npm install canvas' will now succeed
RUN npm ci

# Copy the rest of the application code into the container
COPY . .

# Build the Next.js application for production
RUN npm run build

# The Cloud Run environment (used by App Hosting) automatically sets the PORT.
# The base Node.js image's default command is `npm start`, which Next.js uses.
# So, we don't need an explicit EXPOSE or CMD unless we change the start script.
CMD ["npm", "start"]
