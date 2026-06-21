# Printer Setup

This project is built around our own `node-thermal-printer-js` npm package, developed specifically for this printer workflow. It powers the Node.js service that watches the `Order` collection in MongoDB and prints each new order end to end.

The package is the heart of the setup: it handles the printer startup flow, the transport integration, and the order-printing path that makes this project run.

When the app starts, it:

1. Connects to MongoDB.
2. Starts the printer server unless BLE is disabled.
3. Watches for new order inserts.
4. Prints each inserted order automatically.

## Project Layout

- `app.js` - application entry point.
- `config/db.js` - MongoDB connection setup.
- `models/orderModel.js` - Mongoose schema for orders.
- `utils/utils.js` - printer startup, change stream, and print formatting logic.
- `startPrinter.bat` - Windows helper to start the app with the bundled runtime.
- `runtime-environments/` - bundled Node.js and Python runtimes used by the app.

## Requirements

- A reachable MongoDB instance.
- A MongoDB deployment that supports change streams, such as a replica set or Atlas cluster.
- Access to the printer hardware or transport expected by our `node-thermal-printer-js` package.

## Configuration

Create a `.env` file in the project root with at least:

```env
MONGODB_CONNECTION_URL=your-mongodb-connection-string
BLUETOOTH_DEVICE_NAME=your-printer-ble-name
```

Optional variables:

```env
PRINTER_BLE_DISABLE=1
PRINTER_PYTHON_CMD=path-to-python-executable
MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8
TRANSPORT=your-printer-transport
```

- `MONGODB_CONNECTION_URL` is required for the database connection.
- `BLUETOOTH_DEVICE_NAME` is passed to the printer server when BLE startup is enabled.
- `PRINTER_BLE_DISABLE=1` skips printer-server startup for quick local development or CI.
- `PRINTER_PYTHON_CMD` overrides the bundled Python executable if you need a custom path.
- `MONGODB_DNS_SERVERS` overrides the DNS resolvers used for `mongodb+srv://` lookups. Use a comma-separated list such as `1.1.1.1,8.8.8.8`. Set it to `system` to keep the OS resolver.
- `TRANSPORT` is forwarded to our printer package when an order is printed.

## Running

### Windows

Use the bundled runtime and start script:

```bat
startPrinter.bat
```

Or, if you want to run it manually:

```bat
call runtime-environments\activate.bat
npm run dev
```

This starts Node in watch mode using the bundled runtime.

## What Gets Printed

Each new order insert is formatted as:

- `New Order`
- `Table No: <table number>`
- one line per product, using the product name, quantity, and half/full flag when present

## Shutdown

The app handles `SIGINT` and `SIGTERM`, stops the order stream, disconnects from MongoDB, and shuts down the printer server before exiting.

## Troubleshooting

- If the app connects to MongoDB but never prints, confirm that your MongoDB deployment supports change streams.
- If BLE hardware is unavailable, set `PRINTER_BLE_DISABLE=1` to skip printer-server startup.
- If the bundled Python runtime is not usable on your machine, set `PRINTER_PYTHON_CMD` to a working Python executable.
- If you see `querySrv ECONNREFUSED` while connecting to Atlas, set `MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8` in your `.env` or switch to a standard `mongodb://` connection string.
