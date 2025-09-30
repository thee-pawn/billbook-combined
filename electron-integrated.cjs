const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');

// Keep references to processes and window
let mainWindow;
let backendProcess = null;
let backendPort = 3000;
let backendReady = false;

// Backend management functions
function getBackendPath() {
  if (isDev) {
    // In development, use the backend from the project structure
    return path.join(__dirname, '..', 'backend');
  } else {
    // In production, backend is bundled in resources
    return path.join(process.resourcesPath, 'backend');
  }
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const backendDir = getBackendPath();

    console.log('🌐 Starting BillBook backend server...');
    console.log('Backend directory:', backendDir);

    // Check if backend directory exists
    if (!fs.existsSync(backendDir)) {
      console.error('❌ Backend directory not found:', backendDir);
      reject(new Error('Backend directory not found'));
      return;
    }

    // Check if package.json exists
    const packagePath = path.join(backendDir, 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.error('❌ Backend package.json not found');
      reject(new Error('Backend package.json not found'));
      return;
    }

    // Start the backend server
    const isWindows = process.platform === 'win32';
    const npmCommand = isWindows ? 'npm.cmd' : 'npm';

    backendProcess = spawn(npmCommand, ['start'], {
      cwd: backendDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: backendPort
      }
    });

    let startupOutput = '';

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      startupOutput += output;
      console.log('Backend:', output.trim());

      // Check if server is ready
      if (output.includes('Server running') || output.includes('listening on') || output.includes('started')) {
        backendReady = true;
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('Backend Error:', error.trim());

      // Some npm warnings are not fatal
      if (!error.includes('WARN') && !backendReady) {
        reject(new Error(`Backend startup error: ${error}`));
      }
    });

    backendProcess.on('error', (error) => {
      console.error('❌ Failed to start backend:', error);
      reject(error);
    });

    backendProcess.on('exit', (code) => {
      if (code !== 0 && !backendReady) {
        console.error(`❌ Backend exited with code ${code}`);
        reject(new Error(`Backend exited with code ${code}`));
      } else {
        console.log('🛑 Backend server stopped');
      }
      backendProcess = null;
      backendReady = false;
    });

    // Timeout after 30 seconds if backend doesn't start
    setTimeout(() => {
      if (!backendReady) {
        console.error('❌ Backend startup timeout');
        reject(new Error('Backend startup timeout'));
      }
    }, 30000);
  });
}

function stopBackend() {
  return new Promise((resolve) => {
    if (backendProcess) {
      console.log('🛑 Stopping backend server...');

      // On Windows, we need to kill the process tree
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${backendProcess.pid} /T /F`, (error) => {
          if (error) {
            console.log('Note: Backend process cleanup completed');
          }
          backendProcess = null;
          backendReady = false;
          resolve();
        });
      } else {
        backendProcess.kill('SIGTERM');
        setTimeout(() => {
          if (backendProcess) {
            backendProcess.kill('SIGKILL');
          }
          backendProcess = null;
          backendReady = false;
          resolve();
        }, 5000);
      }
    } else {
      resolve();
    }
  });
}

async function waitForBackend(maxRetries = 30) {
  const { net } = require('electron');

  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const request = net.request(`http://localhost:${backendPort}`);
        request.on('response', () => resolve());
        request.on('error', () => reject(new Error('Backend not ready')));
        request.setTimeout(2000);
        request.end();
      });

      console.log('✅ Backend server is ready!');
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for backend... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Backend failed to start within timeout period');
}

async function createWindow() {
  // Start backend server first
  try {
    console.log('🚀 Starting BillBook backend...');
    await startBackend();
    await waitForBackend();
  } catch (error) {
    console.error('❌ Failed to start backend:', error.message);

    // Show error dialog to user
    const { dialog } = require('electron');
    const result = await dialog.showMessageBox({
      type: 'error',
      title: 'BillBook Backend Error',
      message: 'Failed to start BillBook backend server.',
      detail: `Error: ${error.message}\n\nWould you like to try again?`,
      buttons: ['Retry', 'Exit'],
      defaultId: 0
    });

    if (result.response === 0) {
      // Retry
      setTimeout(() => createWindow(), 2000);
      return;
    } else {
      // Exit
      app.quit();
      return;
    }
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'src/assets/images/bb_icon.png'),
    titleBarStyle: 'default',
    show: false,
    title: 'BillBook - Business Management System'
  });

  // Always load from local backend in integrated mode
  const startUrl = `http://localhost:${backendPort}`;

  console.log('🎯 Loading BillBook from:', startUrl);

  try {
    await mainWindow.loadURL(startUrl);
  } catch (error) {
    console.error('❌ Failed to load application:', error);

    // Fallback to built files if backend URL fails
    const fallbackUrl = `file://${path.join(__dirname, 'dist/index.html')}`;
    console.log('🔄 Falling back to:', fallbackUrl);
    await mainWindow.loadURL(fallbackUrl);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Show success notification
    console.log('✅ BillBook is ready!');
  });

  // Handle window closing
  mainWindow.on('close', async (event) => {
    if (backendProcess) {
      event.preventDefault();

      console.log('🛑 Shutting down BillBook...');
      mainWindow.hide();

      try {
        await stopBackend();
        console.log('✅ Backend stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping backend:', error);
      }

      mainWindow.destroy();
      mainWindow = null;
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create Windows-friendly menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (!mainWindow) {
              createWindow();
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About BillBook',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About BillBook',
              message: 'BillBook',
              detail: 'Business Management System\nVersion 1.0.0\n\nA comprehensive solution for managing your business operations.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  // Always quit the app when all windows are closed
  await stopBackend();
  app.quit();
});

app.on('before-quit', async (event) => {
  if (backendProcess) {
    event.preventDefault();
    await stopBackend();
    app.quit();
  }
});

// Security
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle app protocol (for deep linking if needed)
app.setAsDefaultProtocolClient('billbook');
