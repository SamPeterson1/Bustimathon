const fs = require('node:fs/promises');

const rwQueue = [];
var data = {};

function addToRwQueue(promiseFunc) {
    var promise;

	if (rwQueue.length > 0) {
		var prevRequest = rwQueue[rwQueue.length - 1];

		promise = prevRequest.then(() => {
			return promiseFunc();
		})
	} else {
		promise = promiseFunc();
	}

	rwQueue.push(promise);

	promise.then(() => {
		rwQueue.shift();
	});

	return promise;
}

module.exports = {
    async readJSONFile(file) {
        return await addToRwQueue(async () => {
            return await fs.readFile(file, {encoding: 'utf-8'}).then((contents) => JSON.parse(contents));
        });
    },

    async writeJSONFile(file, data) {
        return await addToRwQueue(async () => {
            await fs.writeFile(file, JSON.stringify(data, null, "\t"), {encoding: 'utf-8'});
        });
    }
}