---
title: 计算1-100数字（while循环版）
published: 2025-10-23
pinned: false
description: while循环版
tags: [作业]
category: Python
licenseName: 转载时转载请注明出处
author: 遇缘
draft: false
date: 2025-10-23
pubDate: 2025-10-23
---
# 此篇为While循环写法
### 总和
```python
number = 1
total = 0 #计数器
while number <= 100: #循环执行条件：直到number小于等于100时
    total += number #使每一次循环的number值加到一起
    number += 1
print(total)
```
>[!CAUTION]
必须额外加一个计数器，不然使用number += number的话会使数字逐个翻倍
### 奇数和
```python
number = 1
total_odd = 0  # 奇数和计数器
while number <= 99:
    total_odd += number
    number += 2  # 每次加2，只取奇数
print("奇数和：", total_odd)
```
### 偶数和
``` python
number = 2
total_even = 0  # 偶数和计数器
while number <= 100:
    total_even += number
    number += 2  # 每次加2，只取偶数
print("偶数和：", total_even)
```
>[!NOTE]
其实和**For循环**两者之间并没有什么太大的差别，计算步骤完全一样，只是**While循环**需要判断循环条件，而**For循环**只需要历遍给出来的值就行了
>