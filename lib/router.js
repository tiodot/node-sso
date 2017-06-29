/**
 * Created by swxy on 2017/6/28.
 */

const Router = require('koa-router');
const debug = require('debug')('node-sso');

const cryptoCookie = require('./cryptoCookie');

const account = require('../data/user.json');
const config = require('../config.json');

const router = new Router();

module.exports = router;

router.get('/', detail);

router.get('/login', async (ctx) => {
    if (getToken(ctx)) {
        await ctx.redirect('/');
    }
    else {
        await ctx.render('index', {title: 'koa-login'});
    }
});

router.get('/logout', async (ctx) => {
    ctx.cookies.set('token', '', {
        domain: config.domain,
        expires: new Date('1970-1-1')
    });
    await ctx.redirect('/login');
});

router.post('/login', async (ctx) => {
    const data = ctx.request.body;
    debug('validate data: ', isValid(data));
    if (!isValid(data)) {
        ctx.body = {
            code: 1,
            msg: '帐号或者密码不正确'
        };
        return;
    }
    debug('received data: ', data);
    // set Cookie
    ctx.cookies.set('token', cryptoCookie.encrypt(data.name), {
        domain: config.domain,
        signed: true
    });
    ctx.body = {
        code: 0,
        msg: '登录成功',
        url: '/detail'
    }
});

router.get('/detail', detail);

/**
 * 验证Cookie信息是否正确。
 */
router.get('/validate', async (ctx) => {
    const query = ctx.query;
    debug('validate query: ', query);
    const name = cryptoCookie.decrypt(query.token);
    if (isExist(name)) {
        ctx.body = {
            code: 0,
            msg: 'success',
            name: name
        }
    }
    else {
        ctx.body = {
            code: 1,
            msg: 'error'
        }
    }
});

async function detail (ctx) {
    debug(ctx.keys);
    const name = cryptoCookie.decrypt(getToken(ctx));
    debug('detail: ', name);
    await ctx.render('detail', {
        title: 'koa-detail',
        content: name
    });
}

function getToken(ctx) {
    return ctx.cookies.get('token', {signed: true});
}

function isValid(data) {
    return account.some((acc) => (acc.name === data.name && acc.password === data.password));
}

function isExist(name) {
    return account.some((acc) => (acc.name === name));
}