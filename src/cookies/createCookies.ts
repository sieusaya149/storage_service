import {Response} from 'express';

const maxAgeAccess = 60 * 1000 * 60; // 60 mins
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30; // 30 days

const secureCookies = true;
export const createCookiesAuthen = (
    res: Response,
    accessToken: string,
    refreshToken: string,
    userId: string | undefined
) => {
    if (!userId) {
        throw new Error('UserId is null');
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

// TODO: Should have a way to sync between set and unset cookies
export const createCookiesLogout = (res: Response) => {
    res.cookie(
        'access-token',
        {},
        {
            httpOnly: true,
            maxAge: 0,
            sameSite: 'strict',
            secure: secureCookies
        }
    );

    res.cookie(
        'refresh-token',
        {},
        {
            httpOnly: true,
            maxAge: 0,
            sameSite: 'strict',
            secure: secureCookies
        }
    );

    res.cookie(
        'userId',
        {},
        {
            httpOnly: true,
            maxAge: 0,
            sameSite: 'strict',
            secure: secureCookies
        }
    );
};
