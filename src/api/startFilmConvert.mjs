import R from 'ramda';
import * as fs from '../utils/fs.mjs';
import publishFilm from '../models/publishFilm.mjs';
import publishSerial from '../models/publishSerial.mjs';

export default async (ctx) => {
  const { filmPath, debug = false } = ctx.params;

  const id = R.pipe(
    R.split('-'),
    R.nth(0),
    Number,
  )(filmPath);

  const files = await fs.readPendingFilmsDir(filmPath);

  for (let i = 0; i < files.length; i++) {
    const film = files[i];
    if (!film.includes('mp4')) { continue; }

    const params = film.slice(0, -4).split('-');

    if (params.length === 1) {
      // simple film
      await publishFilm(id, filmPath, ctx);
      return;
    } if (params.length === 3) {
      await publishSerial(id, filmPath, film, ctx);
    } else {
      console.error('error with', film, params);
      ctx.throw(500);
    }
  }
};
