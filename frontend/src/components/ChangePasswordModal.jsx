import { useState } from "react";
import { createPortal } from "react-dom";
export default function ChangePasswordModal({ user, onClose, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password");
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onLogout();
        }, 2000);
      }
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md animate-fade-in-up rounded-[2rem] border border-white/10 bg-[#07101d] p-6 shadow-2xl sm:p-8">
        
        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/20 text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">Password Updated!</h3>
            <p className="mt-2 text-sm text-slate-400">Please log in again with your new password.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <button
                onClick={onClose}
                className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#40e0f0]/50"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#40e0f0]/50"
                  required
                  minLength={6}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">Confirm New Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#40e0f0]/50"
                  required
                  minLength={6}
                />
              </label>

              {error && (
                <div className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-[#40e0f0] px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#40e0f0]/90 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
