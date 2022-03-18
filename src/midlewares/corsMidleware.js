import cors from "cors"
import { whiteList } from "../../globalVariables.js";

const corsOptions = {
    origin: function (origin, callback) {
        // console.log("** Origin of request " + origin)
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            // console.log("Origin acceptable")
            callback(null, true)
        } else {
            // console.log("Origin rejected")
            callback(new Error('Not allowed by CORS'))
        }
    }
}

export default cors(corsOptions);