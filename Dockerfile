# Use a Node.js base image for building the Vue application
FROM node:lts-alpine AS build-stage

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vue application for production
RUN npm run build

# Use a lightweight Nginx image to serve the built static files
FROM nginx:stable-alpine AS production-stage

# Copy the built Vue application files from the build stage to Nginx's html directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]