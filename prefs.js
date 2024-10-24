import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import Adw from "gi://Adw";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

export default class TogglerPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();

    const mainGroup = new Adw.PreferencesGroup({
      title: "Main Settings",
    });
    page.add(mainGroup);

    const workspacesGroup = new Adw.PreferencesGroup({
      title: "Workspaces Mode",
      description: "When the terminal window is not in the active workspace",
    });
    page.add(workspacesGroup);

    // App ID
    const rowId = new Adw.ActionRow({
      title: "Terminal App ID",
      subtitle: "/usr/share/applications/",
    });
    mainGroup.add(rowId);

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
      title: "Keyboard Shortcut",
      subtitle: "&lt;special_key&gt;regular_key",
    });
    mainGroup.add(rowShortcut);

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
    const actionGroup = new Gio.SimpleActionGroup();
    actionGroup.add_action(settings.create_action("workspaces-mode"));
    page.insert_action_group("toggler", actionGroup);

    const workspaceModes = [
      {
        mode: 0,
        title: "Move the terminal window to the current workspace",
      },
      {
        mode: 1,
        title: "Switch to the workspace with the terminal window",
      },
      {
        mode: 2,
        title: "Launch a new terminal instance in the current workspace",
      },
    ];

    for (const { mode, title } of workspaceModes) {
      const check = new Gtk.CheckButton({
        action_name: "toggler.workspaces-mode",
        action_target: new GLib.Variant("i", mode),
      });
      const row = new Adw.ActionRow({
        activatable_widget: check,
        title,
      });
      row.add_prefix(check);
      workspacesGroup.add(row);
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
