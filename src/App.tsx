import React from 'react';
import { db } from "./db/DexieDB";
import useDexieLiveState from "./hooks/useDexieLiveState";

import './App.css';

type TestO = {
    name: string,
    age: number,
}

type ComplexO = {
    key1: string,
    key2: TestO[],
    key3: {
        key4: {
            key5: TestO[]
        }
    }
}
const initTestO = { name: 'TestO', age: 0};
const initComplexO = {
    key1: 'Complex0',
    key2: [initTestO, initTestO, initTestO, initTestO, initTestO],
    key3: { key4: { key5: [initTestO, initTestO, initTestO, initTestO, initTestO]}},
};
function App() {
    const [text, setText] = useDexieLiveState<string>(db.simpleStructSaveSTate, 'myKey1', '');
    const [text2, setText2] = useDexieLiveState<string>(db.simpleStructSaveSTate, 'myKey2', '', false);
    const [obj1, setObj1] = useDexieLiveState<TestO>(db.simpleStructSaveSTate, 'myKey3', initTestO);
    const [obj2, setObj2] = useDexieLiveState<ComplexO>(db.simpleStructSaveSTate, 'myKey4', initComplexO);
    const [workerCountData] = useDexieLiveState<number>(db.simpleStructSaveSTate, 'myKey5', 0);

    const workerRef = React.useRef<Worker>();

    const inc = React.useCallback(() => {
        const newObj1 = {...obj1, age: obj1.age + 1};
        setObj1(newObj1);
        const newObj2 = {...obj2, key2: [newObj1], key3: {key4: {key5: [newObj1]}}}
        setObj2(newObj2);
    }, [obj1, obj2, setObj1, setObj2]);

    const dec = React.useCallback(() => {
        const newObj1 = {...obj1, age: obj1.age - 1};
        setObj1(newObj1);
        const newObj2 = {...obj2, key2: [newObj1], key3: {key4: {key5: [newObj1]}}}
        setObj2(newObj2);
    }, [obj1, obj2, setObj1, setObj2]);

    // simple worker in background process to fetch data and update a count in indexDB (+ sync here without problem)
    const initWorker = () => {
        if (workerRef.current) {
            return;
        }
        workerRef.current = new Worker(new URL('./worker/worker.ts', import.meta.url))
    };

    const killWorker = () => {
        if (!workerRef.current) {
            return;
        }
        workerRef.current?.terminate();
    }

    return (
        <div className="App">
            <div>
                <label>    Sync Live : </label>
                <input value={text} onChange={({target: {value}}) => setText(value)}/>
            </div>
            <div>
                <label>NOT Sync Live : </label>
                <input value={text2} onChange={({target: {value}}) => setText2(value)}/>
            </div>
            <div>
                {obj1 && (
                    <>
                        <h2> # TestO</h2>
                        <p>
                            {JSON.stringify(obj1, null, 2)}
                        </p>
                        <button onClick={inc}>inc (+)</button>
                        <button onClick={dec}>dec (-)</button>
                    </>
                )}
                {obj2 && (
                    <>
                        <h2> # ComplexO</h2>
                        <p>
                            {JSON.stringify(obj2, null, 2)}
                        </p>
                    </>
                )}
            </div>
            <div>
                <p>Worker fetch data : {workerCountData}</p>
                <button onClick={initWorker}>Worker (background
                    process)
                </button>
                <button onClick={killWorker}>Kill Worker</button>
            </div>
        </div>
    );
}

export default App;
