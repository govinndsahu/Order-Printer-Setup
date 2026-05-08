# Using the bundled runtime-environments

This project includes a `runtime-environments` folder containing local Node.js and Python runtimes. Use the provided activation scripts to run commands without relying on system-installed runtimes.

Files added:

- [runtime-environments/activate.bat](runtime-environments/activate.bat)
- [runtime-environments/activate.ps1](runtime-environments/activate.ps1)
- [runtime-environments/activate.sh](runtime-environments/activate.sh)

Quick usage

- On Windows CMD (recommended):

  call runtime-environments\activate.bat

  After running that, `node`, `npm` and `python` refer to the bundled runtimes for the current session.

- On PowerShell:

  .\runtime-environments\activate.ps1

- On Bash / WSL:

  source runtime-environments/activate.sh

Direct invocation (no activation)

- Node: `runtime-environments/nodejs/node.exe app.js` or `runtime-environments/nodejs\node.exe script.js`
- NPM: `runtime-environments/nodejs/npm.cmd install` (Windows) or `runtime-environments/nodejs/npm install` (POSIX)
- Python: `runtime-environments/python/python.exe script.py`

Notes and best practices

- Persisting environment: On Windows, run the batch with `call` to modify the current shell; otherwise the changes only apply to the spawned process.
- CI / automation: In CI pipelines, either call the activation script before running build steps, or invoke executables directly with their relative paths.
- package.json scripts: When you activate the runtime, normal `npm run` scripts will use the bundled `node` and `npm`. Alternatively reference the node executable directly in `package.json` scripts: e.g. `"start": "./runtime-environments/nodejs/node.exe app.js"`.
- PATH order: Activation prepends the local runtimes to `PATH`, so they take precedence over system-installed versions.

Disable BLE (quick-start)

If your machine doesn't have Bluetooth or you don't want the BLE server to start during development, set the environment variable `PRINTER_BLE_DISABLE=1` before running the app (or add it to your `.env` file). Example:

On Bash / WSL:

```bash
export PRINTER_BLE_DISABLE=1
source runtime-environments/activate.sh
npm run dev
```

On Windows CMD (call the activation first, then set):

```bat
call runtime-environments\activate.bat
set PRINTER_BLE_DISABLE=1
npm run dev
```

This will skip attempting to start the BLE helper process and let the app run without Bluetooth.
