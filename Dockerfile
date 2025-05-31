# 🐳 VidaShield - Dockerfile Multi-stage Profissional
# Etapa 1: Build do React + TypeScript
FROM node:18-alpine as builder

# Definir diretório de trabalho
WORKDIR /app

# Argumentos de build para variáveis de ambiente
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_HCAPTCHA_SITE_KEY

# Definir variáveis de ambiente para o build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_HCAPTCHA_SITE_KEY=$VITE_HCAPTCHA_SITE_KEY

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci --silent

# Copiar código fonte
COPY . .

# Build do projeto (npm run build = tsc && vite build)
RUN npm run build

# Etapa 2: Servidor Nginx ultra-leve para servir build otimizada
FROM nginx:alpine

# Copiar build otimizada da etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx para React SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    # Cache para assets estáticos \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    # Headers de segurança \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
}' > /etc/nginx/conf.d/default.conf

# Expor porta 80 (padrão Nginx)
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

# 📊 Resultado: Container final ~50MB vs ~500MB (90% menor!)
# 🚀 Performance: Nginx otimizado para servir React build estática 