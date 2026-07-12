import { useState, useEffect, useMemo } from "react";
import QuizFeed from "../components/QuizFeed";
import "../QuizStyles.css"; // The MyPrepPartner styles

// Glob import all JSON from local data
const dataModules = import.meta.glob('../data/**/*.json');

export default function TestPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pendingCategory, setPendingCategory] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // QuizFeed specific state
  const [quizMode, setQuizMode] = useState('practice');
  const [testConfig, setTestConfig] = useState({ active: false, duration: 30, timeRemaining: 0 });

  const formatDisplayName = (id) => {
    const customNames = {
      'cn': 'Computer Networks',
      'dbms': 'DBMS',
      'dsa': 'Data Structures & Algorithms',
      'os': 'Operating Systems',
      'oops': 'Object Oriented Programming',
      'hr-questions': 'HR Questions',
      'interview-guides': 'Interview Guides',
      'microsoft365': 'Microsoft 365',
      'system-design': 'System Design',
      'tcs': 'TCS',
      'quizdata': 'Quiz Data',
      'general-studies-exam': 'General Studies Exam'
    };
    
    if (customNames[id.toLowerCase()]) {
      return customNames[id.toLowerCase()];
    }
    
    // Default format: capitalize first letter
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  const categories = useMemo(() => {
    return Object.keys(dataModules)
      .map(path => {
        const id = path.split('/').pop().replace('.json', '');
        return {
          id,
          path,
          displayName: formatDisplayName(id)
        };
      })
      .filter(category => {
        // Exclude datasets that don't have multiple-choice questions
        const excludedIds = ['hr-questions', 'interview-guides', 'challenges'];
        return !excludedIds.includes(category.id.toLowerCase());
      });
  }, []);

  const handleSelectCategory = async (category, mode) => {
    setSelectedCategory(category.id);
    setQuizMode(mode);
    setLoading(true);
    setError('');
    try {
      const module = await dataModules[category.path]();
      const questions = module.default || module || [];
      setQuizData(questions);
      
      if (mode === 'test') {
        // 1 minute (60 seconds) per question
        const totalSeconds = questions.length * 60;
        setTestConfig({ active: true, duration: questions.length, timeRemaining: totalSeconds });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setQuizData([]);
  };

  if (selectedCategory) {
    return (
      <div className="w-full h-[calc(100dvh-64px)] flex flex-col bg-[#0f172a]">
        <div className="p-3 sm:p-4 flex flex-row justify-between items-center gap-3 border-b border-slate-700 bg-[#0f172a] sticky top-0 z-20">
          <button 
            onClick={handleBack}
            className="text-white hover:text-gray-300 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-slate-800 text-sm sm:text-base text-center shrink-0 flex items-center gap-1"
          >
            <span>←</span> <span className="hidden sm:inline">Back to Exams</span><span className="sm:hidden">Back</span>
          </button>
          
          <div className="flex-1 flex justify-end items-center min-w-0">
            <h2 className="text-base sm:text-xl font-black text-white/90 tracking-wide text-right truncate">
              {formatDisplayName(selectedCategory)} {quizMode === 'test' ? 'Exam' : 'Practice'}
            </h2>
            
            {quizMode === 'test' && !testConfig.active && (
              <button 
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg shrink-0"
                onClick={() => setTestConfig({ active: true, duration: quizData.length, timeRemaining: quizData.length * 60 })}
              >
                ▶ Start Exam
              </button>
            )}
          </div>
        </div>
        
        {/* Render the QuizFeed component from New folder */}
        <div className="flex-1 overflow-hidden relative">
          <QuizFeed 
            quizData={quizData}
            isDarkMode={true}
            isLoading={loading}
            error={error}
            quizMode={quizMode}
            testConfig={testConfig}
            setTestConfig={setTestConfig}
            activeCategory={selectedCategory}
          />
        </div>
      </div>
    );
  }

  // Selection view (Arcade style grid)
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 relative z-10">
      
      {/* Mode Selection Modal */}
      {pendingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-2xl max-w-md w-full border-t-4 border-t-blue-500 shadow-[0_10px_40px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-white text-center mb-2">Choose Mode</h2>
            <p className="text-slate-400 text-center mb-8">How would you like to attempt the {pendingCategory.displayName} dataset?</p>
            
            <div className="flex flex-col gap-4">
              <button
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-blue-600/20 hover:border-blue-500 transition-all group"
                onClick={() => {
                  handleSelectCategory(pendingCategory, 'practice');
                  setPendingCategory(null);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    📝
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-lg">Practice Mode</h3>
                    <p className="text-xs text-slate-400">Learn at your own pace with instant feedback</p>
                  </div>
                </div>
                <span className="text-slate-500 group-hover:text-blue-400">→</span>
              </button>

              <button
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-purple-600/20 hover:border-purple-500 transition-all group"
                onClick={() => {
                  handleSelectCategory(pendingCategory, 'test');
                  setPendingCategory(null);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    🎯
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-lg">Time Exam Mode</h3>
                    <p className="text-xs text-slate-400">Simulate a real test with a dynamic timer (1 minute per question)</p>
                  </div>
                </div>
                <span className="text-slate-500 group-hover:text-purple-400">→</span>
              </button>
            </div>

            <button 
              className="mt-6 w-full py-3 text-slate-400 hover:text-white font-semibold transition-colors"
              onClick={() => setPendingCategory(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-12 text-center animate-fade-in-up">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a78bfa]/90">
          Exam Center
        </p>
        <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
          All Exam
        </h1>
        <p className="mt-3 text-sm text-slate-400 tracking-[0.15em]">
          Select an exam dataset to launch the interface
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => setPendingCategory(category)}
            className="interactive-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0a0a0f] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all hover:border-white/15 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-black transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                style={{
                  borderColor: `#3b82f655`,
                  color: '#3b82f6',
                  background: `#3b82f612`,
                }}
              >
                📋
              </div>
              <span
                className="inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{
                  color: '#3b82f6',
                  background: `#3b82f612`,
                }}
              >
                Dataset
              </span>
            </div>

            <div className="mt-5 flex-1">
              <h3 className="text-lg font-black tracking-tight text-white transition-colors group-hover:text-white">
                {category.displayName}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400 line-clamp-2">
                Raw JSON Data
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: '#3b82f6' }}
              >
                Start Exam
              </span>
              <span
                className="opacity-50 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                style={{ color: '#3b82f6' }}
              >
                →
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
