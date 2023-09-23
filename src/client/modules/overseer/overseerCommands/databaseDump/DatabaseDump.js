import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'database dump';
const shortDesc = 'Dump an incremental copy of all databases';
const helpText =
`<p>Dump an incremental copy of all databases in the backup folders.`;

/**
 * DatabaseDump tells all servces to dump an incremental copy in their backup folders.
 */
class DatabaseDump {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'api', 'helpOverseer' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('database', {
			key: 'dump',
			value: (ctx, p) => this._backup(ctx, p),
		});

		this.module.helpOverseer.addTopic({
			id: 'databaseDump',
			cmd: 'database dump',
			usage: l10n.l('databaseDump.usage', usageText),
			shortDesc: l10n.l('databaseDump.shortDesc', shortDesc),
			desc: l10n.l('databaseDump.helpText', helpText),
			sortOrder: 20,
		});
	}

	_backup(ctx, p) {
		let api = this.module.api;
		let charLog = this.module.charLog;
		let char = ctx.char;
		return api.call('core', 'createId').then(idResult => Promise.all([
			api.call('auth.db', 'backup', idResult).then(result => {
				charLog.logInfo(char, l10n.l('databaseDump.authDatabaseDumpSuccess', "Auth database dump took {duration} ms.", { duration: result.duration }));
			}).catch(err => {
				charLog.logError(char, new Err('backup.authDatabaseDumpFailed', "Auth database dump failed: {error}", { error: l10n.t(err.code, err.message, err.data) }));
			}),
			api.call('core.db', 'backup', idResult).then(result => {
				charLog.logInfo(char, l10n.l('databaseDump.coreDatabaseDumpSuccess', "Core database dump took {duration} ms.", { duration: result.duration }));
			}).catch(err => {
				charLog.logError(char, new Err('backup.coreDatabaseDumpFailed', "Core database dump failed: {error}", { error: l10n.t(err.code, err.message, err.data) }));
			}),
			api.call('file.db', 'backup', idResult).then(result => {
				charLog.logInfo(char, l10n.l('databaseDump.fileDatabaseDumpSuccess', "File database dump took {duration} ms.", { duration: result.duration }));
			}).catch(err => {
				charLog.logError(char, new Err('backup.fileDatabaseDumpFailed', "File database dump failed: {error}", { error: l10n.t(err.code, err.message, err.data) }));
			}),
			api.call('identity.db', 'backup', idResult).then(result => {
				charLog.logInfo(char, l10n.l('databaseDump.identityDatabaseDumpSuccess', "Identity database dump took {duration} ms.", { duration: result.duration }));
			}).catch(err => {
				charLog.logError(char, new Err('backup.identityDatabaseDumpFailed', "Identity database dump failed: {error}", { error: l10n.t(err.code, err.message, err.data) }));
			}),
			api.call('mail.db', 'backup', idResult).then(result => {
				charLog.logInfo(char, l10n.l('databaseDump.mailDatabaseDumpSuccess', "Mail database dump took {duration} ms.", { duration: result.duration }));
			}).catch(err => {
				charLog.logError(char, new Err('backup.mailDatabaseDumpFailed', "Mail database dump failed: {error}", { error: l10n.t(err.code, err.message, err.data) }));
			}),
			api.call('note.db', 'backup', idResult).then(result => {
				charLog.logInfo(char, l10n.l('databaseDump.noteDatabaseDumpSuccess', "Note database dump took {duration} ms.", { duration: result.duration }));
			}).catch(err => {
				charLog.logError(char, new Err('backup.noteDatabaseDumpFailed', "Note database dump failed: {error}", { error: l10n.t(err.code, err.message, err.data) }));
			}),
			api.call('report.db', 'backup', idResult).then(result => {
				charLog.logInfo(char, l10n.l('databaseDump.reportDatabaseDumpSuccess', "Report database dump took {duration} ms.", { duration: result.duration }));
			}).catch(err => {
				charLog.logError(char, new Err('backup.reportDatabaseDumpFailed', "Report database dump failed: {error}", { error: l10n.t(err.code, err.message, err.data) }));
			}),
			api.call('tag.db', 'backup', idResult).then(result => {
				charLog.logInfo(char, l10n.l('databaseDump.tagDatabaseDumpSuccess', "Tag database dump took {duration} ms.", { duration: result.duration }));
			}).catch(err => {
				charLog.logError(char, new Err('backup.tagDatabaseDumpFailed', "Tag database dump failed: {error}", { error: l10n.t(err.code, err.message, err.data) }));
			}),
		]));
	}
}

export default DatabaseDump;
