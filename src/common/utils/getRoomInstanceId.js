/**
 * Creates an ID string of a room details model including any instance id.
 * @param {Model} room Room details model.
 * @returns {string} ID string of the room instance.
 */
export default function getRoomInstanceId(room) {
	let id = room.id;
	return room.instance ? id + '_' + room.instance : id;
}
