const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process'); 
const winston = require('winston'); // For logging errors

// Logger setup
const logger = winston.createLogger({
  level: 'error',
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'error-log.log', format: winston.format.simple() }),
  ],
});


// Create the main application window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer', 'app.js'),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

// App initialization
app.on('ready', () => {
  try {
    createWindow();
  } catch (error) {
    logger.error(`Error during app initialization: ${error.message}\nStack: ${error.stack}`);
    dialog.showErrorBox('App Initialization Error', 'The application failed to start.');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Quotation Generation Handler
ipcMain.handle('generate-quotation', async (event, data) => {
  try {
    // Show Save Dialog
    const saveResult = await dialog.showSaveDialog({
      title: 'Save Quotation',
      defaultPath: `Quotation_${data.document_number || 'new'}.docx`,
      buttonLabel: 'Save',
      filters: [{ name: 'Word Documents', extensions: ['docx'] }],
    });

    if (saveResult.canceled) throw new Error('Save dialog was cancelled');

    const savePath = saveResult.filePath;

    // Access Python script from the resources folder
    const scriptPath = path.join(process.resourcesPath, 'generate_quotation.py');

    // Execute the Python script
    const jsonData = JSON.stringify(data).replace(/"/g, '\\"');
    const pythonCommand = `python3 "${scriptPath}" "${jsonData}" "${savePath}"`;

    return new Promise((resolve, reject) => {
      exec(pythonCommand, (error, stdout, stderr) => {
        if (error || stderr) {
          logger.error(`Python Execution Error: ${error || stderr}`);
          reject(new Error('Failed to generate the quotation.'));
        } else {
          logger.info('Python script executed successfully.');
          resolve(savePath);
        }
      });
    });
  } catch (error) {
    logger.error(`Error in generate-quotation handler: ${error.message}\nStack: ${error.stack}`);
    throw error;
  }
});