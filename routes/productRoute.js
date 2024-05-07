import express from 'express';
import formidable from 'express-formidable';
import { braintreePaymentController, createProductController, deleteProductController, getBraintreeTokenController, getProductController, getProductFiltersController, getProductPhotoController, getProductsByCategoryController, getProductsController, productCountController, productListController, relatedProductsController, searchProductController, updateProductController } from '../controllers/productController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-product', requireSignIn, isAdmin, formidable(), createProductController)
router.get('/get-products', getProductsController)
router.get('/get-product/:slug', getProductController)
router.get('/product-photo/:pid', getProductPhotoController)
router.delete('/delete-product/:pid', deleteProductController)
router.put('/update-product/:pid', requireSignIn, isAdmin, formidable(), updateProductController)
//filter products
router.post('/product-filters', getProductFiltersController)
//product count
router.get('/product-count', productCountController)
//product per page
router.get('/product-list/:page', productListController)
//search product
router.get('/search/:keyword', searchProductController)
//similar products
router.get('/similar-products/:pid/:cid', relatedProductsController)
//category wise products
router.get('/product-category/:slug', getProductsByCategoryController)

//payments routes
//token
router.get('/braintree/token', getBraintreeTokenController)
//payments
router.post('/braintree/payment', requireSignIn, braintreePaymentController)
export default router;
