import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from './features/theme/themeSlice'
import API from './api/API'

function App() {
  const dispatch = useDispatch()
  const darkMode = useSelector((state) => state.theme.darkMode)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    API.get('/test')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Backend not connected'))
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          MyApp
        </h1>
        <button
          onClick={() => dispatch(toggleTheme())}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Welcome to <span className="text-purple-600">MyApp</span>
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Build amazing things with React and Tailwind CSS
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Get Started
            </button>
            <button className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              Learn More
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { title: 'Fast', desc: 'Built with Vite for lightning fast development' },
            { title: 'Modern', desc: 'Using React 19 with the latest features' },
            { title: 'Stylish', desc: 'Beautiful UI with Tailwind CSS' }
          ].map((feature, i) => (
            <div key={i} className={`p-6 rounded-xl transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <h3 className="text-xl font-semibold mb-2 text-purple-600">{feature.title}</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Backend Status */}
        <div className={`p-6 rounded-xl text-center transition-colors duration-300 ${
          darkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Backend Status</h3>
          <p className={message.includes('success') ? 'text-green-500' : 'text-gray-500'}>
            {message || 'Loading...'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
      }`}>
        <p>© 2024 MyApp. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App