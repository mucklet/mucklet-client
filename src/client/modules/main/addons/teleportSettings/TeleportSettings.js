import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import LabelToggleBox from 'components/LabelToggleBox';

/**
 * TeleportSettings adds a settings tool for CharLog to PagePlayerSettings.
 */
class TeleportSettings {
  constructor(app, params) {
    this.app = app;

    this.app.require(['settings', 'pagePlayerSettings', 'confirm'], this._init.bind(this));
  }

  _init(module) {
    this.module = Object.assign({ self: this }, module);

    // Settings
    this.settingsPromise = this.module.settings.loadSettings('teleport', {
      showOwnRoomsInTeleports: true,
    });

    this.settingsPromise.then(settings => {
      this.module.pagePlayerSettings.addTool({
        id: 'showOwnRoomsInTeleports',
        sortOrder: 33,
        componentFactory: (user, player, state) => new ModelComponent(
          settings,
          new LabelToggleBox(l10n.l('teleportSettings.showOwnRoomsInTeleports', "Show owned rooms in teleports"), false, {
            className: 'common--formmargin',
            onChange: (v, c) => settings.set({ showOwnRoomsInTeleports: v }),
            popupTip: l10n.l('teleportSettings.showOwnRoomsInTeleports', "Show own rooms in the teleports list."),
            popupTipClassName: 'popuptip--width-s'
          }),
          (m, c) => c.setValue(settings.showOwnRoomsInTeleports, false)
        )
      });
    });
  }

  /**
   * @typedef {Object} TeleportSettings
   * @property {bool} showOwnRoomsInTeleports Flag telling if owned rooms should show up in teleport list.
   */

  /**
   * Returns a promise to the teleportTriggers settings.
   * @returns {Promise.<TeleportSettings>} Promise of settings.
   */
  getSettingsPromise() {
    return this.settingsPromise;
  }

  dispose() {
    this.module.pagePlayerSettings.removeTool('showOwnRoomsInTeleports');
  }
}

export default TeleportSettings;
