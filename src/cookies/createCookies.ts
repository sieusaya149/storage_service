import {Response} from 'express';

const maxAgeAccess = 60 * 1000 * 20; // 20 mins
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30; // 30 days

const secureCookies = true;
export const createCookiesAuthen = (
    res: Response,
    accessToken: string,
    refreshToken: string,
    userId: string | undefined
) => {
    if (!userId) {
        throw new Error('User Id is null');
    }
    res.cookie('access-token', accessToken, {
        httpOnly: true,
        maxAge: maxAgeAccess,
        sameSite: 'strict',
        secure: secureCookies
    });

    res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        maxAge: maxAgeRefresh,
        sameSite: 'strict',
        secure: secureCookies
    });

    res.cookie('userId', userId, {
        httpOnly: true,
        maxAge: maxAgeRefresh,
        sameSite: 'strict',
        secure: secureCookies
    });
};
