import { useEffect, useState } from 'react';
import { FaCode, FaCheck, FaExclamationTriangle, FaMagic, FaCopy, FaSave, FaSpinner, FaLightbulb } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const QuizCreator = ({ currentData, onUpdateData, activeCategory, savingState }) => {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(currentData || [], null, 2));
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const [lineCount, setLineCount] = useState(0);

    const prompt = `Act as a Quiz Generator. First, ask me how many questions I want and what topic I need. Once I answer, generate a JSON array of multiple-choice questions in this strict format: [{"id": 1, "question": "...", "options": [{"id": "a", "text": "..."}, ...], "correctOptionId": "a", "explanation": "..."}]. Ensure strict JSON format.`;

    useEffect(() => {
        const newJson = JSON.stringify(currentData || [], null, 2);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJsonInput(newJson);
        setLineCount(newJson.split('\n').length);
        setError(null);
        setSuccess(false);
    }, [currentData]);

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInputChange = (e) => {
        setJsonInput(e.target.value);
        setLineCount(e.target.value.split('\n').length);
        setError(null);
        setSuccess(false);
    };

    const handleUpdate = async () => {
        try {
            const parsedData = JSON.parse(jsonInput);
            if (!Array.isArray(parsedData)) throw new Error("Data must be an array of questions.");
            parsedData.forEach((q, idx) => {
                if (!q.question || !q.options || !q.correctOptionId) {
                    throw new Error(`Question ${idx + 1} is missing required fields.`);
                }
            });
            const result = await onUpdateData(parsedData);
            if (result?.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result?.message || 'Failed to save changes.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            setJsonInput(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch {
            setError('Invalid JSON - cannot format');
        }
    };

    return (
        <div className="h-100 d-flex flex-column p-4 overflow-auto custom-scrollbar" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <motion.div
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaCode size={20} color="white" />
                </motion.div>
                <div>
                    <h4 className="mb-0 fw-bold">Quiz Creator</h4>
                    <small style={{ color: 'var(--text-muted)' }}>{activeCategory ? `Editing: ${activeCategory}` : 'Select a category'}</small>
                </div>
            </div>

            {/* AI Prompt Section */}
            <motion.div
                className="mb-4 rounded-3 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid var(--border-color)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                            <FaMagic style={{ color: 'var(--warning)' }} />
                            <span className="fw-semibold small">AI Quiz Generator</span>
                        </div>
                        <motion.button
                            className="d-flex align-items-center gap-1 px-2 py-1 rounded"
                            style={{ background: copied ? 'var(--success)' : 'var(--bg-elevated)', border: 'none', color: copied ? 'white' : 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
                            onClick={handleCopyPrompt}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </motion.button>
                    </div>
                    <p className="small mb-2" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Copy this prompt for ChatGPT or Claude:</p>
                    <div className="p-3 rounded-2 small" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: '1.5', color: 'var(--text-secondary)', maxHeight: '80px', overflowY: 'auto', cursor: 'text', userSelect: 'all' }}>
                        {prompt}
                    </div>
                </div>
            </motion.div>

            {/* Tips */}
            <div className="d-flex align-items-start gap-2 mb-3 p-2 rounded-2" style={{ background: 'rgba(59, 130, 246, 0.08)', fontSize: '0.75rem' }}>
                <FaLightbulb style={{ color: 'var(--info)', marginTop: '2px' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Tip: Each question needs <code>id</code>, <code>question</code>, <code>options</code>, and <code>correctOptionId</code></span>
            </div>

            {/* JSON Editor */}
            <div className="flex-grow-1 mb-4 position-relative" style={{ minHeight: '200px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="small fw-medium" style={{ color: 'var(--text-secondary)' }}>Quiz JSON Data</label>
                    <div className="d-flex align-items-center gap-2">
                        <span className="small" style={{ color: 'var(--text-muted)' }}>{lineCount} lines</span>
                        <button
                            className="px-2 py-1 rounded small"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem' }}
                            onClick={formatJson}
                        >
                            Format
                        </button>
                    </div>
                </div>
                <textarea
                    className="w-100 p-3 rounded-3"
                    style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        resize: 'none',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: '0.8rem',
                        lineHeight: '1.6',
                        height: 'calc(100% - 30px)',
                        minHeight: '250px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                    }}
                    value={jsonInput}
                    onChange={handleInputChange}
                    spellCheck="false"
                    placeholder="Paste your JSON here..."
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="d-flex align-items-center gap-2 mb-3 p-3 rounded-2" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                        <FaExclamationTriangle /><span className="small">{error}</span>
                    </motion.div>
                )}
                {(success || savingState?.status === 'saved') && (
                    <motion.div key="success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="d-flex align-items-center gap-2 mb-3 p-3 rounded-2" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                        <FaCheck /><span className="small">Quiz updated successfully!</span>
                    </motion.div>
                )}
                {savingState?.status === 'saving' && (
                    <motion.div key="saving" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="d-flex align-items-center gap-2 mb-3 p-3 rounded-2" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>
                        <FaSpinner className="fa-spin" /><span className="small">Saving changes...</span>
                    </motion.div>
                )}
                {savingState?.status === 'error' && (
                    <motion.div key="save-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="d-flex align-items-center gap-2 mb-3 p-3 rounded-2" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                        <FaExclamationTriangle /><span className="small">{savingState.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Update Button */}
            <motion.button
                className="w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontSize: '0.9375rem',
                    cursor: savingState?.status === 'saving' ? 'not-allowed' : 'pointer',
                    opacity: savingState?.status === 'saving' ? 0.7 : 1,
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
                }}
                onClick={handleUpdate}
                disabled={savingState?.status === 'saving'}
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}
                whileTap={{ y: 0 }}
            >
                <FaSave />
                {savingState?.status === 'saving' ? 'Saving...' : 'Update Quiz'}
            </motion.button>
        </div>
    );
};

export default QuizCreator;
