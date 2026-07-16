export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 min-h-[calc(100vh-120px)] text-center">
      <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">Contact Us</h1>
      <div className="bg-[#0f172a]/80 p-8 rounded-3xl border border-white/10 text-slate-300 space-y-6 text-left">
        <p>If you have any questions, suggestions, or concerns regarding your account or our services, please feel free to reach out to us!</p>
        <div className="flex flex-col gap-4">
          <p><strong>Email:</strong> support@studyarcade.example.com</p>
          <p><strong>Instagram:</strong> <a href="https://instagram.com/studyarcade" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">@studyarcade</a></p>
        </div>
      </div>
    </div>
  );
}
