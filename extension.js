'use strict';


const {Meta, Shell} = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

const MODE = Shell.ActionMode.NORMAL;
const FLAG = Meta.KeyBindingFlags.NONE;

const appSys = Shell.AppSystem.get_default();


class Extension {
    constructor() {
        this._settings = null;
    }


    _toggleTerminal() {
        let id = this._settings.get_string('terminal-id');
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
        this._settings = ExtensionUtils.getSettings();

        Main.wm.addKeybinding('terminal-shortcut', this._settings, FLAG, MODE, () => {
            this._toggleTerminal();
        });
    }


    disable() {
        Main.wm.removeKeybinding('terminal-shortcut');
        this._settings = null;
    }
}


function init() {
    return new Extension();
}
