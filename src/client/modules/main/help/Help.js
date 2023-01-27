import { Model, Collection, sortOrderCompare } from 'modapp-resource';
import TokenList from 'classes/TokenList';
import ListStep from 'classes/ListStep';
import RepeatStep from 'classes/RepeatStep';
import l10n from 'modapp-l10n';
import HelpComponent from './HelpComponent';
import HelpCategory from './HelpCategory';
import HelpTopic from './HelpTopic';
import HelpRelatedTopics from './HelpRelatedTopics';
import './help.scss';

const defaultCategories = [
	{
		id: 'basic',
		title: l10n.l('help.basicTitle', "Basic commands"),
		shortDesc: l10n.l('help.basicShortdesc', "Learn some basic commands"),
		desc: l10n.l('help.basicDesc',
			`<p class="common--formattext">The most basic and useful command is <span class="cmd">help</span>, which will list all available help topics.</p>` +
			`<p class="common--formattext">The <em>help</em> command also gives details on how to use a command, including the help command itself (meta!). Try typing:</p>` +
			`<section class="charlog--pad">` +
			`<div class="charlog--code"><code>help help</code></div>` +
			`</section>` +
			`<p>Below is a list of some basic commands:</p>`,
		),
		sortOrder: 10,
		alias: [ 'basics' ],
	},
	{
		id: 'communicate',
		title: l10n.l('help.communicateTitle', "Communication commands"),
		shortDesc: l10n.l('help.communicateShortDesc', "How to communicate in different ways"),
		desc: l10n.l('help.communicateDesc', `<p>Commands for talking, whispering, messaging, and more.</p>`),
		sortOrder: 20,
		alias: [ 'communication', 'talk', 'communications' ],
	},
	{
		id: 'reporting',
		title: l10n.l('help.requestTitle', "How to report incidents"),
		shortDesc: l10n.l('help.requestShortDesc', "How to reports incidents to the moderators"),
		desc: l10n.l('help.requestDesc',
			`<p>Moderators are here to help us keep this place nice, friendly, and respectful. Don't hesitate to report when someone is being disrespectful, toxic, or breaking realm or area rules. Reports can only be seen by moderators.</p>` +
			`<section class="charlog--pad">` +
			`	<h4>Report a character</h4>` +
			`	<p>To create a report, follow these steps:</p>` +
			`   <ol class="charlog--ol">` +
			`   <li>Hover over the reportable text in the chat log, or tap the text on mobile.</li>` +
			`   <li>Click on the menu icon (⋮) that appears to the right.</li>` +
			`   <li>Select <em>Report</em> to open the <em>Report character</em> dialog.</li>` +
			`   <li>Type a message explaining the report.</li>` +
			`   <li>Optionally choose the time interval of your log to attach.</li>` +
			`   <li>Click <em>Send report</em>.</li>` +
			`   </ol>` +
			`	<p>If you don't have any logs to attach, you can also use the <code>report</code> command:</p>` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>report John Mischief = Keeps spamming the room.</code></div></section>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Report a moderator</h4>` +
			`	<p>It is completely fine to report moderators if you find them acting abusive or unjust. When reporting a moderator, <em>another</em> moderator will review the report and get in contact with you. Remember to keep your own language respectful.</p>` +
			`</section>`,
		),
		sortOrder: 30,
		alias: [ 'abuse' ],
	},
	{
		id: 'transport',
		title: l10n.l('help.transportTitle', "Transportation commands"),
		shortDesc: l10n.l('help.transportShortDesc', "How to move between rooms"),
		desc: l10n.l('help.transportDesc', `<p>Commands for transporting between rooms, and manage teleport destinations.</p>`),
		sortOrder: 40,
		alias: [ 'transportation', 'move' ],
	},
	{
		id: 'profile',
		cmd: 'profiles',
		title: l10n.l('help.charTitle', "Profile commands"),
		shortDesc: l10n.l('help.charShortDesc', "How to manage your character's appearance and profiles"),
		desc: l10n.l('help.charDesc', `<p>Commands for managing your character's appearance and profiles.</p>`),
		sortOrder: 50,
		alias: [ 'manage profile', 'character', 'appearance' ],
	},
	{
		id: 'tags',
		title: l10n.l('help.tagsTitle', "Character tags"),
		shortDesc: l10n.l('help.tagsShortDesc', "How to view and manage character tags"),
		desc: l10n.l('help.basicDesc',
			`<p class="common--formattext">Tags are out of character info that gives a quick view of a character, and what kind of roleplay they are interested in. You can list a character's tags with the <em>whois</em> command:</p>` +
			`<section class="charlog--pad">` +
			`	<div class="charlog--code"><code>whois Jane Doe</code></div>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Tag colors</h4>` +
			`	<p><div class="chartagslist--item" style="display:inline-block"><div title="A character attribute or player preference." class="chartagslist--tag like hasdesc"><span>grey tag</span></div></div> is a character attribute or player preference.<br/>` +
			`	<div class="chartagslist--item" style="display:inline-block"><div title="Something the player dislikes as part of roleplay." class="chartagslist--tag dislike hasdesc"><span>red tag</span></div></div> is something the player dislikes as part of roleplay.<br/>` +
			`	<div class="chartagslist--item" style="display:inline-block"><div title="A title held by the player." class="chartagslist--tag title hasdesc"><span>blue tag</span></div></div> is a title held by the character's player, such as <em>moderator</em> or <em>admin</em>.</p>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Tag description</h4>` +
			`	<p>Hovering over a tag will show a description of the tag, if available. A tag name written in <i>italics</i> indicates a custom tag or a custom description. Custom descriptions can be used to clarify the scope of the tag.</p>` +
			`</section>`,
		),
		sortOrder: 60,
		alias: [ 'tag', 'manage tags' ],
	},
	{
		id: 'friends',
		title: l10n.l('help.friendsTitle', "Friends commands"),
		shortDesc: l10n.l('help.friendsShortDesc', "How to watch for friends and remember them"),
		desc: l10n.l('help.friendsDesc', `<p>Commands for managing friends and remembering them.</p>`),
		sortOrder: 70,
		alias: [ 'friend' ],
	},
	{
		id: 'mute',
		title: l10n.l('help.muteTitle', "Mute commands"),
		shortDesc: l10n.l('help.muteShortDesc', "How to mute unwanted messages"),
		desc: l10n.l('help.muteDesc', `<p>Commands for muting unwanted messages.</p>`),
		sortOrder: 80,
		alias: [ 'muting' ],
	},
	{
		id: 'puppets',
		title: l10n.l('help.puppetsTitle', "How to play with puppets"),
		shortDesc: l10n.l('help.puppetsShortDesc', "How to control and manage puppet characters"),
		desc: l10n.l('help.puppetsDesc',
			`<p>Puppets are shared characters that may be controlled by more than just the owner.</p>` +
			`<section class="charlog--pad">` +
			`	<h4>Identifying a puppet</h4>` +
			`	<p>Puppets are identified by a lighter blue background color of their character badges seen in the <em>Awake</em> or <em>In Room</em> lists. If they are awake, you can show the name of the current puppeteer by hovering over the character badge or a chat log message.</p>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Controlling a puppet</h4>` +
			`	<p>To control a puppet, you first have to register it. To register a puppet (e.g. Jane Shopkeeper), go the the same room and type:</p>` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>register puppet Jane Shopkeeper</code></div></section>` +
			`	<p>This will send a request to the owner of the puppet. Once that request is accepted, the puppet will be available in the <em>Character Select</em> page, where you can wake them up.</p>` +
			`	<p>If another puppeteer is using the puppet, the <em>Wake up</em> button will instead be replaced by the option to send a control request. If the puppeteer accepts the request, or if they do not respond within 5 minutes, you can take over control of the puppet.</p>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Playing a puppet</h4>` +
			`	<p>Most puppets have a <em>How to play</em> section below their description, only visible for the puppeteer. This section provides info on how the puppet is intented to be played.</p>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Interacting with a puppet</h4>` +
			`	<p>Each puppeteer will add their own personal touch to a puppet. Respect if a puppeteer plays a puppet differently than you would have preferred, and do not expect roleplay contingency between different puppeteers.</p>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Reporting a puppet</h4>` +
			`	<p>If a puppeteer breaks any rules while playing the puppet, you can report them as usual. Note that breaking character, not following the <em>How to play</em> guidelines, is not against the rules. To complain about how a puppet is played, contact the puppet's owner by sending a mail to the puppet. Mails sent to a puppet always lands in the owner's inbox.</p>` +
			`</section>`,
		),
		sortOrder: 90,
		alias: [ 'puppet' ],
	},
	{
		id: 'buildRooms',
		cmd: 'build rooms',
		title: l10n.l('help.buildRoomsTitle', "How to build rooms and exits"),
		shortDesc: l10n.l('help.buildRoomsShortDesc', "How to build rooms and exits"),
		desc: l10n.l('help.buildRoomsDesc',
			`<p>Do you wish to create your own private place, or maybe a new public hangout? Let's get you started.</p>` +
			`<section class="charlog--pad">` +
			`	<h4>Create rooms</h4>` +
			`	<p>To create a new room, type:</p>` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>create room</code></div></section>` +
			`	<p>This will teleport you to a new room with a default name. If you wish to set it as your home, type:</p>` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>register home</code></div></section>` +
			`	<p>When you own a room, a little pencil (<i aria-hidden="true" class="fa fa-pencil"></i>) icon will show up in the <em>Room Info</em> panel. Click this icon to edit the room.</p>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Create exits</h4>` +
			`	<p>In the <em>Room Info</em> panel, by the <em>Exits</em> section, you will also see a plus (<i aria-hidden="true" class="fa fa-plus"></i>) icon. Click this icon to create an exit to a new room, or to an old room of yours. If you create a new room, a return exit will automatically be created.</p>` +
			`	<p>Each exit will also have a pencil (<i aria-hidden="true" class="fa fa-pencil"></i>) icon that lets you edit the exit's attributes and messages shown when using the exit.</p>` +
			`</section>` +
			`<section class="charlog--pad">` +
			`	<h4>Teleporting</h4>` +
			`	<p>You can teleport to any room you own, or back to rest of the world once you are done building:` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>list teleports</code></div></section>` +
			`	<p>If you wish to allow others to be able to teleport to your new place, go to the room where teleporters should arrive and type:</p>` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>set room isteleport = yes</code></div></section>` +
			`	<p class="common--formattext">When others visit your place, maybe through a <span class="cmd">summon</span>, they can register that room as a teleport destination:</p>` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>help register teleport</code></div></section>` +
			`</section>`,
		),
		sortOrder: 100,
		alias: [ 'build room', 'building rooms', 'building room' ],
		categories: [ 'buildAreas' ],
	},
	{
		id: 'buildAreas',
		cmd: 'build areas',
		title: l10n.l('help.buildAreasTitle', "How to build areas"),
		shortDesc: l10n.l('help.buildAreasShortDesc', "How to build and manage areas"),
		desc: l10n.l('help.buildAreasDesc',
			`<p>Areas gives structure to rooms, allows for maps, and gives you an overview of where characters are gathered.</p>` +
			`<section class="charlog--pad">` +
			`	<h4>Create areas</h4>` +
			`	<p>To create a new area, type:</p>` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>create area My place</code></div></section>` +
			`	<p>Now you can go to all rooms that should be part of the area, and in each type:</p>` +
			`	<section class="charlog--pad"><div class="charlog--code"><code>set room area = My place</code></div></section>` +
			`</section>`,
		),
		sortOrder: 110,
		alias: [ 'build area', 'building areas', 'building area' ],
		categories: [ 'buildRooms' ],
	},
	{
		id: 'request',
		title: l10n.l('help.requestTitle', "Request commands"),
		shortDesc: l10n.l('help.requestShortDesc', "How to make requests to other players' characters"),
		desc: l10n.l('help.requestDesc', `<p>Commands for sending requests to other players' characters.</p>`),
		sortOrder: 120,
		alias: [ 'requests' ],
	},
	{
		id: 'cleanup',
		title: l10n.l('help.requestTitle', "Cleanup commands"),
		shortDesc: l10n.l('help.requestShortDesc', "How to clean up littering sleepers or unwanted tenants"),
		desc: l10n.l('help.requestDesc',
			`<p>Here you can find commands for cleaning up rooms and areas of littering sleepers, unwanted tenants, or other nuisances.</p>` +
			`<p>For info on how to report incidents to the moderators, type:</p>` +
			`<section class="charlog--pad"><div class="charlog--code"><code>help reporting</code></div></section>`,
		),
		sortOrder: 130,
	},
];

const usageText = 'help <span class="opt"><span class="param">Command</span></span>';
const shortDesc = 'Show help about a command or topic';
const helpText =
`<p>Show help about a command or topic. Typing only <code>help</code> will show a list of help topics and more.</p>
<p><code class="param">Command</code> is either a help topic, a command (eg. <code>create room</code>), or a partial command (eg. <code>create</code> or <code>room</code>).</p>`;

function isBoundary(i, str) {
	return i < 0 || i >= str.length || str[i] == ' ';
}

function topicMatchCategory(topic, categoryId) {
	return topic.category
		? (Array.isArray(topic.category) ? topic.category : [ topic.category ]).indexOf(categoryId) >= 0
		: false;
}

// matchesCmd checks if a topic is matched by the subcommand.
function matchesCmd(topic, cmd) {
	let t = topic.cmd;
	let a = topic.alias;
	let i = 0;
	while (t) {
		let idx = t.indexOf(cmd);
		if (idx >= 0 && isBoundary(idx - 1, t) && isBoundary(idx + cmd.length, t)) {
			return t.substring(0, idx).split(" ").length - 1;
		}
		t = a && a[i++];
	}
	return -1;
}

/**
 * Help allows other modules to registers help topics to different categories.
 */
class Help {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'cmd', 'player', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.categories = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		this.topics = new Model({
			eventBus: this.app.eventBus,
		});

		// Add all default categories
		for (let cat of defaultCategories) {
			this.addCategory(cat);
		}

		this.module.cmd.addCmd({
			key: 'help',
			next: new RepeatStep(
				'part',
				(next, idx, state) => new ListStep(
					'part-' + idx,
					this._getTopicTokenList(state.getParam('topic')),
					{
						name: 'topic',
						textId: 'unknown',
						token: 'attr',
						next,
						errRequired: null,
						// errNotFound: (step, m, state) => ({
						// 	code: 'help.topicNotFound',
						// 	message: 'There is no help topic for "{topic}".',
						// 	data: { topic: ((state.getParam('topic') || "") + " " + m).trim() }
						// })
					},
				),
				{
					each: (state, step, idx) => {
						let v = state.getParam('topic') || '';
						state.setParam('topic', v + (v ? ' ' : '') + (state.getParam(step.id) || state.getParam('unknown')));
					},
				},
			),
			value: (ctx, p) => this._showHelp(ctx.char, p.topic),
		});

		this.addTopic({
			id: 'help',
			category: 'basic',
			cmd: 'help',
			usage: l10n.l('help.usage', usageText),
			shortDesc: l10n.l('help.shortDesc', shortDesc),
			desc: l10n.l('help.helpText', helpText),
			sortOrder: 10,
		});
	}

	/**
	 * Get a collection of help categories.
	 * @returns {Collection} Collection of categories.
	 */
	getCategories() {
		return this.categories;
	}

	/**
	 * Get a help topic by ID.
	 * @param {*} topicId Topic ID
	 * @returns {?object} Topic object or null if not found.
	 */
	getTopic(topicId) {
		return this.topics.props[topicId] || null;
	}

	/**
	 * Registers a category.
	 * @param {object} category Category object
	 * @param {string} category.id Category ID.
	 * @param {string} category.cmd Category command to use with help. Defaults to category ID.
	 * @param {LocaleString} category.title Category title.
	 * @param {LocaleString} category.shortDesc Short category description.
	 * @param {Array.<string|LocaleString>} category.desc Description HTML strings where each string is a stand alone paragraph.
	 * @param {number} category.sortOrder Sort order.
	 * @param {Array.<string>} category.alias Aliases for the help command.
	 * @returns {this}
	 */
	addCategory(category) {
		if (this.categories.get(category.id)) {
			throw new Error("Category ID already registered: ", category.id);
		}
		let topics = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});
		this.categories.add({
			id: category.id,
			cmd: category.cmd || category.id,
			title: category.title,
			shortDesc: category.shortDesc,
			desc: category.desc,
			sortOrder: category.sortOrder,
			alias: category.alias,
			categories: category.categories,
			topics,
		});

		for (let topicId in this.topics.props) {
			let topic = this.topics.props[topicId];
			if (topicMatchCategory(topic, category.id)) {
				topics.add(topic);
			}
		}
		return this;
	}

	/**
	 * Unregisters a previously registered category.
	 * @param {string} categoryId Category ID.
	 * @returns {this}
	 */
	removeCategory(categoryId) {
		this.categories.remove(categoryId);
		return this;
	}

	/**
	 * Registers a help topic.
	 * @param {object} topic Topic object
	 * @param {string} topic.id Topic ID.
	 * @param {string|Array.<string>} [topic.category] Category ID or array of category IDs.
	 * @param {string|LocaleString} topic.title Topic title.
	 * @param {string} topic.cmd Topic command (eg. "create room").
	 * @param {Array.<string>} topic.alias Topic command aliases (eg. [ "msg", "page" ]).
	 * @param {string|LocaleString|function} topic.usage Usage HTML string or callback function returning a HTML string.
	 * @param {string|LocaleString|function} topic.desc Description HTML string or callback function returning a HTML string.
	 * @param {Array.<string|LocaleString>} topic.examples Topic command examples (eg. [ "create room My room" ]).
	 * @param {number} topic.sortOrder Sort order.
	 * @returns {this}
	 */
	addTopic(topic) {
		if (this.topics.props[topic.id]) {
			throw new Error("Topic ID already registered: " + topic.id);
		}
		this.topics.set({ [topic.id]: topic });
		this._addRemoveTopicToCategories(topic, true);

		return this;
	}

	/**
	 * Unregisters a previously registered help topic.
	 * @param {string} topicId Topic ID.
	 * @returns {this}
	 */
	removeTopic(topicId) {
		let topic = this.topics.props[topicId];
		if (topic) {
			this.topics.set({ [topicId]: undefined });
			this._addRemoveTopicToCategories(topic, false);
		}
		return this;
	}

	_addRemoveTopicToCategories(topic, add) {
		if (!topic.category) return;

		let cats = Array.isArray(topic.category) ? topic.category : [ topic.category ];
		for (let cat of cats) {
			let category = this.categories.get(cat);
			if (category) {
				if (add) {
					category.topics.add(topic);
				} else {
					category.topics.remove(topic.id);
				}
			}
		}
	}

	_showHelp(char, cmd) {
		if (!char) {
			throw new Error("No active char");
		}

		// Default help page
		if (!cmd) {
			this.module.charLog.logComponent(char, 'helpCategory', new HelpComponent(this.module, this.categories));
			return;
		}

		// Find matching categories and topics
		let categories = [];
		let topics = [];
		for (let c of this.categories) {
			if (c.cmd === cmd || (c.alias && c.alias.indexOf(cmd) >= 0)) {
				this.module.charLog.logComponent(char, 'helpCategory', new HelpCategory(this.module, this.categories, c));
				return;
			}
			let m = matchesCmd(c, cmd);
			if (m >= 0) {
				categories.push(c);
			}

			for (let t of c.topics) {
				if (t.cmd === cmd || (t.alias && t.alias.indexOf(cmd) >= 0)) {
					this.module.charLog.logComponent(char, 'helpTopic', new HelpTopic(this.module, t, cmd));
					return;
				}

				let m = matchesCmd(t, cmd);
				if (m >= 0) {
					topics.push(t);
				}
			}
		}

		if (!categories.length && !topics.length) {
			this.module.charLog.logError(char, {
				code: 'help.topicNotFound',
				message: 'There is no help topic for "{topic}".',
				data: { topic: cmd },
			});
			return;
		}

		this.module.charLog.logComponent(char, 'helpTopic', new HelpRelatedTopics(categories, topics));
	}

	_getTopicTokenList(prefix) {
		prefix = (prefix || '').trim();
		prefix += prefix ? ' ' : '';

		return new TokenList((ctx, key) => {
			let map = {};
			// Add categories
			for (let cat of this.categories) {
				// Does the category start with the prefix
				let matchMain = false;
				if (cat.cmd.substring(0, prefix.length) === prefix) {
					let token = cat.cmd.substring(prefix.length).split(" ")[0];
					map[token] = true;
					matchMain = !key || token.substring(0, key.length) == key;
				}
				// Add alias in case the real token doesn't match main key
				if (cat.alias && !matchMain) {
					for (let a of cat.alias) {
						// Does any of the category alias start with the prefix
						if (a.substring(0, prefix.length) === prefix) {
							map[a.substring(prefix.length).split(" ")[0]] = true;
						}
					}
				}
			}
			let props = this.topics.props;
			for (let k in props) {
				let matchMain = false;
				let topic = props[k];
				// Does the topic cmd start with the prefix
				if (topic.cmd && topic.cmd.substring(0, prefix.length) === prefix) {
					let token = topic.cmd.substring(prefix.length).split(" ")[0];
					map[token] = true;
					matchMain = !key || token.substring(0, key.length) == key;
				}
				// Add alias in case the real token doesn't match main key
				if (topic.alias && !matchMain) {
					for (let a of topic.alias) {
						// Does any of the topic alias start with the prefix
						if (a.substring(0, prefix.length) === prefix) {
							map[a.substring(prefix.length).split(" ")[0]] = true;
						}
					}
				}
			}

			return Object.keys(map).sort();
		}, {
			regex: /^([^\s]+)/,
			expandRegex: { left: /[^\s]/, right: /[^\s]/ },
			isMatch: (t, key) => key === t ? { key, value: t } : false,
			isPrefix: (t, prefix) => !prefix || t.substring(0, prefix.length) === prefix
				? t
				: null,
		});
	}

}

export default Help;
