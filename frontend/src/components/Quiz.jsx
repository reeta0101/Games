import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaChevronRight, FaBookmark, FaRegBookmark, FaClock } from 'react-icons/fa';
import useKeyboard from '../hooks/useKeyboard';
import useSound from '../hooks/useSound';
import useTimer from '../hooks/useTimer';

const Quiz = ({
  question,
  questionNumber,
  totalQuestions,
  handleAnswerOptionClick,
  isChatMode = false,
  isDarkMode = true,
  onNext,
  isMarked = false,
  onToggleMark,
  timerEnabled = false,
  timerDuration = 30,
  soundEnabled = true,
  savedSelection = null,
  quizMode = 'practice',
  testSubmitted = false
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const { playSound } = useSound(soundEnabled);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true);
      playSound('wrong');
      handleAnswerOptionClick(false);
      setTimeout(() => setShowNext(true), 600);
    }
  }, [isAnswered, handleAnswerOptionClick, playSound]);

  const timer = useTimer(timerDuration, handleTimeUp);

  useEffect(() => {
    // If we have a saved selection, restore it immediately
    if (savedSelection) {
      setSelectedOption(savedSelection);
      setIsAnswered(true);
      setShowNext(true);
      if (timerEnabled) timer.stop();
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      setShowNext(false);
      if (timerEnabled) {
        timer.reset(timerDuration);
        timer.start();
      }
    }
  }, [question, savedSelection]);

  const onOptionClick = useCallback((optionId) => {
    if (isAnswered) return;
    timer.stop();
    setSelectedOption(optionId);
    setIsAnswered(true);

    const isCorrect = optionId === question.correctOptionId;
    if (!isCorrect) {
      playSound('wrong');
    }

    if (isChatMode) {
      setTimeout(() => setShowNext(true), 600);
      handleAnswerOptionClick(isCorrect, optionId);
    } else {
      setTimeout(() => handleAnswerOptionClick(isCorrect, optionId), 300);
    }
  }, [isAnswered, question.correctOptionId, isChatMode, handleAnswerOptionClick, playSound, timer]);

  const handleNextClick = useCallback(() => {
    if (onNext && (showNext || isAnswered)) {
      playSound('click');
      onNext();
    }
  }, [onNext, showNext, isAnswered, playSound]);

  const handleOptionByIndex = useCallback((index) => {
    if (isAnswered || index >= question.options.length) return;
    onOptionClick(question.options[index].id);
  }, [isAnswered, question.options, onOptionClick]);

  // Keyboard navigation
  useKeyboard({
    onOptionSelect: handleOptionByIndex,
    onNext: handleNextClick,
    onMark: onToggleMark,
  });

  const getOptionClass = (optionId) => {
    if (!isAnswered) return '';

    // In test mode, don't reveal correct/wrong until submitted
    if (quizMode === 'test' && !testSubmitted) {
      if (selectedOption === optionId) return 'selected';
      return '';
    }

    // Practice mode or test submitted - show correct/wrong
    if (optionId === question.correctOptionId) return 'correct';
    if (selectedOption === optionId) return 'wrong';
    return 'disabled';
  };

  const getPercentage = (optionId) => {
    if (!isAnswered) return 0;
    if (quizMode === 'test' && !testSubmitted) return 0;
    return optionId === question.correctOptionId ? 100 : 0;
  };

  const getShortcutKey = (index) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return letters[index] || (index + 1).toString();
  };

  return (
    <motion.div
      className="glass-card p-6 rounded-2xl w-full"
      style={{ maxWidth: '800px', borderTopLeftRadius: isChatMode ? '6px' : '24px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Question Header */}
      <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge-primary">Question {questionNumber}</span>
          {question.difficulty && (
            <span className={`difficulty-badge difficulty-${question.difficulty}`}>
              {question.difficulty === 'easy' ? '🟢' : question.difficulty === 'medium' ? '🟡' : '🔴'} {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          )}
          {timerEnabled && !isAnswered && (
            <div className={`timer-container ${timer.isWarning ? 'timer-warning' : ''} ${timer.isDanger ? 'timer-danger' : ''}`}>
              <FaClock size={12} />
              <span className="timer-value">{timer.formattedTime}</span>
            </div>
          )}
        </div>
        <button
          className={`mark-btn ${isMarked ? 'marked' : ''}`}
          onClick={() => { playSound('click'); onToggleMark && onToggleMark(); }}
          aria-label={isMarked ? 'Remove bookmark' : 'Bookmark question'}
        >
          {isMarked ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />}
          <span>{isMarked ? 'Bookmarked' : 'Bookmark'}</span>
          <span className="kbd hidden md:inline">M</span>
        </button>
      </div>

      <h5 className="mb-6 leading-relaxed font-semibold text-white" style={{ fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
        {question.question}
      </h5>

      {/* Topic Tags */}
      {question.topics && question.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {question.topics.map((topic, idx) => (
            <span key={idx} className="topic-tag">
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <motion.button
            key={option.id}
            className={`btn quiz-option-btn text-left py-4 px-5 relative flex items-center justify-between ${getOptionClass(option.id)}`}
            onClick={() => onOptionClick(option.id)}
            disabled={isAnswered}
            whileHover={!isAnswered ? { scale: 1.01 } : {}}
            whileTap={!isAnswered ? { scale: 0.99 } : {}}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{ zIndex: 1 }}
            aria-label={`Option ${option.id}: ${option.text}`}
          >
            {isAnswered && (
              <motion.div
                className="option-percentage-bar"
                initial={{ width: 0 }}
                animate={{ width: `${getPercentage(option.id)}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            )}

            <div className="flex items-center gap-4 relative z-10">
              <span className="option-letter">
                <AnimatePresence mode="wait">
                  {isAnswered && (quizMode === 'practice' || testSubmitted) && option.id === question.correctOptionId ? (
                    <motion.span key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                      <FaCheckCircle size={18} />
                    </motion.span>
                  ) : isAnswered && (quizMode === 'practice' || testSubmitted) && selectedOption === option.id && selectedOption !== question.correctOptionId ? (
                    <motion.span key="cross" initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                      <FaTimesCircle size={18} />
                    </motion.span>
                  ) : (
                    <motion.span key="letter">{getShortcutKey(index)}</motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="relative z-10 text-[0.95rem]">{option.text}</span>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              {!isAnswered && <span className="kbd hidden lg:inline">{getShortcutKey(index)}</span>}
              {isAnswered && getPercentage(option.id) > 0 && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="fw-bold" style={{ fontSize: '0.9rem' }}>
                  {getPercentage(option.id)}%
                </motion.span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Explanation card - hidden in test mode until submitted */}
      <AnimatePresence>
        {isAnswered && question.explanation && (quizMode === 'practice' || testSubmitted) && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ delay: 0.3 }}
            className="explanation-card mt-6"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <strong className="block mb-2 text-blue-400">Explanation</strong>
                <span className="text-slate-300 leading-relaxed">{question.explanation}</span>
                {/* Code snippet if available */}
                {question.codeSnippet && (
                  <div className="code-snippet mt-3">
                    <code>{question.codeSnippet}</code>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      <AnimatePresence>
        {showNext && isChatMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.4 }}
            className="mt-4 d-flex justify-content-center align-items-center gap-3"
          >
            <button
              className="telegram-next-btn inline-flex items-center gap-2"
              onClick={handleNextClick}
              aria-label="Go to next question"
            >
              Next Question
              <FaChevronRight size={14} />
            </button>
            <span className="hidden md:flex items-center gap-1 text-slate-500 text-xs">
              Press <span className="kbd">Enter</span> or <span className="kbd">→</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Quiz;
