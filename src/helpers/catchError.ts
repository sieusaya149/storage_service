import events from 'events';
import {EventEmitter} from 'stream';

//support handling
class SuperCatchError {
    private callback;
    private catchErrors: EventEmitter;
    constructor() {
        this.catchErrors = new events.EventEmitter();
        this.callback = () => {};
    }

    on(event: string, callback: any) {
        this.catchErrors.on(event, callback);
    }

    emit(event: string, error: Error) {
        this.catchErrors.emit(event, Error);
    }
}

export const superCatchError = new SuperCatchError();
