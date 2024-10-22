import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import Adw from "gi://Adw";
import GLib from 'gi://GLib';
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

export default class TogglerPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    const terminalGroup = new Adw.PreferencesGroup({
      title: "Terminal settings"
    });
    page.add(terminalGroup);

    // App ID
    const rowId = new Adw.ActionRow({
      title: "Terminal App ID",
      subtitle: "/usr/share/applications/",
    });
    terminalGroup.add(rowId);

    const entryId = new Gtk.Entry({
      placeholder_text: "org.gnome.Terminal.desktop",
      text: settings.get_string("terminal-id"),
      valign: Gtk.Align.CENTER,
      hexpand: true,
    });

    settings.bind(
      "terminal-id",
      entryId,
      "text",
      Gio.SettingsBindFlags.DEFAULT,
    );

    rowId.add_suffix(entryId);
    rowId.activatable_widget = entryId;

    // Shortcut
    const rowShortcut = new Adw.ActionRow({
      title: "Toggle Shortcut",
      subtitle: "&lt;special_key&gt;regular_key",
    });
    terminalGroup.add(rowShortcut);

    const entryShortcut = new Gtk.Entry({
      placeholder_text: "<Control>space",
      text: settings.get_string("terminal-shortcut-text"),
      valign: Gtk.Align.CENTER,
      hexpand: true,
    });

    settings.bind(
      "terminal-shortcut-text",
      entryShortcut,
      "text",
      Gio.SettingsBindFlags.DEFAULT,
    );

    rowShortcut.add_suffix(entryShortcut);
    rowShortcut.activatable_widget = entryShortcut;

    // Workspaces
    const groupWorkspaces = new Adw.PreferencesGroup({
      title: "Workspaces behavior"
    });
    page.add(groupWorkspaces)
    const actionGroup = new Gio.SimpleActionGroup()
    actionGroup.add_action(settings.create_action('workspaces-mode'))
    page.insert_action_group('toggler', actionGroup)

    const modes = [
      { mode: 'move-opened', title: 'Move the window to the current workspace' },
      { mode: 'focus-opened', title: 'Switch to the workspace with the terminal window' },
      { mode: 'one-per-space', title: 'Launch a new instance in the current workspace' },
    ];

    for (const { mode, title } of modes) {
      const check = new Gtk.CheckButton({
        action_name: 'toggler.workspaces-mode',
        action_target: new GLib.Variant('s', mode),
      });
      const row = new Adw.ActionRow({
        activatable_widget: check,
        title,
      });
      row.add_prefix(check);
      groupWorkspaces.add(row);
    }

    settings.connect("changed::terminal-shortcut-text", () => {
      const shortcutText = settings.get_string("terminal-shortcut-text");
      const [success, key, mods] = Gtk.accelerator_parse(shortcutText);

      if (success && Gtk.accelerator_valid(key, mods)) {
        const shortcut = Gtk.accelerator_name(key, mods);
        settings.set_strv("terminal-shortcut", [shortcut]);
      } else {
        settings.set_strv("terminal-shortcut", []);
      }
    });

    window.add(page);
  }
}
