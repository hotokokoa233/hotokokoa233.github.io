---
title: Ansible运维配置
published: 2026-03-24
pinned: false
description: Ansible配置
tags: [竞赛队]
category: Linux
licenseName: CC BY-NC-SA 4.0
author: 遇缘
draft: false
image: 'guide/凉.png'
date: 2026-03-24
---





# Ansible 自动化运维配置

## 1. 安装 Ansible

```bash
# 安装 Ansible
yum install ansible -y
```

## 2. 配置主机清单

```bash
# 批量添加主机到清单
for i in {1..6}; do
    echo "10.4.220.10$i" >> /etc/ansible/hosts
done

# 编辑主机清单，添加分组
vim /etc/ansible/hosts
```

**添加以下内容：**
```ini
[db1]
10.4.220.101
10.4.220.102
10.4.220.103

[db2]
10.4.220.104
10.4.220.105
10.4.220.106
```

## 3. 测试连通性

```bash
# 测试所有主机的连通性
ansible -m ping all

# 测试特定组
ansible -m ping db1
ansible -m ping db2
```

## 常用模块速查

| 模块 | 用途 |
|------|------|
| `ping` | 测试连通性 |
| `command` | 执行命令 |
| `shell` | 执行 shell 命令 |
| `copy` | 复制文件 |
| `yum` | 包管理 |
| `service` | 服务管理 |
