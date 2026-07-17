import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Quiz from './Quiz';
import { FaClock, FaPaperPlane, FaListUl } from 'react-icons/fa';

const QuizFeed = ({ quizData, isDarkMode, isLoading, error, quizMode = 'practice', testConfig = {}, setTestConfig, recordAnswer, activeCategory }) => {
    const [activeQuestions, setActiveQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [canAdvance, setCanAdvance] = useState(false);
    const [answeredIds, setAnsweredIds] = useState(new Set());
    const [markedIds, setMarkedIds] = useState(new Set());
    const [visitedIds, setVisitedIds] = useState(new Set());
    const [testAnswers, setTestAnswers] = useState({}); // Store answers for test mode
    const testAnswersRef = useRef({}); // Ref to always access latest testAnswers
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [showResultDetail, setShowResultDetail] = useState(false);
    
    // Feedback form state
    const [reportingId, setReportingId] = useState(null);
    const [reportText, setReportText] = useState('');
    const [reportedIds, setReportedIds] = useState(new Set());
    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Keep ref in sync with state
    useEffect(() => {
        testAnswersRef.current = testAnswers;
    }, [testAnswers]);

    // Handle test submission - accepts optional answers param to avoid stale closure
    const handleSubmitTest = (answersParam) => {
        const answers = answersParam || testAnswersRef.current;
        let correctCount = 0;
        quizData.forEach(q => {
            const isCorrect = answers[q.id] === q.correctOptionId;
            if (isCorrect) {
                correctCount++;
            }
            // Record each answered question for stats
            if (recordAnswer && activeCategory && answers[q.id]) {
                recordAnswer(activeCategory, q.topics || [], isCorrect, q.id);
            }
        });
        setScore(correctCount);
        setTestSubmitted(true);
        setQuizCompleted(true);
        if (setTestConfig) {
            setTestConfig(prev => ({ ...prev, active: false }));
        }
        triggerConfetti();
    };

    // Test timer countdown
    useEffect(() => {
        if (!testConfig?.active || testConfig?.timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTestConfig(prev => {
                if (prev.timeRemaining <= 1) {
                    // Time's up - auto submit using ref to avoid stale closure
                    handleSubmitTest(testAnswersRef.current);
                    return { ...prev, timeRemaining: 0, active: false };
                }
                return { ...prev, timeRemaining: prev.timeRemaining - 1 };
            });
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testConfig?.active]);

    // Reset when quizData changes
    useEffect(() => {
        if (quizData && quizData.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveQuestions([quizData[0]]);
            setCurrentQuestionIndex(0);
        } else {
            setActiveQuestions([]);
            setCurrentQuestionIndex(0);
        }
        setScore(0);
        setQuizCompleted(false);
        setCanAdvance(false);
        setAnsweredIds(new Set());
        setMarkedIds(new Set());
        setTestAnswers({});
        testAnswersRef.current = {};
        setTestSubmitted(false);
        setShowResultDetail(false);
        // Track first question as visited
        if (quizData && quizData.length > 0 && quizData[0]?.id) {
            setVisitedIds(new Set([quizData[0].id]));
        } else {
            setVisitedIds(new Set());
        }
    }, [quizData]);



    const handleAnswer = (isCorrect, optionId) => {
        const currentQuestion = quizData[currentQuestionIndex];
        const currentId = currentQuestion?.id;

        // In test mode, just store the answer without revealing correctness
        if (quizMode === 'test' && !testSubmitted) {
            if (currentId) {
                const updated = { ...testAnswersRef.current, [currentId]: optionId };
                testAnswersRef.current = updated;
                setTestAnswers(updated);
                setAnsweredIds(prev => {
                    const next = new Set(prev);
                    next.add(currentId);
                    return next;
                });
            }
            setCanAdvance(true);
            return;
        }

        // Practice mode - show feedback immediately and record stats
        if (isCorrect) {
            setScore(prev => prev + 1);
            triggerConfetti();
        }

        // Store selected option so we can restore it when navigating back
        if (currentId && optionId) {
            const updated = { ...testAnswersRef.current, [currentId]: optionId };
            testAnswersRef.current = updated;
            setTestAnswers(updated);
        }

        // Record answer for stats tracking
        if (recordAnswer && activeCategory && currentId) {
            recordAnswer(activeCategory, currentQuestion?.topics || [], isCorrect, currentId);
        }

        setCanAdvance(true);
        if (currentId) {
            setAnsweredIds((prev) => {
                const next = new Set(prev);
                next.add(currentId);
                return next;
            });
        }
    };

    const handleNext = () => {
        if (!canAdvance) return;

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < quizData.length) {
            const nextQuestionId = quizData[nextIndex]?.id;
            // Show only the current question (single quiz mode)
            setActiveQuestions([quizData[nextIndex]]);
            setCurrentQuestionIndex(nextIndex);
            setCanAdvance(false);
            // Mark as visited
            if (nextQuestionId) {
                setVisitedIds(prev => {
                    const next = new Set(prev);
                    next.add(nextQuestionId);
                    return next;
                });
            }
        } else {
            // Show completion message
            setActiveQuestions([{ type: 'completion', score: score, total: quizData.length }]);
            setQuizCompleted(true);
        }
    };

    const handleRetry = () => {
        setActiveQuestions([quizData[0]]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizCompleted(false);
        setCanAdvance(false);
        setAnsweredIds(new Set());
        setVisitedIds(new Set([quizData[0]?.id]));
        setTestAnswers({});
        testAnswersRef.current = {};
        setTestSubmitted(false);
        setShowResultDetail(false);
    };

    const toggleMark = (questionId) => {
        setMarkedIds((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    };

    // Navigate to a specific question
    const goToQuestion = (index) => {
        if (index < 0 || index >= quizData.length || quizCompleted) return;
        const questionId = quizData[index]?.id;
        setActiveQuestions([quizData[index]]);
        setCurrentQuestionIndex(index);
        setCanAdvance(answeredIds.has(questionId));
        // Mark as visited
        if (questionId) {
            setVisitedIds(prev => {
                const next = new Set(prev);
                next.add(questionId);
                return next;
            });
        }
    };

    const progress = quizData.length ? ((currentQuestionIndex + 1) / quizData.length) * 100 : 0;

    const questionStatuses = quizData.map((q, idx) => {
        const id = q.id;
        const isMarked = markedIds.has(id);
        const isAnswered = answeredIds.has(id);
        const isVisited = visitedIds.has(id);
        let status = 'unseen';
        if (isMarked) status = 'marked';
        else if (isAnswered) status = 'answered';
        else if (isVisited) status = 'seen';
        return { id, idx, status };
    });

    // Compute per-question results after submission
    const resultsByQuestion = quizCompleted && testSubmitted
        ? quizData.map(q => ({
            ...q,
            selectedId: testAnswers[q.id] || null,
            isCorrect: testAnswers[q.id] === q.correctOptionId,
            wasAttempted: !!testAnswers[q.id],
        }))
        : [];

    const getScoreColor = (sc, total) => {
        const pct = sc / total;
        if (pct >= 0.8) return '#10b981';
        if (pct >= 0.5) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div
            className="h-full overflow-auto p-3 sm:p-4 custom-scrollbar"
            style={{ background: isDarkMode ? '#0f172a' : '#f8fafc' }}
        >
            {isLoading && (
                <div className="text-center text-slate-500 py-5">Loading questions…</div>
            )}

            {!isLoading && error && (
                <div className="text-center text-red-500 py-5">{error}</div>
            )}

            {!isLoading && !error && quizData.length === 0 && (
                <div className="text-center text-slate-500 py-5">No questions available for this category.</div>
            )}

            {/* ── COMPLETED / RESULT SCREEN ── */}
            {quizCompleted && (
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card p-6 rounded-2xl text-center"
                    >
                        <div className="text-5xl mb-3">
                            {score >= quizData.length * 0.8 ? '🏆' : score >= quizData.length * 0.5 ? '👍' : '📚'}
                        </div>
                        <h2 className="text-gradient font-bold mb-2 text-2xl sm:text-3xl">
                            {testSubmitted ? 'Exam Submitted! 📋' : 'Practice Complete! 🎉'}
                        </h2>

                        {/* Big Score */}
                        <div className="my-4 flex flex-col items-center gap-1">
                            <span
                                className="text-6xl font-black tabular-nums"
                                style={{ color: getScoreColor(score, quizData.length) }}
                            >
                                {score}
                            </span>
                            <span className="text-slate-400 text-lg">/ {quizData.length} correct</span>
                            <span
                                className="mt-2 text-sm font-bold"
                                style={{ color: getScoreColor(score, quizData.length) }}
                            >
                                {Math.round((score / quizData.length) * 100)}% score
                            </span>
                        </div>

                        {/* Grade badge */}
                        <div className="mb-5">
                            <span className={`inline-block rounded-full px-5 py-2 font-bold text-sm ${score >= quizData.length * 0.8 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : score >= quizData.length * 0.5 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                {score >= quizData.length * 0.8 ? 'Excellent! 🌟' : score >= quizData.length * 0.5 ? 'Good Effort! 👍' : 'Needs Practice 📚'}
                            </span>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            {[
                                { label: 'Correct', val: score, color: '#10b981' },
                                { label: 'Wrong', val: answeredIds.size - score, color: '#ef4444' },
                                { label: 'Skipped', val: quizData.length - answeredIds.size, color: '#6b7280' },
                            ].map(s => (
                                <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-3">
                                    <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors"
                                onClick={handleRetry}
                            >
                                🔄 Try Again
                            </button>
                            {testSubmitted && resultsByQuestion.length > 0 && (
                                <button
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full transition-colors"
                                    onClick={() => setShowResultDetail(v => !v)}
                                >
                                    {showResultDetail ? '🔼 Hide Details' : '🔍 View Answers'}
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Detailed answer review (test mode only) */}
                    {showResultDetail && testSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 space-y-4"
                        >
                            <h3 className="text-lg font-black text-white mb-2">Answer Review</h3>
                            {resultsByQuestion.map((q, idx) => (
                                <div
                                    key={q.id}
                                    className={`glass-card rounded-xl p-4 border-l-4 ${q.isCorrect ? 'border-l-green-500' : q.wasAttempted ? 'border-l-red-500' : 'border-l-slate-500'}`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <span className="text-sm font-bold text-slate-300">Q{idx + 1}</span>
                                        <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${q.isCorrect ? 'bg-green-500/20 text-green-400' : q.wasAttempted ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                            {q.isCorrect ? '✓ Correct' : q.wasAttempted ? '✗ Wrong' : '— Skipped'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white font-semibold mb-3">{q.question}</p>
                                    <div className="space-y-1.5">
                                        {q.options.map(opt => {
                                            const isCorrectOpt = opt.id === q.correctOptionId;
                                            const isSelectedOpt = opt.id === q.selectedId;
                                            return (
                                                <div
                                                    key={opt.id}
                                                    className={`text-xs rounded-lg px-3 py-2 flex items-center gap-2 ${isCorrectOpt ? 'bg-green-500/20 text-green-300 border border-green-500/30' : isSelectedOpt && !isCorrectOpt ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-white/5 text-slate-400'}`}
                                                >
                                                    <span className="font-bold uppercase">{opt.id}.</span>
                                                    <span>{opt.text}</span>
                                                    {isCorrectOpt && <span className="ml-auto">✓</span>}
                                                    {isSelectedOpt && !isCorrectOpt && <span className="ml-auto">✗</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {q.explanation && (
                                        <p className="text-xs text-blue-300 mt-2 pl-2 border-l-2 border-blue-500">
                                            💡 {q.explanation}
                                        </p>
                                    )}
                                    
                                    {/* Feedback / Report button */}
                                    <div className="mt-4 flex justify-end">
                                        {!reportedIds.has(q.id) ? (
                                            <button 
                                                onClick={() => { setReportingId(q.id); setReportText(''); }}
                                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                                            >
                                                🚩 Report Issue
                                            </button>
                                        ) : (
                                            <span className="text-xs text-green-400 flex items-center gap-1">
                                                ✓ Feedback submitted
                                            </span>
                                        )}
                                    </div>

                                    {/* Report Form */}
                                    {reportingId === q.id && !reportedIds.has(q.id) && (
                                        <div className="mt-2 bg-black/20 p-3 rounded-lg border border-white/10">
                                            <p className="text-xs font-semibold text-slate-300 mb-2">What's wrong with this question?</p>
                                            <textarea 
                                                value={reportText}
                                                onChange={e => setReportText(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-xs text-white focus:outline-none focus:border-blue-500 mb-2"
                                                rows={2}
                                                placeholder="E.g. The correct answer is outdated, typos, etc."
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => setReportingId(null)}
                                                    className="px-3 py-1 rounded text-xs text-slate-400 hover:bg-white/10"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setReportedIds(prev => new Set(prev).add(q.id));
                                                        setReportingId(null);
                                                    }}
                                                    className="px-3 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-500 font-semibold"
                                                    disabled={!reportText.trim()}
                                                >
                                                    Submit Feedback
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            )}

            {/* ── ACTIVE QUIZ SCREEN ── */}
            {!quizCompleted && !isLoading && !error && quizData.length > 0 && (
                <>
                    {/* Progress Bar */}
                    <div className="sticky top-0 z-10 mb-4 rounded-xl" style={{ background: isDarkMode ? '#0f172a' : '#f8fafc' }}>
                        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                                    Question {currentQuestionIndex + 1} of {quizData.length}
                                </span>
                                {/* Mode Badge */}
                                <span className={`badge-primary ${quizMode === 'test' ? 'bg-warning text-dark' : ''}`} style={{ fontSize: '0.7rem' }}>
                                    {quizMode === 'practice' ? '📝 Practice' : '🎯 Exam Mode'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Global Test Timer */}
                                {testConfig?.active && (
                                    <div className={`global-timer ${testConfig.timeRemaining < 300 ? 'warning' : ''} ${testConfig.timeRemaining < 60 ? 'danger' : ''}`}>
                                        <FaClock />
                                        <span>{formatTime(testConfig.timeRemaining)}</span>
                                    </div>
                                )}
                                <span className="text-sm font-bold" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                                    {quizMode === 'test' && !testSubmitted ? `Answered: ${answeredIds.size}/${quizData.length}` : `Score: ${score}`}
                                </span>
                            </div>
                        </div>
                        <div className="progress" style={{ height: '6px', background: isDarkMode ? '#1e293b' : '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                            <motion.div
                                className="progress-bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                                style={{
                                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                    height: '100%',
                                    borderRadius: '99px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Main layout: question + sidebar */}
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6" style={{ maxWidth: '1300px', margin: '0 auto' }}>

                        {/* ── LEFT: Question Panel ── */}
                        <div className="flex-1 flex flex-col gap-4" style={{ minWidth: 0 }}>
                            <AnimatePresence mode='wait'>
                                {activeQuestions.map((item) => (
                                    <motion.div
                                        key={item.id || 'completion'}
                                        initial={{ opacity: 0, x: 40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -40 }}
                                        transition={{ type: "spring", duration: 0.4 }}
                                        className="w-full"
                                    >
                                        <Quiz
                                            question={item}
                                            questionNumber={currentQuestionIndex + 1}
                                            totalQuestions={quizData.length}
                                            handleAnswerOptionClick={handleAnswer}
                                            handleNextQuestion={() => { }}
                                            isChatMode={true}
                                            isDarkMode={isDarkMode}
                                            onNext={handleNext}
                                            isMarked={markedIds.has(item.id)}
                                            onToggleMark={() => toggleMark(item.id)}
                                            quizMode={quizMode}
                                            testSubmitted={testSubmitted}
                                            subject={activeCategory || ''}
                                            savedSelection={
                                                quizMode === 'test'
                                                    ? testAnswers[item.id] || null
                                                    : answeredIds.has(item.id) ? (testAnswers[item.id] || item.correctOptionId) : null
                                            }
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Submit Test Button */}
                            {quizMode === 'test' && !testSubmitted && !quizCompleted && quizData.length > 0 && (
                                <button
                                    className="submit-test-btn"
                                    onClick={() => handleSubmitTest()}
                                    disabled={answeredIds.size === 0}
                                >
                                    <FaPaperPlane /> Submit Exam ({answeredIds.size}/{quizData.length} answered)
                                </button>
                            )}
                        </div>

                        {/* ── RIGHT: Navigation Panel (desktop only) ── */}
                        <div className="hidden lg:flex lg:flex-col lg:w-[280px] xl:w-[320px] shrink-0">
                            <div className="glass-card p-5 rounded-2xl border-t-4 border-t-purple-500 shadow-[0_10px_30px_rgba(139,92,246,0.15)] sticky top-16">
                                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                                    <span className="font-black text-base tracking-wide" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                        Question Navigator
                                    </span>
                                    <span className="text-xs text-slate-500">{answeredIds.size}/{quizData.length}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4 max-h-52 overflow-y-auto custom-scrollbar">
                                    {questionStatuses.map(({ id, idx, status }) => (
                                        <span
                                            key={id || idx}
                                            className={`nav-dot nav-dot-${status} ${idx === currentQuestionIndex ? 'nav-dot-current' : ''}`}
                                            title={`Q${idx + 1} - ${status}`}
                                            onClick={() => goToQuestion(idx)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter') goToQuestion(idx); }}
                                        >
                                            {idx + 1}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs mt-4 pt-4 border-t border-white/5" style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                                    <div className="flex items-center gap-1.5"><span className="legend-dot bg-answered" /> Answered</div>
                                    <div className="flex items-center gap-1.5"><span className="legend-dot bg-marked" /> Marked</div>
                                    <div className="flex items-center gap-1.5"><span className="legend-dot bg-seen" /> Seen</div>
                                    <div className="flex items-center gap-1.5"><span className="legend-dot bg-unseen" /> Unseen</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── MOBILE: Question Navigator Button (bottom-right) ── */}
                    <button
                        className="lg:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-full shadow-[0_4px_15px_rgba(147,51,234,0.5)] hover:bg-purple-500 transition-colors font-semibold text-sm"
                        onClick={() => setIsMobileNavOpen(true)}
                        aria-label="Open Question Navigator"
                    >
                        <FaListUl size={14} />
                        <span>{answeredIds.size}/{quizData.length}</span>
                    </button>

                    {/* ── MOBILE: Navigator Bottom Sheet ── */}
                    <AnimatePresence>
                        {isMobileNavOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                                    onClick={() => setIsMobileNavOpen(false)}
                                />
                                {/* Sheet */}
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                    className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111827] border-t border-white/10 rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto"
                                >
                                    {/* Handle */}
                                    <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-black text-white text-base">Question Navigator</span>
                                        <button
                                            className="text-slate-400 hover:text-white p-1"
                                            onClick={() => setIsMobileNavOpen(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {questionStatuses.map(({ id, idx, status }) => (
                                            <span
                                                key={id || idx}
                                                className={`nav-dot nav-dot-${status} ${idx === currentQuestionIndex ? 'nav-dot-current' : ''}`}
                                                title={`Q${idx + 1}`}
                                                onClick={() => {
                                                    goToQuestion(idx);
                                                    setIsMobileNavOpen(false);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        goToQuestion(idx);
                                                        setIsMobileNavOpen(false);
                                                    }
                                                }}
                                            >
                                                {idx + 1}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs pt-4 border-t border-white/5 text-slate-400">
                                        <div className="flex items-center gap-1.5"><span className="legend-dot bg-answered" /> Answered</div>
                                        <div className="flex items-center gap-1.5"><span className="legend-dot bg-marked" /> Marked</div>
                                        <div className="flex items-center gap-1.5"><span className="legend-dot bg-seen" /> Seen</div>
                                        <div className="flex items-center gap-1.5"><span className="legend-dot bg-unseen" /> Unseen</div>
                                    </div>

                                    {/* Submit from nav panel */}
                                    {quizMode === 'test' && !testSubmitted && (
                                        <button
                                            className="mt-4 w-full submit-test-btn"
                                            onClick={() => { handleSubmitTest(); setIsMobileNavOpen(false); }}
                                            disabled={answeredIds.size === 0}
                                        >
                                            <FaPaperPlane /> Submit Exam ({answeredIds.size}/{quizData.length})
                                        </button>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default QuizFeed;
