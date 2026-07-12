import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaFire, FaClock, FaCheckCircle, FaExclamationTriangle, FaTrophy, FaRedo } from 'react-icons/fa';

const Dashboard = ({ stats, getAccuracy, getWeakTopics, getCategoryAccuracy, formatTimeSpent, onClose }) => {
    const accuracy = getAccuracy();
    const weakTopics = getWeakTopics();
    const categoryAccuracy = getCategoryAccuracy();

    // Get last 7 days of history
    const last7Days = stats.dailyHistory.slice(-7);
    const maxQuestions = Math.max(...last7Days.map(d => d.questions), 1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1100 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="dashboard-container glass-card p-4 rounded-4 custom-scrollbar"
                style={{ maxWidth: '700px', width: '95%', maxHeight: '90vh', overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0 fw-bold text-gradient">
                        <FaChartLine className="me-2" /> Your Progress
                    </h3>
                    <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
                </div>

                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    {/* Accuracy */}
                    <div className="col-6 col-md-3">
                        <div className="stat-card text-center p-3 rounded-3">
                            <div className="stat-circle mx-auto mb-2" style={{
                                background: `conic-gradient(var(--accent-primary) ${accuracy * 3.6}deg, var(--bg-elevated) 0deg)`
                            }}>
                                <span className="stat-value">{accuracy}%</span>
                            </div>
                            <div className="stat-label">Accuracy</div>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="col-6 col-md-3">
                        <div className="stat-card text-center p-3 rounded-3">
                            <div className="stat-icon mb-2">
                                <FaFire className="text-warning" size={32} />
                            </div>
                            <div className="stat-value">{stats.streakDays}</div>
                            <div className="stat-label">Day Streak</div>
                            {stats.longestStreak > stats.streakDays && (
                                <div className="stat-subtext">Best: {stats.longestStreak}</div>
                            )}
                        </div>
                    </div>

                    {/* Time Spent */}
                    <div className="col-6 col-md-3">
                        <div className="stat-card text-center p-3 rounded-3">
                            <div className="stat-icon mb-2">
                                <FaClock className="text-info" size={32} />
                            </div>
                            <div className="stat-value">{formatTimeSpent(stats.timeSpent)}</div>
                            <div className="stat-label">Time Spent</div>
                        </div>
                    </div>

                    {/* Total Questions */}
                    <div className="col-6 col-md-3">
                        <div className="stat-card text-center p-3 rounded-3">
                            <div className="stat-icon mb-2">
                                <FaCheckCircle className="text-success" size={32} />
                            </div>
                            <div className="stat-value">{stats.totalQuestions}</div>
                            <div className="stat-label">Questions</div>
                            <div className="stat-subtext">{stats.correctAnswers} correct</div>
                        </div>
                    </div>
                </div>

                {/* Category Performance */}
                {categoryAccuracy.length > 0 && (
                    <div className="mb-4">
                        <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            <FaTrophy className="me-2 text-warning" /> Category Performance
                        </h5>
                        <div className="category-bars">
                            {categoryAccuracy.slice(0, 6).map((cat, idx) => (
                                <div key={cat.category} className="mb-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-medium" style={{ color: 'var(--text-secondary)' }}>
                                            {cat.category.toUpperCase()}
                                        </span>
                                        <span className="small" style={{ color: 'var(--text-muted)' }}>
                                            {cat.accuracy}% ({cat.correct}/{cat.total})
                                        </span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', background: 'var(--bg-elevated)' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.accuracy}%` }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            className="progress-bar"
                                            style={{
                                                background: cat.accuracy >= 70
                                                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                    : cat.accuracy >= 50
                                                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                        : 'linear-gradient(90deg, #ef4444, #f87171)'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weak Areas */}
                {weakTopics.length > 0 && (
                    <div className="mb-4">
                        <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            <FaExclamationTriangle className="me-2 text-warning" /> Weak Areas (Focus Here!)
                        </h5>
                        <div className="d-flex flex-wrap gap-2">
                            {weakTopics.map(topic => (
                                <div key={topic.topic} className="weak-topic-badge">
                                    <span>{topic.topic}</span>
                                    <span className="ms-2 badge bg-danger">{topic.accuracy}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Last 7 Days Activity */}
                {last7Days.length > 0 && (
                    <div className="mb-4">
                        <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            📅 Last 7 Days
                        </h5>
                        <div className="d-flex justify-content-between align-items-end gap-2" style={{ height: '100px' }}>
                            {last7Days.map((day, idx) => {
                                const height = (day.questions / maxQuestions) * 100;
                                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                                return (
                                    <div key={day.date} className="flex-grow-1 d-flex flex-column align-items-center">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(height, 5)}%` }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            className="activity-bar rounded-top"
                                            style={{
                                                width: '100%',
                                                maxWidth: '40px',
                                                background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))'
                                            }}
                                            title={`${day.questions} questions, ${day.correct} correct`}
                                        />
                                        <span className="small mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                                            {dayName}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Revision List Count */}
                {stats.revisionList.length > 0 && (
                    <div className="revision-notice p-3 rounded-3 d-flex align-items-center gap-3">
                        <FaRedo className="text-warning" size={24} />
                        <div>
                            <strong style={{ color: 'var(--text-primary)' }}>
                                {stats.revisionList.length} questions to revise
                            </strong>
                            <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
                                Questions you got wrong are saved for later practice
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {stats.totalQuestions === 0 && (
                    <div className="text-center py-5">
                        <FaChartLine size={48} className="mb-3" style={{ color: 'var(--text-muted)' }} />
                        <h5 style={{ color: 'var(--text-secondary)' }}>No data yet!</h5>
                        <p style={{ color: 'var(--text-muted)' }}>Start practicing to see your progress.</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
