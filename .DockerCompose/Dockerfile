# 基础镜像：使用具体版本的 nginx Alpine 镜像（更轻量安全）
FROM nginx:1.25-alpine

# 安装 wget 用于健康检查
RUN apk add --no-cache wget

# 将自定义nginx配置替换容器默认的配置
COPY default.conf /etc/nginx/conf.d/default.conf

# 创建健康检查文件
RUN echo "OK" > /usr/share/nginx/html/health

# 暴露端口
EXPOSE 80 88

# 以非 root 用户运行（增强安全性）
# USER nginx

# nginx 启动命令
CMD ["nginx", "-g", "daemon off;"]
