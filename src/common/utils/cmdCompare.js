/**
 * A sort compare function comparing a list of custom commands by priority and pattern.
 * @param {{id: string, priority: number, cmd: import('types/modules/cmdPattern').CmdPattern}} a Command.
 * @param {{id: string, priority: number, cmd: import('types/modules/cmdPattern').CmdPattern}} b Command.
 * @returns {number} Sorting value..
 */
export default function cmdCompare(a, b) {
	return (a.priority - b.priority) || a.cmd?.pattern.localeCompare(b.cmd?.pattern) || a.id.localeCompare(b.id);
}
