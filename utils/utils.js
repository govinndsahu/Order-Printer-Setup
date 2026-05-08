import Order from "../models/orderModel.js";
import { existsSync } from "node:fs";
import path from "node:path";

import { printData, startPrinterServer } from "node-thermal-printer-js";

let orderStream = null;

const resolveBundledPython = () => {
  const candidates = process.platform === "win32"
    ? [
      path.join(process.cwd(), "runtime-environments", "python", "python.exe"),
      path.join(process.cwd(), "runtime-environments", "python", "python"),
    ]
    : [
      path.join(process.cwd(), "runtime-environments", "python", "python"),
      path.join(process.cwd(), "runtime-environments", "python", "python3"),
      path.join(process.cwd(), "runtime-environments", "python", "python.exe"),
    ];

  return candidates.find((candidate) => existsSync(candidate));
};

export const connectPrinter = async () => {
  // Allow quick-start or CI to disable BLE server if not available
  if (process.env.PRINTER_BLE_DISABLE === "1") {
    console.log("BLE disabled via PRINTER_BLE_DISABLE=1; skipping printer server startup");
    return;
  }

  try {
    const bundledPython =
      process.env.PRINTER_PYTHON_CMD || resolveBundledPython();

    return await startPrinterServer({
      bleName: process.env.BLE_NAME,
      pythonCmd: bundledPython,
      chunkSize: 244,
      delayMs: 0,
      pair: false,
    });
  } catch (error) {
    console.log(error);
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
    }
  });

  orderStream.on("error", (error) => {
    console.error("Change stream error:", error);
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
