import Router from 'koa-router';
import getPendingFilms from './getPendingFilms.mjs';
import rmConvertedFilm from './rmConvertedFilm.mjs';
import startFilmConvert from './startFilmConvert.mjs';
import getToken from './getToken.mjs';
import publishSerial from './publishSerial.mjs';

const router = new Router({
  prefix: '/api',
});

export default router
  .get('/list', getPendingFilms)
  .delete('/:filmPath', rmConvertedFilm)
  .post('/:filmPath', startFilmConvert)
  .get('/token', getToken)
  .get('/serial/publish', publishSerial);
