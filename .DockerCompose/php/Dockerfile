FROM php:8-fpm-alpine

# 1. 安装 GD 及其它扩展所需的系统依赖库
RUN apk add --no-cache \
    zlib-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libwebp-dev \
    libxpm-dev \
    libzip-dev \
    oniguruma-dev

# 2. 配置 GD 扩展
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    --with-webp \
    --with-xpm

# 3. 安装 PHP 扩展
RUN docker-php-ext-install \
    mysqli \
    pdo_mysql \
    gd \
    exif \
    zip \
    mbstring

# 4. 安装 Imagick 及其依赖
RUN apk add --no-cache imagemagick-dev imagemagick

# 4.1 安装编译工具并编译安装 Imagick 扩展（安装后删除编译工具，保持镜像精简）
RUN apk add --no-cache autoconf automake libtool make g++ && \
    pecl install imagick && \
    docker-php-ext-enable imagick && \
    apk del autoconf automake libtool make g++

# 5. 复制自定义 PHP 配置（大文件上传、内存限制等）
COPY uploads.ini /usr/local/etc/php/conf.d/uploads.ini

# 6. 清理缓存
RUN rm -rf /var/cache/apk/*

# 7. 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone

# 8. 使用非 root 用户运行
USER www-data