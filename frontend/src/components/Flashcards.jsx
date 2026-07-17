import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRedo, FaChevronLeft, FaChevronRight, FaLightbulb, FaCheck } from 'react-icons/fa';

const flashcardsData = {
    java: {
        title: 'Java Fundamentals',
        icon: '☕',
        cards: [
            { front: 'What is JVM?', back: 'Java Virtual Machine - executes Java bytecode and provides platform independence' },
            { front: 'What are the 4 pillars of OOP?', back: 'Encapsulation, Inheritance, Polymorphism, Abstraction' },
            { front: 'Difference between == and .equals()?', back: '== compares references, .equals() compares values' },
            { front: 'What is a Constructor?', back: 'Special method called when object is created, initializes object state' },
            { front: 'Abstract class vs Interface?', back: 'Abstract: partial implementation, single inheritance. Interface: contract only, multiple inheritance' },
            { front: 'What is final keyword?', back: 'final variable: constant, final method: can\'t override, final class: can\'t inherit' },
            { front: 'ArrayList vs LinkedList?', back: 'ArrayList: fast random access O(1), LinkedList: fast insertion/deletion O(1)' },
            { front: 'What is Garbage Collection?', back: 'Automatic memory management - removes unreferenced objects from heap' },
        ]
    },
    dsa: {
        title: 'Data Structures',
        icon: '🔢',
        cards: [
            { front: 'Time Complexity of Binary Search?', back: 'O(log n) - divides search space in half each iteration' },
            { front: 'Stack vs Queue?', back: 'Stack: LIFO (Last In First Out), Queue: FIFO (First In First Out)' },
            { front: 'Hash Table average lookup time?', back: 'O(1) average, O(n) worst case (collisions)' },
            { front: 'When to use BFS vs DFS?', back: 'BFS: shortest path, level-order. DFS: topological sort, cycle detection' },
            { front: 'Binary Tree vs BST?', back: 'BST: left < root < right, enables O(log n) search' },
            { front: 'Quick Sort time complexity?', back: 'Average: O(n log n), Worst: O(n²) when already sorted' },
            { front: 'What is Dynamic Programming?', back: 'Solve complex problems by breaking into overlapping subproblems, memoize results' },
            { front: 'Heap data structure use case?', back: 'Priority queues, finding kth largest/smallest element' },
        ]
    },
    sql: {
        title: 'SQL & Databases',
        icon: '🗄️',
        cards: [
            { front: 'What is Normalization?', back: 'Organizing data to reduce redundancy. 1NF→2NF→3NF→BCNF' },
            { front: 'INNER JOIN vs LEFT JOIN?', back: 'INNER: only matching rows. LEFT: all from left + matching from right' },
            { front: 'What is an Index?', back: 'Data structure that speeds up queries. Like a book index. Slows writes.' },
            { front: 'ACID properties?', back: 'Atomicity, Consistency, Isolation, Durability - transaction guarantees' },
            { front: 'Primary Key vs Foreign Key?', back: 'Primary: unique identifier. Foreign: reference to primary key in another table' },
            { front: 'GROUP BY vs ORDER BY?', back: 'GROUP BY: aggregates rows. ORDER BY: sorts results' },
            { front: 'What is a View?', back: 'Virtual table based on query result. Doesn\'t store data.' },
            { front: 'DELETE vs TRUNCATE?', back: 'DELETE: row-by-row, can rollback. TRUNCATE: fast, can\'t rollback' },
        ]
    },
    webdev: {
        title: 'Web Development',
        icon: '🌐',
        cards: [
            { front: 'What is REST API?', back: 'Representational State Transfer - stateless, uses HTTP methods (GET, POST, PUT, DELETE)' },
            { front: 'What is CORS?', back: 'Cross-Origin Resource Sharing - browser security that restricts cross-domain requests' },
            { front: 'localStorage vs sessionStorage?', back: 'localStorage: persists forever. sessionStorage: cleared when tab closes' },
            { front: 'What is a Promise?', back: 'Object representing eventual completion/failure of async operation' },
            { front: 'React Virtual DOM?', back: 'In-memory representation of actual DOM. Enables efficient updates via diffing' },
            { front: 'What is JWT?', back: 'JSON Web Token - compact, self-contained token for authentication' },
            { front: 'HTTP vs HTTPS?', back: 'HTTPS encrypts data with SSL/TLS. Port 80 vs 443' },
            { front: 'What is Middleware?', back: 'Functions that process requests before reaching route handler' },
        ]
    },
    behavioral: {
        title: 'Behavioral Questions',
        icon: '💬',
        cards: [
            { front: 'Tell me about yourself', back: 'Present (current role) → Past (relevant experience) → Future (why this role)' },
            { front: 'Why do you want this job?', back: 'Company mission + Role fit + Your goals alignment' },
            { front: 'Describe a challenge you overcame', back: 'Use STAR: Situation → Task → Action → Result' },
            { front: 'Where do you see yourself in 5 years?', back: 'Growth in skills + Increased responsibility + Company contribution' },
            { front: 'What is your biggest weakness?', back: 'Real weakness + Steps you\'re taking to improve' },
            { front: 'Why are you leaving current job?', back: 'Seeking growth/new challenges (never negative about employer)' },
            { front: 'Tell me about a time you failed', back: 'Honest failure + What you learned + How you improved' },
            { front: 'How do you handle pressure?', back: 'Prioritization + Time management + Stay calm example' },
        ]
    }
};

const Flashcards = () => {
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState([]);

    const handleDeckSelect = (deckId) => {
        setSelectedDeck(deckId);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards([]);
    };

    const nextCard = () => {
        if (currentIndex < flashcardsData[selectedDeck].cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const markKnown = () => {
        if (!knownCards.includes(currentIndex)) {
            setKnownCards([...knownCards, currentIndex]);
        }
        nextCard();
    };

    const resetDeck = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards([]);
    };

    // Deck Selection View
    if (!selectedDeck) {
        return (
            <div className="flashcards-container p-4">
                <div className="text-center mb-4">
                    <h2 className="text-gradient fw-bold mb-2">🃏 Flashcards</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Quick revision cards for key concepts
                    </p>
                </div>

                <div className="row g-3 justify-content-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {Object.entries(flashcardsData).map(([id, deck], idx) => (
                        <div key={id} className="col-6 col-md-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flashcard-deck glass-card p-4 rounded-3 text-center"
                                onClick={() => handleDeckSelect(id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{deck.icon}</span>
                                <h5 className="mt-2 mb-1 fw-bold" style={{ color: 'var(--text-primary)' }}>
                                    {deck.title}
                                </h5>
                                <span className="small" style={{ color: 'var(--text-muted)' }}>
                                    {deck.cards.length} cards
                                </span>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const currentDeck = flashcardsData[selectedDeck];
    const currentCard = currentDeck.cards[currentIndex];
    const progress = ((currentIndex + 1) / currentDeck.cards.length) * 100;

    return (
        <div className="flashcards-container p-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <button
                    className="icon-btn"
                    onClick={() => setSelectedDeck(null)}
                >
                    <FaChevronLeft /> Back
                </button>
                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                    {currentDeck.icon} {currentDeck.title}
                </h4>
                <button className="icon-btn" onClick={resetDeck} title="Reset">
                    <FaRedo />
                </button>
            </div>

            {/* Progress */}
            <div className="mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="d-flex justify-content-between small mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Card {currentIndex + 1} of {currentDeck.cards.length}</span>
                    <span>{knownCards.length} known</span>
                </div>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Flashcard */}
            <div className="d-flex justify-content-center mb-4">
                <motion.div
                    className="flashcard-wrapper"
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ perspective: '1000px' }}
                >
                    <motion.div
                        className={`flashcard glass-card ${isFlipped ? 'flipped' : ''} ${knownCards.includes(currentIndex) ? 'known' : ''}`}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="flashcard-front p-4">
                            <FaLightbulb className="mb-3" style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }} />
                            <p className="mb-0 fw-medium" style={{ fontSize: '1.25rem' }}>
                                {currentCard.front}
                            </p>
                            <span className="tap-hint">Tap to reveal</span>
                        </div>
                        <div className="flashcard-back p-4">
                            <p className="mb-0" style={{ fontSize: '1.1rem' }}>
                                {currentCard.back}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="d-flex justify-content-center gap-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <button
                    className="icon-btn"
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                >
                    <FaChevronLeft />
                </button>
                <button
                    className="start-test-btn"
                    onClick={markKnown}
                >
                    <FaCheck /> I Know This
                </button>
                <button
                    className="icon-btn"
                    onClick={nextCard}
                    disabled={currentIndex === currentDeck.cards.length - 1}
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default Flashcards;
