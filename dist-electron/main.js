import { app as e, BrowserWindow as t } from "electron";
import n from "path";
import { fileURLToPath as a } from "url";
const l = a(import.meta.url), r = n.dirname(l), s = process.env.NODE_ENV === "development";
function i() {
  const o = new t({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    }
  });
  s ? (o.loadURL("http://localhost:5173"), o.webContents.openDevTools()) : o.loadFile(n.join(r, "../dist/index.html"));
}
e.whenReady().then(i);
e.on("window-all-closed", () => {
  process.platform !== "darwin" && e.quit();
});
e.on("activate", () => {
  t.getAllWindows().length === 0 && i();
});
