# Kubernetes

- [Kubernetes](#kubernetes)
  - [1. Docker容器技术基础](#1-docker容器技术基础)
    - [1.1. Docker 的安装](#11-docker-的安装)
    - [1.2. image 文件](#12-image-文件)
    - [1.3. 实例](#13-实例)
    - [1.4. 容器文件](#14-容器文件)
    - [1.5. 制作自己的 Docker 容器](#15-制作自己的-docker-容器)
      - [1.5.1. 编写 Dockerfile 文件](#151-编写-dockerfile-文件)
      - [1.5.2. 创建 image 文件](#152-创建-image-文件)
      - [1.5.3. 生成容器](#153-生成容器)
      - [1.5.4. CMD 命令](#154-cmd-命令)
      - [1.5.5. 发布 image 文件](#155-发布-image-文件)
  - [2. Kubernetes基础知识](#2-kubernetes基础知识)
  - [3. Kubernetes 集群的搭建与实践](#3-kubernetes-集群的搭建与实践)
  - [4. 容器编排与 Kubernetes 核心特性剖析](#4-容器编排与-kubernetes-核心特性剖析)

## 1. Docker容器技术基础

官网：https://docs.docker.com/  

Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。  

Docker 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样。有了 Docker，就不用担心环境问题。Docker 的接口相当简单，用户可以方便地创建和使用容器，把自己的应用放入容器。容器还可以进行版本管理、复制、分享、修改，就像管理普通的代码一样。  

Docker 的主要用途，目前有三大类：

1. 提供一次性的环境。比如，本地测试他人的软件、持续集成的时候提供单元测试和构建的环境。
2. 提供弹性的云服务。因为 Docker 容器可以随开随关，很适合动态扩容和缩容。
3. 组建微服务架构。通过多个容器，一台机器可以跑多个服务，因此在本机就可以模拟出微服务架构。

### 1.1. Docker 的安装

见官网：https://docs.docker.com/get-docker/  

安装完成后，运行下面的命令，验证是否安装成功。

```text
$ docker version
# 或者
$ docker info
```

Docker 需要用户具有 sudo 权限，为了避免每次命令都输入sudo，可以把用户加入 Docker 用户组, [官方文档](https://docs.docker.com/engine/install/linux-postinstall/）。

```text
$ sudo usermod -aG docker $USER
```

命令行运行docker命令的时候，需要本机有 Docker 服务。如果这项服务没有启动，可以用下面的命令启动, [官方文档](https://docs.docker.com/config/daemon/systemd/)。

```text
# service 命令的用法
$ sudo service docker start

# systemctl 命令的用法
$ sudo systemctl start docker
```

### 1.2. image 文件

Docker 把应用程序及其依赖，打包在 image 文件里面。只有通过这个文件，才能生成 Docker 容器。image 文件可以看作是容器的模板。Docker 根据 image 文件生成容器的实例。同一个 image 文件，可以生成多个同时运行的容器实例。  
image 是二进制文件。实际开发中，一个 image 文件往往通过继承另一个 image 文件，加上一些个性化设置而生成。举例来说，你可以在 Ubuntu 的 image 基础上，往里面加入 Apache 服务器，形成你的 image。  

```text
# 列出本机的所有 image 文件。
$ docker image ls

# 删除 image 文件
$ docker image rm [imageName]
```

image 文件是通用的，一台机器的 image 文件拷贝到另一台机器，照样可以使用。一般来说，为了节省时间，我们应该尽量使用别人制作好的 image 文件，而不是自己制作。即使要定制，也应该基于别人的 image 文件进行加工，而不是从零开始制作。  s

为了方便共享，image 文件制作完成后，可以上传到网上的仓库。Docker 的官方仓库 [Docker Hub](https://hub.docker.com/) 是最重要、最常用的 image 仓库。此外，出售自己制作的 image 文件也是可以的。  

### 1.3. 实例

最简单的 image 文件"hello world"(https://hub.docker.com/_/hello-world).  

国内连接 Docker 的官方仓库很慢，还会断线，需要将默认仓库改成国内的镜像网站, 打开/etc/default/docker文件（需要sudo权限），在文件的底部加上一行。

```text
DOCKER_OPTS="--registry-mirror=https://registry.docker-cn.com"
```

然后，重启 Docker 服务。

```text
$ sudo service docker restart
```

现在就会自动从镜像仓库下载 image 文件了。

1. 首先，运行下面的命令，将 image 文件从仓库抓取到本地。

```text
$ docker image pull library/hello-world
```

docker image pull是抓取 image 文件的命令。library/hello-world是 image 文件在仓库里面的位置，其中library是 image 文件所在的组，hello-world是 image 文件的名字。  

由于 Docker 官方提供的 image 文件，都放在[library](https://hub.docker.com/u/library)组里面，所以它的是默认组，可以省略。因此，上面的命令可以写成下面这样。

```text
$ docker image pull hello-world
```

抓取成功以后，就可以在本机看到这个 image 文件了。

```text
$ docker image ls
```

现在，运行这个 image 文件。

```text
$ docker container run hello-world
```

docker container run命令会从 image 文件，生成一个正在运行的容器实例。  

> 注意，docker container run命令具有自动抓取 image 文件的功能。如果发现本地没有指定的 image 文件，就会从仓库自动抓取。因此，前面的docker image pull命令并不是必需的步骤。  

### 1.4. 容器文件

image 文件生成的容器实例，本身也是一个文件，称为容器文件。也就是说，一旦容器生成，就会同时存在两个文件： image 文件和容器文件。而且关闭容器并不会删除容器文件，只是容器停止运行而已。  

```text
# 列出本机正在运行的容器
$ docker container ls

# 列出本机所有容器，包括终止运行的容器
$ docker container ls --all
```

终止运行的容器文件，依然会占据硬盘空间，可以使用docker container rm命令删除。

```text
$ docker container rm [containerID]
```

运行上面的命令之后，再使用docker container ls --all命令，就会发现被删除的容器文件已经消失了。

### 1.5. 制作自己的 Docker 容器

#### 1.5.1. 编写 Dockerfile 文件  

在项目的根目录下，新建一个文本文件.dockerignore，写入下面的内容。

```text
.git
node_modules
npm-debug.log
```

上面代码表示，这三个路径要排除，不要打包进入 image 文件。如果你没有路径要排除，这个文件可以不新建。  

然后，在项目的根目录下，新建一个文本文件 Dockerfile，写入下面的内容。  

```text
FROM node:10.15.0
COPY . /app
WORKDIR /app
RUN npm install --registry=https://registry.npm.taobao.org
EXPOSE 7777
```

1. FROM node:10.15.0：该 image 文件继承官方的 node image，冒号表示标签，这里标签是10.15.0，即10.15.0版本的 node。  
2. COPY . /app：将当前目录下的所有文件（除了.dockerignore排除的路径），都拷贝进入 image 文件的/app目录。  
3. WORKDIR /app：指定接下来的工作路径为/app。  
4. RUN npm install：在/app目录下，运行npm install命令安装依赖。注意，安装后所有的依赖，都将打包进入 image 文件。  
5. EXPOSE 7777：将容器 7777 端口暴露出来， 允许外部连接这个端口.  

#### 1.5.2. 创建 image 文件

有了 Dockerfile 文件以后，就可以使用docker image build命令创建 image 文件了。  

```text
$ docker image build -t docker-demo .
# 或者
$ docker image build -t docker-demo:0.0.1 .
```

-t参数用来指定 image 文件的名字，后面还可以用冒号指定标签。如果不指定，默认的标签就是latest。最后的那个点表示 Dockerfile 文件所在的路径，上例是当前路径，所以是一个点。  

如果运行成功，就可以看到新生成的 image 文件docker-demo了。

```text
$ docker image ls
```

#### 1.5.3. 生成容器

docker container run命令会从 image 文件生成容器。

```text
$ docker container run -p 8000:7777 -it docker-demo /bin/bash
# 或者
$ docker container run -p 8000:7777 -it docker-demo:0.0.1 /bin/bash
```

1. -p参数：容器的 7777 端口映射到本机的 8000 端口。
2. -it参数：容器的 Shell 映射到当前的 Shell，然后你在本机窗口输入的命令，就会传入容器。
3. docker-demo:0.0.1：image 文件的名字（如果有标签，还需要提供标签，默认是 latest 标签）。
4. /bin/bash：容器启动以后，内部第一个执行的命令。这里是启动 Bash，保证用户可以使用 Shell。

如果一切正常，运行上面的命令以后，就会返回一个命令行提示符。  

```text
root@66d80f4aaf1e:/app#
```

这表示你已经在容器里面了，返回的提示符就是容器内部的 Shell 提示符。执行下面的命令。

```text
root@66d80f4aaf1e:/app# node app/index.js
```

打开本机的浏览器，访问 http://127.0.0.1:8000.  

Node 进程运行在 Docker 容器的虚拟环境里面，进程接触到的文件系统和网络接口都是虚拟的，与本机的文件系统和网络接口是隔离的，因此需要定义容器与物理机的端口映射（map）。  

现在，在容器的命令行，按下 Ctrl + c 停止 Node 进程，然后按下 Ctrl + d （或者输入 exit）退出容器。此外，也可以用docker container kill终止容器运行。  

```text
# 在本机的另一个终端窗口，查出容器的 ID
$ docker container ls

# 停止指定的容器运行
$ docker container kill [containerID]
```

容器停止运行之后，并不会消失，用下面的命令删除容器文件。

```text
# 查出容器的 ID
$ docker container ls --all

# 删除指定的容器文件
$ docker container rm [containerID]
```

也可以使用docker container run命令的--rm参数，在容器终止运行后自动删除容器文件。

```text
$ docker container run --rm -p 8000:7777 -it docker-demo /bin/bash
```

#### 1.5.4. CMD 命令

容器启动以后，需要手动输入命令node app/index.js, 可以把这个命令写在 Dockerfile 里面，这样容器启动以后，这个命令就已经执行了，不用再手动输入了。

```text
FROM node:10.15.0
COPY . /app
WORKDIR /app
RUN npm install --registry=https://registry.npm.taobao.org
EXPOSE 7777
CMD node app/index.js
```

RUN命令与CMD命令的区别在哪里？简单说，RUN命令在 image 文件的构建阶段执行，执行结果都会打包进入 image 文件；CMD命令则是在容器启动后执行。另外，一个 Dockerfile 可以包含多个RUN命令，但是只能有一个CMD命令。  

注意，指定了CMD命令以后，docker container run命令就不能附加命令了（比如前面的/bin/bash），否则它会覆盖CMD命令。现在，启动容器可以使用下面的命令。  

```text
$ docker container run --rm -p 8000:7777 -it docker-demo:0.0.1
```

#### 1.5.5. 发布 image 文件

容器运行成功后，就确认了 image 文件的有效性。这时，我们就可以考虑把 image 文件分享到网上，让其他人使用。

首先，去 hub.docker.com 或 cloud.docker.com 注册一个账户。然后，用下面的命令登录。

```text
$ docker login
```

接着，为本地的 image 标注用户名和版本。

```text
$ docker image tag [imageName] [username]/[repository]:[tag]
# 实例
$ docker image tag docker-demo:0.0.1 spiderT docker-demo:0.0.1
```

也可以不标注用户名，重新构建一下 image 文件。

```text
$ docker image build -t [username]/[repository]:[tag] .
```

最后，发布 image 文件。

```
$ docker image push [username]/[repository]:[tag]
```

发布成功以后，登录 hub.docker.com，就可以看到已经发布的 image 文件。  

## 2. Kubernetes基础知识



## 3. Kubernetes 集群的搭建与实践




## 4. 容器编排与 Kubernetes 核心特性剖析
