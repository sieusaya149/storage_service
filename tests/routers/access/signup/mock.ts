import User from '../../../../src/database/model/User';
import KeyStore from '../../../../src/database/model/KeyStore';
import {Types} from 'mongoose';
import bcrypt from 'bcrypt';

export const FAKE_USER_NAME = 'hunghoang';
export const FAKE_USER_PROFILE_PIC = 'https://abc.com/xyz';
export const FAKE_EMAIL = 'test@xyz.com';
export const FAKE_BIRTHDAY = '1999-14-09';
export const FAKE_PASSWORD = '1234';

export const FAKE_PUBKEY = 'pub-test';
export const FAKE_PRIKEY = 'pri-test';
export const FAKE_ACCESS_TOKEN = 'pub-test';
export const FAKE_REFRESH_TOKEN = 'refresh-test';
import UserRepo from '../../../../src/database/repository/UserRepo';
import KeyStoreRepo from '../../../../src/database/repository/KeyStoreRepo';

export const createFakeUser = async () => {
    const newUser: User = {
        userName: FAKE_USER_NAME,
        profilePicUrl: FAKE_USER_PROFILE_PIC,
        email: FAKE_EMAIL,
        birthDay: FAKE_BIRTHDAY,
        password: FAKE_PASSWORD
    };
    await UserRepo.create(newUser);
};
// export const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

// export const mockUserCreate = jest.fn(async (user: User): Promise<{user: User; keystore: KeyStore}> => {
//     user._id = new Types.ObjectId();
//     return {
//         user: user,
//         keystore: {
//             _id: new Types.ObjectId(),
//             userId: user,
//             publicKey: 'pub-test',
//             privateKey: 'priv-test',
//             accessToken: 'access-test',
//             refreshToken: 'refresh-test'
//         } as KeyStore
//     };
// });

// jest.mock('../../../../src/database/repository/UserRepo', () => ({
//     create: mockUserCreate
// }));
