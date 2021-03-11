const PromisePool = require('@supercharge/promise-pool');

const processConcurrently = async (list, callback, concurrency = 10) => {
    let index = 0;
    const {results, errors} = await PromisePool
        .for(list)
        .withConcurrency(concurrency)
        .process(async (item) => {
            const returnValue = await callback(item);
            console.log(++index + '. ' + returnValue);
        });

    return results;
}

module.exports = {
    processConcurrently
}