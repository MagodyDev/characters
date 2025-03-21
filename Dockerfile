# Stage 1: Build the Vite project
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the Vite project
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default NGINX static files
RUN rm -rf ./*

# Copy built files from the builder stage
COPY --from=builder /app/dist .

# Copy custom NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the server
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
