import express from "express";

import { forgotPasswordController, getAllOrdersController, getOrdersController, loginController, registerController, testController, updateOrderStatusController, updateProfileController } from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

//REGISTER AND LOGIN ROUTES
router.post("/register", registerController)
router.post("/login", loginController)
//Forgot Password
 router.post("/forgot-password", forgotPasswordController)
//test route
router.get("/test", requireSignIn, isAdmin, testController)
//protected USER route auth
router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({ok:true})
})
 //protected ADMIN route auth
router.get('/admin-auth', requireSignIn,isAdmin, (req, res) => {
    res.status(200).send({ok:true})
 })
//update profile
router.put("/profile", requireSignIn, updateProfileController)
export default router;
//orders
router.get('/orders',requireSignIn,getOrdersController)
//All orders
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController)
//order status update
router.put('/order-status/:orderId', requireSignIn, isAdmin, updateOrderStatusController)