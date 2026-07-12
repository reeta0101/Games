// Data Science & AI Learning Path
export const dataSciencePath = {
    id: 'data-science',
    title: 'Data Science & AI',
    subtitle: 'Machine Learning & Deep Learning',
    icon: '🤖',
    color: '#ff6b6b',
    description: 'Build intelligent systems using Python, machine learning, deep learning, and AI techniques.',
    skills: ['Python', 'NumPy', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'NLP'],
    modules: [
        {
            id: 'ml-fundamentals',
            title: 'Machine Learning Basics',
            icon: '🧠',
            lessons: [
                {
                    id: 'ml-intro',
                    title: 'Introduction to ML',
                    duration: '25 min',
                    content: `
## What is Machine Learning?

Machine Learning is a subset of AI that enables computers to learn from data without being explicitly programmed.

### Types of Machine Learning

| Type | Description | Examples |
|------|-------------|----------|
| **Supervised** | Learn from labeled data | Classification, Regression |
| **Unsupervised** | Find patterns in unlabeled data | Clustering, Dimensionality Reduction |
| **Reinforcement** | Learn through rewards/penalties | Game AI, Robotics |

### ML Workflow
1. **Data Collection** - Gather relevant data
2. **Data Preprocessing** - Clean and prepare data
3. **Feature Engineering** - Select/create features
4. **Model Selection** - Choose appropriate algorithm
5. **Training** - Fit model to data
6. **Evaluation** - Measure performance
7. **Deployment** - Put model into production

### Common Algorithms
\`\`\`
Supervised Learning:
├── Regression
│   ├── Linear Regression
│   ├── Polynomial Regression
│   └── Ridge/Lasso Regression
└── Classification
    ├── Logistic Regression
    ├── Decision Trees
    ├── Random Forest
    ├── SVM (Support Vector Machines)
    └── K-Nearest Neighbors

Unsupervised Learning:
├── Clustering
│   ├── K-Means
│   └── Hierarchical Clustering
└── Dimensionality Reduction
    ├── PCA
    └── t-SNE
\`\`\`
          `
                },
                {
                    id: 'sklearn-basics',
                    title: 'Scikit-Learn Essentials',
                    duration: '35 min',
                    content: `
## Machine Learning with Scikit-Learn

### Basic Workflow
\`\`\`python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# Load data
X = df[['feature1', 'feature2', 'feature3']]
y = df['target']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train model
model = LogisticRegression()
model.fit(X_train_scaled, y_train)

# Predict
y_pred = model.predict(X_test_scaled)

# Evaluate
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
print(classification_report(y_test, y_pred))
\`\`\`

### Common Models
\`\`\`python
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

# Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Support Vector Machine
svm = SVC(kernel='rbf', C=1.0)
svm.fit(X_train, y_train)

# K-Nearest Neighbors
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)
\`\`\`

### Model Evaluation Metrics
| Metric | Use Case |
|--------|----------|
| Accuracy | Balanced classes |
| Precision | Minimize false positives |
| Recall | Minimize false negatives |
| F1-Score | Balance precision/recall |
| AUC-ROC | Binary classification |
          `
                }
            ]
        },
        {
            id: 'deep-learning',
            title: 'Deep Learning',
            icon: '🔮',
            lessons: [
                {
                    id: 'neural-networks',
                    title: 'Neural Networks Basics',
                    duration: '30 min',
                    content: `
## Deep Learning with TensorFlow/Keras

### What is Deep Learning?
Deep Learning uses neural networks with many layers to learn complex patterns from data.

### Neural Network Architecture
\`\`\`
Input Layer → Hidden Layers → Output Layer
    [x1]                           [y]
    [x2]  →  [h1] → [h2] → ... →  [y]
    [x3]                           [y]
\`\`\`

### Building a Neural Network
\`\`\`python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Sequential model
model = keras.Sequential([
    layers.Dense(128, activation='relu', input_shape=(input_dim,)),
    layers.Dropout(0.2),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(10, activation='softmax')
])

# Compile model
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train model
history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=5),
        keras.callbacks.ModelCheckpoint('best_model.h5')
    ]
)

# Evaluate
model.evaluate(X_test, y_test)
\`\`\`

### Activation Functions
| Function | Use Case | Range |
|----------|----------|-------|
| ReLU | Hidden layers (default) | [0, ∞) |
| Sigmoid | Binary classification | (0, 1) |
| Softmax | Multi-class output | (0, 1), sum=1 |
| Tanh | Hidden layers | (-1, 1) |
          `
                },
                {
                    id: 'cnn-image',
                    title: 'CNNs for Image Classification',
                    duration: '35 min',
                    content: `
## Convolutional Neural Networks

CNNs are specialized for processing grid-like data (images).

### CNN Architecture
\`\`\`python
model = keras.Sequential([
    # Convolutional layers
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),

    # Flatten and Dense layers
    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])
\`\`\`

### Data Augmentation
\`\`\`python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2,
    rescale=1./255
)

train_generator = datagen.flow_from_directory(
    'data/train',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)
\`\`\`

### Transfer Learning
\`\`\`python
from tensorflow.keras.applications import VGG16

# Load pre-trained model
base_model = VGG16(weights='imagenet', include_top=False,
                   input_shape=(224, 224, 3))

# Freeze base layers
base_model.trainable = False

# Add custom layers
model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation='relu'),
    layers.Dense(num_classes, activation='softmax')
])
\`\`\`
          `
                }
            ]
        },
        {
            id: 'nlp',
            title: 'Natural Language Processing',
            icon: '💬',
            lessons: [
                {
                    id: 'nlp-basics',
                    title: 'NLP Fundamentals',
                    duration: '30 min',
                    content: `
## Natural Language Processing

NLP enables computers to understand, interpret, and generate human language.

### Text Preprocessing
\`\`\`python
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Tokenization
text = "Natural language processing is fascinating!"
tokens = word_tokenize(text.lower())

# Remove stopwords
stop_words = set(stopwords.words('english'))
filtered = [w for w in tokens if w not in stop_words]

# Lemmatization
lemmatizer = WordNetLemmatizer()
lemmatized = [lemmatizer.lemmatize(w) for w in filtered]
\`\`\`

### Text Vectorization
\`\`\`python
from sklearn.feature_extraction.text import TfidfVectorizer

texts = ["I love machine learning", "Deep learning is amazing"]
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(texts)
\`\`\`

### Sentiment Analysis with Transformers
\`\`\`python
from transformers import pipeline

# Load pre-trained model
sentiment_analyzer = pipeline("sentiment-analysis")

# Analyze text
result = sentiment_analyzer("I love this product!")
print(result)
# [{'label': 'POSITIVE', 'score': 0.9998}]
\`\`\`

### NLP Tasks
| Task | Description | Example |
|------|-------------|---------|
| Classification | Categorize text | Spam detection |
| NER | Extract entities | Find names, dates |
| Sentiment | Detect emotion | Product reviews |
| Summarization | Condense text | News summaries |
| Translation | Convert languages | English to French |
| QA | Answer questions | Chatbots |
          `
                }
            ]
        }
    ]
};

export default dataSciencePath;
