import Err from 'classes/Err';

/**
 * Creates a response parse error callback function for when calling
 * response.json() on a fetch response.
 *
 * Depending on status code being => 400, a different error message is shown.
 * @param {Response} resp Response object.
 * @returns {() => Promise} Promise that rejects with a value of type Err.
 */
export default function responseParseError(resp) {
	return () => resp.status >= 400
		? Promise.reject(new Err('responseParseError.errorStatus', "Failed with status {status} {statusText}.", { status: resp.status, statusText: resp.statusText }))
		: resp.text().then(
			text => Promise.reject(text
				? new Err('responseParseError.unexptedResponse', "Unexpected response: {text}", { text })
				: new Err('responseParseError.missingResponse', "Unexpected empty response.", { text }),
			),
			() => Promise.reject(new Err('responseParseError.unexpectedError', "Unexpected response {status} {statusText}.", { status: resp.status, statusText: resp.statusText })),
		);
}
