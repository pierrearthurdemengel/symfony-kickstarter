FROM php:8.3-fpm-alpine

ARG XDEBUG_ENABLED=0

# Dependances systeme
RUN apk add --no-cache \
    icu-dev \
    libzip-dev \
    postgresql-dev \
    linux-headers \
    $PHPIZE_DEPS

# Extensions PHP
RUN docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    intl \
    opcache \
    zip

# Extension Redis via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Xdebug (optionnel, active uniquement en dev)
RUN if [ "$XDEBUG_ENABLED" = "1" ]; then \
    pecl install xdebug && docker-php-ext-enable xdebug; \
    fi

# Composer depuis l'image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configuration PHP
COPY php.ini /usr/local/etc/php/conf.d/php.ini

# Repertoire de travail
WORKDIR /var/www/api

# Permissions
RUN addgroup -g 1000 appuser && adduser -u 1000 -G appuser -s /bin/sh -D appuser
RUN chown -R appuser:appuser /var/www/api

USER appuser

EXPOSE 9000

CMD ["php-fpm"]
