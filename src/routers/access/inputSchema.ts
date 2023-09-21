import Joi from 'joi';

export default {
    signup: Joi.object().keys({
        userName: Joi.string().optional().min(6),
        birthDay: Joi.string().required().isoDate(), //YYYY-MM-DD
        email: Joi.string().optional().email(),
        password: Joi.string().required().min(4)
    })
};
