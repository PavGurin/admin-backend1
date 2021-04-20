import cp from './child_process';

const bitrateMap = {
    480: '2M',
    720: '4M',
    1080: '7M',
};

const getWatermark = q => `/opt/1win/watermarks/${q}-watermark.png`;

const WATERMARK_PADDING = {
  480: 30,
  720: 40,
  1080: 50,
};

const getWatermarkPosition = q => `main_w-overlay_w-${WATERMARK_PADDING[q]}:(main_h-main_w/2.39)/2+${WATERMARK_PADDING[q]}`;

const { CUDA } = process.env;

export default (i, o, q = 720) =>
    cp.exec([
        `CUDA_VISIBLE_DEVICES=${CUDA}`,
        `ffmpeg -y -i ${i} -i ${getWatermark(q)}`,
        `-filter_complex "scale=-1:${q},overlay=${getWatermarkPosition(q)},fps=fps=30"`,
        `-c:v h264_nvenc -preset fast`,
        `-b:v ${bitrateMap[q]} -b:a 128k -c:a copy ${o} 2> /dev/null` ,
    ].join(' '))

