const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { category, brand, sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    // Only apply category filter if valid category is provided
    if (category && typeof category === 'string' && category.trim()) {
      const categories = category.split(',').filter(cat => cat.trim());
      if (categories.length > 0) {
        filters.category = { $in: categories };
      }
    }

    // Only apply brand filter if valid brand is provided
    if (brand && typeof brand === 'string' && brand.trim()) {
      const brands = brand.split(',').filter(b => b.trim());
      if (brands.length > 0) {
        filters.brand = { $in: brands };
      }
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    // Fetch products with or without filters
    const products = await Product.find(filters)
      .sort(sort)
      .lean()
      .exec();

    // Process products to include size availability
    const processedProducts = products.map(product => ({
      ...product,
      sizes: product.sizes || [],
      totalStock: product.sizes ? product.sizes.reduce((sum, size) => sum + size.stock, 0) : 0
    }));

    res.status(200).json({
      success: true,
      data: processedProducts,
    });
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
      error: error.message
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean().exec();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // Ensure sizes are properly structured
    const processedProduct = {
      ...product,
      sizes: product.sizes || [],
      totalStock: product.sizes ? product.sizes.reduce((sum, size) => sum + size.stock, 0) : 0
    };

    res.status(200).json({
      success: true,
      data: processedProduct,
    });
  } catch (error) {
    console.error("Error in getProductDetails:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching product details",
      error: error.message
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };