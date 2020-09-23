/* eslint-disable class-methods-use-this */

import {
  BrowserWindow as ElectronWindow,
  shell,
  globalShortcut,
} from 'electron';
import * as url from 'url';
import * as winston from 'winston';

import { HTML_PATH, windowSizes, icons } from '../const';
import { locale } from '../locale';
import { isDevelopment } from '../utils';

type WindowAppType = 'about' | 'key-pin' | 'message' | 'p11-pin' | 'settings' | 'index';

export interface IBrowserWindow extends ElectronWindow {
  app: WindowAppType;
  lang: string;
  params: Assoc<any>;
}

export interface IWindowOptions {
  app: WindowAppType;
  title: string;
  size?: keyof typeof windowSizes;
  params?: Assoc<any>;
  onClosed: (...args: any[]) => void;
  windowOptions?: {
    modal?: boolean;
    alwaysOnTop?: boolean;
    x?: number;
    y?: number;
    center?: boolean;
    parent?: ElectronWindow ;
    show?: boolean;
  };
}

/**
 * Base class for create browser windows and interact with them.
 */
export class BrowserWindow {
  window: IBrowserWindow;

  constructor(options: IWindowOptions) {
    this.window = new ElectronWindow({
      title: options.title,
      ...this.getWindowDefaultOptions(),
      ...this.getWindowSize(options.size),
      ...options.windowOptions,
    }) as IBrowserWindow;

    this.onInit(options);
  }

  private onInit(options: IWindowOptions) {
    winston.info(`Fortify: Create window ${options.app}`);

    this.window.loadURL(url.format({
      pathname: HTML_PATH,
      protocol: 'file:',
      slashes: true,
    }));

    this.window.lang = locale.lang;
    this.window.app = options.app;
    this.window.params = options.params || {};

    this.onInitListeners(options);
  }

  private onInitListeners(options: IWindowOptions) {
    // Open a url from <a> on default OS browser
    this.window.webContents.on('will-navigate', (e: Event, href: string) => {
      if (href !== this.window.webContents.getURL()) {
        e.preventDefault();
        shell.openExternal(href);
      }
    });

    // Show page only after `lfinish-load` event and prevent show index page
    if (this.window.app !== 'index') {
      this.window.webContents.on('did-finish-load', () => {
        this.window.show();
      });
    }

    // Prevent BrowserWindow refreshes
    this.window.on('focus', () => {
      globalShortcut.registerAll(['CommandOrControl+R', 'F5'], () => {});
    });

    this.window.on('blur', () => {
      globalShortcut.unregisterAll();
    });

    this.window.on('close', () => {
      globalShortcut.unregisterAll();
    });

    this.window.on('closed', options.onClosed);
  }

  private getWindowDefaultOptions(): Electron.BrowserWindowConstructorOptions {
    return {
      icon: icons.favicon,
      autoHideMenuBar: true,
      minimizable: false,
      fullscreen: false,
      fullscreenable: false,
      // Prevent resize window on production
      resizable: isDevelopment,
      show: false,
      ...this.getWindowSize(),
      webPreferences: {
        nodeIntegration: true,
        // Prevent open DevTools on production
        devTools: isDevelopment,
      },
    };
  }

  private getWindowSize(size: keyof typeof windowSizes = 'default') {
    if (size === 'small') {
      return windowSizes.small;
    }

    return windowSizes.default;
  }

  public focus() {
    this.window.focus();
  }

  public show() {
    this.window.show();
  }

  public hide() {
    this.window.hide();
  }
}