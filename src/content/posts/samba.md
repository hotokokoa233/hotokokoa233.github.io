---
title: Samba配置
published: 2026-03-24
pinned: false
description: 使用Samba搭建共享文件夹并配置对应权限与挂载到其他主机
tags: [竞赛队]
category: Linux
licenseName: CC BY-NC-SA 4.0
author: 遇缘
draft: false
image: 'guide/banner.webp'
date: 2026-03-24
---
# Samba 文件共享配置

## 场景说明

- **服务器**: Linux1 (10.3.5.101)
- **共享目录**: /srv/sharesmb
- **用户组**: manager（读写）、dev（只读）

---

## 第一部分：Samba 服务器配置

### 1. 创建用户和组

```bash
# 创建批量用户脚本
cat > a.sh << 'EOF'
#!/bin/bash
for i in {00..19}
do
    useradd -M -s /sbin/nologin user$i
done
EOF

bash a.sh

# 创建用户组
groupadd manager
groupadd dev

# 添加用户到组
usermod -aG manager user00
usermod -aG manager user01
usermod -aG dev user02
usermod -aG dev user03
```

### 2. 添加 Samba 用户

```bash
# 批量添加 Samba 用户（密码：Key-1122）
for i in {00..03}; do
    echo -e "Key-1122\nKey-1122" | pdbedit -a -u user$i
done

# 或者单独添加
smbpasswd -a user00
smbpasswd -a user01
smbpasswd -a user02
smbpasswd -a user03
```

### 3. 配置本地 YUM 源

```bash
cd /etc/yum.repos.d
rm -rf *

# 创建本地源配置
cat > local.repo << 'EOF'
[AppStream]
name=AppStream
baseurl=file:///mnt/AppStream
enabled=1
gpgcheck=0

[BaseOS]
name=BaseOS
baseurl=file:///mnt/BaseOS
enabled=1
gpgcheck=0
EOF

# 挂载光盘
mount /dev/cdrom /mnt
```

### 4. 安装 Samba

```bash
dnf install samba samba-client -y
```

### 5. 配置 Samba

```bash
vim /etc/samba/smb.conf
```

**在文件末尾添加：**
```ini
[sharesmb]
    comment = Shared Directory
    path = /srv/sharesmb
    browseable = yes
    writable = yes
    write list = @manager
    read list = @dev
    create mask = 1755
    directory mask = 1644
    valid users = @manager, @dev
```

**参数说明：**
- `write list = @manager` - manager 组成员可写
- `read list = @dev` - dev 组成员只读
- `create mask = 1755` - 新建文件权限
- `directory mask = 1644` - 新建目录权限

### 6. 创建共享目录并设置权限

```bash
# 创建目录
mkdir -p /srv/sharesmb

# 设置目录权限
chmod -R 1755 /srv/sharesmb

# 设置属主和属组
chown root:manager /srv/sharesmb

# 设置 SELinux
setsebool -P samba_enable_home_dirs on
setsebool -P samba_export_all_rw on
```

### 7. 启动服务

```bash
# 关闭防火墙（或放行 Samba）
firewall-cmd --add-service=samba --permanent
firewall-cmd --reload

# 临时关闭 SELinux（测试用）
setenforce 0

# 启动 Samba 服务
systemctl restart smb nmb
systemctl enable smb nmb
```

### 8. 测试配置

```bash
# 检查配置文件语法
testparm

# 查看 Samba 用户
pdbedit -L
```

---

## 第二部分：Samba 客户端配置

### 1. 配置 YUM 源并安装客户端

```bash
cd /etc/yum.repos.d
rm -rf *

cat > local.repo << 'EOF'
[AppStream]
name=AppStream
baseurl=file:///mnt/AppStream
enabled=1
gpgcheck=0

[BaseOS]
name=BaseOS
baseurl=file:///mnt/BaseOS
enabled=1
gpgcheck=0
EOF

mount /dev/cdrom /mnt

# 安装 CIFS 工具
dnf install cifs-utils -y
```

### 2. 创建挂载点

```bash
mkdir -p /sharesmb
```

### 3. 配置自动挂载

```bash
vim /etc/fstab
```

**添加：**
```fstab
//10.3.5.101/sharesmb /sharesmb cifs username=user00,password=Key-1122,_netdev 0 0
```

**参数说明：**
- `_netdev` - 表示网络文件系统，网络就绪后才挂载
- `username` - Samba 用户名
- `password` - Samba 密码

### 4. 挂载共享

```bash
# 重新加载 systemd
systemctl daemon-reload

# 挂载所有配置
mount -a

# 查看挂载情况
df -h

# 测试访问
ls /sharesmb
```

---

## 常用命令

### 服务器端

```bash
# 查看 Samba 状态
systemctl status smb

# 查看当前连接
smbstatus

# 查看 Samba 用户列表
pdbedit -L

# 删除 Samba 用户
smbpasswd -x username
```

### 客户端

```bash
# 查看服务器共享列表
smbclient -L //10.3.5.101 -U user00

# 临时挂载
mount -t cifs //10.3.5.101/sharesmb /mnt -o username=user00,password=Key-1122

# 卸载
umount /sharesmb
```

---

## 故障排查

| 问题 | 解决方法 |
|------|----------|
| 无法连接 | 检查防火墙：`firewall-cmd --list-all` |
| 权限拒绝 | 检查 SELinux：`getenforce` 和 `setenforce 0` |
| 认证失败 | 确认用户已添加：`pdbedit -L` |
| 无法写入 | 检查组权限：`ls -la /srv/sharesmb` |
| 挂载失败 | 检查网络连通性：`ping 10.3.5.101` |
