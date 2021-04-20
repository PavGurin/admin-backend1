import fs from 'fs';
import path from 'path';
import util from 'util';
import { config } from '../config';

export const readdir = util.promisify(fs.readdir);
export const readFile = util.promisify(fs.readFile);
export const unlink = util.promisify(fs.unlink);
export const rmdir = util.promisify(fs.rmdir);
export const { statSync } = fs;

export const getPendingFilmsPath = (...args) => path.join(config.pendingFilmsPath, ...args);

export const readPendingFilmsDir = (...args) => readdir(
  path.join(config.pendingFilmsPath, ...args),
);
