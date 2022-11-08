import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import { keyTooLong, itemNameTooLong } from 'utils/cmdErr';

const usageText = 'create profile <span class="param">Keyword</span> = <span class="param">Name</span>';
const shortDesc = 'Create a profile based on current appearance';
const helpText =
`<p>Create a profile based on your character's current appearance. This stores the <em>gender</em>, <em>species</em>, <em>description</em>, and <em>image</em>.</p>
<p><code class="param">Keyword</code> is the keyword to use for the profile.</p>
<p><code class="param">Name</code> is a descriptive name for the profile.</p>`;

/**
 * CreateProfile adds command to create a profile based on the character's current appearance.
 */
class CreateProfile {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'profile',
			next: [
				new TextStep('key', {
					regex: /^[\w\s]*\w/,
					name: "profile keyword",
					maxLength: () => this.module.info.getCore().keyMaxLength,
					errTooLong: keyTooLong,
				}),
				new DelimStep("=", {
					next: [
						new TextStep('name', {
							name: "profile name",
							maxLength: () => this.module.info.getCore().itemNameMaxLength,
							errTooLong: itemNameTooLong,
							errRequired: step => ({ code: 'createProfile.nameRequired', message: "What would the descriptive name of the profile be?" }),
						}),
					],
				}),
			],
			value: (ctx, p) => this.createProfile(ctx.char, {
				key: p.key,
				name: p.name,
			}),
		});

		this.module.help.addTopic({
			id: 'createProfile',
			category: 'profile',
			cmd: 'create profile',
			usage: l10n.l('createProfile.usage', usageText),
			shortDesc: l10n.l('createProfile.shortDesc', shortDesc),
			desc: l10n.l('createProfile.helpText', helpText),
			sortOrder: 110,
		});
	}

	createProfile(char, params) {
		return char.call('createProfile', params).then(result => {
		 	this.module.charLog.logInfo(char, l10n.l('createProfile.profileCreated', "Created profile \"{profileName}\".", { profileName: result.profile.name }));
		});
	}
}

export default CreateProfile;
