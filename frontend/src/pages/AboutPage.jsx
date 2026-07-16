export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 min-h-[calc(100vh-120px)] text-center">
      <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">About Study Arcade</h1>
      <div className="bg-[#0f172a]/80 p-8 rounded-3xl border border-white/10 text-slate-300 space-y-6 text-left">
        <p className="text-lg">Study Arcade was built to make learning and gaming seamlessly interactive.</p>
        <p>We provide a wide array of educational quizzes spanning coding, general knowledge, and specialized subjects, alongside classic arcade games like Tic Tac Toe, Rock Paper Scissors, and Penalty Shootout.</p>
        <p>Whether you are here to prepare for an exam, climb the global leaderboard, or just kill some time challenging friends in the multiplayer lobby, Study Arcade is designed to give you instant feedback and robust local progress tracking in a beautifully designed, modern interface.</p>
      </div>
    </div>
  );
}
