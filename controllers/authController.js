import JWT from "jsonwebtoken";

import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";


export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;
        if (!name || !email || !password || !phone || !address || !answer) {
            return res.status(400).send({
                success: false,
                message: 'Please fill all the fields'
            });
        }
        const userExists = await userModel.findOne({ email })
        if (userExists) {
            return res.status(400).send({
                success: false,
                message: 'User Already Exists'
            });
        }
        const hashedPassword = await hashPassword(password);
        const user = await new userModel({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            answer
        }).save();
        res.status(201).send({
            success: true,
            message: 'User Registered Successfully',
            user
        });

    } catch (error) {
        console.error(`Error in registerController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in Registering User',
            error
        });
    }
}
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: 'Please fill all the fields'
            });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send({
                success: false,
                message: 'User Not Found'
            });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).send({
                success: false,
                message: 'Invalid mail or password'
            });
        }
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).send({
            success: true,
            message: 'User Logged In Successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error(`Error in loginController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in Logging In User',
            error
        });
    }
}
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        console.log(req.body)
        if (!email || !answer || !newPassword) {
            return res.status(400).send({
                success: false,
                message: 'Please fill all the fields'
            });
        }
        const user = await userModel.findOne({ email, answer })
        if (!user) {
            return res.status(400).send({
                success: false,
                message: 'User Not Found'
            });
        }
        const hashedPassword = await hashPassword(newPassword);
        const response = await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });
        console.log(response)
        res.status(200).send({
            success: true,
            message: 'Password Changed Successfully'
        });


    } catch (error) {
        console.log(`Error in forgotPasswordController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in Forgot Password',
            error
        });
    }

}
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        if (!name || !email || !phone || !address) {
            return res.status(400).send({
                success: false,
                message: 'Please fill all the fields'
            });
        }
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(400).send({
                success: false,
                message: 'User Not Found'
            });
        }
        if (password && password.length < 6) {
            return res.status(400).send({
                success: false,
                message: 'Password must be atleast 6 characters long'
            });
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address
        }, { new: true })
        res.status(200).send({
            success: true,
            message: 'Profile Updated Successfully',
            updatedUser
        });
    } catch (error) {
        console.error(`Error in updateProfileController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in Updating Profile',
            error
        });

    }
}
//get orders
export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ buyer: req.user._id })
            .populate("products", "-photo")
            .populate("buyer", "name");
        res.json(orders);
    } catch (error) {
        console.error(`Error in getOrdersController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in Fetching Orders',
            error
        });
    }
}
//get all orders
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("products", "-photo")
            .populate("buyer", "name")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(`Error in getAllOrdersController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in Fetching All Orders',
            error
        });
    }
}
//update order status
export const updateOrderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        res.json(order);
    }
    catch (error) {
        console.error(`Error in updateOrderStatusController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in Updating Order Status',
            error
        });
    }
}

export const testController = async (req, res) => {
    try {
        res.status(200).send({
            success: true,
            message: 'Test Route'
        });
    } catch (error) {
        console.error(`Error in testController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in Test Route',
            error
        });
    }
}
