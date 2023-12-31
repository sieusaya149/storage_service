import {NextFunction, Request, Response} from 'express';

export const asyncHandler = (
    callbackFunc: (req: Request, res: Response, next: NextFunction) => any
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // that mean if there is any issue happen when call function callbackFunc then next function will be calling
        callbackFunc(req, res, next).catch((e: Error) => {
            next(e);
        });
    };
};
