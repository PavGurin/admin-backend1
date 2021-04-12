import fs from 'fs';
import path from 'path';
import util from 'util';

export const readdir = util.promisify(fs.readdir);
export const readFile = util.promisify(fs.readFile);
export const unlink = util.promisify(fs.unlink);
export const rmdir = util.promisify(fs.rmdir);
export const statSync = fs.statSync;

export const getPendingFilmsPath = (...args) =>
    path.join(process.env.PENDING_FILMS_PATH, ...args);

export const readPendingFilmsDir = (...args) => readdir(
    path.join(process.env.PENDING_FILMS_PATH, ...args)
);
