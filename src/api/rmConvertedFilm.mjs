import * as fs from '../utils/fs.mjs';
import filmStore from "../models/filmStore.mjs";
import * as mysql from "../utils/mysql.mjs";

export default async (ctx) => {
    const { filmPath } = ctx.params;


    const { filmId } = await mysql.addition.queryRow('SELECT kp_id_movie as filmId FROM dle_post WHERE ?', {
        id: filmPath.split('-')[0],
    });

    await mysql.addition.query(
        'UPDATE kinopoisk_data SET is_disabled = 0 WHERE ?', {
            filmId,
        }
    );

    filmStore.setFilm(filmPath, 'DONE');

    await fs.unlink(fs.getPendingFilmsPath(
        filmPath,
        '1080.mp4',
    ));

    ctx.body = 'ok';
};
