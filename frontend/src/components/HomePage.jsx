import { motion } from 'framer-motion';
import {
    FaFire, FaCheckCircle, FaBook, FaLaptopCode,
    FaUserTie, FaFileAlt, FaBuilding, FaGraduationCap, FaArrowRight,
    FaCalendarCheck, FaLightbulb
} from 'react-icons/fa';

const quickLinks = [
    { id: 'quiz', icon: <FaBook />, label: 'Quiz Practice', color: '#6366f1', desc: 'Test your knowledge' },
    { id: 'learn', icon: <FaGraduationCap />, label: 'Learning Paths', color: '#10b981', desc: 'Structured courses' },
    { id: 'coding', icon: <FaLaptopCode />, label: 'Coding Challenges', color: '#f59e0b', desc: 'Solve problems' },
    { id: 'hr', icon: <FaUserTie />, label: 'HR Interview', color: '#ec4899', desc: 'Behavioral questions' },
    { id: 'resume', icon: <FaFileAlt />, label: 'Resume Tips', color: '#8b5cf6', desc: 'Build your resume' },
    { id: 'guides', icon: <FaBuilding />, label: 'Company Guides', color: '#3b82f6', desc: 'Interview processes' },
];

const dailyTips = [
    "Practice at least 5 coding problems every day",
    "Review one topic from your weak areas",
    "Read about the company you're interviewing with",
    "Practice explaining your projects in 2 minutes",
    "Review common behavioral questions",
    "Update your resume with recent achievements",
    "Practice mock interviews with a friend",
];

const HomePage = ({ stats, setActiveTab, getAccuracy }) => {
    const todaysTip = dailyTips[new Date().getDay()];
    const accuracy = getAccuracy ? getAccuracy() : 0;

    // Get completed lessons count
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]').length;

    return (
        <div className="home-page p-4">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="welcome-section mb-5 position-relative overflow-hidden rounded-4"
                style={{
                    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '4rem 2rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)'
                }}
            >
                <div className="position-relative z-1 text-center">
                    <h1 className="display-4 fw-bold mb-2 text-white">
                        Welcome to <span style={{ color: '#818cf8', textShadow: '0 0 10px rgba(99, 102, 241, 0.5)' }}>MyPrepPartner</span>
                    </h1>
                    <p className="lead mb-0 text-light opacity-75">
                        Your complete interview preparation companion
                    </p>
                    <button
                        className="btn mt-4 px-4 py-2 fw-semibold"
                        onClick={() => setActiveTab('learn')}
                        style={{
                            background: 'white',
                            color: '#4f46e5',
                            border: 'none',
                            borderRadius: '50px'
                        }}
                    >
                        Start Learning <FaArrowRight className="ms-2" />
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div className="col-6 col-md-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="stat-card-home glass-card p-3 rounded-3 text-center h-100"
                    >
                        <FaFire className="mb-2" size={24} style={{ color: '#f59e0b' }} />
                        <div className="stat-value">{stats?.streakDays || 0}</div>
                        <div className="stat-label">Day Streak</div>
                    </motion.div>
                </div>
                <div className="col-6 col-md-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="stat-card-home glass-card p-3 rounded-3 text-center h-100"
                    >
                        <FaCheckCircle className="mb-2" size={24} style={{ color: '#10b981' }} />
                        <div className="stat-value">{accuracy}%</div>
                        <div className="stat-label">Accuracy</div>
                    </motion.div>
                </div>
                <div className="col-6 col-md-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="stat-card-home glass-card p-3 rounded-3 text-center h-100"
                    >
                        <FaBook className="mb-2" size={24} style={{ color: '#6366f1' }} />
                        <div className="stat-value">{stats?.totalQuestions || 0}</div>
                        <div className="stat-label">Questions</div>
                    </motion.div>
                </div>
                <div className="col-6 col-md-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="stat-card-home glass-card p-3 rounded-3 text-center h-100"
                    >
                        <FaGraduationCap className="mb-2" size={24} style={{ color: '#8b5cf6' }} />
                        <div className="stat-value">{completedLessons}</div>
                        <div className="stat-label">Lessons Done</div>
                    </motion.div>
                </div>
            </div>

            {/* Daily Tip */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="daily-tip glass-card p-4 rounded-3 mb-4"
                style={{ maxWidth: '1000px', margin: '0 auto 1.5rem' }}
            >
                <div className="d-flex align-items-start gap-3">
                    <div className="tip-icon">
                        <FaLightbulb size={24} />
                    </div>
                    <div>
                        <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            💡 Tip of the Day
                        </h5>
                        <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                            {todaysTip}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Access Cards */}
            <h4 className="fw-bold mb-3 text-center" style={{ color: 'var(--text-primary)' }}>
                Start Preparing
            </h4>
            <div className="row g-3 mb-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {quickLinks.map((link, idx) => (
                    <div key={link.id} className="col-6 col-md-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="quick-link-card glass-card p-4 rounded-3 h-100"
                            onClick={() => setActiveTab(link.id)}
                            style={{ cursor: 'pointer', borderTop: `3px solid ${link.color}` }}
                        >
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="quick-link-icon" style={{ color: link.color }}>
                                    {link.icon}
                                </div>
                                <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                                    {link.label}
                                </h5>
                            </div>
                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
                                {link.desc}
                            </p>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Interview Countdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="interview-prep glass-card p-4 rounded-3"
                style={{ maxWidth: '1000px', margin: '0 auto' }}
            >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                        <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            <FaCalendarCheck className="me-2" style={{ color: 'var(--accent-primary)' }} />
                            Interview Preparation Checklist
                        </h5>
                        <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
                            Make sure you're ready for your big day
                        </p>
                    </div>
                    <button
                        className="start-test-btn"
                        onClick={() => setActiveTab('checklist')}
                    >
                        View Checklist <FaArrowRight className="ms-2" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default HomePage;
