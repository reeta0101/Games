import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaSquare, FaCheckSquare, FaClock, FaCalendarAlt } from 'react-icons/fa';

const checklistData = {
    weekBefore: {
        title: 'One Week Before',
        icon: '📅',
        items: [
            { id: 'w1', text: 'Research the company thoroughly - mission, products, recent news' },
            { id: 'w2', text: 'Review the job description and match your skills' },
            { id: 'w3', text: 'Prepare 5 questions to ask the interviewer' },
            { id: 'w4', text: 'Practice common technical questions for your role' },
            { id: 'w5', text: 'Review your resume and be ready to discuss every point' },
            { id: 'w6', text: 'Practice explaining your projects in 2-3 minutes each' },
        ]
    },
    dayBefore: {
        title: 'Day Before Interview',
        icon: '⏰',
        items: [
            { id: 'd1', text: 'Confirm interview time, location/link, and interviewer names' },
            { id: 'd2', text: 'Prepare your outfit - professional and comfortable' },
            { id: 'd3', text: 'Test your tech setup (camera, mic, internet) for virtual interviews' },
            { id: 'd4', text: 'Review your notes and key talking points' },
            { id: 'd5', text: 'Prepare copies of your resume (physical or digital)' },
            { id: 'd6', text: 'Get a good night\'s sleep - aim for 7-8 hours' },
        ]
    },
    interviewDay: {
        title: 'Interview Day',
        icon: '🎯',
        items: [
            { id: 'i1', text: 'Wake up early and have a nutritious breakfast' },
            { id: 'i2', text: 'Arrive 10-15 minutes early (or join meeting 5 min early)' },
            { id: 'i3', text: 'Bring notepad, pen, and copies of your resume' },
            { id: 'i4', text: 'Turn off your phone or set to silent' },
            { id: 'i5', text: 'Take deep breaths and stay calm' },
            { id: 'i6', text: 'Make eye contact and smile genuinely' },
        ]
    },
    duringInterview: {
        title: 'During the Interview',
        icon: '💬',
        items: [
            { id: 'dur1', text: 'Listen carefully to each question before answering' },
            { id: 'dur2', text: 'Use STAR method for behavioral questions' },
            { id: 'dur3', text: 'Ask clarifying questions if needed' },
            { id: 'dur4', text: 'Show enthusiasm and genuine interest' },
            { id: 'dur5', text: 'Be honest - don\'t exaggerate or lie' },
            { id: 'dur6', text: 'Ask your prepared questions at the end' },
        ]
    },
    afterInterview: {
        title: 'After the Interview',
        icon: '✅',
        items: [
            { id: 'a1', text: 'Send a thank-you email within 24 hours' },
            { id: 'a2', text: 'Reflect on what went well and areas to improve' },
            { id: 'a3', text: 'Note down any questions you struggled with for future prep' },
            { id: 'a4', text: 'Follow up if you haven\'t heard back within stated timeframe' },
        ]
    }
};

const InterviewChecklist = ({ isDarkMode }) => {
    const [completed, setCompleted] = useState(() => {
        const saved = localStorage.getItem('interviewChecklist');
        return saved ? JSON.parse(saved) : [];
    });

    const [interviewDate, setInterviewDate] = useState(() => {
        return localStorage.getItem('interviewDate') || '';
    });

    useEffect(() => {
        localStorage.setItem('interviewChecklist', JSON.stringify(completed));
    }, [completed]);

    useEffect(() => {
        localStorage.setItem('interviewDate', interviewDate);
    }, [interviewDate]);

    const toggleItem = (id) => {
        setCompleted(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const totalItems = Object.values(checklistData).reduce((acc, section) => acc + section.items.length, 0);
    const completedCount = completed.length;
    const progress = Math.round((completedCount / totalItems) * 100);

    const daysUntilInterview = interviewDate
        ? Math.ceil((new Date(interviewDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const resetChecklist = () => {
        setCompleted([]);
    };

    return (
        <div className="checklist-container p-4">
            <div className="text-center mb-4">
                <h2 className="text-gradient fw-bold mb-2">✅ Interview Checklist</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Your complete preparation guide for interview day
                </p>
            </div>

            {/* Interview Date & Progress */}
            <div className="row g-3 mb-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="col-12 col-md-6">
                    <div className="glass-card p-3 rounded-3">
                        <label className="small fw-bold mb-2 d-block" style={{ color: 'var(--text-primary)' }}>
                            <FaCalendarAlt className="me-2" />
                            Interview Date
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        />
                        {daysUntilInterview !== null && daysUntilInterview > 0 && (
                            <div className="mt-2 small" style={{ color: 'var(--accent-primary)' }}>
                                <FaClock className="me-1" />
                                {daysUntilInterview} day{daysUntilInterview !== 1 ? 's' : ''} to go!
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="glass-card p-3 rounded-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small fw-bold" style={{ color: 'var(--text-primary)' }}>
                                Progress
                            </span>
                            <span className="small" style={{ color: 'var(--text-muted)' }}>
                                {completedCount}/{totalItems} completed
                            </span>
                        </div>
                        <div className="progress-bar-bg mb-2">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%`, background: progress === 100 ? 'var(--success)' : 'var(--accent-primary)' }}
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <span className="fw-bold" style={{ color: progress === 100 ? 'var(--success)' : 'var(--accent-primary)' }}>
                                {progress}%
                            </span>
                            <button
                                className="btn btn-sm"
                                onClick={resetChecklist}
                                style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Sections */}
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {Object.entries(checklistData).map(([key, section], sectionIdx) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sectionIdx * 0.1 }}
                        className="checklist-section glass-card p-4 rounded-3 mb-3"
                    >
                        <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            {section.icon} {section.title}
                        </h5>
                        <div className="d-flex flex-column gap-2">
                            {section.items.map((item) => {
                                const isCompleted = completed.includes(item.id);
                                return (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ x: 5 }}
                                        className={`checklist-item d-flex align-items-start gap-3 p-2 rounded ${isCompleted ? 'completed' : ''}`}
                                        onClick={() => toggleItem(item.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className="check-icon">
                                            {isCompleted ? (
                                                <FaCheckSquare style={{ color: 'var(--success)' }} />
                                            ) : (
                                                <FaSquare style={{ color: 'var(--text-muted)' }} />
                                            )}
                                        </span>
                                        <span style={{
                                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)',
                                            textDecoration: isCompleted ? 'line-through' : 'none'
                                        }}>
                                            {item.text}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default InterviewChecklist;
