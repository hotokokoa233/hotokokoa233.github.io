---
title: MariaDB 数据库配置
published: 2026-03-24
pinned: false
description: 使用MariaDB创建数据库并插入数据
tags: [竞赛队]
category: Linux
licenseName: CC BY-NC-SA 4.0
author: 遇缘
draft: false
image: 'guide/爱弥斯1.png'
date: 2026-03-24
---


# MariaDB 数据库配置

## 1. 安装 MariaDB

```bash
# 安装 MariaDB
dnf install mariadb-server -y

# 启动并设置开机自启
systemctl enable mariadb --now
```

## 2. 初始化安全配置

```bash
mysql_secure_installation
```

**操作步骤：**
1. 按回车跳过当前 root 密码（首次安装无密码）
2. 设置 root 密码（输入两次）
3. 其余选项按回车选择默认（Y）

## 3. 数据库基础操作

### 3.1 登录数据库

```bash
mysql -u root -p
# 输入密码
```

### 3.2 创建用户

```sql
-- 创建远程访问用户
GRANT ALL PRIVILEGES ON *.* TO 'xiao'@'10.4.220.103' 
IDENTIFIED BY 'Key-1122';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看用户列表
SELECT user, host FROM mysql.user;
```

### 3.3 创建数据库和表

```sql
-- 创建数据库
CREATE DATABASE userdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 选择数据库
USE userdb;

-- 创建表
CREATE TABLE userinfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10),
    height FLOAT,
    birthday DATETIME,
    sex VARCHAR(5),
    password VARCHAR(200)
);

-- 查看表结构
DESC userinfo;
```

### 3.4 插入数据

```sql
-- 单条插入（使用 MD5 加密密码）
INSERT INTO userinfo (id, name, height, birthday, sex, password) 
VALUES (1, 'user1', 1.61, '2000-07-01', 'M', MD5('user1'));

INSERT INTO userinfo (id, name, height, birthday, sex, password) 
VALUES (2, 'user2', 1.62, '2000-07-02', 'F', MD5('user2'));

-- 查看数据
SELECT * FROM userinfo;
```

## 4. 批量数据导入

### 4.1 准备数据文件

```bash
mkdir -p /var/mariadb
cd /var/mariadb

# 创建数据文件
cat > userinfo.txt << EOF
3,user3,1.63,2000-07-03,F,user3
4,user4,1.64,2000-07-04,M,user4
5,user5,1.65,2000-07-05,M,user5
6,user6,1.66,2000-07-06,F,user6
7,user7,1.67,2000-07-07,F,user7
8,user8,1.68,2000-07-08,M,user8
9,user9,1.69,2000-07-09,F,user9
EOF
```

### 4.2 导入数据

```sql
-- 使用 LOAD DATA 导入
LOAD DATA LOCAL INFILE '/var/mariadb/userinfo.txt' 
INTO TABLE userinfo 
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n'
(id, name, height, birthday, sex, password) 
SET password = MD5(password);
```

### 4.3 解决权限问题

```bash
# 设置目录权限
chmod 777 /var/mariadb/
setenforce 0

# 永久关闭 SELinux
vim /etc/selinux/config
# 修改：SELINUX=disabled
```

## 5. 数据导出

### 5.1 SQL 格式导出

```sql
-- 导出表数据为 SQL 文件
SELECT * FROM userinfo 
INTO OUTFILE '/var/mariadb/userinfo.sql' 
FIELDS TERMINATED BY ',';
```

### 5.2 使用 mysqldump 备份

```bash
# 手动备份
mysqldump -u root -p'Key-1122' userdb > /var/mariadb/userdb.sql

# 查看备份内容
cat /var/mariadb/userdb.sql
```

## 6. 定时自动备份

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每周五凌晨1点备份）
0 1 * * 5 mysqldump -u root -p'Key-1122' userdb > /var/mariadb/userdb.sql
```

## 常用 SQL 命令速查

| 命令 | 说明 |
|------|------|
| `SHOW DATABASES;` | 显示所有数据库 |
| `USE dbname;` | 选择数据库 |
| `SHOW TABLES;` | 显示所有表 |
| `DESC tablename;` | 查看表结构 |
| `SELECT * FROM table;` | 查询所有数据 |
| `CREATE DATABASE db;` | 创建数据库 |
| `DROP DATABASE db;` | 删除数据库 |
| `GRANT ...` | 授权 |
| `FLUSH PRIVILEGES;` | 刷新权限 |

## 常见问题

### 1. 远程连接失败
```bash
# 检查防火墙
firewall-cmd --add-port=3306/tcp --permanent
firewall-cmd --reload

# 检查 MariaDB 监听地址
vim /etc/my.cnf.d/mariadb-server.cnf
# 注释掉：bind-address = 127.0.0.1
```

### 2. 导入文件权限错误
```bash
# 确保文件可读
chmod 644 /var/mariadb/userinfo.txt

# 临时关闭 SELinux
setenforce 0
```
