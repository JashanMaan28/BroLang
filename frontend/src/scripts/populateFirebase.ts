import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Code Examples Data
const codeExamples = [
  {
    title: 'Gen Z Greeting',
    description: 'A simple greeting with Gen Z flair',
    language: 'brolang',
    code: `wassup famfam spill "Yo, what’s good? 🔥"what’s good numdrop the vibe "You said: " + numcatch you later fam`,
    order: 1
  },
  {
    title: 'Slay Score',
    description: 'Basic variable declaration and print with slay vibe',
    language: 'brolang',
    code: `let’s roll gangslay with score = 100yeet the tea "Score is: " + scorevibe out squad`,
    order: 14
  },
  {
    title: 'Vibe Check Win',
    description: 'Conditional check with vibe check syntax',
    language: 'brolang',
    code: `yo brovibe check if score > 50fam spill "Slay, you’re winning! 💪"no cap elsedrop the vibe "Nah, step it up! 😬"gtfo bro`,
    order: 15
  },
  {
    title: 'Flexin’ Name',
    description: 'Input prompt with flexin’ style',
    language: 'brolang',
    code: `wassup famflexin’ with name = "INPUT"spill the tea "Hey " + name + ", you lit! ✨"peace out bro`,
    order: 4
  },
  {
    title: 'Overworked Loop',
    description: 'While loop exceeding 10 iterations with Gen Z limit message',
    language: 'brolang',
    code: `let’s roll gangflexin’ with counter = 15vibe loop fam counter > 0fam spill "Counting: " + counterflexin’ with counter = counter - 1catch you later fam`,
    order: 5
  },
  {
    title: 'Age Slay',
    description: 'Age-based if-else with slay cycle',
    language: 'brolang',
    code: `yo browhat’s good ageslay if age > 18yeet the tea "You’re an adult, slay! 😎"bet elsedrop the vibe "Still a kid, no cap! 🍼"gtfo bro`,
    order: 6
  },
  {
    title: 'Grind Overload',
    description: 'Grind loop exceeding 10 iterations with limit message',
    language: 'brolang',
    code: `wassup famflexin’ with count = 20grind till count > 0fam spill "Grinding at: " + countflexin’ with count = count - 1vibe out squad`,
    order: 7
  },
  {
    title: 'Vibe Calc',
    description: 'Basic calculator operations with drop the vibe',
    language: 'brolang',
    code: `let’s roll gangwhat’s good xwhat’s good ydrop the vibe "Sum: " + x + ydrop the vibe "Product: " + x * ycatch you later fam`,
    order: 8
  },
  {
    title: 'Temp Vibe',
    description: 'Temperature loop with no cap else',
    language: 'brolang',
    code: `yo broflexin’ with temp = 25vibe loop fam temp > 20fam spill "It’s hot: " + tempflexin’ with temp = temp - 1no cap elseyeet the tea "Chillin’ now! ❄️"peace out bro`,
    order: 9
  },
  {
    title: 'Epic Loop Fail',
    description: 'Extended loop exceeding 10 iterations with limit',
    language: 'brolang',
    code: `wassup famslay with num = 25slay cycle num > 0drop the vibe "Looping: " + numslay with num = num - 2vibe out squad`,
    order: 10
  },
  {
    title: 'Full Vibe Mix',
    description: 'Complex example with multiple Gen Z syntaxes',
    language: 'brolang',
    code: `let’s roll gangflexin’ with a = 10what’s good bslay if a != bfam spill "Not the same, no cap! 🚀"bet elsedrop the vibe "Same vibes, fam! ✨"vibe loop fam a > 0yeet the tea "Counting down: " + aflexin’ with a = a - 1catch you later fam`,
    order: 11
  },
  {
    title: 'Tick Tock',
    description: 'Input-driven countdown loop',
    language: 'brolang',
    code: `wassup famspill the tea "Start count: "what’s good startvibe loop fam start > 0fam spill "Tick: " + startflexin’ with start = start - 1vibe out squad`,
    order: 12
  },
  {
    title: 'Gen Z Calc',
    description: 'A basic calculator with Gen Z flair',
    language: 'brolang',
    code: `wassup fam# Simple calculator programfam spill "BroCalc 1.0 🔥"what’s good num1what’s good num2drop the vibe "Sum: " + num1 + num2drop the vibe "Diff: " + num1 - num2drop the vibe "Prod: " + num1 * num2vibe check if num2 != 0yeet the tea "Div: " + num1 / num2no cap elsefam spill "No div by zero, fam! 😬"catch you later fam`,
    order: 13
  }
];

// Blog Posts Data
const blogPosts = [
  {
    title: 'Introducing BroLang: Programming for Bros',
    date: new Date().toISOString(),
    author: 'BroLang Team',
    readTime: '5 min read',
    excerpt: 'Meet BroLang, a new programming language designed to make coding more approachable and fun.',
    content: `# Introducing BroLang

BroLang is a new programming language that combines simplicity with power. We created it to make programming more approachable while maintaining the capabilities you need for real-world applications.

## Key Features

- Simple, readable syntax
- Strong type system
- Built-in concurrency support
- Modern tooling and ecosystem

## Getting Started

Here's a simple example:

\`\`\`brolang
yo bro
bro say "Hello, World!"
peace out bro
\`\`\`

## What's Next

We're working on:
- Package manager
- IDE support
- Web framework
- More learning resources

Stay tuned for more updates!`
  },
  {
    title: 'BroLang Best Practices',
    date: new Date().toISOString(),
    author: 'BroLang Team',
    readTime: '8 min read',
    excerpt: 'Learn the best practices for writing clean and efficient BroLang code.',
    content: `# BroLang Best Practices

Writing good BroLang code is all about following these core principles.

## Code Organization

- Keep your files focused and organized
- Use meaningful variable names
- Comment your code appropriately

## Performance Tips

\`\`\`brolang
# Good
bro this is counter = 0
keep going bro counter < 10 {
    # Your code here
    counter = counter + 1
}

# Not so good
bro this is i = 0
keep going bro true {
    bro if i >= 10 {
        peace out bro
    }
    i = i + 1
}
\`\`\`

## Error Handling

Always handle potential errors in your code:

\`\`\`brolang
bro ask userInput
bro if userInput == "" {
    bro say "Bro, you need to enter something!"
}
\`\`\`

## Testing

Write tests for your code to ensure it works as expected.`
  }
];

// Function to populate code examples
async function populateCodeExamples() {
  try {
    const examplesRef = collection(db, 'codeExamples');
    for (const example of codeExamples) {
      await addDoc(examplesRef, example);
      console.log(`Added code example: ${example.title}`);
    }
  } catch (error) {
    console.error('Error adding code examples:', error);
  }
}

// Function to populate blog posts
async function populateBlogPosts() {
  try {
    const postsRef = collection(db, 'posts');
    for (const post of blogPosts) {
      await addDoc(postsRef, post);
      console.log(`Added blog post: ${post.title}`);
    }
  } catch (error) {
    console.error('Error adding blog posts:', error);
  }
}

// Run the population functions
async function populateAll() {
  console.log('Starting data population...');
  await populateCodeExamples();
  await populateBlogPosts();
  console.log('Data population completed!');
}

populateAll();