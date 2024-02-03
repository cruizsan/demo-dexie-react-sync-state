import Dexie, { Table } from 'dexie';

export interface SimpleStructSaveStateDB<T> {
    key: string;
    data: T;
}

export class DexieDB<T> extends Dexie {
    simpleStructSaveSTate!: Table<SimpleStructSaveStateDB<T>>;

    constructor(dbName = 'myDatabase') {
        super(dbName);
        this.version(1).stores({
            simpleStructSaveSTate: 'key'
        });
    }
}

export const db = new DexieDB();