import mongoose from "mongoose";
import { configureMongoDns } from "../utils/utils.js";

export const connectDB = async () => {
  try {
    configureMongoDns();
    await mongoose.connect(process.env.MONGODB_CONNECTION_URL);
    console.log("Mongodb connected");
  } catch (error) {
    console.error(error);
    if (error?.syscall === "querySrv" || error?.code === "ECONNREFUSED") {
      console.error(
        "MongoDB SRV lookup failed. If your network DNS refuses SRV records, set MONGODB_DNS_SERVERS to reachable resolvers like 1.1.1.1,8.8.8.8, or use a non-SRV mongodb:// connection string.",
      );
    }
    console.error("Could Not Connect to the Database");
    process.exit(1);
  }
};
