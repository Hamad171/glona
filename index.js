import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Shopify config
const SHOP = process.env.SHOPIFY_STORE;
const ACCESS_TOKEN = process.env.SHOPIFY_CLIENT_SECRET;

// =============================
// MCP ENDPOINT
// =============================
app.post("/mcp", async (req, res) => {
  const { action, input } = req.body;

  try {
    // TOOL 1: Get Products
    if (action === "get_products") {
      const response = await axios.get(
        `https://${SHOP}/admin/api/2023-10/products.json`,
        {
          headers: {
            "X-Shopify-Access-Token": ACCESS_TOKEN,
          },
        }
      );

      return res.json({
        success: true,
        data: response.data.products,
      });
    }

    // TOOL 2: Create Order
    if (action === "create_order") {
      const orderData = {
        order: {
          line_items: input.items,
          customer: {
            first_name: input.first_name,
            last_name: input.last_name,
            email: input.email,
          },
          financial_status: "pending",
        },
      };

      const response = await axios.post(
        `https://${SHOP}/admin/api/2023-10/orders.json`,
        orderData,
        {
          headers: {
            "X-Shopify-Access-Token": ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json({
        success: true,
        data: response.data,
      });
    }

    // Unknown action
    return res.status(400).json({
      error: "Unknown action",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// =============================
// HEALTH CHECK
// =============================
app.get("/", (req, res) => {
  res.send("MCP Server Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
