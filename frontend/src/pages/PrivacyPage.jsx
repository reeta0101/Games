export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 min-h-[calc(100vh-120px)]">
      <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">Privacy Policy</h1>
      <div className="bg-[#0f172a]/80 p-8 rounded-3xl border border-white/10 text-slate-300 space-y-6">
        <p>Effective Date: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-white">1. Introduction</h2>
        <p>Welcome to Study Arcade. We are committed to protecting your personal information and your right to privacy.</p>
        
        <h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
        <p>We may collect information you provide directly to us, such as when you create an account, complete quizzes, or participate in leaderboard rankings. This may include your username, email address, and gameplay statistics.</p>

        <h2 className="text-xl font-bold text-white">3. Third-Party Advertisers and Google AdSense</h2>
        <p>We use third-party advertising companies to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
          <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
          <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-cyan-400 hover:underline" target="_blank" rel="noreferrer">Ads Settings</a>.</li>
        </ul>

        <h2 className="text-xl font-bold text-white">4. Cookies</h2>
        <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>

        <h2 className="text-xl font-bold text-white">5. Changes to This Policy</h2>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

      </div>
    </div>
  );
}
