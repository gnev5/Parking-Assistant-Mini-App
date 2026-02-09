# Multi-stage build for Vite React app
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time Supabase envs (override via --build-arg)
ARG VITE_SUPABASE_URL=
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV NPM_CONFIG_REGISTRY=${NPM_CONFIG_REGISTRY}
ENV NODE_ENV=development

# Install deps with caching (npm ci if lockfile exists)
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm config set fund false \
  && npm config set audit false \
  && npm config set strict-ssl false \
  && npm config set registry ${NPM_CONFIG_REGISTRY} \
  && if [ -f package-lock.json ]; then npm ci --progress=false; else npm install --production=false --progress=false; fi

# Copy sources and build
COPY . .
RUN --mount=type=secret,id=supabase_key \
  export VITE_SUPABASE_ANON_KEY=$(cat /run/secrets/supabase_key) \
  && npm run build

# Runtime stage
FROM nginx:1.27-alpine AS runner
ENV NODE_ENV=production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

