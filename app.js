import "dotenv/config";
import mongoose from "mongoose";
import { stopPrinterServer } from "node-thermal-printer-js";
import { connectDB } from "./config/db.js";
import {
  connectPrinter,
  startOrderStream,
  stopOrderStream,
} from "./utils/utils.js";

await connectDB();

await connectPrinter();

await startOrderStream();

process.on("SIGINT", async () => {
  await stopOrderStream();
  await mongoose.disconnect();
  await stopPrinterServer();
  console.log("DB client disconnected!!");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await stopOrderStream();
  await mongoose.disconnect();
  await stopPrinterServer();
  console.log("DB client disconnected!!");
  process.exit(0);
});
