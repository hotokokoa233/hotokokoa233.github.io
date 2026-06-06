---
title: iSCSI 存储配置
published: 2026-03-26
pinned: false
description: 配置ISCSI服务，使多块硬盘共同调用
tags: [竞赛队]
category: Linux
licenseName: CC BY-NC-SA 4.0
author: 遇缘
draft: false
image: 'guide/爱弥斯2.png'
date: 2026-03-26
---

# iSCSI 存储配置

## 环境信息
| 主机 | IP 地址 | 角色 |
|------|---------|------|
| Linux3 | 10.4.220.103 | iSCSI 服务端 |
| Linux4 | 10.4.220.104 | iSCSI 客户端 |

---

## 第一部分：iSCSI 服务端配置 (Linux3)

### 1. 添加硬盘

**在虚拟机中添加 5GB 硬盘（需重启进入 BIOS 调整磁盘顺序）**

```bash
# 查看磁盘信息
lsblk
```

### 2. 创建物理卷

```bash
# 创建物理卷
pvcreate /dev/sda /dev/sdb /dev/sdc /dev/sdd

# 查看物理卷
pvdisplay
```

### 3. 创建卷组

```bash
# 创建卷组 vg1
vgcreate vg1 /dev/sda /dev/sdb /dev/sdc /dev/sdd

# 查看卷组
vgdisplay
```

### 4. 创建逻辑卷

```bash
# 创建逻辑卷（使用所有空闲空间）
lvcreate -l +100%free vg1 -n lv1

# 查看逻辑卷
lvdisplay

# 格式化为 ext4 文件系统
mkfs.ext4 /dev/vg1/lv1

# 查看磁盘信息
lsblk
```

### 5. 安装 targetcli

```bash
# 安装 iSCSI 服务端工具
dnf install targetcli -y
```

### 6. 配置 iSCSI 目标

```bash
# 进入 targetcli 交互界面
targetcli
```

**在 targetcli 中执行以下命令：**

```bash
# 创建后端存储块
/backstores/block create vg1 /dev/vg1/lv1

# 创建 iSCSI 目标（WWN 名称）
/iscsi create wwn=iqn.2022-05.com.skills:server

# 配置 ACL 权限（客户端 IQN）
/iscsi/iqn.2022-05.com.skills:server/tpg1/acls create wwn=iqn.2022-05.com.skills:client

# 创建 LUN 并绑定到后端存储
/iscsi/iqn.2022-05.com.skills:server/tpg1/luns create /backstores/block/vg1

# 查看配置
ls

# 退出
exit
```

**WWN 命名规范：**
- 格式：`iqn.yyyy-mm.反向域名:标识符`
- 服务端：`iqn.2022-05.com.skills:server`
- 客户端：`iqn.2022-05.com.skills:client`

### 7. 启动服务

```bash
# 重启并启用 target 服务
systemctl restart targetclid
systemctl enable targetclid
```

---

## 第二部分：iSCSI 客户端配置 (Linux4)

### 1. 安装客户端工具

```bash
# 安装 iSCSI 客户端工具
dnf install iscsi-initiator-utils -y
```

### 2. 配置 Initiator 名称

```bash
vim /etc/iscsi/initiatorname.iscsi
```

**修改为：**

```ini
InitiatorName=iqn.2022-05.com.skills:client
```

### 3. 启动服务

```bash
# 重启并启用 iscsid 服务
systemctl restart iscsid
systemctl enable iscsid
```

### 4. 发现 iSCSI 目标

```bash
# 搜索服务端的 iSCSI 目标
iscsiadm -m discovery -t sendtargets -p 10.4.220.103
```

### 5. 连接到 iSCSI 目标

```bash
# 登录到目标
iscsiadm -m node -T iqn.2022-05.com.skills:server -p 10.4.220.103 --login

# 查看连接会话
iscsiadm -m session -o show

# 重启服务使连接生效
systemctl restart iscsid
```

### 6. 验证磁盘

```bash
# 查看磁盘信息（应看到新磁盘 /dev/sda）
lsblk

# 重启系统以确认配置
reboot

# 重启后再次查看
lsblk
```

### 7. 创建挂载点

```bash
# 创建挂载目录
mkdir -p /shareiscsi
```

### 8. 配置开机自动挂载

```bash
vim /etc/rc.d/rc.local
```

**添加：**

```bash
mount /dev/sda /shareiscsi
```

```bash
# 添加执行权限
chmod +x /etc/rc.d/rc.local
```

### 9. 测试挂载

```bash
# 手动挂载
mount /dev/sda /shareiscsi

# 查看挂载结果
ls /shareiscsi/
```

---

## 常用命令速查

### 服务端命令
| 命令 | 说明 |
|------|------|
| `targetcli` | 进入 iSCSI 配置界面 |
| `ls` | 在 targetcli 中查看配置 |
| `systemctl status targetclid` | 查看 target 服务状态 |
| `targetcli ls` | 查看 iSCSI 配置树 |

### 客户端命令
| 命令 | 说明 |
|------|------|
| `iscsiadm -m discovery -t st -p <IP>` | 发现目标 |
| `iscsiadm -m node -T <IQN> -p <IP> --login` | 登录目标 |
| `iscsiadm -m node -T <IQN> -p <IP> --logout` | 登出目标 |
| `iscsiadm -m session -o show` | 查看会话 |
| `iscsiadm -m node` | 查看已发现的节点 |

### 存储管理命令
| 命令 | 说明 |
|------|------|
