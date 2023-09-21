import mongoose from 'mongoose';
import Logger from '../helpers/Logger';
import {db} from '../config';

const dbURI = `mongodb://${db.host}:${db.port}/${db.name}`;

const options = {
    autoIndex: true,
    minPoolSize: db.minPoolSize, // Maintain up to x socket connections
    maxPoolSize: db.maxPoolSize, // Maintain up to x socket connections
    connectTimeoutMS: 60000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
};

Logger.debug(dbURI);

// mongoose will remove the atr (not-in-schema) out of filter if needed
// ref: https://mongoosejs.com/docs/tutorials/query_casting.html
mongoose.set('strictQuery', true);

// turn on runValidators
function setRunValidators(this: any) {
    this.setOptions({runValidators: true});
}
// Create the database connection
mongoose
    .plugin((schema: any) => {
        schema.pre('findOneAndUpdate', setRunValidators); // setup pre-hook run validator
        schema.pre('updateMany', setRunValidators);
        schema.pre('updateOne', setRunValidators);
        schema.pre('update', setRunValidators);
    })
    .connect(dbURI, options)
    .then(() => {
        Logger.info('Connection MongoDB Was Establisted Successfully');
    })
    .catch((e) => {
        Logger.info('onnection MongoDB Was Establisted Error');
        Logger.error(e);
    });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
    Logger.debug('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
    Logger.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    Logger.info('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', async () => {
    Logger.info('Mongoose default connection disconnected through app termination');
    await mongoose.connection.close();
    process.exit(0);
});

export default mongoose.connection;
