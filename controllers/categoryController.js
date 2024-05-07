import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

export const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({
                success: false,
                message: 'Category name is required'
            });
        }
        const existingCategory = await categoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(400).send({
                success: false,
                message: 'Category already exists'
            });
        }
        const category = await new categoryModel({
            name,
            slug: slugify(name)
        }).save();

        res.status(200).send({
            success: true,
            message: 'Category created successfully',
            category
        });

    } catch (error) {
        console.error(`Error in createCategoryController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in creating category',
            error
        });

    }
}
export const updateCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        if (!name) {
            return res.status(400).send({
                success: false,
                message: 'Category name is required'
            });
        }
        const updatedCategory = await categoryModel.findByIdAndUpdate(id, {
            name,
            slug: slugify(name)
        }, { new: true });

        res.status(200).send({
            success: true,
            message: 'Category updated successfully',
            updatedCategory
        });

    } catch (error) {
        console.error(`Error in updateCategoryController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in updating category',
            error
        });

    }
}
export const getCategoriesController = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.status(200).send({
            success: true,
            categories
        });

    } catch (error) {
        console.error(`Error in getCategoryController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in getting categories',
            error
        });

    }
}
export const getCategoryController = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await categoryModel.findOne({ slug });
        if (!category) {
            return res.status(404).send({
                success: false,
                message: 'Category not found'
            });
        }
        res.status(200).send({
            success: true,
            category
        });

    } catch (error) {
        console.error(`Error in getCategoryController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in getting category',
            error
        });

    }
} 
export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await categoryModel.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).send({
                success: false,
                message: 'Category not found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Category deleted successfully',
            deletedCategory
        });

    } catch (error) {
        console.error(`Error in deleteCategoryController: ${error}`);
        res.status(500).send({
            success: false,
            message: 'Error in deleting category',
            error
        });

    }
 }


