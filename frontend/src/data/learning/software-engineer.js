// Software Engineer (Java) Learning Path
export const softwareEngineerPath = {
    id: 'software-engineer',
    title: 'Software Engineer',
    subtitle: 'Java Developer',
    icon: '☕',
    color: '#f89820',
    description: 'Master Java programming, OOP concepts, data structures, and system design for backend development.',
    skills: ['Java', 'OOP', 'DSA', 'Spring Boot', 'System Design'],
    modules: [
        {
            id: 'java-fundamentals',
            title: 'Java Fundamentals',
            icon: '📘',
            lessons: [
                {
                    id: 'variables-types',
                    title: 'Variables & Data Types',
                    duration: '15 min',
                    content: `
## Variables & Data Types in Java

Java is a **statically-typed** language, meaning every variable must have a declared type.

### Primitive Data Types

| Type | Size | Range | Example |
|------|------|-------|---------|
| byte | 1 byte | -128 to 127 | \`byte b = 100;\` |
| short | 2 bytes | -32,768 to 32,767 | \`short s = 1000;\` |
| int | 4 bytes | -2^31 to 2^31-1 | \`int i = 100000;\` |
| long | 8 bytes | -2^63 to 2^63-1 | \`long l = 100000L;\` |
| float | 4 bytes | ~7 decimal digits | \`float f = 3.14f;\` |
| double | 8 bytes | ~15 decimal digits | \`double d = 3.14159;\` |
| boolean | 1 bit | true/false | \`boolean flag = true;\` |
| char | 2 bytes | Unicode character | \`char c = 'A';\` |

### Variable Declaration
\`\`\`java
// Declaration and initialization
int age = 25;
String name = "John";
double salary = 50000.50;
boolean isActive = true;

// Multiple declarations
int x = 10, y = 20, z = 30;

// Constants (final keyword)
final double PI = 3.14159;
\`\`\`

### Type Casting
\`\`\`java
// Implicit casting (widening)
int myInt = 100;
double myDouble = myInt;  // 100.0

// Explicit casting (narrowing)
double pi = 3.14159;
int rounded = (int) pi;  // 3
\`\`\`

### Key Points
- Always initialize variables before use
- Use meaningful variable names (camelCase)
- Prefer \`int\` for integers, \`double\` for decimals
- Use \`final\` for constants
          `
                },
                {
                    id: 'control-flow',
                    title: 'Control Flow Statements',
                    duration: '20 min',
                    content: `
## Control Flow in Java

Control flow statements determine the order in which code executes.

### If-Else Statements
\`\`\`java
int score = 85;

if (score >= 90) {
    System.out.println("Grade: A");
} else if (score >= 80) {
    System.out.println("Grade: B");
} else if (score >= 70) {
    System.out.println("Grade: C");
} else {
    System.out.println("Grade: F");
}
\`\`\`

### Switch Statement
\`\`\`java
int day = 3;
String dayName;

switch (day) {
    case 1: dayName = "Monday"; break;
    case 2: dayName = "Tuesday"; break;
    case 3: dayName = "Wednesday"; break;
    case 4: dayName = "Thursday"; break;
    case 5: dayName = "Friday"; break;
    default: dayName = "Weekend";
}

// Java 14+ Enhanced Switch
String result = switch (day) {
    case 1, 2, 3, 4, 5 -> "Weekday";
    case 6, 7 -> "Weekend";
    default -> "Invalid";
};
\`\`\`

### Loops

#### For Loop
\`\`\`java
for (int i = 0; i < 5; i++) {
    System.out.println("Count: " + i);
}

// Enhanced for-each loop
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}
\`\`\`

#### While Loop
\`\`\`java
int count = 0;
while (count < 5) {
    System.out.println(count);
    count++;
}
\`\`\`

### Key Points
- Use \`if-else\` for complex conditions
- Use \`switch\` for multiple fixed values
- Prefer \`for\` when iteration count is known
- Use \`while\` when condition is dynamic
          `
                },
                {
                    id: 'methods',
                    title: 'Methods & Functions',
                    duration: '25 min',
                    content: `
## Methods in Java

Methods are reusable blocks of code that perform specific tasks.

### Method Syntax
\`\`\`java
accessModifier returnType methodName(parameters) {
    // method body
    return value;  // if returnType is not void
}
\`\`\`

### Example Methods
\`\`\`java
public class Calculator {

    // Method with return value
    public static int add(int a, int b) {
        return a + b;
    }

    // Method without return (void)
    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    // Method with multiple parameters
    public static double calculateArea(double length, double width) {
        return length * width;
    }

    // Method overloading (same name, different parameters)
    public static int add(int a, int b, int c) {
        return a + b + c;
    }
}
\`\`\`

### Access Modifiers
| Modifier | Class | Package | Subclass | World |
|----------|-------|---------|----------|-------|
| public | ✅ | ✅ | ✅ | ✅ |
| protected | ✅ | ✅ | ✅ | ❌ |
| default | ✅ | ✅ | ❌ | ❌ |
| private | ✅ | ❌ | ❌ | ❌ |

### Varargs (Variable Arguments)
\`\`\`java
public static int sum(int... numbers) {
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    return total;
}

// Usage
sum(1, 2);           // 3
sum(1, 2, 3, 4, 5);  // 15
\`\`\`

### Key Points
- Use descriptive method names (verbs)
- Keep methods short and focused (single responsibility)
- Use appropriate access modifiers
- Method overloading improves code readability
          `
                }
            ]
        },
        {
            id: 'oop-concepts',
            title: 'Object-Oriented Programming',
            icon: '🎯',
            lessons: [
                {
                    id: 'classes-objects',
                    title: 'Classes & Objects',
                    duration: '30 min',
                    content: `
## Classes & Objects

A **class** is a blueprint for creating objects. An **object** is an instance of a class.

### Defining a Class
\`\`\`java
public class Employee {
    // Instance variables (attributes)
    private String name;
    private int id;
    private double salary;

    // Constructor
    public Employee(String name, int id, double salary) {
        this.name = name;
        this.id = id;
        this.salary = salary;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Instance method
    public void displayInfo() {
        System.out.println("ID: " + id + ", Name: " + name);
    }
}
\`\`\`

### Creating Objects
\`\`\`java
// Creating an object
Employee emp1 = new Employee("John", 101, 50000);
Employee emp2 = new Employee("Jane", 102, 60000);

// Accessing methods
emp1.displayInfo();
String name = emp1.getName();
\`\`\`

### Static vs Instance
\`\`\`java
public class Counter {
    private static int count = 0;  // Shared across all objects
    private int id;                // Unique to each object

    public Counter() {
        count++;
        id = count;
    }

    public static int getCount() {
        return count;
    }
}
\`\`\`

### Key Points
- Classes define structure (attributes + methods)
- Objects are instances of classes
- Use constructors to initialize objects
- Encapsulate data with private fields + getters/setters
          `
                },
                {
                    id: 'inheritance',
                    title: 'Inheritance & Polymorphism',
                    duration: '35 min',
                    content: `
## Inheritance

Inheritance allows a class to inherit properties and methods from another class.

### Basic Inheritance
\`\`\`java
// Parent class
public class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + " is eating");
    }
}

// Child class
public class Dog extends Animal {
    private String breed;

    public Dog(String name, String breed) {
        super(name);  // Call parent constructor
        this.breed = breed;
    }

    public void bark() {
        System.out.println(name + " is barking!");
    }

    // Method overriding
    @Override
    public void eat() {
        System.out.println(name + " is eating dog food");
    }
}
\`\`\`

## Polymorphism

Polymorphism means "many forms" - the same method can behave differently.

### Runtime Polymorphism
\`\`\`java
Animal myAnimal = new Dog("Buddy", "Labrador");
myAnimal.eat();  // Outputs: "Buddy is eating dog food"

// Using polymorphism with arrays
Animal[] animals = {
    new Dog("Buddy", "Lab"),
    new Cat("Whiskers"),
    new Bird("Tweety")
};

for (Animal animal : animals) {
    animal.eat();  // Each calls its own version
}
\`\`\`

### Abstract Classes
\`\`\`java
public abstract class Shape {
    abstract double calculateArea();

    public void display() {
        System.out.println("Area: " + calculateArea());
    }
}

public class Circle extends Shape {
    private double radius;

    @Override
    double calculateArea() {
        return Math.PI * radius * radius;
    }
}
\`\`\`

### Key Points
- Use \`extends\` for inheritance
- Call parent constructor with \`super()\`
- Override methods with \`@Override\` annotation
- Abstract classes can't be instantiated
          `
                }
            ]
        },
        {
            id: 'collections',
            title: 'Collections Framework',
            icon: '📦',
            lessons: [
                {
                    id: 'lists-sets',
                    title: 'Lists, Sets & Maps',
                    duration: '30 min',
                    content: `
## Java Collections Framework

Collections are containers that store and manipulate groups of objects.

### ArrayList
\`\`\`java
import java.util.ArrayList;

ArrayList<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");

// Access elements
String first = names.get(0);  // "Alice"

// Iterate
for (String name : names) {
    System.out.println(name);
}

// Remove
names.remove("Bob");
names.remove(0);  // Remove by index
\`\`\`

### HashSet (No duplicates, unordered)
\`\`\`java
import java.util.HashSet;

HashSet<Integer> numbers = new HashSet<>();
numbers.add(1);
numbers.add(2);
numbers.add(1);  // Duplicate ignored

System.out.println(numbers.size());  // 2
\`\`\`

### HashMap (Key-Value pairs)
\`\`\`java
import java.util.HashMap;

HashMap<String, Integer> ages = new HashMap<>();
ages.put("Alice", 25);
ages.put("Bob", 30);

// Access
int aliceAge = ages.get("Alice");  // 25

// Iterate
for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
\`\`\`

### When to Use What?
| Collection | Use When |
|------------|----------|
| ArrayList | Ordered, allows duplicates, frequent access |
| LinkedList | Frequent insertions/deletions |
| HashSet | No duplicates, fast lookup |
| TreeSet | Sorted, no duplicates |
| HashMap | Key-value pairs, fast lookup |
| TreeMap | Sorted keys |
          `
                }
            ]
        }
    ]
};

export default softwareEngineerPath;
