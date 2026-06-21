import Order from "../models/orderModel.js";
import { existsSync } from "node:fs";
import path from "node:path";
import dns from "node:dns";

import {
  printData,
  startPrinterServer,
  stopPrinterServer,
} from "node-thermal-printer-js";

import { connectDB } from "../config/db.js";
import mongoose from "mongoose";

let orderStream = null;
let isRestarting = false;

const defaultMongoDnsServers = ["1.1.1.1", "8.8.8.8"];

const resolveBundledPython = () => {
  const candidates =
    process.platform === "win32"
      ? [
        path.join(
          process.cwd(),
          "runtime-environments",
          "python",
          "python.exe",
        ),
        path.join(process.cwd(), "runtime-environments", "python", "python"),
      ]
      : [
        path.join(process.cwd(), "runtime-environments", "python", "python"),
        path.join(process.cwd(), "runtime-environments", "python", "python3"),
        path.join(
          process.cwd(),
          "runtime-environments",
          "python",
          "python.exe",
        ),
      ];

  return candidates.find((candidate) => existsSync(candidate));
};

export const connectPrinter = async () => {
  // Allow quick-start or CI to disable BLE server if not available
  if (process.env.PRINTER_BLE_DISABLE === "1") {
    console.log(
      "BLE disabled via PRINTER_BLE_DISABLE=1; skipping printer server startup",
    );
    return;
  }

  try {
    const bundledPython =
      process.env.PRINTER_PYTHON_CMD || resolveBundledPython();

    return await startPrinterServer({
      bleName: process.env.BLUETOOTH_DEVICE_NAME,
      pythonCmd: bundledPython,
      chunkSize: 244,
      delayMs: 0,
      pair: false,
    });
  } catch (error) {
    console.log(error);
    await restartServer();
  }
};

export const formatItem = (item) =>
  `${item?.half_price ? "Half" : "Full"} ${item?.name ?? "Item"} x ${item?.quantity ?? 1}`;

export const printOrder = async (order) => {
  const items = Array.isArray(order.products)
    ? order.products.map(formatItem)
    : [];

  const data = [
    "New Order",
    `Table No: ${order.tableNumber}`,
    "",
    ...items,
  ].join("\n");

  await printData(data, {
    autoStart: false,
    transport: process.env.TRANSPORT,
  });
};

export const startOrderStream = async () => {
  if (orderStream) {
    return;
  }

  orderStream = Order.watch([{ $match: { operationType: "insert" } }], {
    fullDocument: "updateLookup",
  });

  orderStream.on("change", async (change) => {
    const order = change.fullDocument;

    if (!order) {
      return;
    }

    try {
      await printOrder(order);
      console.log(`Printed order: ${order._id}`);
    } catch (error) {
      console.error("Failed to print order from change stream:", error);
      await restartServer();
    }
  });

  orderStream.on("error", async (error) => {
    console.error("Change stream error:", error);
    await restartServer();
  });

  console.log("Listening for new order inserts via MongoDB change stream...");
};

export const stopOrderStream = async () => {
  if (!orderStream) {
    return;
  }

  await orderStream.close();
  orderStream = null;
};

export const restartServer = async () => {
  if (isRestarting) {
    console.log("Server restart already in progress...");
    return;
  }

  isRestarting = true;
  console.log("🔄 Restarting server...");

  try {
    // Clean up existing connections
    await stopOrderStream();
    await mongoose.disconnect();
    await stopPrinterServer();
    console.log("✓ Cleanup completed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }

  // Wait a bit before restarting
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Restart the server
    await runServer();
    console.log("✓ Server restarted successfully");
  } catch (error) {
    console.error("Failed to restart server:", error);
    isRestarting = false;
    // Retry after delay
    setTimeout(() => restartServer(), 5000);
  }

  isRestarting = false;
};

export const runServer = async () => {
  await connectDB();

  await connectPrinter();

  await startOrderStream();
};

export const configureMongoDns = () => {
  const connectionUrl = process.env.MONGODB_CONNECTION_URL ?? "";

  if (!connectionUrl.startsWith("mongodb+srv://")) {
    return;
  }

  if (process.env.MONGODB_DNS_SERVERS?.toLowerCase() === "system") {
    return;
  }

  const configuredServers = process.env.MONGODB_DNS_SERVERS
    ? process.env.MONGODB_DNS_SERVERS.split(",")
      .map((server) => server.trim())
      .filter(Boolean)
    : defaultMongoDnsServers;

  dns.setServers(configuredServers);
};
