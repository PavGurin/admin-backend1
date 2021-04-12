import fs from 'fs';
import Rabbit from 'amqplib';
import convertTask from './convertTask';
import wget from './utils/wget';
import cp from './utils/child_process';
import CheckDiskSpace from 'check-disk-space';

const getFilmMeta = (id) => `/opt/1win/media/${id}.json`;

const getOutputDownloadPath = f => `/opt/1win/media/${f}-1080-src.mp4`;
const getOutputConvertPath = (f, q) => `/opt/1win/media/${f}-${q}.mp4`;

const getInputConvertPath = f => `/opt/1win/media/${f}-1080-src.mp4`;

const {
    RABBIT_URL,
    DOWNLOAD_TASKS,
    CUDA,
    DC_HOST,
    TASKS_PER_GPU,
} = process.env;

const gb = s => s / 1024 / 1024 / 1024;

(async () => {

    const connection = await Rabbit.connect(RABBIT_URL);

    if (+CUDA === 0) {
        const downloadChannel = await connection.createChannel();

        downloadChannel.prefetch(+DOWNLOAD_TASKS || 1);

        console.log('Started download daemon');


        downloadChannel.consume('download-tasks', async msg => {
            try {

                const space = await CheckDiskSpace('/');

                if (gb(space.free) < 80) {
                    setTimeout(() => {
                        downloadChannel.nack(msg);
                    }, 5 * 60 * 1e3);
                    return;
                }

                const {id: filmId, size: filmSize, downloadUrl} = JSON.parse(msg.content.toString());

                const start = Date.now();
                console.log(`Got download task for ${filmId}`, Date.now());

                await wget(downloadUrl, getOutputDownloadPath(filmId));

                fs.writeFileSync(getFilmMeta(filmId), JSON.stringify({
                    720: false,
                    1080: false,
                    480: false,
                }));
                console.log(`Done download task for ${filmId} in ${(Date.now() - start) / 1e3}s`, Date.now());

                const {size: factDownloadSize} = fs.statSync(getOutputDownloadPath(filmId));

                if (filmSize !== factDownloadSize) {
                    console.log(`Some problems with film #${filmId} download.`);

                    cp
                        .exec(`rm -rf ${getOutputDownloadPath(filmId)}`)
                        .catch(console.error);

                    await downloadChannel.nack(msg);
                    return;
                }


                const ch = await connection.createChannel();

                await ch.assertQueue(`${DC_HOST}-convert-tasks`);

                await ch.sendToQueue(`${DC_HOST}-convert-tasks`, Buffer.from(`${filmId}-720`));
                await ch.sendToQueue(`${DC_HOST}-convert-tasks`, Buffer.from(`${filmId}-480`));
                await ch.sendToQueue(`${DC_HOST}-convert-tasks`, Buffer.from(`${filmId}-1080`));

                await ch.close();

                console.log(`Passed ${filmId} to convert tasks query(${DC_HOST}-convert-tasks).`)

                await downloadChannel.ack(msg);
            } catch (e) {
                console.error(e);
                await downloadChannel.nack(msg);
            }
        });
    }

    const convertChannel = await connection.createChannel();

    await convertChannel.assertQueue(`${DC_HOST}-convert-tasks`);

    await convertChannel.prefetch(+TASKS_PER_GPU || 5);

    convertChannel.consume(`${DC_HOST}-convert-tasks`, async msg => {
        try {

            const film = msg.content.toString();

            const [filmId, quality] = film.split('-');

            const start = Date.now();
            console.log(`Got convert task for ${filmId}`, Date.now());
            await convertTask(getInputConvertPath(filmId), getOutputConvertPath(filmId, quality), +quality);
            console.log(`Done convert task for ${filmId} in ${(Date.now() - start) / 1e3}s`, Date.now());

            const {size: factSize} = fs.statSync(getOutputConvertPath(filmId, quality));

            const ch = await connection.createChannel();

            await ch.assertQueue('ready-tasks');

            await ch.sendToQueue('ready-tasks', Buffer.from(JSON.stringify({
                ip: DC_HOST,
                size: factSize,
                id: filmId,
                quality,
                url: `http://proxy.1win.tv/${filmId}-${quality}.mp4`
            })));

            await ch.close();

            console.log(`Passed ${filmId} to ready tasks query(${DC_HOST}-ready-tasks).`);

            await convertChannel.ack(msg);
        } catch (e) {
            console.error(e);
            await convertChannel.nack(msg);
        }
    });

    const removeChannel = await connection.createChannel();

    await removeChannel.assertQueue(`${DC_HOST}-remove-tasks`);

    if (+CUDA === 0) {
        removeChannel.consume(`${DC_HOST}-remove-tasks`, async msg => {
            const film = msg.content.toString();

            const {id, quality} = JSON.parse(film);

            try {
                await cp.exec(`rm -rf ${getOutputConvertPath(id, quality)}`);

                const oldMap = JSON.parse(fs.readFileSync(getFilmMeta(id)).toString());

                oldMap[quality] = true;

                const isAll = Object.values(oldMap).filter(v => v).length === 3;

                console.log(oldMap);

                if (isAll) {
                    await cp.exec(`rm -rf ${getInputConvertPath(id)}`);
                    oldMap.src = true;
                }

                fs.writeFileSync(getFilmMeta(id), JSON.stringify(oldMap));

                await removeChannel.ack(msg);
            } catch (e) {
                console.error(e);
                await removeChannel.nack(msg);
            }
        });
    }

})();

