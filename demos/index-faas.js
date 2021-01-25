// 阿里云FaaS部署，从'@webserverless/fc-express'获取Server对象
const { Server } = require('@webserverless/fc-express');
// 主进程代码
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { accessKeySecret } = require('./aliyunConfig');
// 初始化当前用户
const me = {
  name: 'ABC',
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  userid: '00000001',
  email: 'ABC@me.com',
  signature: '1234567890',
  title: '全栈工程师',
  group: '某厂－某事业群－某平台部－某技术部－中台团队',
  tags: [{
    key: '0',
    label: '全栈',
  }],
  notifyCount: 12,
  unreadCount: 11,
  country: 'China',
  geographic: {
    province: {
      label: '浙江省',
      key: '330000',
    },
    city: {
      label: '杭州市',
      key: '330100',
    },
  },
  address: '余杭区某小区',
  phone: '0752-26888xxxx',
};

const app = express();
// 静态资源路由
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/api/currentUser', (req, resp) => {
  const jwtToken = jwt.sign({ data: me.name }, accessKeySecret, { expiresIn: '1h' });
  resp.cookie('jwtToken', jwtToken);
  resp.json(me);
});

// SPA单页应用，默认加载index.html
app.all("/*", (req, resp) => {
  resp.setHeader('Content-Type', 'text/html');
  resp.send(fs.readFileSync('./public/index.html', 'utf8'));
});
// 阿里云FaaS部署
const server = new Server(app);
module.exports.handler = function(req, res, context) {
  server.httpProxy(req, res, context);
};
