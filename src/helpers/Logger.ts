import {createLogger, transports, format} from 'winston';
import fs from 'fs';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import {environment, logDirectory} from '../config';

let dir = logDirectory;
// create a path for creating
if (!dir) dir = path.resolve('logs');

// create directory if it is not present
if (!fs.existsSync(dir)) {
    // Create the directory if it does not exist
    fs.mkdirSync(dir);
}
const logLevel = environment === 'development' ? 'debug' : 'warn';
const dailyRotateFile = new DailyRotateFile({
    level: logLevel,
    filename: dir + '/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    handleExceptions: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: format.combine(format.errors({stack: true}), format.timestamp(), format.json())
});

// create logger from DailyRotateFile with format and log level then export it
export default createLogger({
    transports: [
        new transports.Console({
            level: logLevel,
            format: format.combine(format.errors({stack: true}), format.prettyPrint())
        }),
        dailyRotateFile
    ],
    exceptionHandlers: [dailyRotateFile],
    exitOnError: false // do not exit on handled exceptions
});
