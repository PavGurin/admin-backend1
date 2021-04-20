import Rabbit from 'amqplib';
import * as fs from '../utils/fs.mjs';
import filmStore, { statuses } from './filmStore.mjs';

export default async (id, filmPath, filmName, ctx) => {
  // заглушка заменили payload ответа publish serial
  const { size } = 5400280440;
  //     await fs.statSync(fs.getPendingFilmsPath(
  //   filmPath,
  //   filmName,
  // ));

  const episodeId = filmName.slice(0, -4).split('-');
  episodeId[0] = id;

  const payload = {
    id: episodeId.join('-'),
    size,
    path: fs.getPendingFilmsPath(filmPath, filmName),
  };

  payload.webPath = payload.path.replace('/opt/1win', '');

  payload.downloadUrl = `http://${process.env.SERVER_NAME}${payload.webPath}`;

  // already wip.
  if (filmStore.getSerialStatus(filmPath, filmName) === statuses.converting) {
    return;
  }

  filmStore.setSerialStatus(filmPath, filmName, statuses.converting);

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
