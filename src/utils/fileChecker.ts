const videoExtList = [
    '3g2',
    '3gp',
    'aaf',
    'asf',
    'avchd',
    'avi',
    'drc',
    'flv',
    'm2v',
    'm4p',
    'm4v',
    'mkv',
    'mng',
    'mov',
    'mp2',
    'mp4',
    'mpe',
    'mpeg',
    'mpg',
    'mpv',
    'mxf',
    'nsv',
    'ogg',
    'ogv',
    'qt',
    'rm',
    'rmvb',
    'roq',
    'svi',
    'vob',
    'webm',
    'wmv',
    'yuv'
];

import ffmpeg from 'fluent-ffmpeg';

interface videoChecked {
    isVideo: boolean;
    duration: number;
}
export const videoChecker = (filename: any, filePath: string): videoChecked => {
    if (filename.length < 1 || !filename.includes('.')) {
        return {} as videoChecked;
    }

    const extSplit = filename.split('.');

    if (extSplit.length <= 1) {
        return {} as videoChecked;
    }

    const ext = extSplit[extSplit.length - 1];
    let duration = -1;
    let isVideo = false;
    if (videoExtList.includes(ext.toLowerCase())) {
        duration = getVideoDuration(filePath);
        isVideo = true;
    }
    return {
        isVideo: isVideo,
        duration: duration
    };
};

// TODO fix this function because the file was encrypted
export const getVideoDuration = (filePath: string): number => {
    const ffprobe = ffmpeg(filePath);
    let duration: number = -1;
    // Get the duration of the media file
    ffprobe.ffprobe((err, data) => {
        if (err) {
            console.log(`Get duration error`);
        } else {
            duration = data.format.duration || -1;
            console.log(`Duration: ${duration} seconds`);
            return duration;
        }
    });
    return duration;
};

const imageExtList = ['jpeg', 'jpg', 'png', 'gif', 'svg', 'tiff', 'bmp'];

export const imageChecker = (fileName: string) => {
    if (fileName.length < 1 || !fileName.includes('.')) {
        return false;
    }

    const extSplit = fileName.split('.');

    if (extSplit.length <= 1) {
        return false;
    }

    const ext = extSplit[extSplit.length - 1];

    return imageExtList.includes(ext.toLowerCase());
};
