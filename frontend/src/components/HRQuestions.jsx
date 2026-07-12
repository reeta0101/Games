import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaLightbulb, FaCommentDots } from 'react-icons/fa';

const hrQuestions = [
    {
        id: 1,
        category: "Introduction",
        question: "Tell me about yourself.",
        tips: [
            "Keep it professional and relevant to the job",
            "Follow the Present-Past-Future formula",
            "Mention your current role, key achievements, and career goals",
            "Keep it under 2 minutes"
        ],
        sampleAnswer: "I'm a software developer with 3 years of experience specializing in full-stack web development. Currently, I work at XYZ Tech where I've led the development of a customer portal that increased user engagement by 40%. I started my career after graduating with a Computer Science degree, and I've since worked on various projects using React, Node.js, and cloud technologies. I'm now looking to take on more challenging projects and grow into a senior technical role."
    },
    {
        id: 2,
        category: "Strengths",
        question: "What are your greatest strengths?",
        tips: [
            "Choose strengths relevant to the job",
            "Provide specific examples",
            "Show how your strength benefits the team",
            "Be confident but not arrogant"
        ],
        sampleAnswer: "My greatest strength is problem-solving. I enjoy breaking down complex technical challenges into manageable pieces. For example, at my current job, we had a performance issue where our app was loading slowly. I analyzed the codebase, identified bottlenecks, and implemented caching strategies that reduced load time by 60%."
    },
    {
        id: 3,
        category: "Weaknesses",
        question: "What is your greatest weakness?",
        tips: [
            "Be honest but strategic",
            "Choose a real weakness that won't disqualify you",
            "Show what you're doing to improve",
            "Never say 'I work too hard' or 'I'm a perfectionist'"
        ],
        sampleAnswer: "I sometimes struggle with delegating tasks because I want everything to be done perfectly. I've realized this can slow down projects. To address this, I've been making a conscious effort to trust my teammates more and provide clear guidelines when assigning tasks."
    },
    {
        id: 4,
        category: "Behavioral",
        question: "Tell me about a time you faced a conflict at work.",
        tips: [
            "Use the STAR method (Situation, Task, Action, Result)",
            "Focus on resolution, not blame",
            "Highlight what you learned",
            "Choose a conflict that ended positively"
        ],
        sampleAnswer: "At my previous company, I disagreed with a senior developer about the architecture for a new feature. Instead of arguing, I proposed we both present our cases with pros and cons to the team. After discussion, we compromised with a hybrid approach. The feature launched on time and I learned the importance of data-driven decisions."
    },
    {
        id: 5,
        category: "Situational",
        question: "How do you handle tight deadlines?",
        tips: [
            "Show you can prioritize effectively",
            "Mention communication with stakeholders",
            "Give a specific example if possible",
            "Demonstrate you stay calm under pressure"
        ],
        sampleAnswer: "I handle tight deadlines by first assessing the scope and identifying critical deliverables. Then I break the work into smaller tasks and prioritize based on impact. During a product launch with a two-week deadline, I created a detailed timeline and communicated daily with stakeholders. We delivered on time with all key functionality."
    },
    {
        id: 6,
        category: "Career Goals",
        question: "Where do you see yourself in 5 years?",
        tips: [
            "Show ambition but be realistic",
            "Align your goals with the company's growth",
            "Focus on skill development and contributions",
            "Don't say you want the interviewer's job"
        ],
        sampleAnswer: "In 5 years, I see myself as a senior developer or technical lead, having deepened my expertise in cloud architecture and system design. I want to be someone who not only writes great code but also mentors junior developers and contributes to technical decisions."
    }
];

const HRQuestions = ({ isDarkMode }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [showAnswer, setShowAnswer] = useState({});

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const toggleAnswer = (id) => {
        setShowAnswer(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const categories = [...new Set(hrQuestions.map(q => q.category))];

    return (
        <div className="hr-questions-container p-4">
            <div className="text-center mb-4">
                <h2 className="text-gradient fw-bold mb-2">🎤 HR Interview Questions</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Master behavioral and situational questions with tips and sample answers
                </p>
            </div>

            {/* Category Filter */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                {categories.map(cat => (
                    <span key={cat} className="topic-tag">{cat}</span>
                ))}
            </div>

            {/* Questions */}
            <div className="d-flex flex-column gap-3" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {hrQuestions.map((q) => (
                    <motion.div
                        key={q.id}
                        className="glass-card p-3 rounded-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Question Header */}
                        <div
                            className="d-flex justify-content-between align-items-center cursor-pointer"
                            onClick={() => toggleExpand(q.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div>
                                <span className="badge-primary me-2">{q.category}</span>
                                <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {q.question}
                                </span>
                            </div>
                            {expandedId === q.id ? <FaChevronUp /> : <FaChevronDown />}
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expandedId === q.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-3"
                                >
                                    {/* Tips */}
                                    <div className="tips-section mb-3 p-3 rounded-3" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <FaLightbulb className="text-warning" />
                                            <strong style={{ color: 'var(--accent-primary)' }}>Tips</strong>
                                        </div>
                                        <ul className="mb-0 ps-3" style={{ color: 'var(--text-secondary)' }}>
                                            {q.tips.map((tip, idx) => (
                                                <li key={idx} className="mb-1">{tip}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Sample Answer Toggle */}
                                    <button
                                        className="btn btn-sm d-flex align-items-center gap-2"
                                        onClick={() => toggleAnswer(q.id)}
                                        style={{
                                            background: 'var(--bg-elevated)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        <FaCommentDots />
                                        {showAnswer[q.id] ? 'Hide Sample Answer' : 'Show Sample Answer'}
                                    </button>

                                    {/* Sample Answer */}
                                    <AnimatePresence>
                                        {showAnswer[q.id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-3 p-3 rounded-3"
                                                style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid var(--success)' }}
                                            >
                                                <strong className="d-block mb-2" style={{ color: 'var(--success)' }}>
                                                    Sample Answer
                                                </strong>
                                                <p className="mb-0" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                                    "{q.sampleAnswer}"
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HRQuestions;
