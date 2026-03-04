const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["men", "women", "kids"],
      required: true
    },
    brand: {
      type: String,
      enum: ["nike", "adidas", "puma", "levi", "zara", "h&m"],
      required: true
    },
    stock: {
      type: Number,
      default: 0,
    },
    averageReview: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);