import { verifyToken } from "../cores/handleToken.js";

function getTokenDataMidleware(req, res, next) {
    req.body.userId = undefined;
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    const tokenInfo = verifyToken(token);
    // console.log(tokenInfo);
    if (tokenInfo.error) {
        return res.json({ success: false, message: 'invalid access token ' })
    }

    req.body.userId = tokenInfo.data?.userId;

    return next();
}
export default getTokenDataMidleware;