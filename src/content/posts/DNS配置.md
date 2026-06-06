---
title: DNS,证书，NTP配置
published: 2026-03-24
pinned: false
description: 使用Bind搭建DNS服务器，Chorny搭建NTP，并且给自己颁发证书
tags: [竞赛队]
category: Linux
licenseName: CC BY-NC-SA 4.0
author: 遇缘
draft: false
image: 'guide/爱弥斯2.png'
date: 2026-03-24
---


# DNS 服务器配置指南

## 环境信息

| 主机 | IP 地址 | 角色 |
|------|---------|------|
| Linux1 | 10.4.220.101 | 主 DNS + CA 服务器 |
| Linux2 | 10.4.220.102 | 备用 DNS 服务器 |

---

## 1. 基础网络配置

### Linux1 配置

```bash
nmtui
# Set system hostname: linux1
# Edit connection:
#   - Addresses: 10.4.220.101/24
#   - Gateway: 10.4.220.1
#   - DNS servers: 10.4.220.101, 10.4.220.102

reboot
```

### Linux2 配置

```bash
nmtui
# Set system hostname: linux2
# Edit connection:
#   - Addresses: 10.4.220.102/24
#   - Gateway: 10.4.220.1
#   - DNS servers: 10.4.220.102, 10.4.220.101

reboot
```

---

## 2. 防火墙配置

```bash
# 放行 DNS 端口（53/tcp, 53/udp）
firewall-cmd --zone=public --add-port=53/tcp --add-port=53/udp --permanent
firewall-cmd --reload
firewall-cmd --list-all
```

---

## 3. SSH 免密登录配置

```bash
# 安装 expect
dnf install expect -y

# 创建自动化脚本
cat > ssh.sh << 'EOF'
#!/bin/bash
ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa

for i in {1..2}
do
    expect -c "
    spawn ssh-copy-id root@10.4.220.10$i
    expect {
        \"yes/no\" { send yes\r; exp_continue }
        \"password\" { send Key-1122\r }
    }
    expect eof
    "
done
EOF

bash ssh.sh

# 测试登录
ssh root@10.4.220.102
```

---

## 4. NTP 时间同步 (Chrony)

### Linux1 (NTP 服务器)

```bash
vim /etc/chrony.conf
```

**添加：**
```conf
server 10.4.220.101 iburst
allow 10.4.220.0/24
local stratum 10
```

```bash
systemctl restart chronyd
```

### Linux2 (NTP 客户端)

```bash
vim /etc/chrony.conf
# 添加：
server 10.4.220.101 iburst

systemctl restart chronyd
```

---

## 5. 主 DNS 服务器配置 (Linux1)

### 5.1 安装 BIND

```bash
dnf install bind bind-utils -y
```

### 5.2 配置主配置文件

```bash
vim /etc/named.conf
```

**修改：**
```conf
options {
    listen-on port 53 { any; };
    allow-query { any; };
    allow-update { any; };
    allow-transfer { 10.4.220.102; };  # 允许从服务器传输
};
```

### 5.3 配置区域文件

```bash
vim /etc/named.rfc1912.zones
```

**添加：**
```conf
zone "skills.lan" IN {
    type master;
    file "named.skills";
    allow-update { none; };
};

zone "220.4.10.in-addr.arpa" IN {
    type master;
    file "named.10";
    allow-update { none; };
};
```

### 5.4 创建正向解析文件

```bash
cd /var/named
cp -a named.empty named.skills
vim named.skills
```

**内容：**
```dns
$TTL 86400
@       IN      SOA     skills.lan. admin.skills.lan. (
                        2024031601      ; Serial
                        3600            ; Refresh
                        1800            ; Retry
                        604800          ; Expire
                        86400 )         ; Minimum TTL

        IN      NS      linux1.skills.lan.
        IN      NS      linux2.skills.lan.

linux1  IN      A       10.4.220.101
linux2  IN      A       10.4.220.102
```

### 5.5 创建反向解析文件

```bash
cp -a named.empty named.10
vim named.10
```

**内容：**
```dns
$TTL 86400
@       IN      SOA     skills.lan. admin.skills.lan. (
                        2024031601      ; Serial
                        3600            ; Refresh
                        1800            ; Retry
                        604800          ; Expire
                        86400 )         ; Minimum TTL

        IN      NS      linux1.skills.lan.

101     IN      PTR     linux1.skills.lan.
102     IN      PTR     linux2.skills.lan.
```

### 5.6 启动服务

```bash
systemctl restart named
systemctl enable named
```

### 5.7 测试

```bash
nslookup linux1.skills.lan
nslookup 10.4.220.102
```

---

## 6. 备用 DNS 服务器配置 (Linux2)

### 6.1 安装 BIND

```bash
dnf install bind bind-utils -y
```

### 6.2 配置主配置文件

```bash
vim /etc/named.conf
```

**修改：**
```conf
options {
    listen-on port 53 { any; };
    allow-query { any; };
};
```

### 6.3 配置从区域

```bash
vim /etc/named.rfc1912.zones
```

**添加：**
```conf
zone "skills.lan" IN {
    type slave;
    file "slaves/named.skills";
    masters { 10.4.220.101; };
    masterfile-format text;
};

zone "220.4.10.in-addr.arpa" IN {
    type slave;
    file "slaves/named.10";
    masters { 10.4.220.101; };
    masterfile-format text;
};
```

### 6.4 启动服务

```bash
# 创建 slaves 目录
mkdir -p /var/named/slaves
chown named:named /var/named/slaves

systemctl restart named
systemctl enable named
```

---

## 7. CA 证书服务器配置 (Linux1)

### 7.1 安装 OpenSSL

```bash
dnf install openssl -y
```

### 7.2 配置 OpenSSL

```bash
vim /etc/pki/tls/openssl.cnf
```

**修改/添加：**
```conf
[ req ]
req_extensions = v3_req

[ v3_req ]
basicConstraints = CA:TRUE
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = *.skills.lan
DNS.2 = skills.lan
```

### 7.3 初始化 CA 目录

```bash
cd /etc/pki/CA

# 创建必要文件
touch index.txt
echo 00 > serial

# 创建扩展配置文件
cat > a.conf << EOF
subjectAltName=DNS:skills.lan,DNS:*.skills.lan
EOF
```

### 7.4 生成 CA 根证书

```bash
# 生成 CA 私钥
openssl genrsa -out private/cakey.pem 2048

# 生成自签名 CA 证书（有效期10年）
openssl req -x509 -key private/cakey.pem -out cacert.pem -days 3650
# 填写信息：CN, Beijing, Beijing, skills, system, linux1.skills.lan
```

### 7.5 签发服务器证书

```bash
cd /etc/pki/CA

# 生成服务器私钥
openssl genrsa -out skills.key 2048

# 生成证书请求
openssl req -new -key skills.key -out skills.csr
# 填写信息：CN, Beijing, Beijing, skills, system, skills.lan

# 签发证书（有效期5年）
openssl ca -extfile a.conf -in skills.csr -out skills.crt -days 1825
# 输入 y 确认两次

# 复制证书到目标位置
cp skills.key skills.crt /etc/pki/tls/

# 添加 CA 证书到系统信任库
cat cacert.pem >> /etc/pki/tls/certs/ca-bundle.crt
```

---

## 8. 禁用 SSH 密码认证

```bash
vim /etc/ssh/sshd_config
```

**修改：**
```conf
PasswordAuthentication no
```

```bash
systemctl restart sshd
```

---

## 常用测试命令

```bash
# 测试正向解析
nslookup linux1.skills.lan

# 测试反向解析
nslookup 10.4.220.101

# 测试 DNS 服务器
dig @10.4.220.101 linux1.skills.lan
dig @10.4.220.102 linux1.skills.lan

# 查看证书信息
openssl x509 -in skills.crt -text -noout
```
