import fs from 'fs';
import slugify from 'slugify';

import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import dotenv from 'dotenv';
import braintree from 'braintree';
import orderModel from '../models/orderModel.js';

dotenv.config()

//Braintree payment gateway
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});


export const createProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity } = req.fields;
        const { photo } = req.files;
        switch (true) {
            case !name:
                return res.status(500).send({ error: "Name is Required" });
            case !description:
                return res.status(500).send({ error: "Description is Required" });
            case !price:
                return res.status(500).send({ error: "Price is Required" });
            case !category:
                return res.status(500).send({ error: "Category is Required" });
            case !quantity:
                return res.status(500).send({ error: "Quantity is Required" });
            case photo && photo.size > 1000000:
                return res
                    .status(500)
                    .send({ error: "photo is Required and should be less then 1mb" });
        }
        const product = new productModel({
            ...req.fields,
            slug: slugify(name),
        });
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();
        res.status(201).send({
            success: true,
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error(`Error in createProductController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in creating product',
            error
        });

    }
}
export const getProductsController = async (req, res) => {
    try {
        const products = await productModel.find({}).select('-photo').limit(12).sort({ createdAt: -1 }).populate('category');
        res.status(200).send({
            success: true,
            message: 'Products fetched successfully',
            totalProducts: products.length,
            products,
        });
    } catch (error) {
        console.error(`Error in getProductsController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in fetching products',
            error: error.message
        });

    }
}
export const getProductController = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await productModel.findOne({ slug }).select('-photo').populate('category');
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Product fetched successfully',
            product
        });
    } catch (error) {
        console.error(`Error in getProductController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in getting product',
            error
        });
    }
}
export const getProductPhotoController = async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productModel.findById(pid).select('photo');
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            });
        }
        if (product.photo.data) {
            res.set('Content-Type', product.photo.contentType);
            return res.status(200).send(product.photo.data);

        }
    } catch (error) {
        console.error(`Error in getProductPhotoController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in getting product photo',
            error
        });
    }
}
export const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo")
        res.status(200).send({
            success: true,
            message: "Product deleted successfully"
        })
    } catch (error) {
        console.log(`Error in deleteProductController: ${error}`)
        res.status(500).send({
            success: false,
            message: "Error in deleting product",
            error
        })
    }
}
export const updateProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;
        const { pid } = req.params
        switch (true) {
            case !name:
                return res.status(500).send({ error: "Name is Required" });
            case !description:
                return res.status(500).send({ error: "Description is Required" });
            case !price:
                return res.status(500).send({ error: "Price is Required" });
            case !category:
                return res.status(500).send({ error: "Category is Required" });
            case !quantity:
                return res.status(500).send({ error: "Quantity is Required" });
            case photo && photo.size > 1000000:
                return res
                    .status(500)
                    .send({ error: "photo is Required and should be less then 1mb" });
        }
        const product = await productModel.findByIdAndUpdate(
            pid,
            { ...req.fields, slug: slugify(name) },
            { new: true }
        )
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }
        await product.save();

        res.status(201).send({
            success: true,
            message: "Product Updated Successfully",
            product
        })

    } catch (error) {
        console.log(`Error in updateProductController: ${error}`)
        res.status(500).send({
            success: false,
            message: "Error in updating product",
            error
        })
    }
}
//filter products
export const getProductFiltersController = async (req, res) => {
    try {
        const { checked, radio } = req.body;
        let args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length > 0) args.price = { $gte: radio[0], $lte: radio[1] };
        const products = await productModel.find(args)

        res.status(200).send({
            success: true,
            message: 'Products fetched successfully',
            totalProducts: products.length,
            products,
        });
    } catch (error) {
        console.error(`Error in getProductFiltersController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in filtering products',
            error: error.message
        });

    }
}
//product count
export const productCountController = async (req, res) => {
    try {
        const total = await productModel.countDocuments();
        res.status(200).send({
            success: true,
            message: 'Product count fetched successfully',
            total
        });
    } catch (error) {
        console.error(`Error in productCountController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in fetching product count',
            error: error.message
        });

    }
}
//product per page
export const productListController = async (req, res) => {
    try {
        const perPage = 3;
        const page = req.params.page || 1;
        const products = await productModel.find({}).select('-photo').skip((page - 1) * perPage).limit(perPage).sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            message: 'Products fetched successfully',
            totalProducts: products.length,
            products,
        });
    } catch (error) {
        console.error(`Error in productListController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in fetching products per page',
            error: error.message
        });

    }
}
//search product
export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        if (!keyword) {
            return res.status(400).send({
                success: false,
                message: 'Keyword is required'
            });
        }
        const products = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        }).select('-photo');
        res.status(200).json(products);
        // res.status(200).send({
        //     success: true,
        //     message: 'Products fetched successfully',
        //     products,
        // });
    } catch (error) {
        console.error(`Error in searchProductController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in searching products',
            error: error.message
        });

    }
}
//similar products
export const relatedProductsController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel.find({
            _id: { $ne: pid },
            category: cid
        }).select('-photo').limit(3).populate('category');
        res.status(200).send({
            success: true,
            message: 'Related products fetched successfully',
            products
        });
    } catch (error) {
        console.error(`Error in relatedProductsController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in fetching related products',
            error: error.message
        });

    }
}
//category wise products
export const getProductsByCategoryController = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await categoryModel.findOne({ slug });
        if (!category) {
            return res.status(400).send({
                success: false,
                message: 'Category not found'
            });
        }
        const products = await productModel.find({ category }).populate('category');
        res.status(200).send({
            success: true,
            message: 'Category wise products fetched successfully',
            products,
            category
        });
    } catch (error) {
        console.error(`Error in getProductsByCategoryController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in fetching category wise products',
            error: error.message
        });

    }
}
//payment getWay api
//Get braintree token 
export const getBraintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(response);
            }
        });
    } catch (error) {
        console.log(error);
    }
};

//make braintree payment
export const braintreePaymentController = async (req, res) => {
    try {
        const { nonce, cart } = req.body;
        let total = 0;
        cart.map((i) => {
            total += i.price;
        });
        gateway.transaction.sale(
            {
                amount: total,
                paymentMethodNonce: nonce,
                options: {
                    submitForSettlement: true,
                },
            },
            function (error, result) {
                if (result) {
                    new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id,
                    }).save();
                    res.json({ ok: true });
                } else {
                    res.status(500).send(error);
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
};