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

function idRoleTag(r) {
	return idRoleTags[r] || { id: r, idRole: r, key: r };
}

class OverviewAccountTitlesComponent extends ModelCollapser {
	constructor(module, user, state) {
		super(user, [
			{
				factory: () => {
					let model = new Model({ eventBus: module.self.app.eventBus });
					return new PanelSection(
						l10n.l('overviewAccountTitles.titles', "Titles"),
						new ModelComponent(
							user,
							new CharTagsList(model),
							(m, c, change) => model.reset(this._transformRoles(m.idRoles)),
						),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					);
				},
				condition: m => m.idRoles?.length,
			},
		]);
	}

	_transformRoles(roles) {
		let o = {};
		for (let r of roles) {
			o[r + '_like'] = idRoleTag(r);
		}
		return o;
	}
}

export default OverviewAccountTitlesComponent;
