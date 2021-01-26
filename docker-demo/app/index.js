const fs = require("fs.promised");
const Koa = require("koa");
const app = new Koa();

const main = async function (ctx) {
  ctx.response.type = "html";
  ctx.response.body = await fs.readFile("./index.html", "utf8");
};

app.use(main);
app.listen(7777);
