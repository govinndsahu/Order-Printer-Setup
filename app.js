import "dotenv/config";
import mongoose from "mongoose";
import { stopPrinterServer } from "node-thermal-printer-js";
import { runServer, stopOrderStream, restartServer } from "./utils/utils.js";

await runServer();

// Handle process-level errors
process.on("uncaughtException", async (error) => {
  console.error("🚨 Uncaught Exception:", error);
  await restartServer();
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
  await restartServer();
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await stopOrderStream();
  await mongoose.disconnect();
  await stopPrinterServer();
  console.log("DB client disconnected!!");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await stopOrderStream();
  await mongoose.disconnect();
  await stopPrinterServer();
  console.log("DB client disconnected!!");
  process.exit(0);
});
