const Product = require("../../models/Product");
const cloudinary = require("../../config/cloudinary");
const fs = require('fs');
const path = require('path');

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      
      // Clean up the temporary file
      fs.unlinkSync(req.file.path);

      return res.json({
        success: true,
        imageUrl: result.secure_url
      });
    } catch (uploadError) {
      // Clean up the temporary file in case of error
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw uploadError;
    }
  } catch (error) {
    console.error("Error in handleImageUpload:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading image to cloud storage",
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log("Received product data:", req.body);

    const { title, description, price, salePrice, category, brand, sizes, image } = req.body;

    // Validate required fields
    const requiredFields = { title, description, price, category, brand, image };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields
      });
    }

    // Validate sizes
    if (!Array.isArray(sizes)) {
      return res.status(400).json({
        success: false,
        message: "Sizes must be an array"
      });
    }

    // Validate at least one size has stock
    const hasStock = sizes.some(size => (parseInt(size.stock) || 0) > 0);
    if (!hasStock) {
      return res.status(400).json({
        success: false,
        message: "At least one size must have stock greater than 0"
      });
    }

    // Calculate total stock and validate size data
    const totalStock = sizes.reduce((sum, size) => {
      if (!size.name || typeof size.stock === 'undefined') {
        throw new Error(`Invalid size data: ${JSON.stringify(size)}`);
      }
      return sum + (parseInt(size.stock) || 0);
    }, 0);

    const product = new Product({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      category: category.trim().toLowerCase(),
      brand: brand.trim().toLowerCase(),
      sizes: sizes.map(size => ({
        name: size.name.toUpperCase(),
        stock: parseInt(size.stock) || 0
      })),
      totalStock,
      image: image.trim()
    });

    console.log("Creating product with data:", product);

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, salePrice, category, brand, sizes, image } = req.body;

    // Validate required fields
    const requiredFields = { title, description, price, category, brand };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields
      });
    }

    // Calculate total stock
    const totalStock = sizes.reduce((sum, size) => sum + (parseInt(size.stock) || 0), 0);

    const updateData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      category: category.trim().toLowerCase(),
      brand: brand.trim().toLowerCase(),
      sizes: sizes.map(size => ({
        name: size.name.toUpperCase(),
        stock: parseInt(size.stock) || 0
      })),
      totalStock
    };

    if (image) {
      updateData.image = image.trim();
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Error in editProduct:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
};

module.exports = {
  handleImageUpload,
  createProduct,
  editProduct,
  deleteProduct,
  getAllProducts,
};