import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const requireSignIn = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(400).send({
                success: false,
                message: 'Authorization Required'
            });
        }
        const token = req.headers.authorization;
        const decodedUser = JWT.verify(token, process.env.JWT_SECRET);
        req.user = decodedUser;
        next();
    }
    catch (error) {
        console.error(`Error in requireSignIn: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in requireSignIn',
            error
        });
    }
}
 
export const isAdmin =async (req, res, next) => {
    try {
    const user = await userModel.findById(req.user._id);
    if(user.role !== 1){
        return res.status(400).send({
            success: false,
            message: 'Admin Access Denied'
        });
        }
        else{
            next();
        }
} catch (error) {
    console.error(`Error in isAdmin: ${error}`);
    res.status(500).send({
        success: false,
        message: 'Error in isAdmin',
        error
    });
}
 }