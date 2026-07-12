import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBuilding, FaLightbulb, FaQuestionCircle, FaChevronRight } from 'react-icons/fa';

const interviewGuides = [
    {
        id: "tcs",
        company: "TCS (Tata Consultancy Services)",
        icon: "🏢",
        overview: "TCS is one of India's largest IT services companies. The interview process typically involves aptitude tests, technical interviews, and HR rounds.",
        rounds: [
            {
                name: "TCS NQT (National Qualifier Test)",
                description: "Online aptitude test covering verbal, quantitative, and programming ability",
                tips: [
                    "Practice verbal ability - synonyms, antonyms, reading comprehension",
                    "Focus on quantitative aptitude - percentages, ratios, time & work",
                    "Programming section tests logic and basic coding"
                ]
            },
            {
                name: "Technical Interview",
                description: "Tests core CS fundamentals and project knowledge",
                tips: [
                    "Be thorough with OOPS concepts",
                    "Know DBMS basics - normalization, SQL queries",
                    "Prepare your projects well - be ready to explain code"
                ]
            },
            {
                name: "HR Interview",
                description: "Assesses communication, attitude, and cultural fit",
                tips: [
                    "Be confident and maintain eye contact",
                    "Research TCS values and recent news",
                    "Show willingness to relocate and work in any domain"
                ]
            }
        ],
        commonQuestions: [
            "Tell me about yourself",
            "Why TCS?",
            "Explain OOPS concepts with examples",
            "What is normalization in DBMS?",
            "Are you willing to relocate?"
        ]
    },
    {
        id: "infosys",
        company: "Infosys",
        icon: "🌐",
        overview: "Infosys conducts a multi-stage selection process including online tests, technical interviews, and HR rounds. They emphasize logical thinking.",
        rounds: [
            {
                name: "InfyTQ / Online Assessment",
                description: "Tests aptitude, logical reasoning, and programming skills",
                tips: [
                    "Practice puzzle-solving and logical reasoning",
                    "Strong focus on programming fundamentals",
                    "Time management is crucial"
                ]
            },
            {
                name: "Technical Interview",
                description: "Deep dive into technical skills and projects",
                tips: [
                    "Know at least one programming language thoroughly",
                    "Be prepared to write code on paper/whiteboard",
                    "Understand your projects end-to-end"
                ]
            },
            {
                name: "HR Interview",
                description: "Evaluates soft skills and company fit",
                tips: [
                    "Research Infosys's recent projects and values",
                    "Prepare behavioral questions using STAR method",
                    "Show enthusiasm for learning and growth"
                ]
            }
        ],
        commonQuestions: [
            "Why do you want to join Infosys?",
            "Explain your final year project",
            "What is inheritance? Types?",
            "Difference between C and Java",
            "Where do you see yourself in 5 years?"
        ]
    },
    {
        id: "wipro",
        company: "Wipro",
        icon: "🔷",
        overview: "Wipro's recruitment process includes online tests, technical interviews, and HR rounds. They value adaptability and problem-solving skills.",
        rounds: [
            {
                name: "Wipro NLTH",
                description: "Online test with aptitude, logical reasoning, and written communication",
                tips: [
                    "Essay writing is important - practice clear, concise writing",
                    "Quantitative section is moderate difficulty",
                    "Logical reasoning needs practice"
                ]
            },
            {
                name: "Technical Interview",
                description: "Tests programming skills and CS fundamentals",
                tips: [
                    "Focus on data structures and algorithms",
                    "Know OOPS concepts with real-world examples",
                    "Basic OS concepts like process, thread, memory"
                ]
            },
            {
                name: "HR Interview",
                description: "Assesses personality and career goals",
                tips: [
                    "Know Wipro's Spirit of values",
                    "Be clear about your career aspirations",
                    "Show flexibility for roles and locations"
                ]
            }
        ],
        commonQuestions: [
            "Tell me about yourself",
            "What is polymorphism?",
            "Explain your project architecture",
            "What are your salary expectations?",
            "Why should we hire you?"
        ]
    },
    {
        id: "amazon",
        company: "Amazon",
        icon: "📦",
        overview: "Amazon has a rigorous interview process focused on Leadership Principles and technical excellence. Expect multiple rounds.",
        rounds: [
            {
                name: "Online Assessment (OA)",
                description: "2-3 coding problems + work simulation",
                tips: [
                    "Practice LeetCode medium/hard problems",
                    "Focus on arrays, strings, trees, graphs, DP",
                    "Work simulation tests Leadership Principles"
                ]
            },
            {
                name: "Phone Screen",
                description: "45-60 min coding interview with LP questions",
                tips: [
                    "Think out loud while solving problems",
                    "Clarify requirements before coding",
                    "Prepare 2-3 STAR stories for LP questions"
                ]
            },
            {
                name: "Onsite/Virtual Loop",
                description: "4-5 rounds of coding + system design + LP",
                tips: [
                    "Each round tests different LPs - prepare examples",
                    "System design: practice designing scalable systems",
                    "Bar Raiser round is crucial"
                ]
            }
        ],
        commonQuestions: [
            "Tell me about a time you disagreed with your manager",
            "Describe a situation where you had to make a decision with incomplete data",
            "Design a URL shortener",
            "Implement LRU cache",
            "How would you scale a system to handle 1M requests/second?"
        ],
        leadershipPrinciples: [
            "Customer Obsession", "Ownership", "Invent and Simplify",
            "Bias for Action", "Learn and Be Curious", "Hire and Develop the Best",
            "Insist on the Highest Standards", "Think Big", "Earn Trust", "Deliver Results"
        ]
    }
];

const InterviewGuides = ({ isDarkMode }) => {
    const [selectedCompany, setSelectedCompany] = useState(interviewGuides[0]);

    return (
        <div className="interview-guides-container p-4">
            <div className="text-center mb-4">
                <h2 className="text-gradient fw-bold mb-2">🏢 Interview Guides</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Company-specific interview process and preparation tips
                </p>
            </div>

            <div className="d-flex flex-column flex-lg-row gap-4" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Company Selector */}
                <div className="company-selector d-flex flex-row flex-lg-column gap-2" style={{ minWidth: '200px' }}>
                    {interviewGuides.map((guide) => (
                        <motion.button
                            key={guide.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`company-btn d-flex align-items-center gap-2 p-3 rounded-3 w-100 ${selectedCompany.id === guide.id ? 'active' : ''}`}
                            onClick={() => setSelectedCompany(guide)}
                            style={{
                                border: selectedCompany.id === guide.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                background: selectedCompany.id === guide.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-elevated)',
                                color: 'var(--text-primary)',
                                textAlign: 'left',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{guide.icon}</span>
                            <span className="d-none d-lg-inline fw-medium">{guide.company.split(' ')[0]}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Guide Content */}
                <div className="flex-grow-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCompany.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card p-4 rounded-3"
                        >
                            {/* Header */}
                            <div className="mb-4">
                                <h3 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {selectedCompany.icon} {selectedCompany.company}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{selectedCompany.overview}</p>
                            </div>

                            {/* Interview Rounds */}
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--accent-primary)' }}>
                                    <FaBuilding /> Interview Rounds
                                </h5>
                                {selectedCompany.rounds.map((round, idx) => (
                                    <div key={idx} className="round-card p-3 rounded-3 mb-3" style={{ background: 'var(--bg-elevated)' }}>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge-primary">{idx + 1}</span>
                                            <strong style={{ color: 'var(--text-primary)' }}>{round.name}</strong>
                                        </div>
                                        <p className="mb-2 small" style={{ color: 'var(--text-secondary)' }}>{round.description}</p>
                                        <ul className="mb-0 ps-3">
                                            {round.tips.map((tip, tipIdx) => (
                                                <li key={tipIdx} className="small" style={{ color: 'var(--text-muted)' }}>
                                                    <FaChevronRight size={10} className="me-1" />{tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Common Questions */}
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--warning)' }}>
                                    <FaQuestionCircle /> Common Questions
                                </h5>
                                <ul className="mb-0">
                                    {selectedCompany.commonQuestions.map((q, idx) => (
                                        <li key={idx} className="mb-1" style={{ color: 'var(--text-secondary)' }}>{q}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Leadership Principles (Amazon only) */}
                            {selectedCompany.leadershipPrinciples && (
                                <div>
                                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--success)' }}>
                                        <FaLightbulb /> Leadership Principles to Know
                                    </h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedCompany.leadershipPrinciples.map((lp, idx) => (
                                            <span key={idx} className="topic-tag">{lp}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default InterviewGuides;
