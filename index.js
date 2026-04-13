import express from "express";
import axios from "axios";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const SHOP = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_CLIENT_SECRET;

// ================= MCP SERVER =================
const server = new Server(
  {
    name: "glona-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 🛒 Tool: Get Products
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "get_products",
        description: "Get all products from Shopify",
      },
    ],
  };
});

server.setRequestHandler("tools/call", async (req) => {
  if (req.params.name === "get_products") {
    const res = await axios.get(
      `https://${SHOP}/admin/api/2023-10/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
        },
      }
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data),
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: "Unknown tool" }],
  };
});

// تشغيل MCP
const transport = new StdioServerTransport();
server.connect(transport);

// ================= EXPRESS =================
app.get("/", (req, res) => {
  res.send("MCP Server Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
