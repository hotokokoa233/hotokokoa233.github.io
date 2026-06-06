---
title: Apache HTTP 服务器配置
published: 2026-03-24
pinned: false
description: 证书配置，HTTPS配置
tags: [竞赛队]
category: Linux
licenseName: CC BY-NC-SA 4.0
author: 遇缘
draft: false
image: 'guide/初音.png'
date: 2026-03-24
---


# Apache HTTP 服务器配置

## 1. 安装 Apache 和 SSL 模块

```bash
# 安装 httpd 和 mod_ssl
dnf install mod_ssl httpd -y
```

## 2. SSL 证书配置

### 2.1 修改 SSL 配置文件

```bash
vim /etc/httpd/conf.d/ssl.conf
```

**修改以下配置项：**
```apache
# 指定服务器 SSL 证书文件路径
SSLCertificateFile /etc/pki/tls/apache.crt

# 指定与证书对应的私钥文件路径
SSLCertificateKeyFile /etc/pki/tls/apache.key
```

### 2.2 证书格式转换

```bash
cd /etc/pki/tls

# 1. 将证书和私钥合并为 PFX 文件
openssl pkcs12 -export -in skills.crt -inkey skills.key -out skills.pfx
# 输入密码两次

# 2. 从 PFX 提取为 PEM 格式（未加密私钥）
openssl pkcs12 -nodes -in skills.pfx -out skills.pem
# 输入密码

# 3. 从 PEM 提取 RSA 私钥
openssl rsa -in skills.pem -out apache.key

# 4. 从 PEM 提取 X.509 证书
openssl x509 -in skills.pem -out apache.crt
```

**参数说明：**
- `pkcs12` - 使用 PKCS#12 格式处理证书和密钥（.pfx 文件）
- `-export` - 导出模式，打包证书和私钥
- `-nodes` - 不加密私钥（no DES）
- `-in` - 指定输入文件
- `-out` - 指定输出文件

## 3. 虚拟主机配置

```bash
vim /etc/httpd/conf/httpd.conf
```

### HTTP (80端口) 配置

```apache
# 主域名虚拟主机
<VirtualHost *:80>
    ServerName www.skills.lan
    DocumentRoot "/var/www/html"
</VirtualHost>

# 子域名重定向到主域名
<VirtualHost *:80>
    ServerName linux1.skills.lan
    ServerAlias *.skills.lan
    Redirect permanent / https://www.skills.lan
</VirtualHost>

# 禁止直接 IP 访问
<VirtualHost *:80>
    ServerName 10.4.220.101
    Redirect 403 /
</VirtualHost>
```

### HTTPS (443端口) 配置

```apache
# HTTPS 主域名
<VirtualHost *:443>
    ServerName www.skills.lan
    DocumentRoot "/var/www/html"
    SSLEngine on
    SSLCertificateFile /etc/pki/tls/apache.crt
    SSLCertificateKeyFile /etc/pki/tls/apache.key
</VirtualHost>

# HTTPS 子域名重定向
<VirtualHost *:443>
    ServerName linux1.skills.lan
    ServerAlias *.skills.lan
    Redirect permanent / https://www.skills.lan
</VirtualHost>

# HTTPS 禁止 IP 访问
<VirtualHost *:443>
    ServerName 10.4.220.101
    Redirect 403 /
</VirtualHost>
```

## 4. 启动服务

```bash
# 创建测试页面
echo "HelloApache" > /var/www/html/index.html

# 启动并启用服务
systemctl restart httpd
systemctl enable httpd
```

## 5. DNS 配置

```bash
vim /var/named/named.skills
```

**添加 DNS 记录：**
```dns
$TTL 86400
@       IN      SOA     skills.lan. admin.skills.lan. (
                        2024031601      ; Serial
                        3600            ; Refresh
                        1800            ; Retry
                        604800          ; Expire
                        86400 )         ; Minimum TTL

        IN      NS      linux1.skills.lan.

linux1  IN      A       10.4.220.101
linux2  IN      A       10.4.220.102
linux3  IN      A       10.4.220.103
linux4  IN      A       10.4.220.104
linux5  IN      A       10.4.220.105
linux6  IN      A       10.4.220.106
tomcat  IN      A       10.4.220.102
www     IN      A       10.4.220.101
*       IN      A       10.4.220.101
```

```bash
# 重启 DNS 服务
systemctl restart named
```

## 6. 测试

```bash
# 测试 HTTP
curl http://www.skills.lan

# 测试 HTTPS
curl https://www.skills.lan
```
