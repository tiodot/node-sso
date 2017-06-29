/**
 * Created by swxy on 2017/6/26.
 */

const Koa = require('koa');
const debug = require('debug')('node-sso');
const hbs = require('koa-hbs');
const http = require('http');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const router = require('./router');

const app = new Koa();

app.keys = ['im a newer secret', 'i like turtle'];

app.use(hbs.middleware({
    viewPath:path.resolve( __dirname, '../views')
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
    const cookie = ctx.cookies.get('token', {signed: true});
    debug(cookie);
    if (!cookie && ctx.request.path !== '/login') {
        debug('redirect to login');
        await ctx.redirect('/login');
    }
    else {
        await next();
    }
});


app
    .use(router.routes())
    .use(router.allowedMethods());



http.createServer(app.callback()).listen(3000, () => {
    debug('listen http at: ', 3000);
});
/*
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('./cert/privatekey.pem'),
    cert: fs.readFileSync('./cert/certificate.pem')
};

https.createServer(options, app.callback()).listen(3005, () => {
    debug('listen https at port: ', 3005);
});
*/