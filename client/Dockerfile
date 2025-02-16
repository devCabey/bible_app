# ---- Step 1: Build Stage ----
  FROM node:18-alpine AS builder
  WORKDIR /app
  
  # Copy dependencies
  COPY package.json yarn.lock ./
  RUN yarn install --frozen-lockfile
  
  # Copy app files & build
  COPY . .
  RUN yarn build
  
  # ---- Step 2: Serve with Nginx ----
  FROM nginx:alpine
  
  # Copy built app to Nginx public folder
  COPY --from=builder /app/dist /usr/share/nginx/html
  
  # Copy the Nginx configuration
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  
  # Expose port 80 for Nginx
  EXPOSE 80
  
  # Start Nginx
  CMD ["nginx", "-g", "daemon off;"]
  