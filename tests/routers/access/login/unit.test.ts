/* eslint-disable prettier/prettier */
// import '../../../database/mock';

// import the mock for this file below all mock imports
import mongoose from 'mongoose';

import request from 'supertest';
import app from '../../../../src/app';
import {Logform} from 'winston';
import Logger from '../../../../src/helpers/Logger';

describe('Check Format Login', () => {
    const endpoint = '/v1/api/login';
    afterAll(async () => await mongoose.disconnect());
    it('Should Response 400 Bad Request if body is empty ', async () => {
        const response = await request(app).post(endpoint);
        expect(response.status).toBe(400);
    });

    it('Should Response 400 If Missing Password', async () => {
        // eslint-disable-next-line prettier/prettier
        const response = await request(app).post(endpoint).send({
            userName: 'hung'
        });
        expect(response.status).toBe(400);
    });

    it('Should Response 400 If provide both userName and email', async () => {
        // eslint-disable-next-line prettier/prettier
        const response = await request(app).post(endpoint).send({
            userName: 'hung',
            email: 'test@gmail.com',
            password: 'test'
        });
        expect(response.status).toBe(400);
    });

    it('Should Response 200 If provide userName and Password', async () => {
        // eslint-disable-next-line prettier/prettier
        Logger.debug('Test Case Login 2');
        const response = await request(app).post(endpoint).send({
            userName: 'hung',
            password: 'test'
        });
        expect(response.status).toBe(200);
    });

    it('Should Response 200 If provide Email and Password', async () => {
        // eslint-disable-next-line prettier/prettier
        Logger.debug('Test Case Login 2');
        const response = await request(app).post(endpoint).send({
            email: 'hun@gmail.com',
            password: 'test'
        });
        expect(response.status).toBe(200);
    });
});
