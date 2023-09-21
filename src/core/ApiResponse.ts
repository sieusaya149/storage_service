import {Response} from 'express';
import Logger from '../helpers/Logger';
// Helper code for the API consumer to understand the error and handle is accordingly
enum ResponseCode {
    SUCCESS = '10000',
    FAILURE = '10001',
    RETRY = '10002',
    INVALID_ACCESS_TOKEN = '10003'
}

enum ResponseStatus {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
}

// Define abstract class ApiReponse for abstract the atr and method that related to
// ApiReponse
abstract class ApiResponse {
    protected code: ResponseCode;
    protected status: ResponseStatus;
    protected message: string;

    constructor(code: ResponseCode, status: ResponseStatus, message: string) {
        this.code = code;
        this.status = status;
        this.message = message;
    }

    protected prepare<T extends ApiResponse>(res: Response, response: T, headers: {[key: string]: string}): Response {
        for (const [key, value] of Object.entries(headers)) {
            res.append(key, value);
        }

        return res.status(this.status).json(this.sanitize<ApiResponse>(response));
    }

    private sanitize<T extends ApiResponse>(response: T): T {
        const clone: T = {} as T;
        Object.assign(clone, response);
        // @ts-ignore
        delete clone.status;
        for (const i in clone) {
            if (typeof clone[i] === 'undefined') {
                delete clone[i];
            }
        }
        return clone;
    }

    public send(res: Response, headers: {[key: string]: string} = {}): Response {
        if (this.status != ResponseStatus.SUCCESS) {
            Logger.warn(
                `Api Result will be failed with code ${this.code} status ${this.status} with messsage ${this.message}`
            );
        }
        return this.prepare<ApiResponse>(res, this, headers);
    }
}

//Define Failed Response
export class AuthFailureResponse extends ApiResponse {
    constructor(message = 'Authentication Failure') {
        super(ResponseCode.FAILURE, ResponseStatus.UNAUTHORIZED, message);
    }
}

export class NotFoundResponse extends ApiResponse {
    constructor(message = 'Not Found') {
        super(ResponseCode.FAILURE, ResponseStatus.NOT_FOUND, message);
    }
}

export class ForbiddenResponse extends ApiResponse {
    constructor(message = 'Forbidden') {
        super(ResponseCode.FAILURE, ResponseStatus.FORBIDDEN, message);
    }
}

export class BadRequestResponse extends ApiResponse {
    constructor(message = 'Bad Parameters') {
        super(ResponseCode.FAILURE, ResponseStatus.BAD_REQUEST, message);
    }
}

export class InternalErrorResponse extends ApiResponse {
    constructor(message = 'Internal Error') {
        super(ResponseCode.FAILURE, ResponseStatus.INTERNAL_ERROR, message);
    }
}

export class FailureMsgResponse extends ApiResponse {
    constructor(message: string) {
        super(ResponseCode.FAILURE, ResponseStatus.SUCCESS, message);
    }
}

// Define Success Response
export class SuccessMsgResponse extends ApiResponse {
    constructor(message: string) {
        super(ResponseCode.SUCCESS, ResponseStatus.SUCCESS, message);
    }
}

// Success with Data custom
export class SuccessResponse<T> extends ApiResponse {
    constructor(
        message: string,
        private data: T
    ) {
        super(ResponseCode.SUCCESS, ResponseStatus.SUCCESS, message);
    }
    //override send function for adding data
    send(res: Response, headers: {[key: string]: string} = {}): Response {
        return super.prepare<SuccessResponse<T>>(res, this, headers);
    }
}

// access token is invalid
export class AccessTokenErrorResponse extends ApiResponse {
    private instruction = 'refresh_token';
    constructor(message = 'Access Token is Invalid') {
        super(ResponseCode.INVALID_ACCESS_TOKEN, ResponseStatus.UNAUTHORIZED, message);
    }

    //override send function
    send(res: Response, headers: {[key: string]: string} = {}): Response {
        headers.instruction = this.instruction;
        return super.prepare<AccessTokenErrorResponse>(res, this, headers);
    }
}

export class TokenRefeshResponse extends ApiResponse {
    constructor(
        message: string,
        private accessToken: string,
        private refreshToken: string
    ) {
        super(ResponseCode.SUCCESS, ResponseStatus.SUCCESS, message);
    }

    //override send function
    send(res: Response, headers: {[key: string]: string} = {}): Response {
        return super.prepare<TokenRefeshResponse>(res, this, headers);
    }
}
