---
title: Python 语句：For、While 与 If 判断
published: 2026-01-09
pinned: false
description: For 循环、While 循环和 If 判断教程
tags: [教程]
category: Python
licenseName: For Li
author: 遇缘
draft: false
image: 'guide/凉.png'
date: 2026-01-09
---


# Python 语句：If、While 与 For

## 学习目标

- 理解 `if` / `while` / `for` 的基本语法和使用场景。
- 学会把现实问题拆解成“状态”、“事件规则（循环体）”与“终止条件/判断（if/break）”。
- 能读懂并运行示例代码，理解每行注释所表达的含义。
---

## 1. If 条件判断（分支与逻辑，最简单）

`if` 用于根据条件执行不同分支，最适合检查边界或决定是否执行某段操作。

示例 1：判断一个数是正、负或零。

解题思路：根据大小关系分三种情况，分别输出不同信息。

```python
# 示例：判断正负零
x = 3
if x > 0:
    print("正数")
elif x == 0:
    print("零")
else:
    print("负数")
```

示例 2：判断一个年份是否为闰年。
解题思路：闰年规则为能被 4 整除但不能被 100 整除，或能被 400 整除。

```python
# 示例：判断闰年
year = int(input("请输入年份："))
if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):#如果年能被4整除且不能被100整除，或者能被400整除
    print("是闰年")#如果是闰年则输出是闰年
else:#否则输出不是闰年
    print("不是闰年")
```

## 2. While 循环（基于条件的重复，进阶）

`while` 适合当循环次数不确定时使用。

```python
while 循环成立的条件:
    循环体（重复执行的代码）
```
`while` 循环会持续执行循环体，直到条件不成立为止。
并且循环里面的代码块需要缩进，并且循环里面可以使用 `if` 语句来判断某些条件，从而决定是否继续循环或者跳出循环，甚至嵌套使用多个循环。
### 泳池注水

题目：出水管每小时排 10 立方米，进水管每小时进 15 立方米，泳池总容积 1000 立方米，同时打开需要多少小时？

用 `while` 逐小时模拟以处理边界和非整数小时情形。


```python
water = 0      # 当前水量（立方米）
time = 0        # 已过小时数
while water < 1000:
    # 先进水再出水（此顺序与模型假设有关）
    water += 15  # 进水管
    water -= 10  # 出水管
    time += 1

print(f"需要{time}小时才能加满，最终水量为{water}立方米")
```


### 桃树与猴子（中等）

题目：两棵桃树初始共有 3 颗桃子；猴子每 3 天吃 1 颗桃子；每过 7 天树长 1 颗桃子/树（两棵树共 +2）。问多少天后猴子没桃子吃？

解题思路：用 `days` 推进天数，按天检查是否为第 7 的倍数（长桃）与第 3 的倍数（吃桃），在吃桃时判断库存是否为 0。

```python
tree = 3   # 初始桃子数
days = 0   # 天数计数

while True:
    days += 1

    # 每 7 天，树长 2 颗（两棵树各 +1）
    if days % 7 == 0:
        tree += 2

    # 每 3 天猴子吃 1 颗
    if days % 3 == 0:
        if tree == 0:# 如果桃子数为0
            print(f'猴子第 {days} 天没饭吃')
            break
        else:
            tree -= 1
```

说明：`while True` 常用于“直到某条件发生才退出”的场景，内部用 `break` 结束循环。

---

## 3. For 循环（遍历与枚举，适合枚举解法）

`for` 常用于枚举可能性或遍历集合。例题由易到难：求和示例、母鸡问题（枚举优化）、质数练习。

### 求和与奇数倒数（入门）

示例：计算 1 到 9 的和；以及 1/1 + 1/3 + ... + 1/99 的和。

```python
# 求和示例
S = 0
for i in range(1, 10):
    S += i
print(S)

# 奇数倒数示例
S = 0.0
for i in range(1, 100, 2):
    S += 1 / i
print(S)
```

### 母鸡、公鸡、小鸡（中等）

题目回顾：母鸡 5 块/只，公鸡 3 块/只，小鸡 3 只 1 块。用 100 块买 100 只鸡，三种鸡至少各 1 只，求所有购买方式。

解题思路：枚举母鸡和公鸡数量，计算小鸡数量并检查价格与可整除条件。枚举范围可通过简单约束缩小，例如母鸡最多 20 只（5*20=100）。

详细可运行代码（含注释）：

```python
count = 0

#+ 母鸡最多 20 只（超出价格上限），最少 1 只
for x in range(1, 21):
    # 公鸡至少 1 只，最多可以由剩余数量决定
    for y in range(1, 100 - x):
        z = 100 - x - y  # 小鸡数量

        # 小鸡必须至少 1 且能被 3 整除
        if z >= 1 and (5*x + 3*y + z/3) == 100:
            print(f'母鸡：{x} 只，公鸡：{y} 只，小鸡：{z} 只')
            count += 1
print(f'总方案数：{count}')
```

---

## 4. 混合题（较难）

### 五人分鱼（经典椰子问题的变体）

题目：五个人（A、B、C、D、E）夜里分鱼：每人醒来把鱼分成 5 份，发现多 1 条（扔掉 1 条），拿走自己的一份，剩下的合并。五人依次操作，第六天早上刚好能被 5 整除。求最少最初有多少条鱼。

解题思路：暴力搜索初始鱼数，从小往大模拟 5 次分鱼过程；每一步判断 `temp % 5 == 1`，满足则更新 `temp = (temp - 1) // 5 * 4` 并继续。

示例代码（逐行注释）：

```python
fish = 1
while True:
    temp = fish
    ok = True
    for i in range(5):
        if temp % 5 != 1:
            ok = False
            break
        # 丢掉 1 条，拿走 1/5，剩下 4/5
        temp = (temp - 1) // 5 * 4

    # 经过 5 次分配都满足条件，则 fish 是答案
    if ok and temp % 5 == 0:
        print(f'最少捕了 {fish} 条鱼')
        break
    fish += 1
```

提示：在某些变体中需要检查“第二天早上能被 5 整除”的条件（上例中 `temp % 5 == 0` 可视情况调整）。

---

## 5. 题目联系

将将！ 现在就有一道题目等你来挑战：
某某小卖部做活动，买玻璃瓶可乐，每凑齐3个瓶盖，可以换购一瓶玻璃瓶可乐，每凑齐5个瓶子，也能换购一瓶玻璃瓶可乐
班长知道后，一口气买了100只，问，班长总共能喝多少只可乐
>[!TIP]
（提示：可以用while循环模拟喝可乐和换购的过程,并且不要忘记换来的可乐也有瓶子和盖子哦！）
>

<details>
<summary>这题答案在这：</summary>

```python
cap = bottle = total = 100#初始瓶盖和瓶子数量均为100
while cap >= 3 or bottle >= 5:#当瓶盖大于等于3或者瓶子大于等于5时循环
    temp = cap // 3 + bottle // 5#计算能换购的可乐数量
    total += temp#更新总共喝的可乐数量
    cap = cap % 3 + temp#更新瓶盖数量，余下的加上新喝的可乐产生的瓶盖
    bottle = bottle % 5 + temp#更新瓶子数量，余下的加上新喝的可乐产生的瓶子
print(f'班长总共能喝{total}只可乐')
```

</details>

<details>
<summary>小彩蛋</summary>
<iframe width="100%" height="468" src="//player.bilibili.com/player.html?bvid=BV1d44y1z7EB&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" &autoplay=0> </iframe>


~我真的好累~
</details>
