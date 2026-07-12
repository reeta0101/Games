import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaChevronRight, FaClock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import learning paths
import { softwareEngineerPath } from '../data/learning/software-engineer';
import { webDevelopmentPath } from '../data/learning/web-development';
import { dataAnalystPath } from '../data/learning/data-analyst';
import { dataSciencePath } from '../data/learning/data-science';

const learningPaths = [
    softwareEngineerPath,
    webDevelopmentPath,
    dataAnalystPath,
    dataSciencePath
];

const LearningHub = ({ isDarkMode }) => {
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState(() => {
        const saved = localStorage.getItem('completedLessons');
        return saved ? JSON.parse(saved) : [];
    });

    const markComplete = (lessonId) => {
        const updated = [...completedLessons, lessonId];
        setCompletedLessons(updated);
        localStorage.setItem('completedLessons', JSON.stringify(updated));
    };

    const isCompleted = (lessonId) => completedLessons.includes(lessonId);

    // Career Path Selection View
    if (!selectedPath) {
        return (
            <div className="learning-hub p-4">
                <div className="text-center mb-5">
                    <h2 className="text-gradient fw-bold mb-2">🎓 Learning Paths</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Choose your career path and start learning
                    </p>
                </div>

                <div className="row g-4 justify-content-center" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {learningPaths.map((path, idx) => (
                        <div key={path.id} className="col-12 col-md-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="career-path-card glass-card p-4 rounded-4 h-100"
                                onClick={() => setSelectedPath(path)}
                                style={{ cursor: 'pointer', borderLeft: `4px solid ${path.color}` }}
                            >
                                <div className="d-flex align-items-start gap-4">
                                    <div
                                        className="path-thumbnail rounded-3 flex-shrink-0"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            backgroundImage: `url(${path.id === 'software-engineer' ? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&q=80' :
                                                    path.id === 'web-development' ? 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=200&q=80' :
                                                        path.id === 'data-analyst' ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80' :
                                                            'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=200&q=80'
                                                })`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            border: `1px solid ${path.color}40`,
                                            boxShadow: `0 4px 12px ${path.color}20`
                                        }}
                                    />
                                    <div className="flex-grow-1">
                                        <h4 className="mb-1 fw-bold" style={{ color: 'var(--text-primary)' }}>
                                            {path.title}
                                        </h4>
                                        <p className="mb-2 small" style={{ color: path.color }}>
                                            {path.subtitle}
                                        </p>
                                        <p className="mb-3 small" style={{ color: 'var(--text-secondary)' }}>
                                            {path.description}
                                        </p>
                                        <div className="d-flex flex-wrap gap-1">
                                            {path.skills.slice(0, 4).map(skill => (
                                                <span key={skill} className="topic-tag">{skill}</span>
                                            ))}
                                            {path.skills.length > 4 && (
                                                <span className="topic-tag">+{path.skills.length - 4}</span>
                                            )}
                                        </div>
                                        <div className="mt-3 small" style={{ color: 'var(--text-muted)' }}>
                                            <FaBook className="me-1" /> {path.modules.length} modules
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Lesson Content View
    if (selectedLesson) {
        return (
            <div className="lesson-viewer p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <button
                        className="icon-btn"
                        onClick={() => setSelectedLesson(null)}
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <div className="small" style={{ color: 'var(--text-muted)' }}>
                            {selectedPath.title} / {selectedModule.title}
                        </div>
                        <h3 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                            {selectedLesson.title}
                        </h3>
                    </div>
                    <div className="ms-auto d-flex align-items-center gap-2">
                        <FaClock className="text-muted" />
                        <span className="small" style={{ color: 'var(--text-muted)' }}>
                            {selectedLesson.duration}
                        </span>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lesson-content glass-card p-4 rounded-3"
                    style={{ maxWidth: '900px', margin: '0 auto' }}
                >
                    <div className="markdown-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    return inline ? (
                                        <code className="inline-code" {...props}>{children}</code>
                                    ) : (
                                        <pre className="code-snippet">
                                            <code {...props}>{children}</code>
                                        </pre>
                                    );
                                },
                                table({ children }) {
                                    return <table className="lesson-table">{children}</table>;
                                }
                            }}
                        >
                            {selectedLesson.content}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                        {isCompleted(selectedLesson.id) ? (
                            <div className="d-flex align-items-center gap-2 text-success">
                                <FaCheckCircle /> Completed
                            </div>
                        ) : (
                            <button
                                className="start-test-btn"
                                onClick={() => markComplete(selectedLesson.id)}
                            >
                                <FaCheckCircle /> Mark as Complete
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Module & Lessons View
    return (
        <div className="learning-path-view p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <button
                    className="icon-btn"
                    onClick={() => { setSelectedPath(null); setSelectedModule(null); }}
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <span style={{ fontSize: '2rem' }}>{selectedPath.icon}</span>
                </div>
                <div>
                    <h3 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                        {selectedPath.title}
                    </h3>
                    <span className="small" style={{ color: selectedPath.color }}>
                        {selectedPath.subtitle}
                    </span>
                </div>
            </div>

            <div className="row g-4" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Modules List */}
                <div className="col-12 col-lg-4">
                    <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        <FaBook className="me-2" /> Modules
                    </h5>
                    <div className="d-flex flex-column gap-2">
                        {selectedPath.modules.map((module, idx) => {
                            const completedCount = module.lessons.filter(l => isCompleted(l.id)).length;
                            return (
                                <motion.button
                                    key={module.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`module-btn p-3 rounded-3 text-start d-flex align-items-center justify-content-between ${selectedModule?.id === module.id ? 'active' : ''}`}
                                    onClick={() => setSelectedModule(module)}
                                    style={{
                                        border: selectedModule?.id === module.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        background: selectedModule?.id === module.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-elevated)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <span>{module.icon}</span>
                                        <span className="fw-medium">{module.title}</span>
                                    </div>
                                    <span className="badge" style={{ background: 'var(--bg-card)' }}>
                                        {completedCount}/{module.lessons.length}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Lessons List */}
                <div className="col-12 col-lg-8">
                    {selectedModule ? (
                        <>
                            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                                {selectedModule.icon} {selectedModule.title}
                            </h5>
                            <div className="d-flex flex-column gap-2">
                                {selectedModule.lessons.map((lesson, idx) => (
                                    <motion.div
                                        key={lesson.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="lesson-card glass-card p-3 rounded-3 d-flex align-items-center justify-content-between"
                                        onClick={() => setSelectedLesson(lesson)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            {isCompleted(lesson.id) ? (
                                                <FaCheckCircle className="text-success" />
                                            ) : (
                                                <div className="lesson-number">{idx + 1}</div>
                                            )}
                                            <div>
                                                <div className="fw-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {lesson.title}
                                                </div>
                                                <div className="small" style={{ color: 'var(--text-muted)' }}>
                                                    <FaClock className="me-1" />{lesson.duration}
                                                </div>
                                            </div>
                                        </div>
                                        <FaChevronRight style={{ color: 'var(--text-muted)' }} />
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                            <FaBook size={48} className="mb-3" />
                            <p>Select a module to see lessons</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearningHub;
