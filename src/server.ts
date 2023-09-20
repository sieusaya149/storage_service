import Logger from './helpers/Logger';
import {port} from './config';
import app from './app';

app.listen(port, () => {
    Logger.info(`server running on port : ${port}`);
}).on('error', (e: Error) => Logger.error(e));
