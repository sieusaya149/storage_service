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
const options = {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3, // Include milliseconds
    hour12: true // Use AM/PM format
} as Intl.DateTimeFormatOptions;
const timezoned = () => {
    return new Date().toLocaleString('en-US', options);
};

const logLevel = environment === 'development' || environment === 'test' ? 'debug' : 'warn';
const dailyRotateFile = new DailyRotateFile({
    level: logLevel,
    filename: dir + '/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    handleExceptions: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: format.combine(format.errors({stack: true}), format.timestamp({format: timezoned}), format.json())
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
