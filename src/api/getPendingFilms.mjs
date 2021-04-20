import R from 'ramda';
import * as fs from '../utils/fs.mjs';
import { getPendingFilmsPath } from '../utils/fs.mjs';
import filmStore from '../models/filmStore.mjs';

const getId = R.pipe(
  R.prop('name'),
  R.split('-'),
  R.nth(0),
  Number,
);

export default async (ctx) => {
  const files = await fs.readdir(getPendingFilmsPath());
  ctx.body = files.filter((n) => n !== 'status.json' && n !== '1.txt').map((name) => (
    {
      name,
      status: filmStore.getFilm(name),
    })).sort((a, b) => {
    const [aId, bId] = [getId(a), getId(b)];
    return bId - aId;
  });
};
