import "dotenv/config";
import connectDB from "../db/connectDB.js";
import Product from "../models/Product.model.js";

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "Over-ear wireless headphones with noise isolation and up to 30 hours of battery life.",
    price: 2499,
    stock: 45,
  },
  {
    name: "Mechanical Gaming Keyboard",
    description:
      "RGB mechanical keyboard with blue switches, compact design, and USB connectivity.",
    price: 3299,
    stock: 30,
  },
  {
    name: "Wireless Gaming Mouse",
    description:
      "Ergonomic wireless gaming mouse with adjustable DPI and rechargeable battery.",
    price: 1799,
    stock: 50,
  },
  {
    name: "USB-C Fast Charger",
    description:
      "65W USB-C fast charger suitable for smartphones, tablets, and compatible laptops.",
    price: 1499,
    stock: 75,
  },
  {
    name: "Power Bank 20000mAh",
    description:
      "High-capacity power bank with dual USB output and USB-C input.",
    price: 1899,
    stock: 60,
  },
  {
    name: "Smart LED Bulb",
    description:
      "Wi-Fi enabled smart LED bulb with adjustable brightness and app control.",
    price: 699,
    stock: 100,
  },
  {
    name: "Portable Bluetooth Speaker",
    description:
      "Compact Bluetooth speaker with rich sound, built-in microphone, and 12-hour battery life.",
    price: 1299,
    stock: 55,
  },
  {
    name: "Laptop Stand",
    description:
      "Adjustable aluminum laptop stand designed for comfortable viewing and improved airflow.",
    price: 999,
    stock: 40,
  },
  {
    name: "USB-C Hub",
    description:
      "Multi-port USB-C hub with HDMI, USB 3.0, SD card, and USB-C charging support.",
    price: 1599,
    stock: 35,
  },
  {
    name: "1080p Full HD Webcam",
    description:
      "Full HD webcam with built-in microphone suitable for video calls and online meetings.",
    price: 2199,
    stock: 25,
  },
  {
    name: "Smartphone Tripod",
    description:
      "Adjustable tripod stand with phone holder for photography, video recording, and streaming.",
    price: 799,
    stock: 70,
  },
  {
    name: "Wireless Charging Pad",
    description:
      "Fast wireless charging pad compatible with Qi-enabled smartphones and accessories.",
    price: 899,
    stock: 65,
  },
  {
    name: "External SSD 1TB",
    description:
      "Portable 1TB solid-state drive with high-speed USB-C connectivity.",
    price: 7499,
    stock: 20,
  },
  {
    name: "Laptop Backpack",
    description:
      "Water-resistant laptop backpack with multiple compartments and a padded laptop sleeve.",
    price: 1799,
    stock: 45,
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Adjustable office chair with lumbar support, padded seat, and height adjustment.",
    price: 8499,
    stock: 12,
  },
  {
    name: "24-inch Full HD Monitor",
    description:
      "24-inch Full HD monitor with IPS display, HDMI connectivity, and low blue light mode.",
    price: 10999,
    stock: 18,
  },
  {
    name: "Smart Fitness Band",
    description:
      "Fitness band with heart-rate tracking, sleep monitoring, step tracking, and notifications.",
    price: 2499,
    stock: 35,
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Insulated stainless steel water bottle that keeps beverages cold or hot for several hours.",
    price: 699,
    stock: 90,
  },
  {
    name: "Electric Coffee Grinder",
    description:
      "Compact electric coffee grinder with adjustable grinding settings and stainless steel blades.",
    price: 1399,
    stock: 28,
  },
  {
    name: "Digital Kitchen Scale",
    description:
      "Precise digital kitchen scale with LCD display and measurements up to 10 kilograms.",
    price: 599,
    stock: 80,
  },
  {
    name: "Non-Stick Frying Pan",
    description:
      "Durable non-stick frying pan with heat-resistant handle suitable for everyday cooking.",
    price: 899,
    stock: 50,
  },
  {
    name: "LED Desk Lamp",
    description:
      "Adjustable LED desk lamp with multiple brightness levels and flexible neck.",
    price: 799,
    stock: 65,
  },
  {
    name: "Memory Foam Pillow",
    description:
      "Ergonomic memory foam pillow designed to provide comfortable neck and head support.",
    price: 1299,
    stock: 40,
  },
  {
    name: "Cotton Casual T-Shirt",
    description:
      "Soft and breathable cotton t-shirt suitable for everyday casual wear.",
    price: 599,
    stock: 120,
  },
  {
    name: "Running Shoes",
    description:
      "Lightweight running shoes with cushioned soles designed for everyday running and workouts.",
    price: 2999,
    stock: 35,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.insertMany(products);
    console.log(`${products.length} products inserted successfully`);
    process.exit(0);
  } catch (error) {
    console.error("Error inserting products:", error);
    process.exit(1);
  }
};

seedProducts();
