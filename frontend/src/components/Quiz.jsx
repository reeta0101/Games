import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaChevronRight, FaBookmark, FaRegBookmark, FaClock, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import useKeyboard from '../hooks/useKeyboard';
import useSound from '../hooks/useSound';
import useTimer from '../hooks/useTimer';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

// Persistent bookmarks stored in localStorage
const BOOKMARK_KEY = 'quiz_bookmarks';

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
  } catch {
    return [];
  }
}

function toggleBookmarkStorage(question, subject) {
  const bookmarks = getBookmarks();
  const key = `${subject}_${question.id}`;
  const exists = bookmarks.findIndex(b => b.key === key);
  if (exists >= 0) {
    bookmarks.splice(exists, 1);
  } else {
    bookmarks.unshift({
      key,
      subject,
      difficulty: question.difficulty || 'unknown',
      questionId: question.id,
      questionText: question.question,
      options: question.options,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation || '',
      savedAt: new Date().toISOString(),
    });
  }
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
  return bookmarks;
}

// Get user session identifier (anonymous ID stored in localStorage)
function getUserId() {
  let uid = localStorage.getItem('quiz_uid');
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem('quiz_uid', uid);
  }
  return uid;
}

const Quiz = ({
  question,
  questionNumber,
  handleAnswerOptionClick,
  isChatMode = false,
  onNext,
  onToggleMark,
  timerEnabled = false,
  timerDuration = 30,
  soundEnabled = true,
  savedSelection = null,
  quizMode = 'practice',
  testSubmitted = false,
  subject = '',
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const { playSound } = useSound(soundEnabled);

  // Vote state
  const [myVote, setMyVote] = useState(null);       // 'up' | 'down' | null
  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [voteLoading, setVoteLoading] = useState(false);

  // Bookmark (persistent)
  const [isBookmarked, setIsBookmarked] = useState(false);

  const questionKey = question?.id ? `${subject}_${question.id}` : null;

  // Load vote + bookmark state when question changes
  useEffect(() => {
    if (!question?.id) return;

    // Restore bookmark state from localStorage
    const bookmarks = getBookmarks();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsBookmarked(bookmarks.some(b => b.key === questionKey));

    // Restore vote from localStorage (offline fallback)
    const localVotes = JSON.parse(localStorage.getItem('quiz_votes') || '{}');
    const localVote = localVotes[questionKey] || null;
    setMyVote(localVote);
    setUpCount(0);
    setDownCount(0);

    // Try to fetch live vote counts from backend
    const uid = getUserId();
    const qId = `${subject}_${question.id}`;
    fetch(`${API_BASE}/votes/question/${encodeURIComponent(qId)}?userIdentifier=${uid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUpCount(data.upCount || 0);
          setDownCount(data.downCount || 0);
          if (data.myVote) setMyVote(data.myVote);
        }
      })
      .catch(() => { /* silently ignore if offline */ });
  }, [question?.id, subject, questionKey]);

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
    if (savedSelection) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [question, savedSelection, timer, timerDuration, timerEnabled]);

  const onOptionClick = useCallback((optionId) => {
    if (isAnswered) return;
    timer.stop();
    setSelectedOption(optionId);
    setIsAnswered(true);

    const isCorrect = optionId === question.correctOptionId;
    if (!isCorrect) {
      playSound('wrong');
    } else if (quizMode === 'practice') {
      playSound('firework');
    }

    if (isChatMode) {
      setTimeout(() => setShowNext(true), 600);
      handleAnswerOptionClick(isCorrect, optionId);
    } else {
      setTimeout(() => handleAnswerOptionClick(isCorrect, optionId), 300);
    }
  }, [isAnswered, question.correctOptionId, isChatMode, handleAnswerOptionClick, playSound, timer, quizMode]);

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

  // Handle vote
  const handleVote = useCallback(async (voteType) => {
    if (voteLoading || !question?.id) return;
    const newVote = myVote === voteType ? null : voteType; // toggle off if same
    setVoteLoading(true);

    const uid = getUserId();
    const qId = `${subject}_${question.id}`;

    // Optimistic UI update
    const prevVote = myVote;
    setMyVote(newVote);
    if (newVote === 'up') {
      setUpCount(c => c + 1);
      if (prevVote === 'down') setDownCount(c => Math.max(0, c - 1));
    } else if (newVote === 'down') {
      setDownCount(c => c + 1);
      if (prevVote === 'up') setUpCount(c => Math.max(0, c - 1));
    } else {
      // Toggled off
      if (prevVote === 'up') setUpCount(c => Math.max(0, c - 1));
      if (prevVote === 'down') setDownCount(c => Math.max(0, c - 1));
    }

    // Save to localStorage (offline fallback)
    const localVotes = JSON.parse(localStorage.getItem('quiz_votes') || '{}');
    const qKey = `${subject}_${question.id}`;
    if (newVote) {
      localVotes[qKey] = newVote;
    } else {
      delete localVotes[qKey];
    }
    localStorage.setItem('quiz_votes', JSON.stringify(localVotes));

    // POST to backend (if toggle-off, still send null to remove)
    if (newVote) {
      try {
        const res = await fetch(`${API_BASE}/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: qId,
            subject: subject || 'unknown',
            difficulty: question.difficulty || 'unknown',
            questionText: question.question?.slice(0, 150) || '',
            vote: newVote,
            userIdentifier: uid,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setUpCount(data.upCount || 0);
          setDownCount(data.downCount || 0);
        }
      } catch { /* offline - optimistic update remains */ }
    }

    setVoteLoading(false);
  }, [myVote, voteLoading, question, subject]);

  // Handle persistent bookmark
  const handleBookmark = useCallback(() => {
    playSound('click');
    toggleBookmarkStorage(question, subject);
    const bookmarks = getBookmarks();
    setIsBookmarked(bookmarks.some(b => b.key === questionKey));
    // Also call parent onToggleMark if provided (for in-session nav dots)
    if (onToggleMark) onToggleMark();
  }, [question, subject, questionKey, playSound, onToggleMark]);

  const getOptionClass = (optionId) => {
    if (!isAnswered) return '';
    if (quizMode === 'test' && !testSubmitted) {
      if (selectedOption === optionId) return 'selected';
      return '';
    }
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

        {/* Right side: Votes & Bookmark */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Thumbs Up */}
          <button
            onClick={() => handleVote('up')}
            disabled={voteLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              myVote === 'up'
                ? 'bg-green-500/25 text-green-400 border border-green-500/40 scale-105'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-green-500/15 hover:text-green-400 hover:border-green-500/30'
            }`}
            title="Good question"
            aria-label="Vote up - good question"
          >
            <FaThumbsUp size={12} />
            <span>{upCount > 0 ? upCount : ''}</span>
          </button>

          {/* Thumbs Down */}
          <button
            onClick={() => handleVote('down')}
            disabled={voteLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              myVote === 'down'
                ? 'bg-red-500/25 text-red-400 border border-red-500/40 scale-105'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30'
            }`}
            title="Report issue / wrong question"
            aria-label="Vote down - report issue"
          >
            <FaThumbsDown size={12} />
            <span>{downCount > 0 ? downCount : ''}</span>
          </button>

          {/* Bookmark button */}
          <button
            className={`mark-btn ${isBookmarked ? 'marked' : ''}`}
            onClick={handleBookmark}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
          >
            {isBookmarked ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />}
            <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            <span className="kbd hidden md:inline">M</span>
          </button>
        </div>
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
            className={`btn quiz-option-btn text-left py-5 sm:py-4 px-4 sm:px-5 relative flex items-center justify-between min-h-[60px] ${getOptionClass(option.id)}`}
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
              <span className="relative z-10 text-[1rem] sm:text-[0.95rem] pr-2">{option.text}</span>
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

      {/* Explanation card */}
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
            className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3 w-full"
          >
            <button
              className="telegram-next-btn w-full sm:w-auto justify-center inline-flex items-center gap-2"
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
