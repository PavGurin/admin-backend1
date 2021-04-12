import Koa from 'koa';
import api from './api/index';


console.log(process.env);

new Koa()
    .use(api.routes())
    .listen(process.env.WEB_PORT);
