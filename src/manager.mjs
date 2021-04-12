import Rabbit from 'amqplib';
import wget from "./utils/wget";
import fs from "fs";
import cp from "./utils/child_process";

const {
    RABBIT_URL,
    DOWNLOAD_TASKS,
} = process.env;

const getOutputDownloadPath = (id, q) => `/opt/1win/film-store/${id}-film/${q}.mp4`;
const getOutputDownloadDir = (id) => `/opt/1win/film-store/${id}-film`;


(async () => {

    const connection = await Rabbit.connect(RABBIT_URL);

    const readyChannel = await connection.createChannel();

    readyChannel.prefetch(+DOWNLOAD_TASKS || 1);

    console.log('Started download daemon');

    readyChannel.consume('ready-tasks', async msg => {
        try {

            const {url, size, id, quality, ip} = JSON.parse(msg.content.toString());

            await cp.exec(`mkdir -p ${getOutputDownloadDir(id)}`);

            await wget(url, getOutputDownloadPath(id, quality));

            const { size: factDownloadSize } = fs.statSync(getOutputDownloadPath(id, quality));

            if (size !== factDownloadSize) {
                console.log(`Some problems with film #${id}-${quality} download.`);

                cp
                    .exec(`rm -rf ${getOutputDownloadPath(id, quality)}`)
                    .catch(console.error);

                await readyChannel.nack(msg);
                return;
            }

            const ch = await connection.createChannel();

            await ch.assertQueue(`${ip}-remove-tasks`);

            await ch.sendToQueue(`${ip}-remove-tasks`, Buffer.from(JSON.stringify({
                id, quality,
            })));

            await ch.close();

            await readyChannel.ack(msg);
        } catch (e) {
            console.error(e);
            await readyChannel.nack(msg);
        }
    });
})();

