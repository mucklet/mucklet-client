import { isResError } from 'resclient';
import Err from 'classes/Err';

/**
 * Fetches the source for a room script. If the room script uses a binary file,
 * or if an error occurrs, the promise will be rejected.
 * @param {RoomScriptDetails} roomScriptDetails Room script details model.
 * @param {() => Promise<void>} [refreshTokens] Callback to refresh access tokens.
 * @returns {Promise<string>} Source code.
 */
export default function fetchRoomScriptSource(roomScriptDetails, refreshTokens) {
	// Handle special case of empty script
	if (!roomScriptDetails.version) {
		return Promise.resolve("");
	}
	let source = roomScriptDetails.source;
	return (!source || isResError(source)
		? Promise.reject(source || new Err('fetchRoomScriptSource.noSource', "The room script source code is not available."))
		: Promise.resolve(refreshTokens?.())
			.then(() => {
				return fetch(source.href, {
					credentials: 'include',
				}).then(response => {
					if (response.status >= 300) {
						throw response.text();
					};
					return response.text();
				}).catch(err => {
					console.error("Error fetching script: ", err);
					throw new Err('fetchRoomScriptSource.errorFetchingScript', "Error fetching script: {err}", { err: String(err) });
				});
			})
	);
}
