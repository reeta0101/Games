// Web Development (MERN + Django) Learning Path
export const webDevelopmentPath = {
    id: 'web-development',
    title: 'Web Developer',
    subtitle: 'MERN Stack & Django',
    icon: '🌐',
    color: '#61dafb',
    description: 'Build full-stack web applications using React, Node.js, MongoDB, and Python Django.',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Django', 'HTML/CSS'],
    modules: [
        {
            id: 'react-fundamentals',
            title: 'React.js Fundamentals',
            icon: '⚛️',
            lessons: [
                {
                    id: 'react-intro',
                    title: 'Introduction to React',
                    duration: '20 min',
                    content: `
## What is React?

React is a JavaScript library for building user interfaces, developed by Facebook.

### Why React?
- **Component-Based**: Build encapsulated components
- **Declarative**: Describe what you want, React handles the how
- **Virtual DOM**: Efficient updates to the UI
- **Large Ecosystem**: Rich tooling and community

### Creating a React App
\`\`\`bash
# Using Create React App
npx create-react-app my-app
cd my-app
npm start

# Using Vite (faster)
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
\`\`\`

### Your First Component
\`\`\`jsx
// App.jsx
function App() {
  const name = "World";

  return (
    <div className="App">
      <h1>Hello, {name}!</h1>
      <p>Welcome to React</p>
    </div>
  );
}

export default App;
\`\`\`

### JSX Rules
- Components must return a single parent element
- Use \`className\` instead of \`class\`
- Close all tags (even self-closing: \`<img />\`)
- Use curly braces \`{}\` for JavaScript expressions
          `
                },
                {
                    id: 'state-props',
                    title: 'State & Props',
                    duration: '25 min',
                    content: `
## State & Props

### Props (Properties)
Props are read-only data passed from parent to child.

\`\`\`jsx
// Parent component
function App() {
  return <Greeting name="Alice" age={25} />;
}

// Child component
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old</p>
    </div>
  );
}
\`\`\`

### State with useState Hook
State is mutable data that belongs to a component.

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
\`\`\`

### State with Objects
\`\`\`jsx
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
    </form>
  );
}
\`\`\`

### Key Points
- Props flow down (parent → child)
- State is local to the component
- Never modify state directly (use setState)
- State changes trigger re-renders
          `
                },
                {
                    id: 'hooks',
                    title: 'React Hooks',
                    duration: '30 min',
                    content: `
## Essential React Hooks

### useEffect - Side Effects
\`\`\`jsx
import { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Runs after component mounts
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });

    // Cleanup function (optional)
    return () => {
      console.log('Component unmounting');
    };
  }, []); // Empty array = run once on mount

  if (loading) return <p>Loading...</p>;
  return <ul>{data.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}
\`\`\`

### useRef - DOM References
\`\`\`jsx
import { useRef } from 'react';

function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}
\`\`\`

### Custom Hooks
\`\`\`jsx
// useLocalStorage.js
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage
function App() {
  const [name, setName] = useLocalStorage('username', '');
}
\`\`\`
          `
                }
            ]
        },
        {
            id: 'nodejs-express',
            title: 'Node.js & Express',
            icon: '🟢',
            lessons: [
                {
                    id: 'express-basics',
                    title: 'Express.js Basics',
                    duration: '25 min',
                    content: `
## Building APIs with Express.js

### Setting Up Express
\`\`\`bash
mkdir my-api
cd my-api
npm init -y
npm install express
\`\`\`

### Basic Server
\`\`\`javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to my API!' });
});

app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  // Save to database...
  res.status(201).json({ id: 3, name, email });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

### Route Parameters
\`\`\`javascript
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  // Find user by id...
  res.json({ id, name: 'User ' + id });
});

// Query parameters: /search?q=term
app.get('/search', (req, res) => {
  const { q } = req.query;
  res.json({ query: q, results: [] });
});
\`\`\`

### Middleware
\`\`\`javascript
// Custom middleware
const logger = (req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`);
  next();
};

app.use(logger);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
\`\`\`
          `
                }
            ]
        },
        {
            id: 'mongodb',
            title: 'MongoDB & Mongoose',
            icon: '🍃',
            lessons: [
                {
                    id: 'mongoose-basics',
                    title: 'MongoDB with Mongoose',
                    duration: '30 min',
                    content: `
## MongoDB with Mongoose

### Setup
\`\`\`bash
npm install mongoose
\`\`\`

### Connecting to MongoDB
\`\`\`javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));
\`\`\`

### Defining a Schema
\`\`\`javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
\`\`\`

### CRUD Operations
\`\`\`javascript
// Create
const newUser = new User({ name: 'Alice', email: 'alice@example.com' });
await newUser.save();

// Read
const users = await User.find();
const user = await User.findById(id);
const alice = await User.findOne({ name: 'Alice' });

// Update
await User.findByIdAndUpdate(id, { name: 'New Name' });

// Delete
await User.findByIdAndDelete(id);
\`\`\`

### Key Points
- Schemas define document structure
- Models are constructors for creating documents
- Always use async/await for database operations
- Add validation in schema for data integrity
          `
                }
            ]
        },
        {
            id: 'django',
            title: 'Django Framework',
            icon: '🐍',
            lessons: [
                {
                    id: 'django-intro',
                    title: 'Django Basics',
                    duration: '30 min',
                    content: `
## Django Web Framework

Django is a high-level Python web framework that encourages rapid development.

### Setup
\`\`\`bash
pip install django
django-admin startproject myproject
cd myproject
python manage.py startapp myapp
python manage.py runserver
\`\`\`

### Models (Database)
\`\`\`python
# myapp/models.py
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    published = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
\`\`\`

### Views
\`\`\`python
# myapp/views.py
from django.shortcuts import render
from django.http import JsonResponse
from .models import Article

def article_list(request):
    articles = Article.objects.all()
    return render(request, 'articles.html', {'articles': articles})

def api_articles(request):
    articles = list(Article.objects.values())
    return JsonResponse(articles, safe=False)
\`\`\`

### URLs
\`\`\`python
# myapp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('articles/', views.article_list, name='article_list'),
    path('api/articles/', views.api_articles, name='api_articles'),
]
\`\`\`

### Django REST Framework
\`\`\`python
pip install djangorestframework

# serializers.py
from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'
\`\`\`
          `
                }
            ]
        }
    ]
};

export default webDevelopmentPath;
