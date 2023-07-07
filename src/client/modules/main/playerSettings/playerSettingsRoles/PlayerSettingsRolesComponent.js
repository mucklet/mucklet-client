import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import ModelCollapser from 'components/ModelCollapser';
import PanelSection from 'components/PanelSection';
import CharTagsList from 'components/CharTagsList';

const idRoleTags = [ 'overseer', 'supporter', 'pioneer', 'root' ].reduce((o, r) => {
	o[r] = {
		id: r,
		idRole: r,
		key: r,
	};
	return o;
}, {});

const roleTags = [ 'helper', 'moderator', 'builder', 'admin' ].reduce((o, r) => {
	o[r] = {
		id: r,
		role: r,
		key: r,
	};
	return o;
}, {});

function idRoleTag(r) {
	return idRoleTags[r] || { id: r, idRole: r, key: r };
}

function roleTag(r) {
	return roleTags[r] || { id: r, role: r, key: r };
}


class PlayerSettingsRolesComponent {
	constructor(module) {
		this.module = module;
	}

	render(el) {
		this.elem = new ModelCollapser(this.module.player.getModel(), [
			{
				factory: playerModel => {
					let model = new Model({ eventBus: this.module.self.app.eventBus });
					return new PanelSection(
						l10n.l('playerSettingsRoles.roles', "Roles"),
						new ModelComponent(
							playerModel,
							new CharTagsList(model),
							(m, c, change) => model.reset(this._transformRoles(playerModel)),
						),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					);
				},
				condition: m => m.idRoles?.length || m.roles?.length,
			},
		]);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_transformRoles(playerModel) {
		let o = {};
		if (playerModel.roles) {
			for (let r of playerModel.roles) {
				o[r + '_like'] = roleTag(r);
			}
		}
		if (playerModel.idRoles) {
			for (let r of playerModel.idRoles) {
				o[r + '_like'] = idRoleTag(r);
			}
		}
		return o;
	}
}

export default PlayerSettingsRolesComponent;
