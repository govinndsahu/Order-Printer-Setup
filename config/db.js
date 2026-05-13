import dns from "node:dns";
import mongoose from "mongoose";

const defaultMongoDnsServers = ["1.1.1.1", "8.8.8.8"];

const configureMongoDns = () => {
  const connectionUrl = process.env.MONGODB_CONNECTION_URL ?? "";

  console.log(connectionUrl);

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
