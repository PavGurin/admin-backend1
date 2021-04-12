import Router from 'koa-router';
import getPendingFilms from './getPendingFilms';
import rmConvertedFilm from './rmConvertedFilm';
import startFilmConvert from './startFilmConvert';
import getToken from './getToken';
import publishSerial from './publishSerial';

const router = new Router({
    prefix: '/api',
});


export default router
    .get('/list', getPendingFilms)
    .delete('/:filmPath', rmConvertedFilm)
    .post('/:filmPath', startFilmConvert)
    .get('/token', getToken)
    .get('/serial/publish', publishSerial);
