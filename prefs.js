'use strict';


const {Adw, Gio, Gtk} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;


function init() {
}


function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings();

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    const rowId = new Adw.ActionRow({
        title: 'Terminal App ID',
        subtitle: '/usr/share/applications/',
    });
    group.add(rowId);

    const entryId = new Gtk.Entry({
        placeholder_text: 'org.gnome.Terminal.desktop',
        text: settings.get_string('terminal-id'),
        valign: Gtk.Align.CENTER,
        hexpand: true,
    });

    rowId.add_suffix(entryId);
    rowId.activatable_widget = entryId;

    settings.bind(
        'terminal-id',
        entryId,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    const rowShortcut = new Adw.ActionRow({
        title: 'Toggle Shortcut',
        subtitle: '&lt;special_key&gt;regular_key',
    });
    group.add(rowShortcut);

    const entryShortcut = new Gtk.Entry({
        placeholder_text: '<Control>space',
        text: settings.get_string('terminal-shortcut-text'),
        valign: Gtk.Align.CENTER,
        hexpand: true,
    });

    rowShortcut.add_suffix(entryShortcut);
    rowShortcut.activatable_widget = entryShortcut;

    settings.bind(
        'terminal-shortcut-text',
        entryShortcut,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    settings.connect('changed::terminal-shortcut-text', () => {
        const shortcutText = settings.get_string('terminal-shortcut-text');
        const [success, key, mods] = Gtk.accelerator_parse(shortcutText);

        if (success && Gtk.accelerator_valid(key, mods)) {
            const shortcut = Gtk.accelerator_name(key, mods);
            settings.set_strv('terminal-shortcut', [shortcut]);
        } else {
            settings.set_strv('terminal-shortcut', []);
        }
    });

    window.add(page);
}
