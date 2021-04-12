import ffmpeg from './utils/ffmpeg';

const convertTask = async (input, output, quality) => {

    if (quality !== 720 && quality !== 480 && quality !== 1080) {
        console.error('Something strange with quality', quality);
        throw new Error(`Bad ${quality}`);
    }

    await ffmpeg(
        input,
        output,
        quality,
    );

};

export default convertTask;
