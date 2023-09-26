// this function will packing data of file to send to rabbitmq
export const packFileInfo = (
    userId: string,
    fileData: any,
    secretCipherKey: string
): string => {
    const type = 'cloud';
    const msg = {
        type,
        userId,
        fileData,
        secretCipherKey
    };

    return JSON.stringify(msg);
};
