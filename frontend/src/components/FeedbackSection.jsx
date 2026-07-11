import { useState } from "react";
import { useSelector } from "react-redux";

export default function FeedbackSection() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const currentUser = useSelector((state) => state.auth.currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setStatus("loading");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          name: currentUser?.name || "Anonymous",
          userId: currentUser?.id || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");
      
      setStatus("success");
      setMessage("");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section
      className="surface mt-6 rounded-3xl p-5 sm:p-8 animate-fade-in-up"
      style={{
        animationDelay: "0.15s",
        background: "linear-gradient(135deg, rgba(64,224,240,0.05), rgba(167,139,250,0.05)), rgba(8,13,24,0.72)",
        boxShadow: "0 24px 80px rgba(2,6,23,0.35)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="md:w-[45%] flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#40e0f0]/80">
              We value your input
            </p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Help us improve
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              What features or quiz topics would you like to see next? Found a bug? Have an idea to make learning even better? Let us know!
            </p>
          </div>
          <div className="mt-8 hidden md:flex items-center justify-center animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-[#40e0f0]/10 rounded-full blur-2xl opacity-60"></div>
              <img 
                src="/images/feedback.png" 
                alt="Feedback Suggestion" 
                className="relative w-48 h-auto object-contain drop-shadow-[0_10px_30px_rgba(167,139,250,0.3)] transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="md:w-1/2 flex flex-col gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your feedback here..."
            className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-black/24 p-4 text-sm text-white outline-none transition focus:border-[#40e0f0]/60 focus:bg-black/40"
            disabled={status === "loading" || status === "success"}
          ></textarea>
          
          <div className="flex items-center justify-between">
            {status === "success" && (
              <span className="text-sm font-semibold text-emerald-400">
                ✓ Thank you for your feedback!
              </span>
            )}
            {status === "error" && (
              <span className="text-sm font-semibold text-rose-400">
                ⚠️ Failed to send feedback.
              </span>
            )}
            {status === "idle" && <span />}
            {status === "loading" && <span className="text-sm text-slate-400">Sending...</span>}

            <button
              type="submit"
              disabled={!message.trim() || status === "loading" || status === "success"}
              className="rounded-2xl border border-[#40e0f0]/30 bg-[#40e0f0]/10 px-6 py-2.5 text-sm font-black text-[#40e0f0] transition hover:bg-[#40e0f0]/20 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
