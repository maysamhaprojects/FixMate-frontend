# ============================================================
#  FixMate frontend — multi-stage Docker build
#  Stage 1 builds the React app with Vite; stage 2 serves it with nginx.
# ============================================================

# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Inside Docker the API is reached through nginx on the same origin,
# so the base URL is empty and requests go to a relative "/api/...".
ENV VITE_API_BASE=""
RUN npm run build

# --- Run stage ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
