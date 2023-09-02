import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import Meta from "gi://Meta";
import Shell from "gi://Shell";

const MODE = Shell.ActionMode.NORMAL;
const FLAG = Meta.KeyBindingFlags.NONE;

const appSys = Shell.AppSystem.get_default();

export default class TogglerExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._settings = null;
    }

    _toggleTerminal() {
        let id = this._settings.get_string("terminal-id");
        let terminal = appSys.lookup_app(id);
        if (!terminal) return;

        let windows = terminal.get_windows();
        let focus = global.display.get_focus_window();
        let focusedWindow = focus ? focus.get_id() : null;

        if (!windows.length) {
            return terminal.open_new_window(-1);
        }

        if (windows.length > 1) {
            return Main.activateWindow(windows[windows.length - 1]);
        }

        if (windows.length === 1) {
            if (focusedWindow === windows[0].get_id()) {
                return windows[0].minimize();
            } else {
                return Main.activateWindow(windows[0]);
            }
        }
    }

    enable() {
        this._settings = this.getSettings();

        Main.wm.addKeybinding("terminal-shortcut", this._settings, FLAG, MODE, () => {
            this._toggleTerminal();
        });
    }

    disable() {
        Main.wm.removeKeybinding("terminal-shortcut");
        this._settings = null;
    }
}
