---
title: 安装 Python
date: 2019-11-03 12:05:21
tags: 
  - Python
  - 教程
  - Windows
  - Linux
  - macOS
categories:
  - Python
typora-root-url: ../../source/
---

##  写在前面

Python 2.x 将在「 **2020年1月1日**」停止支持，因此本文介绍的都是 Python 3.x 的安装。如果你还在用 Python 2.x，转向 Python 3.x 是一个明智的决定。

<!--more-->

## Windows 下安装

### 下载

Python 3.8.0 64位 安装包: [官网下载](https://www.python.org/ftp/python/3.7.5/python-3.7.5-amd64.exe) [百度云下载](https://pan.baidu.com/s/1QEPxt8Lf3LTEE_fnIc8oAA)

Python 3.8.0 32位 安装包: [官网下载](https://www.python.org/ftp/python/3.8.0/python-3.8.0.exe) [百度云下载](https://pan.baidu.com/s/1VCIjSfY1jDJKIBL4VQsJkQ)

**注意：Python 3.8 不支持 Windows XP 及更早期系统**

### 安装

双击下载的安装包即可开始安装。

![准备安装 Python](/images/How-to-Install-Python/image-20191103132315293.png)

如果你不熟悉如何设置环境变量可以勾选自动添加 Python 环境变量，若你需要安装多个 Python 版本请谨慎添加环境变量，否则会造成版本管理困难。

点击「**Insatall Now**」开始安装。

### 安装完成

![安装完成](/images/How-to-Install-Python/image-20191104123856064.png)

点击「**Close**」关闭安装窗口。

### 验证安装

Python 3.8.0 默认安装在 `C:\Users\<用户名>\AppData\Local\Programs\Python\Python38` 目录，其中 `<用户名>` 是当前登录的用户名。该目录下有 `python.exe` 可执行文件，双击可打开 Python 的交互式命令行。如果已经配置环境变量可以在 `cmd` 中直接使用 `python` 命令完成上面的操作，或者使用 `python --version` 命令查看 Python 版本。

![Python 交互式命令行](/images/How-to-Install-Python/image-20191104124631417.png)

## Linux 下安装

在很多 Linux 发行版中 Python 已经内置，可以通过 `python`  命令来判断是否已安装 Python 及版本。若没有安装需要下载源代码自行编译，这需要一定的 Linux 管理经验，这里不展开介绍。Ubuntu 中可以使用 `sudo apt-get install python3.7` 直接安装 Python 3.7，如果你使用的发行版包管理提供安装也可以通过类似方法安装，否则需要自行编译源代码。

##  macOS 下安装 [^1] 

### 下载安装程序安装

Python 3.8.0 macOS 安装包: [官网下载](https://www.python.org/ftp/python/3.8.0/python-3.8.0-macosx10.9.pkg) [百度云下载](https://pan.baidu.com/s/1KofWqeNkaYYHZFjfwdDPZQ)

下载后双击运行并安装 。

### 使用命令行安装

如果安装了 [Homebrew](https://brew.sh/)，直接通过命令 `brew install python3` 安装即可 。

[^1]: [https://www.liaoxuefeng.com/wiki/1016959663602400/1016959856222624](https://www.liaoxuefeng.com/wiki/1016959663602400/1016959856222624)	"安装Python - 廖雪峰的官方网站"

