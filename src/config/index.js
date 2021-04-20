import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV,
  pendingFilmsPath: process.env.PENDING_FILMS_PATH,
  webPort: process.env.WEB_PORT,
};
