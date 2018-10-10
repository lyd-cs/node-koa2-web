# koa-web 项目部署

## 开发环境

### 安装 node.js

1.  windows 下载 LTS 版本进行安装，下载地址 https://nodejs.org/en/
2.  安装 `cnpm` , `cnpm` 是淘宝定制的 `npm` ,开发模式下使用 `cnpm` 代替 `npm` 进行 node 包管理
    ```
    $ npm install -g cnpm --registry=https://registry.npm.taobao.org
    ```
3.  安装开发依赖包
    ```
    $ cnpm install -g gulp nodemon stylus
    ```

### 调试

复制 `setting.bak.js` 到 `setting.js`

```bash
# 安装依赖
$ npm install
```

```bash
# 自动编译js,css
$ npm run watch
```

```bash
# livreload
$ npm run livereload
```

```bash
# 启动服务
$ npm run dev
```

## 线上部署

### 安装 node.js

```bash
# 安装 gcc c++ 编译器,centos7 需要
$ sudo yum -y install gcc-c++

# 安装 `node` 管理器 `nvm` 以方便安装 `node`
# https://github.com/creationix/nvm
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

# 更新 `.bashrc` 以便 `nvm` 生效
$ source .bashrc

# 安装 node v8.11.3
$ nvm install v8.11.3

# node 进程管理 pm2 编译工具 gulp
$ npm install -g pm2 gulp
```

### 部署项目

```
# 上传项目文件包
$ rz mgmt.zip web.zip

# 解压项目到相应目录
$ unzip -o -d /var/www/web/ ./web.zip
$ unzip -o -d /var/www/mgmt/ ./mgmt.zip

# 软连接 /upload目录
$ ln -s /upload /var/www/web/static/upload
$ ln -s /upload /var/www/mgmt/public/upload

# 编译项目 web 项目
$ cd /var/www/web
$ npm install
$ gulp build

# 上传 web 配置
$ rz setting.js

# 检查 setting 配置，注意 redis, apiBase
$ vi setting.js

# 编译项目 mgmt 项目
$ cd /var/www/mgmt
$ npm install
$ npm run build

# 上传 mgmt 配置
$ rz config.js

# 检查 config 配置, 注意 redis, apiBase
$ vi config.js
```

### 启动项目

```
# 上传 web 项目 进程配置
$ cd /var/www/web
$ rz web3000.json api3100.json mobile3300.json

# 启动 web 项目
$ pm2 start web3000.json api3100.json mobile3300.json

# 上传 mgmt 项目 进程配置
$ cd /var/www/mgmt
$ rz mgmt.json

# 启动 mgmt 项目
$ pm2 start mgmt.json
```
