import { verifyToken } from "../cores/handleToken.js";

function getTokenDataMidleware(req, res, next) {
    req.body.userId = undefined;
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);

    if (!token) {
        return next();
    }

    const tokenInfo = verifyToken(token);
    // console.log(tokenInfo);
    // console.log(tokenInfo);
    if (tokenInfo.error) {
        return res.status(401).json({ success: false, message: 'invalid token' })
    }

    req.body.userId = tokenInfo.data?.userId;

    return next();
}
export default getTokenDataMidleware;