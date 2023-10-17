import fs from 'fs';

// https://nguyenquanicd.blogspot.com/2019/10/aes-bai-6-cac-che-o-ma-hoa-va-giai-ma.html
// because the input for decrypt the next block is the prev block so we need read the previous block
const getNewIv = (start: number, path: string) => {
    return new Promise<Buffer | string>((resolve, reject) => {
        const stream = fs.createReadStream(path, {
            start,
            end: start + 15 // because currently the algo is aes256 (16 bytes) so start + 15
        });
        stream.on('data', (data) => {
            resolve(data);
        });
    });
};

export default getNewIv;
