# === STAGE 1: Build the Vite App ===
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# === STAGE 2: Serve with Nginx ===
FROM nginx:alpine
# Copy the built assets from Vite (default output folder is 'dist')
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 80 (standard HTTP port for Nginx)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]