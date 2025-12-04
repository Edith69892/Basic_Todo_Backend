import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./index.js";
import { userModel } from "./models/user.models.js";

async function auth(req,res, next){
    const token = req.headers.token;

    const decodeToken = jwt.verify(token, JWT_SECRET);

    const user = await userModel.findById(decodeToken._id)

     req.user = user
     next()
}

export  {auth}