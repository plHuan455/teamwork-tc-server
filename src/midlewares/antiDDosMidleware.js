import rateLimit from 'express-rate-limit';

export default function authDdosMidleware(limit = 4) {
    return rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minutes
        max: limit,
        message: 'Too many request'
    });
}
