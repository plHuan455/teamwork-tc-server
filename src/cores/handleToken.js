import jwt from "jsonwebtoken";

export function verifyToken(token, isRefresh) {
    let data = {};

    const refreshKey = process.env.JWT_REFRESH_SECRET;
    // console.log(refreshKey);
    jwt.verify(token, isRefresh ? refreshKey : process.env.JWT_SECRET, function (err, decoded) {
        if (err)
            return data = { error: err };
        return data = { error: false, data: decoded }
    });

    return data;
}

export function createToken(data) {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '10s' });
}

export function createRefreshToken(data) {
    return jwt.sign(data, process.env.JWT_REFRESH_SECRET);
}