import fs from 'fs';
import { getPendingFilmsPath } from '../utils/fs.mjs';

export const statuses = {
  pending: 'PENDING',
  converting: 'CONVERTING',
  done: 'DONE',
};

class FilmStatuses {
  constructor() {
    this.statuses = {};
    this.path = getPendingFilmsPath('status.json');
    this.readStatusFile().catch(console.error);
  }

  async readStatusFile() {
    const configBuffer = fs.readFileSync(this.path);
    this.statuses = JSON.parse(configBuffer.toString());
  }

  async writeStatusFile() {
    fs.writeFileSync(this.path, JSON.stringify(this.statuses));
  }

  getFilm(name) {
    return this.statuses[name] || statuses.pending;
  }

  setFilm(name, status) {
    this.statuses[name] = status;
    this.writeStatusFile().catch(console.error);
  }

  setSerialStatus(name, file, status) {
    this.statuses[name] = this.statuses[name] || {};
    this.statuses[name][file] = status;
    this.writeStatusFile().catch(console.error);
  }

  getSerialStatus(name, file) {
    return (this.statuses[name] || {})[file];
  }
}

export default new FilmStatuses();
