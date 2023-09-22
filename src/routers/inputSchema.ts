import Joi from 'joi';

export default {
    signup: Joi.object().keys({
        userName: Joi.string().required().min(6),
        birthDay: Joi.string().required().isoDate(), //YYYY-MM-DD
        email: Joi.string().required().email(),
        password: Joi.string().required().min(4)
    }),

    login: Joi.object()
        .keys({
            userName: Joi.string().optional(),
            email: Joi.string().optional().email(),
            password: Joi.string().required()
        })
        .xor('userName', 'email'),

    authenticate: Joi.object().keys({
        'access-token': Joi.string().required(),
        'refresh-token': Joi.string().required(),
        userId: Joi.string().required()
    })
};
