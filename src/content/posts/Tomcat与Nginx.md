---
title: Tomcat+Nginx
published: 2026-03-24
pinned: false
description: 使用Tomcat搭建均衡负载并使用Nginx反代
tags: [竞赛队]
category: Linux
licenseName: CC BY-NC-SA 4.0
author: 遇缘
draft: false
image: 'guide/爱弥斯2.png'
date: 2026-03-24
---


# Tomcat + Nginx 负载均衡配置

## 环境架构

| 主机 | IP 地址 | 角色 |
|------|---------|------|
| Linux1 | 10.4.220.101 | CA 证书服务器 |
| Linux2 | 10.4.220.102 | Nginx 反向代理/负载均衡 |
| Linux3 | 10.4.220.103 | Tomcat A |
| Linux4 | 10.4.220.104 | Tomcat B |

---

## 第一部分：Tomcat A 配置 (Linux3)

### 1. 安装 Java 和 Tomcat

```bash
dnf install java-17-openjdk* tomcat -y
```



### 2. 修改 Tomcat 服务配置

```bash
vim /usr/lib/systemd/system/tomcat.service
```

**修改用户：**
```ini
User=root
Group=root
```

### 3. 配置 server.xml

```bash
vim /etc/tomcat/server.xml
```

**修改 HTTP 端口 (约第69行)：**
```xml
<Connector port="80" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="443" />
```

**添加 HTTPS 连接器：**
```xml
<Connector port="443" protocol="org.apache.coyote.http11.Http11NioProtocol"
           maxThreads="150" SSLEnabled="true"
           scheme="https" secure="true"
           sslProtocol="TLS">
    <SSLHostConfig>
        <Certificate certificateKeystoreFile="/etc/ssl/skills.jks"
                     certificateKeystorePassword="Key-1122"
                     type="RSA" />
    </SSLHostConfig>
</Connector>
```

**修改默认主机 (约第132行)：**
```xml
<Engine name="Catalina" defaultHost="linux3.skills.lan">
```

**配置虚拟主机 (约第152行)：**
```xml
<Host name="linux3.skills.lan"  appBase="webapps"
      unpackWARs="true" autoDeploy="true">
</Host>

<!-- 禁止 IP 直接访问 -->
<Host name="10.4.220.103" appBase="ipapps"
      unpackWARs="true" autoDeploy="true"
      xmlValidation="false" xmlNamespaceAware="false">
</Host>
```

### 4. 创建测试页面

```bash
echo "tomcatA" > /usr/share/tomcat/webapps/ROOT/index.jsp
cat /usr/share/tomcat/webapps/ROOT/index.jsp
```

---

## 第二部分：Tomcat B 配置 (Linux4)

配置与 Linux3 基本相同，只需修改以下内容：

```bash
vim /etc/tomcat/server.xml
```

**修改：**
```xml
<!-- 第132行 -->
<Engine name="Catalina" defaultHost="linux4.skills.lan">

<!-- 第152行 -->
<Host name="linux4.skills.lan" appBase="webapps"
      unpackWARs="true" autoDeploy="true">
</Host>

<Host name="10.4.220.104" appBase="ipapps"
      unpackWARs="true" autoDeploy="true"
      xmlValidation="false" xmlNamespaceAware="false">
</Host>
```

```bash
echo "tomcatB" > /usr/share/tomcat/webapps/ROOT/index.jsp
```

---

## 第三部分：证书分发和 JKS 转换

### 1. 从 Linux1 分发证书

```bash
# 在 Linux1 上执行
cd /etc/pki/tls/
for i in {1..4}; do
    scp skills.crt skills.key root@10.4.220.10$i:/etc/ssl/
done
```

### 2. 转换 PFX 为 JKS (Linux3)

```bash
cd /etc/ssl

# 将 PFX 转换为 JKS 格式
keytool -importkeystore \
    -srckeystore skills.pfx \
    -destkeystore skills.jks \
    -deststoretype JKS

# 输入密码三次（Key-1122）
```

### 3. 复制 JKS 到 Linux4

```bash
# 在 Linux3 上执行
scp skills.jks root@10.4.220.104:/etc/ssl/
```

### 4. 启动 Tomcat

```bash
# Linux3 和 Linux4 分别执行
systemctl restart tomcat
systemctl enable tomcat

# 检查端口
ss -tunlp | grep java
```

### 5. 配置 hosts 文件

```bash
vim /etc/hosts
```

**添加：**
```
10.4.220.102 linux2.skills.lan
10.4.220.102 tomcat.skills.lan
10.4.220.103 linux3.skills.lan
10.4.220.104 linux4.skills.lan
```

```bash
# 同步到所有主机
for i in {1..4}; do
    scp /etc/hosts root@10.4.220.10$i:/etc/
done
```

### 6. 测试 Tomcat

```bash
# HTTP 测试
curl linux3.skills.lan
curl linux4.skills.lan

# HTTPS 测试（跳过证书验证）
curl https://linux3.skills.lan -k
curl https://linux4.skills.lan -k

# HTTPS 测试（使用证书）
curl --cacert skills.crt https://linux3.skills.lan

# IP 访问测试（应被禁止或返回错误）
curl 10.4.220.103
curl https://10.4.220.103 -k
```

---

## 第四部分：Nginx 负载均衡配置 (Linux2)

### 1. 安装 Nginx

```bash
dnf install nginx -y
```

### 2. 关闭 SELinux

```bash
vim /etc/selinux/config
# 修改：SELINUX=disabled

setenforce 0
```

### 3. 配置 Nginx

```bash
vim /etc/nginx/nginx.conf
```

**删除默认 server 块（约第12行）**

### 4. 创建自定义配置

```bash
vim /etc/nginx/conf.d/default.conf
```

**完整配置：**
```nginx
# 默认服务器 - 禁止直接 IP 访问
server {
    listen 80 default_server;
    listen 443 ssl http2 default_server;
    server_name _;
    return 403;
    
    ssl_certificate /etc/ssl/skills.crt;
    ssl_certificate_key /etc/ssl/skills.key;
}

# linux2.skills.lan - HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name linux2.skills.lan;
    return 301 https://$server_name$request_uri;
}

# linux2.skills.lan - HTTPS
server {
    listen 443 ssl http2;
    server_name linux2.skills.lan;
    root /usr/share/nginx/html;
    
    ssl_certificate /etc/ssl/skills.crt;
    ssl_certificate_key /etc/ssl/skills.key;
    
    location / {
        try_files $uri $uri/ =404;
    }
}

# Tomcat 负载均衡配置
upstream tomcat_backend {
    server 10.4.220.103:443;
    server 10.4.220.104:443;
}

# tomcat.skills.lan - HTTP 重定向
server {
    listen 80;
    server_name tomcat.skills.lan;
    return 301 https://$server_name$request_uri;
}

# tomcat.skills.lan - HTTPS 代理到 Tomcat
server {
    listen 443 ssl http2;
    server_name tomcat.skills.lan;
    
    ssl_certificate /etc/ssl/skills.crt;
    ssl_certificate_key /etc/ssl/skills.key;
    
    location / {
        proxy_pass https://tomcat_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. 创建测试页面

```bash
echo "HelloNginx" > /usr/share/nginx/html/index.html
```

### 6. 启动 Nginx

```bash
systemctl restart nginx
systemctl enable nginx
```

---

## 第五部分：测试验证

### 1. 测试 Nginx

```bash
# HTTP 自动跳转 HTTPS
curl -I http://linux2.skills.lan

# HTTPS 访问
curl https://linux2.skills.lan -k
```

### 2. 测试 Tomcat 负载均衡

```bash
# 多次访问，观察轮询效果
curl https://tomcat.skills.lan -k
curl https://tomcat.skills.lan -k
curl https://tomcat.skills.lan -k
```

### 3. 测试证书

```bash
# 使用 CA 证书验证（无警告）
curl --cacert skills.crt https://tomcat.skills.lan

# 浏览器访问测试
# 确保证书已导入浏览器信任库
```

---

## 常用命令

```bash
# 检查 Nginx 配置
nginx -t

# 重载配置
systemctl reload nginx

# 查看错误日志
tail -f /var/log/nginx/error.log

# 查看访问日志
tail -f /var/log/nginx/access.log

# 检查 Tomcat 状态
systemctl status tomcat

# 查看 Tomcat 日志
tail -f /var/log/tomcat/catalina.out
```

---

## 故障排查

| 问题 | 排查方法 |
|------|----------|
| Nginx 无法启动 | `nginx -t` 检查配置语法 |
| 502 Bad Gateway | 检查 Tomcat 是否运行，防火墙是否放行 |
| 证书错误 | 确认证书路径正确，权限正确 |
| 负载不均衡 | 检查 upstream 配置，确认后端服务正常 |
| 无法访问 | 检查 hosts 文件，DNS 解析 |
