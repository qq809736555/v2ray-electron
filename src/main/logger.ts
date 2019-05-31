import { BrowserWindow } from "electron";
import * as path from "path";
const MAX_LINE_NUMBER = 1024;
declare const __static: string;

export default class Logger {
  store: Array<String>;
  windowOpen: boolean;
  win: null | BrowserWindow;
  constructor() {
    this.store = [];
    this.windowOpen = false;
    this.win = null;
  }

  append(data: Buffer) {
    let lines = data.toString().split("\n");
    if (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }
    this.store = [...this.store, ...lines];
    if (this.store.length > MAX_LINE_NUMBER) {
      this.store = this.store.slice(this.store.length - MAX_LINE_NUMBER);
    }
    if (this.windowOpen) {
      this.win && this.win.webContents.send("log", lines);
    }
  }

  showWindow() {
    if (!this.win) {
      this.win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Log Viewer - V2Ray Electron",
        webPreferences: { nodeIntegration: true }
      });
      this.win.on("closed", () => {
        this.win = null;
        this.windowOpen = false;
      });

      this.win.setMenu(null);
      this.win.loadURL(
        `file://${path.join(__static, "pages", "logger", "index.html")}`
      );
      this.win.webContents.on("did-finish-load", () => {
        if (this.win) this.win.webContents.send("log", this.store);
      });
      this.windowOpen = true;
    } else {
      this.win.focus();
    }
  }
}