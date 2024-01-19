import { RootElem, Elem, Input, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import AutoComplete from 'components/AutoComplete';
import patternMatch, { patternMatchRender, patternMatchCompare } from 'utils/patternMatch';
import Err from 'classes/Err';
import './locationInput.scss';

const countries = [
	{ code: 'AF', name: l10n.l('countries.af', "Afghanistan") },
	{ code: 'AX', name: l10n.l('countries.ax', "Åland Islands") },
	{ code: 'AL', name: l10n.l('countries.al', "Albania") },
	{ code: 'DZ', name: l10n.l('countries.dz', "Algeria") },
	{ code: 'AD', name: l10n.l('countries.ad', "Andorra") },
	{ code: 'AO', name: l10n.l('countries.ao', "Angola") },
	{ code: 'AI', name: l10n.l('countries.ai', "Anguilla") },
	{ code: 'AQ', name: l10n.l('countries.aq', "Antarctica") },
	{ code: 'AG', name: l10n.l('countries.ag', "Antigua & Barbuda") },
	{ code: 'AR', name: l10n.l('countries.ar', "Argentina") },
	{ code: 'AM', name: l10n.l('countries.am', "Armenia") },
	{ code: 'AW', name: l10n.l('countries.aw', "Aruba") },
	{ code: 'AC', name: l10n.l('countries.ac', "Ascension Island") },
	{ code: 'AU', name: l10n.l('countries.au', "Australia") },
	{ code: 'AT', name: l10n.l('countries.at', "Austria") },
	{ code: 'AZ', name: l10n.l('countries.az', "Azerbaijan") },
	{ code: 'BS', name: l10n.l('countries.bs', "Bahamas") },
	{ code: 'BH', name: l10n.l('countries.bh', "Bahrain") },
	{ code: 'BD', name: l10n.l('countries.bd', "Bangladesh") },
	{ code: 'BB', name: l10n.l('countries.bb', "Barbados") },
	{ code: 'BY', name: l10n.l('countries.by', "Belarus") },
	{ code: 'BE', name: l10n.l('countries.be', "Belgium") },
	{ code: 'BZ', name: l10n.l('countries.bz', "Belize") },
	{ code: 'BJ', name: l10n.l('countries.bj', "Benin") },
	{ code: 'BM', name: l10n.l('countries.bm', "Bermuda") },
	{ code: 'BT', name: l10n.l('countries.bt', "Bhutan") },
	{ code: 'BO', name: l10n.l('countries.bo', "Bolivia") },
	{ code: 'BA', name: l10n.l('countries.ba', "Bosnia & Herzegovina") },
	{ code: 'BW', name: l10n.l('countries.bw', "Botswana") },
	{ code: 'BV', name: l10n.l('countries.bv', "Bouvet Island") },
	{ code: 'BR', name: l10n.l('countries.br', "Brazil") },
	{ code: 'IO', name: l10n.l('countries.io', "British Indian Ocean Territory") },
	{ code: 'VG', name: l10n.l('countries.vg', "British Virgin Islands") },
	{ code: 'BN', name: l10n.l('countries.bn', "Brunei") },
	{ code: 'BG', name: l10n.l('countries.bg', "Bulgaria") },
	{ code: 'BF', name: l10n.l('countries.bf', "Burkina Faso") },
	{ code: 'BI', name: l10n.l('countries.bi', "Burundi") },
	{ code: 'KH', name: l10n.l('countries.kh', "Cambodia") },
	{ code: 'CM', name: l10n.l('countries.cm', "Cameroon") },
	{ code: 'CA', name: l10n.l('countries.ca', "Canada") },
	{ code: 'CV', name: l10n.l('countries.cv', "Cape Verde") },
	{ code: 'BQ', name: l10n.l('countries.bq', "Caribbean Netherlands") },
	{ code: 'KY', name: l10n.l('countries.ky', "Cayman Islands") },
	{ code: 'CF', name: l10n.l('countries.cf', "Central African Republic") },
	{ code: 'TD', name: l10n.l('countries.td', "Chad") },
	{ code: 'CL', name: l10n.l('countries.cl', "Chile") },
	{ code: 'CN', name: l10n.l('countries.cn', "China") },
	{ code: 'CO', name: l10n.l('countries.co', "Colombia") },
	{ code: 'KM', name: l10n.l('countries.km', "Comoros") },
	{ code: 'CG', name: l10n.l('countries.cg', "Congo - Brazzaville") },
	{ code: 'CD', name: l10n.l('countries.cd', "Congo - Kinshasa") },
	{ code: 'CK', name: l10n.l('countries.ck', "Cook Islands") },
	{ code: 'CR', name: l10n.l('countries.cr', "Costa Rica") },
	{ code: 'CI', name: l10n.l('countries.ci', "Côte d’Ivoire") },
	{ code: 'HR', name: l10n.l('countries.hr', "Croatia") },
	{ code: 'CW', name: l10n.l('countries.cw', "Curaçao") },
	{ code: 'CY', name: l10n.l('countries.cy', "Cyprus") },
	{ code: 'CZ', name: l10n.l('countries.cz', "Czechia") },
	{ code: 'DK', name: l10n.l('countries.dk', "Denmark") },
	{ code: 'DJ', name: l10n.l('countries.dj', "Djibouti") },
	{ code: 'DM', name: l10n.l('countries.dm', "Dominica") },
	{ code: 'DO', name: l10n.l('countries.do', "Dominican Republic") },
	{ code: 'EC', name: l10n.l('countries.ec', "Ecuador") },
	{ code: 'EG', name: l10n.l('countries.eg', "Egypt") },
	{ code: 'SV', name: l10n.l('countries.sv', "El Salvador") },
	{ code: 'GQ', name: l10n.l('countries.gq', "Equatorial Guinea") },
	{ code: 'ER', name: l10n.l('countries.er', "Eritrea") },
	{ code: 'EE', name: l10n.l('countries.ee', "Estonia") },
	{ code: 'SZ', name: l10n.l('countries.sz', "Eswatini") },
	{ code: 'ET', name: l10n.l('countries.et', "Ethiopia") },
	{ code: 'FK', name: l10n.l('countries.fk', "Falkland Islands") },
	{ code: 'FO', name: l10n.l('countries.fo', "Faroe Islands") },
	{ code: 'FJ', name: l10n.l('countries.fj', "Fiji") },
	{ code: 'FI', name: l10n.l('countries.fi', "Finland") },
	{ code: 'FR', name: l10n.l('countries.fr', "France") },
	{ code: 'GF', name: l10n.l('countries.gf', "French Guiana") },
	{ code: 'PF', name: l10n.l('countries.pf', "French Polynesia") },
	{ code: 'TF', name: l10n.l('countries.tf', "French Southern Territories") },
	{ code: 'GA', name: l10n.l('countries.ga', "Gabon") },
	{ code: 'GM', name: l10n.l('countries.gm', "Gambia") },
	{ code: 'GE', name: l10n.l('countries.ge', "Georgia") },
	{ code: 'DE', name: l10n.l('countries.de', "Germany") },
	{ code: 'GH', name: l10n.l('countries.gh', "Ghana") },
	{ code: 'GI', name: l10n.l('countries.gi', "Gibraltar") },
	{ code: 'GR', name: l10n.l('countries.gr', "Greece") },
	{ code: 'GL', name: l10n.l('countries.gl', "Greenland") },
	{ code: 'GD', name: l10n.l('countries.gd', "Grenada") },
	{ code: 'GP', name: l10n.l('countries.gp', "Guadeloupe") },
	{ code: 'GU', name: l10n.l('countries.gu', "Guam") },
	{ code: 'GT', name: l10n.l('countries.gt', "Guatemala") },
	{ code: 'GG', name: l10n.l('countries.gg', "Guernsey") },
	{ code: 'GN', name: l10n.l('countries.gn', "Guinea") },
	{ code: 'GW', name: l10n.l('countries.gw', "Guinea-Bissau") },
	{ code: 'GY', name: l10n.l('countries.gy', "Guyana") },
	{ code: 'HT', name: l10n.l('countries.ht', "Haiti") },
	{ code: 'HN', name: l10n.l('countries.hn', "Honduras") },
	{ code: 'HK', name: l10n.l('countries.hk', "Hong Kong SAR China") },
	{ code: 'HU', name: l10n.l('countries.hu', "Hungary") },
	{ code: 'IS', name: l10n.l('countries.is', "Iceland") },
	{ code: 'IN', name: l10n.l('countries.in', "India") },
	{ code: 'ID', name: l10n.l('countries.id', "Indonesia") },
	{ code: 'IQ', name: l10n.l('countries.iq', "Iraq") },
	{ code: 'IE', name: l10n.l('countries.ie', "Ireland") },
	{ code: 'IM', name: l10n.l('countries.im', "Isle of Man") },
	{ code: 'IL', name: l10n.l('countries.il', "Israel") },
	{ code: 'IT', name: l10n.l('countries.it', "Italy") },
	{ code: 'JM', name: l10n.l('countries.jm', "Jamaica") },
	{ code: 'JP', name: l10n.l('countries.jp', "Japan") },
	{ code: 'JE', name: l10n.l('countries.je', "Jersey") },
	{ code: 'JO', name: l10n.l('countries.jo', "Jordan") },
	{ code: 'KZ', name: l10n.l('countries.kz', "Kazakhstan") },
	{ code: 'KE', name: l10n.l('countries.ke', "Kenya") },
	{ code: 'KI', name: l10n.l('countries.ki', "Kiribati") },
	{ code: 'XK', name: l10n.l('countries.xk', "Kosovo") },
	{ code: 'KW', name: l10n.l('countries.kw', "Kuwait") },
	{ code: 'KG', name: l10n.l('countries.kg', "Kyrgyzstan") },
	{ code: 'LA', name: l10n.l('countries.la', "Laos") },
	{ code: 'LV', name: l10n.l('countries.lv', "Latvia") },
	{ code: 'LB', name: l10n.l('countries.lb', "Lebanon") },
	{ code: 'LS', name: l10n.l('countries.ls', "Lesotho") },
	{ code: 'LR', name: l10n.l('countries.lr', "Liberia") },
	{ code: 'LY', name: l10n.l('countries.ly', "Libya") },
	{ code: 'LI', name: l10n.l('countries.li', "Liechtenstein") },
	{ code: 'LT', name: l10n.l('countries.lt', "Lithuania") },
	{ code: 'LU', name: l10n.l('countries.lu', "Luxembourg") },
	{ code: 'MO', name: l10n.l('countries.mo', "Macao SAR China") },
	{ code: 'MG', name: l10n.l('countries.mg', "Madagascar") },
	{ code: 'MW', name: l10n.l('countries.mw', "Malawi") },
	{ code: 'MY', name: l10n.l('countries.my', "Malaysia") },
	{ code: 'MV', name: l10n.l('countries.mv', "Maldives") },
	{ code: 'ML', name: l10n.l('countries.ml', "Mali") },
	{ code: 'MT', name: l10n.l('countries.mt', "Malta") },
	{ code: 'MQ', name: l10n.l('countries.mq', "Martinique") },
	{ code: 'MR', name: l10n.l('countries.mr', "Mauritania") },
	{ code: 'MU', name: l10n.l('countries.mu', "Mauritius") },
	{ code: 'YT', name: l10n.l('countries.yt', "Mayotte") },
	{ code: 'MX', name: l10n.l('countries.mx', "Mexico") },
	{ code: 'MD', name: l10n.l('countries.md', "Moldova") },
	{ code: 'MC', name: l10n.l('countries.mc', "Monaco") },
	{ code: 'MN', name: l10n.l('countries.mn', "Mongolia") },
	{ code: 'ME', name: l10n.l('countries.me', "Montenegro") },
	{ code: 'MS', name: l10n.l('countries.ms', "Montserrat") },
	{ code: 'MA', name: l10n.l('countries.ma', "Morocco") },
	{ code: 'MZ', name: l10n.l('countries.mz', "Mozambique") },
	{ code: 'MM', name: l10n.l('countries.mm', "Myanmar (Burma)") },
	{ code: 'NA', name: l10n.l('countries.na', "Namibia") },
	{ code: 'NR', name: l10n.l('countries.nr', "Nauru") },
	{ code: 'NP', name: l10n.l('countries.np', "Nepal") },
	{ code: 'NL', name: l10n.l('countries.nl', "Netherlands") },
	{ code: 'NC', name: l10n.l('countries.nc', "New Caledonia") },
	{ code: 'NZ', name: l10n.l('countries.nz', "New Zealand") },
	{ code: 'NI', name: l10n.l('countries.ni', "Nicaragua") },
	{ code: 'NE', name: l10n.l('countries.ne', "Niger") },
	{ code: 'NG', name: l10n.l('countries.ng', "Nigeria") },
	{ code: 'NU', name: l10n.l('countries.nu', "Niue") },
	{ code: 'MK', name: l10n.l('countries.mk', "North Macedonia") },
	{ code: 'NO', name: l10n.l('countries.no', "Norway") },
	{ code: 'OM', name: l10n.l('countries.om', "Oman") },
	{ code: 'PK', name: l10n.l('countries.pk', "Pakistan") },
	{ code: 'PS', name: l10n.l('countries.ps', "Palestinian Territories") },
	{ code: 'PA', name: l10n.l('countries.pa', "Panama") },
	{ code: 'PG', name: l10n.l('countries.pg', "Papua New Guinea") },
	{ code: 'PY', name: l10n.l('countries.py', "Paraguay") },
	{ code: 'PE', name: l10n.l('countries.pe', "Peru") },
	{ code: 'PH', name: l10n.l('countries.ph', "Philippines") },
	{ code: 'PN', name: l10n.l('countries.pn', "Pitcairn Islands") },
	{ code: 'PL', name: l10n.l('countries.pl', "Poland") },
	{ code: 'PT', name: l10n.l('countries.pt', "Portugal") },
	{ code: 'PR', name: l10n.l('countries.pr', "Puerto Rico") },
	{ code: 'QA', name: l10n.l('countries.qa', "Qatar") },
	{ code: 'RE', name: l10n.l('countries.re', "Réunion") },
	{ code: 'RO', name: l10n.l('countries.ro', "Romania") },
	{ code: 'RU', name: l10n.l('countries.ru', "Russia") },
	{ code: 'RW', name: l10n.l('countries.rw', "Rwanda") },
	{ code: 'WS', name: l10n.l('countries.ws', "Samoa") },
	{ code: 'SM', name: l10n.l('countries.sm', "San Marino") },
	{ code: 'ST', name: l10n.l('countries.st', "São Tomé & Príncipe") },
	{ code: 'SA', name: l10n.l('countries.sa', "Saudi Arabia") },
	{ code: 'SN', name: l10n.l('countries.sn', "Senegal") },
	{ code: 'RS', name: l10n.l('countries.rs', "Serbia") },
	{ code: 'SC', name: l10n.l('countries.sc', "Seychelles") },
	{ code: 'SL', name: l10n.l('countries.sl', "Sierra Leone") },
	{ code: 'SG', name: l10n.l('countries.sg', "Singapore") },
	{ code: 'SX', name: l10n.l('countries.sx', "Sint Maarten") },
	{ code: 'SK', name: l10n.l('countries.sk', "Slovakia") },
	{ code: 'SI', name: l10n.l('countries.si', "Slovenia") },
	{ code: 'SB', name: l10n.l('countries.sb', "Solomon Islands") },
	{ code: 'SO', name: l10n.l('countries.so', "Somalia") },
	{ code: 'ZA', name: l10n.l('countries.za', "South Africa") },
	{ code: 'GS', name: l10n.l('countries.gs', "South Georgia & South Sandwich Islands") },
	{ code: 'KR', name: l10n.l('countries.kr', "South Korea") },
	{ code: 'SS', name: l10n.l('countries.ss', "South Sudan") },
	{ code: 'ES', name: l10n.l('countries.es', "Spain") },
	{ code: 'LK', name: l10n.l('countries.lk', "Sri Lanka") },
	{ code: 'BL', name: l10n.l('countries.bl', "St. Barthélemy") },
	{ code: 'SH', name: l10n.l('countries.sh', "St. Helena") },
	{ code: 'KN', name: l10n.l('countries.kn', "St. Kitts & Nevis") },
	{ code: 'LC', name: l10n.l('countries.lc', "St. Lucia") },
	{ code: 'MF', name: l10n.l('countries.mf', "St. Martin") },
	{ code: 'PM', name: l10n.l('countries.pm', "St. Pierre & Miquelon") },
	{ code: 'VC', name: l10n.l('countries.vc', "St. Vincent & Grenadines") },
	{ code: 'SR', name: l10n.l('countries.sr', "Suriname") },
	{ code: 'SJ', name: l10n.l('countries.sj', "Svalbard & Jan Mayen") },
	{ code: 'SE', name: l10n.l('countries.se', "Sweden") },
	{ code: 'CH', name: l10n.l('countries.ch', "Switzerland") },
	{ code: 'TW', name: l10n.l('countries.tw', "Taiwan") },
	{ code: 'TJ', name: l10n.l('countries.tj', "Tajikistan") },
	{ code: 'TZ', name: l10n.l('countries.tz', "Tanzania") },
	{ code: 'TH', name: l10n.l('countries.th', "Thailand") },
	{ code: 'TL', name: l10n.l('countries.tl', "Timor-Leste") },
	{ code: 'TG', name: l10n.l('countries.tg', "Togo") },
	{ code: 'TK', name: l10n.l('countries.tk', "Tokelau") },
	{ code: 'TO', name: l10n.l('countries.to', "Tonga") },
	{ code: 'TT', name: l10n.l('countries.tt', "Trinidad & Tobago") },
	{ code: 'TA', name: l10n.l('countries.ta', "Tristan da Cunha") },
	{ code: 'TN', name: l10n.l('countries.tn', "Tunisia") },
	{ code: 'TR', name: l10n.l('countries.tr', "Turkey") },
	{ code: 'TM', name: l10n.l('countries.tm', "Turkmenistan") },
	{ code: 'TC', name: l10n.l('countries.tc', "Turks & Caicos Islands") },
	{ code: 'TV', name: l10n.l('countries.tv', "Tuvalu") },
	{ code: 'UG', name: l10n.l('countries.ug', "Uganda") },
	{ code: 'UA', name: l10n.l('countries.ua', "Ukraine") },
	{ code: 'AE', name: l10n.l('countries.ae', "United Arab Emirates") },
	{ code: 'GB', name: l10n.l('countries.gb', "United Kingdom") },
	{ code: 'US', name: l10n.l('countries.us', "United States") },
	{ code: 'UY', name: l10n.l('countries.uy', "Uruguay") },
	{ code: 'UZ', name: l10n.l('countries.uz', "Uzbekistan") },
	{ code: 'VU', name: l10n.l('countries.vu', "Vanuatu") },
	{ code: 'VA', name: l10n.l('countries.va', "Vatican City") },
	{ code: 'VE', name: l10n.l('countries.ve', "Venezuela") },
	{ code: 'VN', name: l10n.l('countries.vn', "Vietnam") },
	{ code: 'WF', name: l10n.l('countries.wf', "Wallis & Futuna") },
	{ code: 'EH', name: l10n.l('countries.eh', "Western Sahara") },
	{ code: 'YE', name: l10n.l('countries.ye', "Yemen") },
	{ code: 'ZM', name: l10n.l('countries.zm', "Zambia") },
	{ code: 'ZW', name: l10n.l('countries.zw', "Zimbabwe") },
];

const txtPostalCode = l10n.l('locationInput.postalCode', "Postal code");
const txtZipCode = l10n.l('locationInput.zip', "Zip code");
const errMissingCountry = new Err('locationInput.missingCountry', "You must select a country.");
const errMissingPostalCode = new Err('locationInput.missingPostalCode', "You must enter your postal code.");
const errPostalCodeIncomplete = new Err('locationInput.invalidPostalCode', "Your postal code is incomplete.");
const errMissingZipCode = new Err('locationInput.missingZipCode', "You must enter your ZIP code.");
const errZipCodeIncomplete = new Err('locationInput.invalidZipCode', "Your ZIP code is incomplete.");


const postalCodeCountries = {
	US: {
		label: txtZipCode,
		placeholder: "12345",
		validate: (v) => {
			if (!v) {
				return errMissingZipCode;
			}
			if (!v.match(/^[0-9]{5}$/)) {
				return errZipCodeIncomplete;
			}
		},
		filter: v => v.replace(/[^0-9]/g, '').slice(0, 5),
	},
	GB: {
		label: txtPostalCode,
		placeholder: "WS11 1DB",
		validate: (v) => {
			if (!v) {
				return errMissingPostalCode;
			}
			// From Wikipedia: https://en.wikipedia.org/wiki/Postcodes_in_the_United_Kingdom#Validation
			if (!v.match(/^(([A-Z]{1,2}[0-9][A-Z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?[0-9][A-Z]{2}|BFPO ?[0-9]{1,4}|(KY[0-9]|MSR|VG|AI)[ -]?[0-9]{4}|[A-Z]{2} ?[0-9]{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/)) {
				return errPostalCodeIncomplete;
			}
		},
		filter: v => v.toUpperCase(),
	},
	CA: {
		label: txtPostalCode,
		placeholder: "M5T 1T4",
		validate: (v) => {
			if (!v) {
				return errMissingPostalCode;
			}
			// From O'Reilly: https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s15.html
			if (!v.match(/^(?!.*[DFIOQU])[A-VXY][0-9][A-Z] ?[0-9][A-Z][0-9]$/)) {
				return errPostalCodeIncomplete;
			}
		},
		filter: v => v.toUpperCase(),
	},
};

/**
 * LocationInput shows a password input field which lets you toggle between
 * showing the password as dots or as text.
 */
class LocationInput extends RootElem {

	/**
	 * Creates an instance of LocationInput
	 * @param {string} value Input value
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.onInput] Callback on input events.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.inputOpt] Options for the input element
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback. Default click event is calling toggleNext()
	 */
	constructor(value, opt) {
		super(null);
		opt = Object.assign({}, opt);
		opt.className = 'locationinput' + (opt.className ? ' ' + opt.className : '');

		this._country = null;
		this._postalCode = "";
		// Components
		this._input = new AutoComplete(this._country, {
			className: 'dialog--incomplete',
			attributes: {
				id: 'locationinput-country',
				placeholder: l10n.t('locationInput.selectACountry', "Search for your country"),
				spellcheck: 'false',
			},
			fetch: (text, update, c) => {
				this._setCountry(null);
				c.addClass('dialog--incomplete');
				let list = countries
					.map(m => ({ value: m.code, label: l10n.t(m.name) }))
					.filter(m => patternMatch(m.label, text))
					.sort(patternMatchCompare(text, m => m.label))
					.slice(0, 10);
				update(list);
			},
			events: {
				input: (_, ev) => {
					if (!ev.target.value) {
						this._setCountry(null);
					}
				},
				blur: c => {
					if (!this._country) {
						c.setProperty('value', "");
					}
				},
			},
			render: patternMatchRender,
			minLength: 1,
			onSelect: (c, item) => {
				c.removeClass('dialog--incomplete');
				this._setCountry(item.value);
				c.setProperty('value', item.label);
			},
		});
		this._postalCodeComponent = null;

		this.setRootNode(n => n.elem('div', opt, [
			n.elem('div', [
				n.elem('label', { attributes: { for: 'locationinput-country' }}, [
					n.component(new Txt(l10n.l('locationInput.country', "Country"), { tagName: 'h3' })),
				]),
				n.component(this._input),
			]),
		]));

		this._updatePostalCode();
	}

	render(el) {
		let rel = super.render(el);
		this._updatePostalCode();
		return rel;
	}

	unrender() {
		this._removePostalCode();
		super.unrender();
	}

	_setCountry(code) {
		code = code || null;
		if (this._country == code) return;

		this._country = code;
		this._postalCode = "";
		this._updatePostalCode();
	}

	/**
	 * Returns the selected country code.
	 * @returns {string | null} Two letter country code or null if no country is selected.
	 */
	getCountry() {
		return this._country;
	}

	/**
	 * Returns the postal code or null if a country without postal code is selected.
	 * @returns {string | null} Postal code or null if no postal code is showing.
	 */
	getPostalCode() {
		if (postalCodeCountries[this._country]) {
			return this._postalCode.trim();
		}
		return null;
	}

	/**
	 * Validates the values and returns any error.
	 * @returns {Err | null} An Err object if an error exists, otherwise null;
	 */
	getError() {
		if (!this._country) {
			return errMissingCountry;
		}

		let o = postalCodeCountries[this._country];
		let v = this._postalCode.trim();
		return o?.validate(v) || null;
	}

	_newPostalCode() {
		return new Elem(n => n.elem('div', [
			n.elem('label', { attributes: { for: 'locationinput-postalcode' }}, [
				n.component('label', new Txt("", { tagName: 'h3' })),
			]),
			n.component('input', new Input(this._postalCode, {
				events: {
					input: (c) => {
						this._postalCode = this._filterPostalCode(c.getValue(), c);
					},
				},
				attributes: {
					id: 'locationinput-postalcode',
					spellcheck: 'false',
					autocomplete: 'billing postal-code',
				},
			})),
		]));
	}

	_filterPostalCode(v, c) {
		let o = postalCodeCountries[this._country];
		if (o?.filter) {
			let el = c?.getElement();
			let p = el?.selectionStart;
			let nv = o.filter(v);
			if (nv != v) {
				v = nv;
				c?.setValue(nv);
				el?.setSelectionRange(p, p);
			}
		}
		return v;
	}

	_updatePostalCode() {
		let el = this.getElement();
		if (!el) {
			return;
		}

		let o = postalCodeCountries[this._country];

		if (o) {
			let c = this._postalCodeComponent || this._newPostalCode();
			let input = c.getNode('input');
			this._postalCode = this._filterPostalCode(this._postalCode, this._postalCodeComponent?.getNode('input'));

			c.getNode('label').setText(o.label);
			input.setValue(this._postalCode);
			input.setAttribute('placeholder', o.placeholder || null);
			if (!this._postalCodeComponent) {
				this._postalCodeComponent = c;
				c.render(el);
			}
		} else {
			this._removePostalCode();
		}
	}

	_removePostalCode() {
		this._postalCodeComponent?.unrender();
		this._postalCodeComponent = null;
	}
}

export default LocationInput;
