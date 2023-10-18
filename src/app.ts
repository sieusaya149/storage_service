import express, {Request, Response, NextFunction} from 'express';
import Logger from './helpers/Logger';
import cors from 'cors';
import {corsUrl, environment, exchangeNotify, queueStatusJob} from './config';
import routers from './routers';
import {
    NotFoundError,
    ApiError,
    InternalError,
    ErrorType
} from './core/ApiError';
import cookieParser from 'cookie-parser';
import './database'; // initialize database
import RabbitMqServices from './services/rabbitmq.services';

process.on('uncaughtException', (e: Error) => {
    Logger.error(e);
});
RabbitMqServices.consumer(exchangeNotify, queueStatusJob);
const app = express();

// midderware added
app.use(
    express.json({
        limit: '10mb'
    })
);
app.use(
    express.urlencoded({
        limit: '10mb',
        extended: true,
        parameterLimit: 50000
    })
);
app.use(
    cors({
        origin: corsUrl,
        optionsSuccessStatus: 200
    })
);

app.use(cookieParser());

// add router
app.use('/', routers);

// Not found request handling
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError());
});

// Error hanlder
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        ApiError.handle(err, res);
        if (err.type === ErrorType.INTERNAL)
            Logger.error(
                `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            );
    } else {
        Logger.error(
            `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        );
        Logger.error(err);
        if (environment === 'development') {
            return res.status(500).send(err);
        }
        ApiError.handle(new InternalError(), res);
    }
});

export default app;
