import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Quiz from './Quiz';
import { FaClock, FaPaperPlane } from 'react-icons/fa';

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
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Test timer countdown
    useEffect(() => {
        if (!testConfig?.active || testConfig?.timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTestConfig(prev => {
                if (prev.timeRemaining <= 1) {
                    // Time's up - auto submit
                    handleSubmitTest();
                    return { ...prev, timeRemaining: 0, active: false };
                }
                return { ...prev, timeRemaining: prev.timeRemaining - 1 };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [testConfig?.active]);

    // Reset when quizData changes
    useEffect(() => {
        if (quizData && quizData.length > 0) {
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
        setTestSubmitted(false);
        // Track first question as visited
        if (quizData && quizData.length > 0 && quizData[0]?.id) {
            setVisitedIds(new Set([quizData[0].id]));
        } else {
            setVisitedIds(new Set());
        }
    }, [quizData]);

    // Handle test submission
    const handleSubmitTest = () => {
        let correctCount = 0;
        quizData.forEach(q => {
            const isCorrect = testAnswers[q.id] === q.correctOptionId;
            if (isCorrect) {
                correctCount++;
            }
            // Record each answered question for stats
            if (recordAnswer && activeCategory && testAnswers[q.id]) {
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

    const handleAnswer = (isCorrect, optionId) => {
        const currentQuestion = quizData[currentQuestionIndex];
        const currentId = currentQuestion?.id;

        // In test mode, just store the answer without revealing correctness
        if (quizMode === 'test' && !testSubmitted) {
            if (currentId) {
                setTestAnswers(prev => ({ ...prev, [currentId]: optionId }));
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
            setTestAnswers(prev => ({ ...prev, [currentId]: optionId }));
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

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
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

    return (
        <div
            className="h-full overflow-auto p-4 custom-scrollbar"
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

            {/* Progress Bar */}
            {!quizCompleted && !isLoading && !error && quizData.length > 0 && (
                <div className="sticky top-0 z-10 mb-4" style={{ background: isDarkMode ? '#0f172a' : '#f8fafc' }}>
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                                Question {currentQuestionIndex + 1} of {quizData.length}
                            </span>
                            {/* Mode Badge */}
                            <span className={`badge-primary ${quizMode === 'test' ? 'bg-warning text-dark' : ''}`} style={{ fontSize: '0.7rem' }}>
                                {quizMode === 'practice' ? '📝 Practice' : '🎯 Test Mode'}
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
                                {quizMode === 'test' && !testSubmitted ? `Answered: ${answeredIds.size}` : `Score: ${score}`}
                            </span>
                        </div>
                    </div>
                    <div className="progress" style={{ height: '6px', background: isDarkMode ? '#1e293b' : '#e2e8f0' }}>
                        <motion.div
                            className="progress-bar"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            style={{
                                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                height: '100%'
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8" style={{ maxWidth: '1300px', margin: '0 auto' }}>

                <div className="flex-1 flex flex-col gap-4 items-stretch" style={{ minWidth: 0 }}>
                    {/* Main Questions Panel Header */}
                    <div className="w-full mb-2">
                        <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Questions Panel
                        </h3>
                    </div>

                    {/* Single Question Display */}
                    <AnimatePresence mode='wait'>
                        {activeQuestions.map((item) => (
                            <motion.div
                                key={item.id || 'completion'}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ type: "spring", duration: 0.4 }}
                                className="w-full"
                            >
                                {item.type === 'completion' ? (
                                    <div className="text-center p-8 rounded-2xl glass-card">
                                        <h2 className="text-gradient font-bold mb-3 text-3xl">
                                            {quizMode === 'test' ? 'Test Completed! 📋' : 'Quiz Completed! 🎉'}
                                        </h2>
                                        <p className="text-xl mb-4" style={{ color: isDarkMode ? '#fff' : '#1e293b' }}>
                                            You scored {score} / {quizData.length}
                                        </p>
                                        <div className="mb-4">
                                            <span className={`inline-block rounded-full px-4 py-2 font-bold text-sm ${score >= quizData.length * 0.8 ? 'bg-green-500/20 text-green-400' : score >= quizData.length * 0.5 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {score >= quizData.length * 0.8 ? 'Excellent! 🌟' : score >= quizData.length * 0.5 ? 'Good Effort! 👍' : 'Needs Practice 📚'}
                                            </span>
                                        </div>
                                        <button
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors"
                                            onClick={handleRetry}
                                        >
                                            🔄 Try Again
                                        </button>
                                    </div>
                                ) : (
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
                                        savedSelection={
                                            quizMode === 'test'
                                                ? testAnswers[item.id] || null
                                                : answeredIds.has(item.id) ? (testAnswers[item.id] || item.correctOptionId) : null
                                        }
                                    />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Submit Test Button - Only in test mode when not completed */}
                    {quizMode === 'test' && !testSubmitted && !quizCompleted && quizData.length > 0 && (
                        <button
                            className="submit-test-btn"
                            onClick={handleSubmitTest}
                            disabled={answeredIds.size === 0}
                        >
                            <FaPaperPlane /> Submit Test ({answeredIds.size}/{quizData.length} answered)
                        </button>
                    )}
                </div>

                {/* Overlay for mobile sidebar */}
                {isMobileNavOpen && (
                    <div 
                        className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileNavOpen(false)}
                    />
                )}

                {/* Navigation Panel (Sidebar on mobile, fixed width on desktop) */}
                <div className={`
                    fixed top-0 bottom-0 right-0 z-50 w-[320px] md:w-[400px] shrink-0 
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:static
                    bg-[#0f172a] md:bg-transparent shadow-2xl md:shadow-none
                    border-l border-white/10 md:border-none p-4 md:p-0
                    flex flex-col h-full overflow-y-auto
                `}>
                    <div className="glass-card p-5 rounded-2xl border-t-4 border-t-purple-500 shadow-[0_10px_30px_rgba(139,92,246,0.15)] flex-1 relative mt-16 md:mt-0">
                        {/* Mobile Close Button */}
                        <button 
                            className="md:hidden absolute -top-12 right-2 text-white/70 hover:text-white p-2"
                            onClick={() => setIsMobileNavOpen(false)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        
                        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                            <span className="font-black text-lg tracking-wide" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
                                Questions Navigation Panel
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {questionStatuses.map(({ id, idx, status }) => (
                                <span
                                    key={id || idx}
                                    className={`nav-dot nav-dot-${status} ${idx === currentQuestionIndex ? 'nav-dot-current' : ''}`}
                                    title={`Q${idx + 1} - ${status} (Click to jump)`}
                                    onClick={() => {
                                        goToQuestion(idx);
                                        setIsMobileNavOpen(false); // Auto-close on selection
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
                        <div className="flex flex-wrap justify-between gap-2 text-sm mt-4 pt-4 border-t border-white/5" style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                            <div className="flex items-center gap-2"><span className="legend-dot bg-answered" /> Answered</div>
                            <div className="flex items-center gap-2"><span className="legend-dot bg-marked" /> Marked</div>
                            <div className="flex items-center gap-2"><span className="legend-dot bg-seen" /> Seen</div>
                            <div className="flex items-center gap-2"><span className="legend-dot bg-unseen" /> Unseen</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Toggle Button */}
            {!isMobileNavOpen && (
                <button
                    className="md:hidden fixed bottom-6 right-6 z-30 p-4 bg-purple-600 text-white rounded-full shadow-[0_4px_15px_rgba(147,51,234,0.5)] hover:bg-purple-500 transition-colors"
                    onClick={() => setIsMobileNavOpen(true)}
                    aria-label="Open Navigation Panel"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default QuizFeed;
