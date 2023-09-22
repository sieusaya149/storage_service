import KeyStore from './database/model/KeyStore';
declare global {
    namespace Express {
        interface Request {
            keyStore: KeyStore;
        }
    }
}
