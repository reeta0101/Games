export default function Footer({ darkMode }) {
  return (
    <footer
      className={`border-t border-white/10 py-6 text-center text-sm transition-colors duration-300 ${darkMode ? "bg-[#0a0a0f] text-slate-400" : "bg-[#0a0a0f] text-slate-400"}`}
    >
      <p>© 2024 MyApp. All rights reserved.</p>
    </footer>
  );
}
