import jwt from "jsonwebtoken";

export function verifyToken(token) {
    let data = {};
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err)
            return data = { error: err };
        return data = { error: false, data: decoded }
    });

    return data;
}

export function createToken(data) {
    return jwt.sign(data, process.env.JWT_SECRET);
}