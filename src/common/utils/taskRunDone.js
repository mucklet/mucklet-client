/**
 * Listens to a taskRun model and calls the callback onces the taskRun is done.
 * @param {TaskRunModel} taskRun TaskRun model.
 * @param {(TaskRunModel) => void} onDone Callback called on done.
 */
export default function taskRunDone(taskRun, onDone) {
	let f = () => {
		if (taskRun.done) {
			taskRun.off('change', f);
			onDone(taskRun);
			return;
		}
	};
	taskRun.on('change', f);
	setTimeout(f, 0);
}
