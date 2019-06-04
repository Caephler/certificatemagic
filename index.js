const Koa = require('koa');
const https = require('https');
const router = require('koa-router');
const views = require('koa-views');
const fs = require('fs');
const { default: enforceHttps } = require('koa-sslify');
const { flipTheSwitch, getIsFlipped, doesFlipExist, clearFlip, createFlip, getFlipMap } = require('./flip');
const { generateNewCert } = require('./sslgen');

const startServer = () => {
  console.log('[Server] Starting server.');
  const app = new Koa();
  app.use(views(`${__dirname}/views`, {
    extension: 'pug'
  }));

  app.use(enforceHttps({
    port: process.env.PORT
  }));

  const options = {
    key: fs.readFileSync('./localhost.key'),
    cert: fs.readFileSync('./localhost.crt')
  };

  const r = router();

  r.get('/flip/:code/:interval', (ctx, next) => {
    const internalCode = `${ctx.params.code}/${ctx.params.interval}`;
    if (!doesFlipExist(internalCode)) {
      const rawInterval = parseInt(ctx.params.interval);
      const interval = isNaN(rawInterval) ? 60 : rawInterval;
      createFlip(internalCode, interval);
    }

    if (getIsFlipped(internalCode)) {
      ctx.throw(parseInt(ctx.params.code));
    } else {
      ctx.status = 200;
    }
  });

  r.get('/flip/:code/:interval/clear', (ctx) => {
    const internalCode = `${ctx.params.code}/${ctx.params.interval}`;
    if (doesFlipExist(internalCode)) {
      clearFlip(internalCode);
    }

    ctx.redirect('/');
  })
  
  r.get('/turn/:code/:interval', (ctx) => {
    const internalCode = `${ctx.params.code}/${ctx.params.interval}`;
    flipTheSwitch(internalCode);
    ctx.status = 200;

    ctx.redirect('/');
  });

  r.get('/ssl/:numdays', (ctx, next) => {
    const numDays = ctx.params.numdays;
    generateNewCert(numDays).then(() => {
      server.close();
      startServer();
    });

    ctx.status = 200;
    ctx.redirect('/');
  })

  r.get('/', async (ctx, next) => {
    ctx.state = {
      pageTitle: 'Overview',
      flipMap: getFlipMap(),
    }
    await ctx.render('overview');
  })

  app.use(r.routes());

  const server = https.createServer(options, app.callback()).listen(process.env.PORT);

  console.log('[Server] Started server.');
  return () => server.close();
}

generateNewCert(100).then(() => {
  startServer();
});
