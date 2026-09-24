const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

const RAILWAY_URL = "https://ar-client-dear-management.fly.dev";
const RETRY_MS = 5000;

let mainWindow = null;
// Which screen to (re)load — switched via the "Akun" menu below, and also
// what a network-drop retry returns to, so an Admin/Owner mid-session isn't
// bounced back to the Client login on reconnect.
let currentPath = "/login";

function loadApp() {
  mainWindow.loadURL(RAILWAY_URL + currentPath).catch(() => {
    mainWindow.loadFile(path.join(__dirname, "offline.html"));
  });
}

function navigateTo(targetPath) {
  currentPath = targetPath;
  loadApp();
}

function buildMenu() {
  const template = [
    {
      label: "Akun",
      submenu: [
        { label: "Login Client/Channel", click: () => navigateTo("/login") },
        { label: "Login Admin/Owner", click: () => navigateTo("/admin-login") },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 840,
    title: "DEAR Management Channel",
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      contextIsolation: true,
    },
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode) => {
    if (errorCode === -3) return; // ERR_ABORTED (e.g. a redirect) — not a real failure
    mainWindow.loadFile(path.join(__dirname, "offline.html"));
    setTimeout(loadApp, RETRY_MS);
  });

  loadApp();
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
