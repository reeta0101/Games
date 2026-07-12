import React from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaBriefcase, FaGraduationCap, FaExclamationTriangle, FaCheckCircle, FaGithub, FaLinkedin } from 'react-icons/fa';

const ResumeTips = ({ isDarkMode }) => {
    const sections = [
        {
            icon: <FaFileAlt className="text-info" />,
            title: "Resume Format",
            tips: [
                { text: "Use a clean, ATS-friendly format (avoid tables, graphics, headers/footers)", good: true },
                { text: "Keep it to 1 page for freshers, 2 pages max for experienced", good: true },
                { text: "Use standard fonts: Arial, Calibri, or Times New Roman (10-12pt)", good: true },
                { text: "Save as PDF to preserve formatting", good: true },
                { text: "Using fancy templates with graphics that ATS can't read", good: false }
            ]
        },
        {
            icon: <FaBriefcase className="text-warning" />,
            title: "Experience Section",
            tips: [
                { text: "Start with action verbs: Developed, Implemented, Led, Optimized", good: true },
                { text: "Quantify achievements: 'Reduced load time by 40%' not just 'Improved performance'", good: true },
                { text: "Focus on impact and results, not just responsibilities", good: true },
                { text: "Tailor experience to the job description", good: true },
                { text: "Writing vague statements like 'Worked on various projects'", good: false }
            ]
        },
        {
            icon: <FaGraduationCap className="text-success" />,
            title: "Education & Skills",
            tips: [
                { text: "List relevant coursework and projects for freshers", good: true },
                { text: "Include GPA only if above 7.5/10 or 3.0/4.0", good: true },
                { text: "Organize skills by category: Languages, Frameworks, Tools, Databases", good: true },
                { text: "Only list skills you can actually discuss in an interview", good: true },
                { text: "Listing every technology you've ever heard of", good: false }
            ]
        },
        {
            icon: <FaGithub />,
            title: "IT-Specific Tips",
            tips: [
                { text: "Include GitHub profile link with active projects", good: true },
                { text: "Add LinkedIn profile (customized URL)", good: true },
                { text: "Mention certifications: AWS, Azure, Google Cloud, etc.", good: true },
                { text: "Highlight open-source contributions if any", good: true },
                { text: "Include links to deployed projects or portfolio", good: true }
            ]
        }
    ];

    const commonMistakes = [
        "Spelling and grammatical errors",
        "Using unprofessional email addresses",
        "Including personal information (age, marital status, photo)",
        "Writing 'References available upon request'",
        "Using first-person pronouns (I, me, my)",
        "Leaving unexplained gaps in employment",
        "Using generic objectives like 'Seeking a challenging position'"
    ];

    const actionVerbs = [
        "Developed", "Implemented", "Designed", "Optimized", "Architected",
        "Led", "Managed", "Mentored", "Collaborated", "Delivered",
        "Automated", "Migrated", "Integrated", "Debugged", "Deployed",
        "Analyzed", "Documented", "Tested", "Refactored", "Scaled"
    ];

    return (
        <div className="resume-tips-container p-4">
            <div className="text-center mb-4">
                <h2 className="text-gradient fw-bold mb-2">📄 Resume Tips for IT Professionals</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Create an ATS-friendly resume that gets you interviews
                </p>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Main Tips Sections */}
                <div className="row g-4 mb-4">
                    {sections.map((section, idx) => (
                        <div key={idx} className="col-12 col-md-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card p-4 rounded-3 h-100"
                            >
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    {section.icon}
                                    <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                                        {section.title}
                                    </h5>
                                </div>
                                <ul className="list-unstyled mb-0">
                                    {section.tips.map((tip, tipIdx) => (
                                        <li key={tipIdx} className="d-flex align-items-start gap-2 mb-2">
                                            {tip.good ? (
                                                <FaCheckCircle className="text-success mt-1 flex-shrink-0" />
                                            ) : (
                                                <FaExclamationTriangle className="text-danger mt-1 flex-shrink-0" />
                                            )}
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {tip.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Common Mistakes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-4 rounded-3 mb-4"
                    style={{ borderLeft: '4px solid var(--error)' }}
                >
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--error)' }}>
                        <FaExclamationTriangle /> Common Mistakes to Avoid
                    </h5>
                    <div className="row">
                        {commonMistakes.map((mistake, idx) => (
                            <div key={idx} className="col-12 col-md-6 mb-2">
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    ❌ {mistake}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Action Verbs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-4 rounded-3"
                    style={{ borderLeft: '4px solid var(--success)' }}
                >
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--success)' }}>
                        <FaCheckCircle /> Power Action Verbs for IT Resumes
                    </h5>
                    <div className="d-flex flex-wrap gap-2">
                        {actionVerbs.map((verb, idx) => (
                            <span key={idx} className="topic-tag">{verb}</span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResumeTips;
