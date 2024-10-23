import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import Meta from "gi://Meta";
import Shell from "gi://Shell";

export default class TogglerExtension extends Extension {
  constructor(metadata) {
    super(metadata);
    this._settings = null;
  }

  _toggleTerminal() {
    const id = this._settings.get_string("terminal-id");
    const appSys = Shell.AppSystem.get_default();
    const terminalApp = appSys.lookup_app(id);
    if (!terminalApp) return;

    const terminalWindows = terminalApp.get_windows();

    if (!terminalWindows.length) {
      return terminalApp.open_new_window(-1);
    }

    const focusWindow = global.display.get_focus_window();
    const focusWindowId = focusWindow ? focusWindow.get_id() : null;

    for (const window of terminalWindows) {
      if (window.get_id() === focusWindowId) {
        return window.minimize();
      }
    }

    const activeWorkspaceIndex =
      global.workspace_manager.get_active_workspace_index();

    for (const window of terminalWindows) {
      if (window.get_workspace().index() === activeWorkspaceIndex) {
        return Main.activateWindow(window);
      }
    }

    const workspacesMode = this._settings.get_int("workspaces-mode");

    if (workspacesMode === 2) {
      return terminalApp.open_new_window(-1);
    }

    const window = terminalWindows[0];

    if (workspacesMode === 0) {
      window.change_workspace_by_index(activeWorkspaceIndex, false);
    }

    return Main.activateWindow(window);
  }

  enable() {
    this._settings = this.getSettings();
    Main.wm.addKeybinding(
      "terminal-shortcut",
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      () => {
        this._toggleTerminal();
      },
    );
  }

  disable() {
    Main.wm.removeKeybinding("terminal-shortcut");
    this._settings = null;
  }
}
