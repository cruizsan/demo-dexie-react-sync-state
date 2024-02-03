import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from "lodash";
import { Table } from "dexie";

/**
 * IndexedDB key characteristics and basic terminology
 * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology
 *
 * Custom React hook for managing the state of a Dexie.js table within a React component
 * Provides real-time synchronization, persistence and interaction with Dexie.js data
 *
 * @param {Table} dexieTable - The Dexie.js table to manage
 * @param {string} key - The key associated with the data in the Dexie.js table
 * @param {T} defaultValue - The default value
 * @param {boolean} syncLive - Determines if the hook should sync the data in real-time. Default is true
 * @param {(data1: T, data2?: T) => boolean} isEqual - Custom equality function for comparing data changes
 *
 * @returns {[T, (value: T) => void]} - An array containing the current data state and a function to set a new value.
 */
export function useDexieLiveState<T>(
    dexieTable: Table,
    key: string,
    defaultValue: T,
    syncLive?: boolean,
    isEqual?: (data1: T, data2?: T) => boolean
): [T, (value: T) => void];

export function useDexieLiveState<T>(
    dexieTable: Table,
    key: string,
    defaultValue?: T,
    syncLive?: boolean,
    isEqual?: (data1: T, data2?: T) => boolean
): [T | undefined, (value: T | undefined) => void];

export function useDexieLiveState<T>(
    dexieTable: Table,
    key: string,
    defaultValue: T,
    syncLive: boolean = true,
    isEqual: (data1: T, data2?: T) => boolean = _.isEqual
): [T, (value: T) => void] {

    // Local state for the Dexie.js table data
    const [data, setData] = React.useState<T>(defaultValue);

    // Function to fetch Dexie.js data asynchronously
    const fetchDexieData = React.useCallback(async () => {
        return (await dexieTable.where({ key }).first())?.data || defaultValue;
    }, [dexieTable, key, defaultValue]);

    // Use dexie-react-hooks for real-time data querying
    useLiveQuery(
        async  () => {
            // If syncLive is false, do not perform real-time synchronization
            if (!syncLive) {
                return;
            }
            // Fetch new data and update the state if it's different
            const newData = (await fetchDexieData());
            if (!isEqual(newData, data)) {
                setData(newData);
            }
        },
        [key, data, isEqual, fetchDexieData, syncLive]
    );

    // Function to set a new value for the Dexie.js table data
    const fnSetter = React.useCallback((value: T) => {
        dexieTable.put({ key, data: value }, key);
        // If syncLive is false, update the local state without waiting for real-time synchronization
        if (!syncLive) {
            setData(value);
        }
    }, [dexieTable, key, syncLive]);

    // Fetch Dexie.js data once during component mounting
    React.useEffect(() => {
        fetchDexieData().then((response) => {
            setData(response);
        })
    }, [fetchDexieData]);

    // Return the current data state and the function to set a new value
    return [
        data,
        fnSetter
    ];
}

export default useDexieLiveState;