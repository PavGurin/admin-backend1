import fs from 'fs';
import path from 'path';
import Rabbit from 'amqplib';
import * as R from 'ramda';

const { MEDIA_STORAGE, MEDIA_STORAGE_2 } = process.env;

const readStore = (p) => R.pipe(
  fs.readdirSync,
  R.map((filmFolder) => ({
    films: fs.readdirSync(path.join(p, filmFolder)),
    id: +filmFolder.split('-')[0],
    path: path.join(p, filmFolder),
  })),
)(p);

const films = R.groupBy(R.prop('id'))(
  [
    ...readStore(MEDIA_STORAGE),
    ...readStore(MEDIA_STORAGE_2),
  ],
);

const findNewestFile = (arr) => arr.map(
  (name) => ({
    name,
    birthday: fs.statSync(name).birthtimeMs,
  }),
).reduce((accum, item) => (accum.birthday > item.birthday ? accum : item),
  { birthday: Number.MIN_SAFE_INTEGER }).name;

const transform = R.pipe(
  R.toPairs,
  R.map(([id, value]) => {
    const result = {};

    value.forEach((item) => {
      item.films.forEach((name) => {
        if (!['1080.mp4', '720.mp4', '480.mp4'].includes(name)) {
          console.error(item.path);
        }

        const quality = name.split('.')[0];
        const filmPath = path.join(item.path, name);

        if (!result[quality]) {
          result[quality] = {
            watermarked: false,
            versions: [filmPath],
          };
        } else {
          result[quality].versions.push(filmPath);
        }

        result[quality].actual = findNewestFile(result[quality].versions);
      });
    });

    return [id, result];
  }),
  R.fromPairs,
);

const MAIN_MAP = transform(films);

const shallConvertFilm = (film) => {
  if (Object.values(film).length === 1) {
    console.log(film);
    return film[1080].actual;
  }
  return false;
};

const files = R.pipe(
  R.toPairs,
  R.map(([key, value]) => ([
    key, shallConvertFilm(value),
  ])),
  R.filter(([_, value]) => value),
)(MAIN_MAP);

console.log(JSON.stringify(files));

const badFilms = [];

for (let i = 0; i < files.length; i++) {
  const [filmId, filmPath] = files[i];

  try {
    const { size } = fs.statSync(path.join(filmPath));

    badFilms.push({
      filmId,
      size,
      filmPath,
    });
  } catch (e) {
    console.log(filmPath);
  }
}

console.log(`Found ${badFilms.length} films`);

const sleep = (t) => new Promise((res) => setTimeout(res, t));
(async () => {
  const connection = await Rabbit.connect(process.env.RABBIT_URL);

  const channel = await connection.createChannel();

  await channel.assertQueue('download-tasks');

  for (let i = 0; i < badFilms.length; i++) {
    const payload = {
      id: badFilms[i].filmId,
      size: badFilms[i].size,
      path: badFilms[i].filmPath,
      webPath: badFilms[i].filmPath.replace('/opt/1win', ''),
    };

    channel.sendToQueue('download-tasks', Buffer.from(JSON.stringify(payload)));
    await sleep(10);
  }

  console.log('Filling queue done with %d films', badFilms.length);
  await sleep(1e3);

  await channel.close();
  await connection.close();
})();
