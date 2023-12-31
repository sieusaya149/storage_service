import path from 'path';
// Mapper for environment variables
export const environment = process.env.NODE_ENV;
export const port = process.env.PORT;
export const timezone = process.env.TZ;

// getting the enviroment config for mongo db database
export const db = {
    name: process.env.DB_NAME || '',
    host: process.env.DB_HOST || '',
    port: process.env.DB_PORT || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_USER_PWD || '',
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10')
};

// Allow crossing sharing for domain
export const corsUrl = process.env.CORS_URL || '*';

export const tokenInfo = {
    accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || '0'),
    refreshTokenValidity: parseInt(
        process.env.REFRESH_TOKEN_VALIDITY_SEC || '0'
    ),
    issuer: process.env.TOKEN_ISSUER || '',
    audience: process.env.TOKEN_AUDIENCE || ''
};

export const logDirectory = process.env.LOG_DIR;

const publicDirectoryName = process.env.UPLOAD_DIR_NAME || 'public';
// console.log(publicDirectory)
export const publicDirectory = path.join(__dirname, '..', publicDirectoryName);

export const secretKeyCipher = process.env.SECRET_CIPHER || 'default_secret';

export const rabbitMqUri = process.env.RABBITMQ_URI || undefined;
export const exchangeCloud =
    process.env.EXCHANGE_CLOUD_PUSH || 'cloud_exchange';
export const queueCloud = process.env.QUEUE_CLOUD || 'cloud_queue';

// exchange and queue for handling notify (fanout exchange)
export const exchangeNotify = process.env.EXCHANGE_NOTIFY || 'notify_exchange';
export const queueStatusJob = process.env.QUEUE_NOTIFY || 'job_status_queue';
