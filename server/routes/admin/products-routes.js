const express = require("express");
const {
  handleImageUpload,
  createProduct,
  editProduct,
  deleteProduct,
  getAllProducts,
} = require("../../controllers/admin/products-controller");
const upload = require("../../config/multer");

const router = express.Router();

// Handle image upload - using 'productImage' as the field name
router.post("/upload-image", upload.single("productImage"), handleImageUpload);

// Product CRUD routes
router.post("/create", createProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get-all", getAllProducts);

module.exports = router;