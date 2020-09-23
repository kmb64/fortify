import { BrowserWindow, IWindowOptions } from './window';
import { intl } from '../locale';
import { windows } from '../application';

export class SettingsWindow extends BrowserWindow {
  constructor(options: Pick<IWindowOptions, 'onClosed'>) {
    super({
      ...options,
      size: 'default',
      app: 'settings',
      title: intl('settings'),
    });
  }

  /**
   * Create the browser window.
   */
  static create() {
    /**
     * Don't create if the window exists.
     */
    if (windows.settings) {
      windows.settings.focus();
      windows.settings.show();

      return;
    }

    windows.settings = new SettingsWindow({
      onClosed: () => {
        delete windows.settings;
      },
    });
  }
}