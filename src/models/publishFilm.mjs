import Rabbit from 'amqplib';
import * as fs from '../utils/fs.mjs';
import filmStore, { statuses } from './filmStore.mjs';

export default async (id, filmPath, ctx) => {
  // заглушка для publishFilm
  const { size } = 5400280440;
  //     await fs.statSync(fs.getPendingFilmsPath(
  //   filmPath,
  //   '1080.mp4',
  // ));

  const payload = {
    id,
    size,
    path: fs.getPendingFilmsPath(filmPath, '1080.mp4'),
  };

  payload.webPath = payload.path.replace('/opt/1win', '');

  payload.downloadUrl = `http://${process.env.SERVER_NAME}${payload.webPath}`;

  filmStore.setFilm(filmPath, statuses.converting);

  // const connection = await Rabbit.connect(process.env.RABBIT_URL);
  //
  // const channel = await connection.createChannel();
  //
  // await channel.assertQueue('download-tasks');
  //
  // channel.sendToQueue('download-tasks', Buffer.from(JSON.stringify(payload)));
  //
  // await channel.close();
  //
  // await connection.close();

  ctx.body = payload;
};
