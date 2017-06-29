/**
 * Created by swxy on 2017/6/28.
 */

const Koa = require('koa');
const debug = require('debug')('node-sso-sub');
const http = require('http');
const hbs = require('koa-hbs');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const Router = require('koa-router');

const router = new Router();

const app = new Koa();

app.use(hbs.middleware({
    viewPath: path.resolve(__dirname, './views')
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
    const cookie = ctx.cookies.get('token');
    debug('get token: ', cookie);
    if (!cookie) {
        ctx.state.isLogin = false;
    }
    else {
        await new Promise((resolve, reject) => {
            http.request({
                host: 'local.com',
                port: 3000,
                path: '/validate?token=' + cookie,
                method: 'get',
                headers: {
                    'Cookie': ctx.request.headers.cookie
                }
            }, (res) => {
                res.setEncoding('utf8');
                let data;
                res.on('data', (chunk) => {
                    debug('body chunk', chunk);
                    data = JSON.parse(chunk);
                });
                res.on('end', () => {
                    resolve(data);
                });
            }).end();
        }).then((res) => {
            if (res.code !== 0) {
                ctx.state.isLogin = false;
            }
            else {
                ctx.state.isLogin = true;
                ctx.state.name = res.name;
            }
        });
    }
    debug('state: ', ctx.state);
    await next();
});

router.get('/', async (ctx) => {
    const data = Object.assign({}, ctx.state);
    data.title = 'sub-domain';
    debug('render data: ', data);
    await ctx.render('index', data);
});

router.get('/logout', async (ctx) => {
    await ctx.redirect('http://local.com:3000/logout');
});

router.get('/login', async (ctx) => {
    await ctx.redirect('http://local.com:3000/login');
});

app
    .use(router.routes())
    .use(router.allowedMethods());

http.createServer(app.callback()).listen(3001, () => {
    debug('listen http at: ', 3001);
});
