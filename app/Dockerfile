# Stage 1: Build the Flutter web app
FROM debian:bullseye-slim AS build

# Install dependencies needed for Flutter
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

# Clone Flutter SDK (stable channel)
RUN git clone https://github.com/flutter/flutter.git -b stable /flutter
ENV PATH="/flutter/bin:/flutter/bin/cache/dart-sdk/bin:${PATH}"

# Pre-cache Flutter web artifacts and run doctor
RUN flutter doctor
RUN flutter config --enable-web

WORKDIR /app

# Copy pubspec files first (better layer caching)
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

# Copy the rest of the project
COPY . .

# Build the web release
RUN flutter build web --release

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built web files to Nginx's serving directory
COPY --from=build /app/build/web /usr/share/nginx/html

# Copy custom Nginx config (handles Flutter's client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]