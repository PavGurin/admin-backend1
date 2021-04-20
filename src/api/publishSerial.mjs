// import * as fs from '../utils/fs.mjs';
// import filmStore from "../models/filmStore";
import * as mysql from '../utils/mysql.mjs';

export default async (ctx) => {
  const { idList } = ctx.query;

  if (!idList) {
    ctx.body = 'Provide idList';
  }

  const id = idList.split(',');

  const [
    query1,
    query2,
  ] = [
    mysql.addition.format(
      'UPDATE dle_post SET is_serial = 1 WHERE id IN (?)',
      [id],
    ),
    mysql.addition.format(
      `UPDATE kinopoisk_data 
                SET is_disabled = 0 
                WHERE filmId IN (
                    SELECT kp_id_movie FROM dle_post WHERE id IN (?)
            )`,
      [id],
    ),
  ];

  console.log(query1, query2);

  await Promise.all([
    mysql.addition.query(query1),
    mysql.addition.query(query2),
  ]);

  ctx.body = 'ok';
};
