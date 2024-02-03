/* eslint-disable no-restricted-globals */

import {db} from "../db/DexieDB";

console.log('Worker init ...');

const fetchDummyData = async () => {
    console.log('start...fetchDummyData...');
    const key = 'myKey5';
    const response = await fetch('https://jsonplaceholder.typicode.com/photos');
    const count = (await response.json()).length;
    const countInDexieDB = (await db.simpleStructSaveSTate.where({ key }).first())?.data;
    const sum = ( (countInDexieDB || 0) + count);
    await db.simpleStructSaveSTate.put({key, data: sum}, key);
    console.log('end...fetchDummyData...', {count, countInDexieDB, sum});
};

setInterval(fetchDummyData, 5000);

self.onmessage = (e: MessageEvent<string>) => {
    if (e.data === 'echo') {
        self.postMessage({data: e.data});
    }
};

export {};