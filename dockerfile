FROM node:18-slim

# Install required dependencies (skip Docker)
RUN apt-get update && apt-get install -y \
    docker.io \
    curl \
    python3 \
    python3-pip \
    default-jdk \
    build-essential \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set default environment variables
ENV PORT=8000 \
    NODE_ENV=production \
    CLIENT_URL=http://localhost:3000

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE ${PORT}

# Start the application
CMD ["npm", "start"]
