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

    const focusedWindow = global.display.get_focus_window();
    const focusedTerminalWindow = terminalWindows.find(
      (window) => window === focusedWindow,
    );

    const activeWorkspaceIndex =
      global.workspace_manager.get_active_workspace_index();

    const unfocusedTerminalWindows = terminalWindows.filter(
      (window) =>
        window !== focusedTerminalWindow &&
        window.get_workspace().index() === activeWorkspaceIndex,
    );

    if (unfocusedTerminalWindows.length) {
      return Main.activateWindow(unfocusedTerminalWindows.at(-1));
    }

    if (focusedTerminalWindow) {
      return focusedTerminalWindow.minimize();
    }

    const workspacesMode = this._settings.get_int("workspaces-mode");

    if (workspacesMode === 2) {
      return terminalApp.open_new_window(-1);
    }

    const terminalWindow = terminalWindows.at(-1);

    if (workspacesMode === 0) {
      terminalWindow.change_workspace_by_index(activeWorkspaceIndex, false);
    }

    return Main.activateWindow(terminalWindow);
  }

  enable() {
    this._settings = this.getSettings();
    Main.wm.addKeybinding(
      "terminal-shortcut",
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      this._toggleTerminal.bind(this),
    );
  }

  disable() {
    Main.wm.removeKeybinding("terminal-shortcut");
    this._settings = null;
  }
}
