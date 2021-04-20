import Koa from 'koa';
import cors from '@koa/cors';
import api from './api/index.mjs';
import { config } from './config';

console.log(process.env);

new Koa()
  .use(cors())
  .use(api.routes())
  .listen(config.webPort);
