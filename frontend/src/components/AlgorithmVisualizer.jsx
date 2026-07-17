import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaRandom, FaPause } from 'react-icons/fa';

const AlgorithmVisualizer = () => {
    const [array, setArray] = useState([]);
    const [isSorting, setIsSorting] = useState(false);
    const [algorithm, setAlgorithm] = useState('bubble');
    const [speed, setSpeed] = useState(50);
    const [arraySize, setArraySize] = useState(50);
    const [comparing, setComparing] = useState([]); // Indices being compared
    const [swapping, setSwapping] = useState([]); // Indices being swapped
    const [sorted, setSorted] = useState([]); // Indices that are sorted

    const stopSortingRef = useRef(false);

    const generateArray = () => {
        if (isSorting) return;
        const newArray = [];
        for (let i = 0; i < arraySize; i++) {
            // Generate values between 10 and 400
            newArray.push(Math.floor(Math.random() * 390) + 10);
        }
        setArray(newArray);
        setSorted([]);
        setComparing([]);
        setSwapping([]);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        generateArray();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arraySize]);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSort = async () => {
        setIsSorting(true);
        stopSortingRef.current = false;

        if (algorithm === 'bubble') {
            await bubbleSort();
        } else if (algorithm === 'quick') {
            await quickSort(array, 0, array.length - 1);
        } else if (algorithm === 'merge') {
            await mergeSort(array, 0, array.length - 1);
        } // Add more algorithms here

        if (!stopSortingRef.current) {
            const allIndices = [];
            for (let i = 0; i < array.length; i++) allIndices.push(i);
            setSorted(allIndices);
        }
        setIsSorting(false);
        setComparing([]);
        setSwapping([]);
    };

    const stopSort = () => {
        stopSortingRef.current = true;
        setIsSorting(false);
        setComparing([]);
        setSwapping([]);
    }


    // --- BUBBLE SORT ---
    const bubbleSort = async () => {
        const arr = [...array];
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (stopSortingRef.current) return;

                setComparing([j, j + 1]);
                await sleep(100 - speed);

                if (arr[j] > arr[j + 1]) {
                    setSwapping([j, j + 1]);
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    setArray([...arr]);
                    await sleep(100 - speed);
                }
            }
            setSorted(prev => [...prev, arr.length - i - 1]);
        }
    };

    // --- QUICK SORT ---
    const quickSort = async (arr, start, end) => {
        if (start >= end || stopSortingRef.current) return;

        let index = await partition(arr, start, end);
        await Promise.all([
            quickSort(arr, start, index - 1),
            quickSort(arr, index + 1, end)
        ]);
    };

    const partition = async (arr, start, end) => {
        let pivotIndex = start;
        let pivotValue = arr[end];

        setComparing([end]); // Visualize pivot

        for (let i = start; i < end; i++) {
            if (stopSortingRef.current) return;

            setComparing([i, end]);
            await sleep(100 - speed);

            if (arr[i] < pivotValue) {
                setSwapping([i, pivotIndex]);
                let temp = arr[i];
                arr[i] = arr[pivotIndex];
                arr[pivotIndex] = temp;
                setArray([...arr]);
                pivotIndex++;
                await sleep(100 - speed);
            }
        }

        setSwapping([pivotIndex, end]);
        let temp = arr[pivotIndex];
        arr[pivotIndex] = arr[end];
        arr[end] = temp;
        setArray([...arr]);
        await sleep(100 - speed);

        return pivotIndex;
    };

    // --- MERGE SORT ---
    // Note: Merge sort requires careful visualization logic for in-place or auxiliary array visualization.
    // Simplified for this context to show updates on the main array.
    const mergeSort = async (arr, start, end) => {
        if (start >= end || stopSortingRef.current) return;
        const middle = Math.floor((start + end) / 2);
        await mergeSort(arr, start, middle);
        await mergeSort(arr, middle + 1, end);
        await merge(arr, start, middle, end);
    };

    const merge = async (arr, start, middle, end) => {
        let left = arr.slice(start, middle + 1);
        let right = arr.slice(middle + 1, end + 1);

        let i = 0, j = 0, k = start;

        while (i < left.length && j < right.length) {
            if (stopSortingRef.current) return;

            setComparing([start + i, middle + 1 + j]);
            await sleep(100 - speed);

            if (left[i] <= right[j]) {
                arr[k] = left[i];
                setArray([...arr]);
                i++;
            } else {
                arr[k] = right[j];
                setArray([...arr]);
                j++;
            }
            k++;
            await sleep(100 - speed);
        }

        while (i < left.length) {
            if (stopSortingRef.current) return;
            arr[k] = left[i];
            setArray([...arr]);
            i++;
            k++;
            await sleep(100 - speed);
        }

        while (j < right.length) {
            if (stopSortingRef.current) return;
            arr[k] = right[j];
            setArray([...arr]);
            j++;
            k++;
            await sleep(100 - speed);
        }
    }


    return (
        <div className="algo-visualizer p-4">
            <div className="text-center mb-4">
                <h2 className="text-gradient fw-bold mb-2">⚡ Algorithm Visualizer</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Visualize how sorting algorithms work step-by-step
                </p>
            </div>

            {/* Controls */}
            <div className="glass-card p-3 rounded-3 mb-4 d-flex flex-wrap align-items-center justify-content-center gap-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                <div className="d-flex flex-column align-items-start">
                    <label className="small fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Algorithm</label>
                    <select
                        className="form-select form-select-sm"
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                        disabled={isSorting}
                        style={{ width: '150px' }}
                    >
                        <option value="bubble">Bubble Sort</option>
                        <option value="quick">Quick Sort</option>
                        <option value="merge">Merge Sort</option>
                    </select>
                </div>

                <div className="d-flex flex-column align-items-start" style={{ minWidth: '120px' }}>
                    <label className="small fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Speed</label>
                    <input
                        type="range"
                        min="1"
                        max="99"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="form-range"
                        disabled={isSorting}
                    />
                </div>

                <div className="d-flex flex-column align-items-start" style={{ minWidth: '120px' }}>
                    <label className="small fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Compare Size</label>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={arraySize}
                        onChange={(e) => setArraySize(Number(e.target.value))}
                        className="form-range"
                        disabled={isSorting}
                    />
                </div>

                <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
                    <button
                        className="icon-btn"
                        onClick={generateArray}
                        disabled={isSorting}
                        title="Generate New Array"
                    >
                        <FaRandom />
                    </button>
                    <button
                        className="start-test-btn"
                        onClick={isSorting ? stopSort : handleSort}
                        style={{ minWidth: '100px' }}
                    >
                        {isSorting ? <><FaPause className="me-2" /> Stop</> : <><FaPlay className="me-2" /> Start</>}
                    </button>
                </div>

            </div>

            {/* Visualization Area */}
            <div className="visualization-container glass-card p-4 rounded-3 d-flex align-items-end justify-content-center gap-1" style={{ height: '500px', overflow: 'hidden', maxWidth: '1000px', margin: '0 auto' }}>
                {array.map((value, idx) => {
                    let bgColor = 'var(--accent-primary)';
                    if (comparing.includes(idx)) bgColor = '#f59e0b'; // Warning/Orange
                    if (swapping.includes(idx)) bgColor = '#ef4444'; // Error/Red
                    if (sorted.includes(idx)) bgColor = '#10b981'; // Success/Green

                    return (
                        <motion.div
                            key={idx}
                            initial={{ height: 0 }}
                            animate={{ height: `${value}px`, backgroundColor: bgColor }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            style={{
                                width: `${Math.max(2, 800 / arraySize)}px`,
                                borderRadius: '4px 4px 0 0',
                            }}
                            title={value}
                        />
                    );
                })}
            </div>

            {/* Legend */}
            <div className="d-flex justify-content-center gap-4 mt-4">
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>Unsorted</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>Comparing</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>Swapping</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>Sorted</span>
                </div>
            </div>

        </div>
    );
};

export default AlgorithmVisualizer;
