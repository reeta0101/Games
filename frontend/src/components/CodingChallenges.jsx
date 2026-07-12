import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { FaPlay, FaLightbulb, FaCheckCircle, FaTimesCircle, FaCode, FaEye, FaEyeSlash } from 'react-icons/fa';

const codingChallenges = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "easy",
        description: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        examples: [
            { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "Because nums[0] + nums[1] == 9" }
        ],
        starterCode: "function twoSum(nums, target) {\n  // Your code here\n  \n}",
        testCases: [
            { input: "twoSum([2, 7, 11, 15], 9)", expected: "[0,1]" },
            { input: "twoSum([3, 2, 4], 6)", expected: "[1,2]" },
            { input: "twoSum([3, 3], 6)", expected: "[0,1]" }
        ],
        solution: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
        hints: ["Think about using a hash map to store values you've seen", "For each number, check if (target - number) exists in the map"]
    },
    {
        id: 2,
        title: "Reverse String",
        difficulty: "easy",
        description: "Write a function that reverses a string. The input string is given as an array of characters.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
        examples: [
            { input: "s = ['h', 'e', 'l', 'l', 'o']", output: "['o', 'l', 'l', 'e', 'h']", explanation: "The string 'hello' reversed" }
        ],
        starterCode: "function reverseString(s) {\n  // Your code here - modify s in-place\n  \n  return s;\n}",
        testCases: [
            { input: "reverseString(['h','e','l','l','o'])", expected: '["o","l","l","e","h"]' },
            { input: "reverseString(['H','a','n','n','a','h'])", expected: '["h","a","n","n","a","H"]' }
        ],
        solution: "function reverseString(s) {\n  let left = 0, right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++;\n    right--;\n  }\n  return s;\n}",
        hints: ["Use two pointers - one at the start, one at the end", "Swap characters and move pointers toward the center"]
    },
    {
        id: 3,
        title: "FizzBuzz",
        difficulty: "easy",
        description: "Given an integer n, return a string array where:\n- answer[i] == 'FizzBuzz' if i is divisible by 3 and 5\n- answer[i] == 'Fizz' if i is divisible by 3\n- answer[i] == 'Buzz' if i is divisible by 5\n- answer[i] == i (as string) otherwise",
        examples: [
            { input: "n = 5", output: "['1', '2', 'Fizz', '4', 'Buzz']", explanation: "Fizz at 3, Buzz at 5" }
        ],
        starterCode: "function fizzBuzz(n) {\n  // Your code here\n  \n}",
        testCases: [
            { input: "fizzBuzz(5)", expected: '["1","2","Fizz","4","Buzz"]' },
            { input: "fizzBuzz(15)[14]", expected: '"FizzBuzz"' },
            { input: "fizzBuzz(3)", expected: '["1","2","Fizz"]' }
        ],
        solution: "function fizzBuzz(n) {\n  const result = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) result.push('FizzBuzz');\n    else if (i % 3 === 0) result.push('Fizz');\n    else if (i % 5 === 0) result.push('Buzz');\n    else result.push(String(i));\n  }\n  return result;\n}",
        hints: ["Check divisibility by 15 first (both 3 and 5)", "Use modulo operator (%) to check divisibility"]
    },
    {
        id: 4,
        title: "Maximum Subarray",
        difficulty: "medium",
        description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous part of an array.",
        examples: [
            { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", explanation: "The subarray [4, -1, 2, 1] has the largest sum = 6" }
        ],
        starterCode: "function maxSubArray(nums) {\n  // Your code here\n  \n}",
        testCases: [
            { input: "maxSubArray([-2,1,-3,4,-1,2,1,-5,4])", expected: "6" },
            { input: "maxSubArray([1])", expected: "1" },
            { input: "maxSubArray([5,4,-1,7,8])", expected: "23" }
        ],
        solution: "function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  \n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  \n  return maxSum;\n}",
        hints: ["Use Kadane's algorithm", "At each position, decide: start fresh or continue the existing sum?"]
    }
];

const CodingChallenges = ({ isDarkMode }) => {
    const [selectedChallenge, setSelectedChallenge] = useState(codingChallenges[0]);
    const [code, setCode] = useState(codingChallenges[0].starterCode);
    const [output, setOutput] = useState('');
    const [testResults, setTestResults] = useState([]);
    const [showSolution, setShowSolution] = useState(false);
    const [showHints, setShowHints] = useState(false);

    const handleChallengeChange = (challenge) => {
        setSelectedChallenge(challenge);
        setCode(challenge.starterCode);
        setOutput('');
        setTestResults([]);
        setShowSolution(false);
        setShowHints(false);
    };

    const runCode = () => {
        setOutput('');
        setTestResults([]);

        try {
            // Create function from code
            const fn = new Function('return ' + code)();

            // Run test cases
            const results = selectedChallenge.testCases.map(test => {
                try {
                    const result = eval(code + '\n' + test.input);
                    const resultStr = JSON.stringify(result);
                    const passed = resultStr === test.expected;
                    return { ...test, result: resultStr, passed };
                } catch (err) {
                    return { ...test, result: err.message, passed: false };
                }
            });

            setTestResults(results);

            const passedCount = results.filter(r => r.passed).length;
            if (passedCount === results.length) {
                setOutput(`✅ All ${passedCount} test cases passed!`);
            } else {
                setOutput(`⚠️ ${passedCount}/${results.length} test cases passed`);
            }
        } catch (err) {
            setOutput(`❌ Error: ${err.message}`);
        }
    };

    return (
        <div className="coding-challenges-container p-4">
            <div className="text-center mb-4">
                <h2 className="text-gradient fw-bold mb-2">💻 Coding Challenges</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Practice coding problems with a live editor
                </p>
            </div>

            <div className="d-flex flex-column flex-lg-row gap-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Challenge List */}
                <div className="challenge-list d-flex flex-row flex-lg-column gap-2 overflow-auto" style={{ minWidth: '220px' }}>
                    {codingChallenges.map((challenge) => (
                        <motion.button
                            key={challenge.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`challenge-btn p-3 rounded-3 text-start ${selectedChallenge.id === challenge.id ? 'active' : ''}`}
                            onClick={() => handleChallengeChange(challenge)}
                            style={{
                                border: selectedChallenge.id === challenge.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                background: selectedChallenge.id === challenge.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-elevated)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                minWidth: '180px'
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between">
                                <span className="fw-medium">{challenge.title}</span>
                                <span className={`difficulty-badge difficulty-${challenge.difficulty}`}>
                                    {challenge.difficulty}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-grow-1 d-flex flex-column gap-3">
                    {/* Problem Description */}
                    <div className="glass-card p-4 rounded-3">
                        <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            <FaCode className="me-2" />{selectedChallenge.title}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                            {selectedChallenge.description}
                        </p>

                        {/* Examples */}
                        <div className="mt-3">
                            <strong style={{ color: 'var(--text-primary)' }}>Example:</strong>
                            {selectedChallenge.examples.map((ex, idx) => (
                                <div key={idx} className="code-snippet mt-2 p-3">
                                    <div><strong>Input:</strong> {ex.input}</div>
                                    <div><strong>Output:</strong> {ex.output}</div>
                                    {ex.explanation && <div><strong>Explanation:</strong> {ex.explanation}</div>}
                                </div>
                            ))}
                        </div>

                        {/* Hints */}
                        <div className="mt-3">
                            <button
                                className="btn btn-sm d-flex align-items-center gap-2"
                                onClick={() => setShowHints(!showHints)}
                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            >
                                <FaLightbulb className="text-warning" />
                                {showHints ? 'Hide Hints' : 'Show Hints'}
                            </button>
                            {showHints && (
                                <ul className="mt-2 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                    {selectedChallenge.hints.map((hint, idx) => (
                                        <li key={idx}>{hint}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="glass-card rounded-3 overflow-hidden" style={{ height: '350px' }}>
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme={isDarkMode ? 'vs-dark' : 'light'}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true
                            }}
                        />
                    </div>

                    {/* Controls */}
                    <div className="d-flex flex-wrap gap-2">
                        <button className="start-test-btn" onClick={runCode}>
                            <FaPlay /> Run Code
                        </button>
                        <button
                            className="btn d-flex align-items-center gap-2"
                            onClick={() => setShowSolution(!showSolution)}
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                        >
                            {showSolution ? <FaEyeSlash /> : <FaEye />}
                            {showSolution ? 'Hide Solution' : 'Show Solution'}
                        </button>
                        <button
                            className="btn d-flex align-items-center gap-2"
                            onClick={() => setCode(selectedChallenge.starterCode)}
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                        >
                            Reset Code
                        </button>
                    </div>

                    {/* Output */}
                    {output && (
                        <div className="glass-card p-3 rounded-3" style={{ background: 'var(--bg-elevated)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Output:</strong>
                            <div className="mt-2" style={{ color: output.includes('✅') ? 'var(--success)' : output.includes('❌') ? 'var(--error)' : 'var(--warning)' }}>
                                {output}
                            </div>
                        </div>
                    )}

                    {/* Test Results */}
                    {testResults.length > 0 && (
                        <div className="glass-card p-3 rounded-3">
                            <strong style={{ color: 'var(--text-primary)' }}>Test Results:</strong>
                            <div className="mt-2 d-flex flex-column gap-2">
                                {testResults.map((test, idx) => (
                                    <div key={idx} className="d-flex align-items-start gap-2 p-2 rounded" style={{ background: test.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                                        {test.passed ? <FaCheckCircle className="text-success mt-1" /> : <FaTimesCircle className="text-danger mt-1" />}
                                        <div className="small">
                                            <div><strong>Input:</strong> {test.input}</div>
                                            <div><strong>Expected:</strong> {test.expected}</div>
                                            <div><strong>Got:</strong> {test.result}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Solution */}
                    {showSolution && (
                        <div className="glass-card p-3 rounded-3" style={{ borderLeft: '4px solid var(--success)' }}>
                            <strong className="d-block mb-2" style={{ color: 'var(--success)' }}>Solution:</strong>
                            <div className="code-snippet">
                                <code style={{ whiteSpace: 'pre-wrap' }}>{selectedChallenge.solution}</code>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodingChallenges;
