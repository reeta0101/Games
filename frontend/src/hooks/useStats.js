import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'myPrepPartner_stats';

const getDefaultStats = () => ({
    totalQuestions: 0,
    correctAnswers: 0,
    timeSpent: 0,
    lastActive: null,
    streakDays: 0,
    longestStreak: 0,
    categoryStats: {},
    topicStats: {},
    dailyHistory: [],
    revisionList: []
});

const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

const useStats = () => {
    const [stats, setStats] = useState(getDefaultStats);

    // Load stats from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setStats(prev => ({ ...prev, ...parsed }));
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }, []);

    // Save stats to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        } catch (err) {
            console.error('Failed to save stats:', err);
        }
    }, [stats]);

    // Update streak on daily check
    const checkAndUpdateStreak = useCallback(() => {
        const today = getTodayString();

        setStats(prev => {
            if (prev.lastActive === today) {
                // Already active today, no change
                return prev;
            }

            const lastDate = prev.lastActive ? new Date(prev.lastActive) : null;
            const todayDate = new Date(today);

            let newStreak = prev.streakDays;

            if (lastDate) {
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    // Consecutive day - increment streak
                    newStreak = prev.streakDays + 1;
                } else if (diffDays > 1) {
                    // Missed days - reset streak
                    newStreak = 1;
                }
            } else {
                // First time using app
                newStreak = 1;
            }

            return {
                ...prev,
                lastActive: today,
                streakDays: newStreak,
                longestStreak: Math.max(prev.longestStreak, newStreak)
            };
        });
    }, []);

    // Record an answer
    const recordAnswer = useCallback((category, topics, isCorrect, questionId, timeSpentOnQuestion = 0) => {
        const today = getTodayString();

        setStats(prev => {
            // Update category stats
            const categoryStats = { ...prev.categoryStats };
            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, correct: 0, timeSpent: 0 };
            }
            categoryStats[category].total += 1;
            if (isCorrect) categoryStats[category].correct += 1;
            categoryStats[category].timeSpent += timeSpentOnQuestion;

            // Update topic stats
            const topicStats = { ...prev.topicStats };
            (topics || []).forEach(topic => {
                if (!topicStats[topic]) {
                    topicStats[topic] = { total: 0, correct: 0 };
                }
                topicStats[topic].total += 1;
                if (isCorrect) topicStats[topic].correct += 1;
            });

            // Update daily history
            const dailyHistory = [...prev.dailyHistory];
            const todayIndex = dailyHistory.findIndex(d => d.date === today);
            if (todayIndex >= 0) {
                dailyHistory[todayIndex] = {
                    ...dailyHistory[todayIndex],
                    questions: dailyHistory[todayIndex].questions + 1,
                    correct: dailyHistory[todayIndex].correct + (isCorrect ? 1 : 0),
                    timeSpent: dailyHistory[todayIndex].timeSpent + timeSpentOnQuestion
                };
            } else {
                dailyHistory.push({
                    date: today,
                    questions: 1,
                    correct: isCorrect ? 1 : 0,
                    timeSpent: timeSpentOnQuestion
                });
            }
            // Keep only last 30 days
            while (dailyHistory.length > 30) {
                dailyHistory.shift();
            }

            // Update revision list (add wrong answers)
            let revisionList = [...prev.revisionList];
            if (!isCorrect && questionId) {
                // Add to revision list if not already there
                const exists = revisionList.some(r => r.questionId === questionId && r.category === category);
                if (!exists) {
                    revisionList.push({
                        questionId,
                        category,
                        timestamp: Date.now()
                    });
                }
            } else if (isCorrect && questionId) {
                // Remove from revision list if answered correctly
                revisionList = revisionList.filter(r => !(r.questionId === questionId && r.category === category));
            }

            return {
                ...prev,
                totalQuestions: prev.totalQuestions + 1,
                correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
                timeSpent: prev.timeSpent + timeSpentOnQuestion,
                categoryStats,
                topicStats,
                dailyHistory,
                revisionList
            };
        });
    }, []);

    // Get accuracy percentage
    const getAccuracy = useCallback(() => {
        if (stats.totalQuestions === 0) return 0;
        return Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
    }, [stats.totalQuestions, stats.correctAnswers]);

    // Get weak topics (below 70% accuracy, min 3 attempts)
    const getWeakTopics = useCallback(() => {
        return Object.entries(stats.topicStats)
            .filter(([_, data]) => data.total >= 3)
            .map(([topic, data]) => ({
                topic,
                accuracy: Math.round((data.correct / data.total) * 100),
                total: data.total
            }))
            .filter(t => t.accuracy < 70)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5);
    }, [stats.topicStats]);

    // Get category accuracy for charts
    const getCategoryAccuracy = useCallback(() => {
        return Object.entries(stats.categoryStats)
            .map(([category, data]) => ({
                category,
                accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
                total: data.total,
                correct: data.correct
            }))
            .sort((a, b) => b.total - a.total);
    }, [stats.categoryStats]);

    // Format time spent
    const formatTimeSpent = useCallback((seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }, []);

    // Clear revision list
    const clearRevisionList = useCallback(() => {
        setStats(prev => ({ ...prev, revisionList: [] }));
    }, []);

    // Reset all stats
    const resetStats = useCallback(() => {
        setStats(getDefaultStats());
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        stats,
        checkAndUpdateStreak,
        recordAnswer,
        getAccuracy,
        getWeakTopics,
        getCategoryAccuracy,
        formatTimeSpent,
        clearRevisionList,
        resetStats
    };
};

export default useStats;
