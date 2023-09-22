/* eslint-disable prettier/prettier */
// import '../../../database/mock';

// import the mock for this file below all mock imports
import mongoose from 'mongoose';
import {createFakeUser} from './mock';

import request from 'supertest';
import app from '../../../../src/app';
import UserRepo from '../../../../src/database/repository/UserRepo';
import User, {UserModel} from '../../../../src/database/model/User';
import KeyStoreRepo from '../../../../src/database/repository/KeyStoreRepo';
import Logger from '../../../../src/helpers/Logger';

// describe('Signup basic route', () => {
//     const endpoint = '/v1/api/signup';
//     const request = supertest(app);
//     const email = 'abc@xyz.com';
//     beforeEach(() => {
//         mockUserCreate.mockClear();
//         bcryptHashSpy.mockClear();
//     });
//     it('Should send error when empty body is sent', async () => {
//         const response = await addHeaders(request.post(endpoint));
//         expect(response.status).toBe(200);
//         expect(bcryptHashSpy).not.toBeCalled();
//         expect(mockUserCreate).not.toBeCalled();
//         // expect(createTokensSpy).not.toBeCalled();
//     });
// });

describe('Check Format Signup', () => {
    const endpoint = '/v1/api/signup';
    it('Should Response 400 Bad Request if body is empty ', async () => {
        const response = await request(app).post(endpoint);
        expect(response.status).toBe(400);
    });

    it('Should Response 400 If userName is invalid', async () => {
        // eslint-disable-next-line prettier/prettier
        const response = await request(app).post(endpoint).send({
            userName: 'hung'
        });
        expect(response.status).toBe(400);
    });

    it('Should Response 400 If birthDay is wrong iso format YYYY-MM-DD --> 1999-13-09', async () => {
        // eslint-disable-next-line prettier/prettier
        const response = await request(app).post(endpoint).send({
            userName: 'hunghoang',
            birthDay: '1999-13-09' // wrong iso format
        });
        expect(response.status).toBe(400);
    });

    it('Should Response 400 If email is invalid', async () => {
        // eslint-disable-next-line prettier/prettier
        const response = await request(app).post(endpoint).send({
            userName: 'hunghoang',
            birthDay: '1999-12-09',
            email: 'hunghoang' // invalid email
        });
        expect(response.status).toBe(400);
    });

    it('Should Response 400 If password is invalid', async () => {
        // eslint-disable-next-line prettier/prettier
        const response = await request(app).post(endpoint).send({
            userName: 'hunghoang',
            birthDay: '1999-12-09',
            email: 'hunghoang@gmail.com',
            password: 'abc'
        });
        expect(response.status).toBe(400);
    });

    it('Should Response 400 If body has redundant data', async () => {
        // eslint-disable-next-line prettier/prettier
        const response = await request(app).post(endpoint).send({
            userName: 'hunghoang',
            birthDay: '1999-12-09',
            email: 'hunghoang@gmail.com',
            password: 'abcd',
            noInSchema: 'test' // redundant data
        });
        expect(response.status).toBe(400);
    });
});

describe('Sign Up New User', () => {
    const endpoint = '/v1/api/signup';
    beforeEach(async () => {
        await createFakeUser();
    });
    afterEach(async () => {
        await UserRepo.deleteAll();
        await KeyStoreRepo.deleteAll();
    });
    afterAll(async () => await mongoose.disconnect());
    it('Should Response 400 if UserName already Registered', async () => {
        // eslint-disable-next-line prettier/prettier
        const response = await request(app).post(endpoint).send({
            userName: 'hunghoang',
            birthDay: '1999-12-09',
            email: 'hunghoang@gmail.com',
            password: 'abcd'
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'UserName or Email already Registered'
        );
    });
});
