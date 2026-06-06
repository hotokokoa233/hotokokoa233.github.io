---
title: def函数讲解
published: 2025-11-18
pinned: false
description: 详解Python中def关键字的作用、函数定义语法、参数传递机制，通过水仙花数等实例演示函数封装复用技巧，帮助初学者掌握代码模块化思维
tags: [教程]
category: Python
licenseName: 转载时转载请注明出处
author: 遇缘
draft: false
date: 2025-11-18
pubDate: 2025-11-18
---
# Python函数定义：def语句详解
## 一、什么是def？
 `def` 是 Python 中用来定义函数的关键字。函数是一段可重复使用的代码块，它接收输入（参数），执行特定任务，并可能返回结果。
## 二、基本语法与组成
```python
def 函数名(参数1,参数2....):
    执行内容
    return 返回值#可选择使用
```
**关键组成部分**
* 函数名：自定义的标识符（如 greet），用于调用函数
* 参数：函数接收的输入值（如 name），可以为空或多个
* 函数体：缩进的代码块，定义函数的具体行为
* 返回值：return 语句返回结果（没有 return 时返回 None）
>[!NOTE]
理解不了吗？那看看这个呢？
>
```python
def f(x):#定义函数与参数
    return x**2#返回值
print(f(2))#执行def函数
```
假设`x`为2，那么输出的值就是4
想要执行`def`函数定义只需要打出f(x)就行了
怎么样，是不是很熟悉，就是我们数学中所学的f(x)，然后其中包含的代码块就会带入x的参数执行
### 三、实战：水仙花数判断
我们学习的很多学习的很多代码的实现都可以嵌套进`def`里面
**例如**
```python
#水仙花数判断
def shuixianhua(a):#计算过程
    a1 = a // 100
    a2 = a // 10 % 10
    a3 = a % 10
    return (a1**3 + a2**3 + a3**3) == a  # 返回判断结果（布尔值）
number = int(input())  # 例如输入153
if shuixianhua(number):#如果函数执行的值为number
    print(number)
else:
    print('no')
```
:::important
有人可能会想，明明不用`def`函数定义直接写更简单更快，为什么要用`def`函数定义呢,最主要的原因如下
:::
`def`函数定义具有复用性，有时候有个计算过程我们可能会反复利用到，这时候用def可以:
* 避免重复编写相同逻辑
* 将复杂任务分解为小块
* 修改函数内部不影响其他代码
所以，用`def`函数定义来进行代码编写是一种规范，方便的形式
## 💡 动手练习

试着把这段代码改写成函数形式：

```python
# 原代码：判断闰年
year = int(input())
if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
    print("是闰年")
else:
    print("不是闰年")
```