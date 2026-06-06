---
title: MySQL例题
published: 2025-11-26
pinned: false
description: MySQL的实体关系，E-R图与指令学习
tags: [作业]
category: MySQL
licenseName: CC BY-NC-SA 4.0
author: 遇缘
draft: false
image: 'guide/凉.png'
date: 2025-11-26
pubDate: 2025-11-26
---
# MySQL讲解
## 题目示例
1．**教学管理系统数据库设计**
学校有若干个`系`，每个系有各自的`系号`、`系名`和`系主任`；每个`系`有若干名`教师`和`学生`，`教师`有*教师号*、*教师名*和*职称属性*，每个`教师`可以**担任**若干门`课程`，一门`课程`只能由一位`教师` **讲授**，`课程`有*课程号*、*课程名*和*学分*；`教师`可以参加多项`科研项目`，一个`项目`有**多人合作**，且责任轻重有*排名*，项目有*项目号*、*名称*和*负责人*；`学生`有*学号*、*姓名*、*年龄*、*性别*，每个`学生`可以同时选修**多门课程**，选修课程后有相应科目的*考试成绩*。
### 题目分析
**首先，我们得需要明确有哪些实体，关系与属性**
* 实体：系，教师，学生，课程项目
* 属性由于太多，就不一一标出了，为上文斜体字
* 关系：要注意是一对多或多对多等，这里要注意题目用的是什么量词，为上文加粗字
### 关系
明确了有哪些属性后，我们就得把他们列成关系模型，如下：
* 系(<u>系号</u>，系名，系主任)
* 教师(<u>教师号</u>，教师名，职称属性，**系号**)
* 课程(<u>课程号</u>，课程名，学分，**教师号**)
* 学生(<u>学号</u>，姓名，年龄，性别，**系号**)
* 项目(<u>项目号</u>，项目名称，负责人，**系号**)
  以下是外键清单
* 教师参加项目(<u>教师号</u>,<u>项目号</u>)
* 选课(<u>学号</u>，<u>课程号</u>，考试成绩)



--------------------------------------------------

>[!CAUTION]
在表内的外键按照老师要求需要用黄色打底来标注，由于我这边做不到所以我用加粗代替
>

在描述关系模型的时候我们就要关注如何分配**外键**了

>[!TIP]
外键的来源：为了在关系模型表达当实体与实体产生联系，需要在属性里加上别的实体的主键用于表明这两个表产生了联系
>
### E-R图
```mermaid
erDiagram
    系 {
    char(4) 系号 PK
    varchar(50) 系名
    varchar(20) 系主任
}

教师 {
    char(8) 教师号 PK
    varchar(20) 教师名
    varchar(10) 职称
    char(4) 系号 FK
}

学生 {
    char(10) 学号 PK
    varchar(20) 姓名
    int 年龄
    char(2) 性别
    char(4) 系号 FK
}

课程 {
    char(8) 课程号 PK
    varchar(50) 课程名
    int 学分
    char(8) 教师号 FK
}

科研项目 {
    char(10) 项目号 PK
    varchar(100) 名称
    char(8) 负责人 FK "引用教师.教师号"
}

教师项目关联 {
    char(8) 教师号 PK, FK
    char(10) 项目号 PK, FK
    int 排名
}

学生选课关联 {
    char(10) 学号 PK, FK
    char(8) 课程号 PK, FK
    int 成绩
}

%% 关系说明（带基数）
系 ||--o{ 教师 : "1:N"
系 ||--o{ 学生 : "1:N"
教师 ||--o{ 课程 : "1:N"
教师 }o--o{ 教师项目关联 : "M:N"
科研项目 }o--o{ 教师项目关联 : "M:N"
学生 }o--o{ 学生选课关联 : "M:N"
课程 }o--o{ 学生选课关联 : "M:N"
科研项目 }o--|| 教师 : "N:1（负责人）"
```


`PK`为`primary key`，即为主键，`FK`即为`Foreign Key`，是外键
## 字符类型
1. 存储长度
CHAR(n)：定长字符串
固定占用 n 个字符的存储空间。
如果实际内容不足 n 个字符，会用空格（或填充符）补足到 n 位。
例如：CHAR(10) 存 "ABC"，实际占 10 字节（后面补 7 个空格）。
VARCHAR(n)：变长字符串
只占用 实际内容长度 + 长度标识（通常 1~2 字节） 的空间。
例如：VARCHAR(10) 存 "ABC"，只占 3 + 1 = 4 字节（1 字节记录长度）。
举个小栗子
```text
#如果你要保存00001
你用char，他的储存方式是：00001
用varchar，他的储存方式是：1
很明显，varchar作为灵活长度字符，他会省去掉一些“无用的占位数字”
但是在实际应用中，身份证或者编号这些主键的长度是不能改变的，所以要用char来固定长度，其他的信息用varchar可以节省存储空间
```
## MySQL操作指令
```sql
CREATE DATABASE SZ1Z
USE SZ1Z
CREATE TABLE 系 (S
    系号 CHAR(4) PRIMARY KEY,
    系名 VARCHAR(50),
    系主任 VARCHAR(20)
);

CREATE TABLE 教师 (
    教师号 CHAR(8) PRIMARY KEY,
    教师名 VARCHAR(20),
    职称 VARCHAR(10),
    系号 CHAR(4)
);

CREATE TABLE 学生 (
    学号 CHAR(10) PRIMARY KEY,
    姓名 VARCHAR(20),
    年龄 INT,
    性别 CHAR(2),
    系号 CHAR(4)
);

CREATE TABLE 课程 (
    课程号 CHAR(8) PRIMARY KEY,
    课程名 VARCHAR(50),
    学分 INT,
    教师号 CHAR(8)
);

CREATE TABLE 科研项目 (
    项目号 CHAR(10) PRIMARY KEY,
    名称 VARCHAR(100),
    负责人 CHAR(8)
);

CREATE TABLE 教师项目关联 (
    教师号 CHAR(8),
    项目号 CHAR(10),
    排名 INT,
    PRIMARY KEY (教师号, 项目号)
);

CREATE TABLE 学生选课关联 (
    学号 CHAR(10),
    课程号 CHAR(8),
    成绩 INT,
    PRIMARY KEY (学号, 课程号)
);
```
**插入数据指令**
```sql
-- 系
INSERT INTO 系 VALUES ('D001', '计算机系', '张伟');
INSERT INTO 系 VALUES ('D002', '数学系', '李芳');

-- 教师
INSERT INTO 教师 VALUES ('T001', '王明', '教授', 'D001');
INSERT INTO 教师 VALUES ('T002', '刘洋', '副教授', 'D001');

-- 学生
INSERT INTO 学生 VALUES ('S2023001', '赵磊', 20, '男', 'D001');
INSERT INTO 学生 VALUES ('S2023002', '孙婷', 19, '女', 'D001');

-- 课程
INSERT INTO 课程 VALUES ('C101', '数据库原理', 3, 'T001');
INSERT INTO 课程 VALUES ('C102', '数据结构', 4, 'T002');

-- 科研项目
INSERT INTO 科研项目 VALUES ('P202501', '智能数据库研究', 'T001');

-- 教师项目关联
INSERT INTO 教师项目关联 VALUES ('T001', 'P202501', 1);
INSERT INTO 教师项目关联 VALUES ('T002', 'P202501', 2);

-- 学生选课关联
INSERT INTO 学生选课关联 VALUES ('S2023001', 'C101', 88);
INSERT INTO 学生选课关联 VALUES ('S2023002', 'C101', 85);
```