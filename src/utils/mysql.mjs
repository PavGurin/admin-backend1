import util from 'util';
import mysql from 'mysql';

const config = process.env;
const poolGen = (config) => {
    const pool = mysql.createPool(config);

    pool.query = util.promisify(pool.query);
    pool.queryRow = (...q) => pool.query(...q).then(r => r[0]);
    pool.format = mysql.format;

    return pool;
};

export const main = poolGen({
    host: config.MYSQL_HOST,
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DATABASE,
});

export const addition = poolGen({
    host: config.TV_MYSQL_HOST,
    user: config.TV_MYSQL_USER,
    password: config.TV_MYSQL_PASSWORD,
    database: config.TV_MYSQL_DATABASE,
});
