import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (pw) => bcrypt.hashSync(pw, 10);

async function main() {
  console.log("Seeding database...");

  // Clean slate (order matters for FKs).
  await prisma.progress.deleteMany();
  await prisma.game.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // --- Subjects ---
  const math = await prisma.subject.create({
    data: { name: "Math", description: "Numbers, arithmetic and logic puzzles", icon: "🔢", color: "blue" },
  });
  const english = await prisma.subject.create({
    data: { name: "English", description: "Vocabulary, spelling and sentences", icon: "📚", color: "purple" },
  });
  const science = await prisma.subject.create({
    data: { name: "Science", description: "Explore the world around us", icon: "🔬", color: "green" },
  });
  const space = await prisma.subject.create({
    data: { name: "Space", description: "Explore planets, stars and the universe", icon: "🚀", color: "amber" },
  });

  // --- Games ---
  const games = [
    // ===== MATH =====
    {
      title: "Addition Adventure",
      description: "Add the numbers and reach the treasure!",
      subjectId: math.id,
      difficultyLevel: 1,
      points: 100,
      type: "math",
      content: {
        instructions: "Solve each addition problem.",
        questions: [
          { prompt: "2 + 3", answer: 5, options: [4, 5, 6, 7] },
          { prompt: "4 + 1", answer: 5, options: [3, 5, 6, 8] },
          { prompt: "6 + 2", answer: 8, options: [7, 8, 9, 10] },
          { prompt: "5 + 5", answer: 10, options: [9, 10, 11, 12] },
          { prompt: "3 + 4", answer: 7, options: [6, 7, 8, 9] },
        ],
      },
    },
    {
      title: "Subtraction Safari",
      description: "Take away numbers on a jungle journey.",
      subjectId: math.id,
      difficultyLevel: 1,
      points: 100,
      type: "math",
      content: {
        instructions: "Solve each subtraction problem.",
        questions: [
          { prompt: "5 - 2", answer: 3, options: [2, 3, 4, 5] },
          { prompt: "9 - 4", answer: 5, options: [4, 5, 6, 7] },
          { prompt: "8 - 3", answer: 5, options: [3, 5, 6, 7] },
          { prompt: "10 - 6", answer: 4, options: [3, 4, 5, 6] },
        ],
      },
    },
    {
      title: "Multiplication Masters",
      description: "Master your times tables!",
      subjectId: math.id,
      difficultyLevel: 2,
      points: 150,
      type: "math",
      content: {
        instructions: "Solve each multiplication problem.",
        questions: [
          { prompt: "3 × 4", answer: 12, options: [9, 12, 14, 16] },
          { prompt: "5 × 5", answer: 25, options: [20, 25, 30, 35] },
          { prompt: "6 × 2", answer: 12, options: [10, 12, 14, 8] },
          { prompt: "7 × 3", answer: 21, options: [18, 21, 24, 27] },
          { prompt: "8 × 4", answer: 32, options: [28, 30, 32, 36] },
        ],
      },
    },
    {
      title: "Logic Puzzles",
      description: "Find the next number in the pattern.",
      subjectId: math.id,
      difficultyLevel: 3,
      points: 200,
      type: "quiz",
      content: {
        instructions: "Pick the number that comes next.",
        questions: [
          { prompt: "2, 4, 6, 8, ?", answer: "10", options: ["9", "10", "12", "16"] },
          { prompt: "1, 3, 5, 7, ?", answer: "9", options: ["8", "9", "10", "11"] },
          { prompt: "5, 10, 15, ?", answer: "20", options: ["18", "20", "25", "30"] },
          { prompt: "1, 2, 4, 8, ?", answer: "16", options: ["10", "12", "16", "20"] },
        ],
      },
    },

    // ===== ENGLISH =====
    {
      title: "Vocabulary Voyage",
      description: "Choose the correct meaning of each word.",
      subjectId: english.id,
      difficultyLevel: 1,
      points: 100,
      type: "quiz",
      content: {
        instructions: "What does each word mean?",
        questions: [
          { prompt: "Happy", answer: "Feeling joy", options: ["Feeling joy", "Very tired", "Quite cold", "A big animal"] },
          { prompt: "Huge", answer: "Very big", options: ["Very small", "Very big", "Very fast", "Very quiet"] },
          { prompt: "Begin", answer: "To start", options: ["To stop", "To start", "To sleep", "To eat"] },
        ],
      },
    },
    {
      title: "Spelling Bee",
      description: "Type the word that you hear and see.",
      subjectId: english.id,
      difficultyLevel: 2,
      points: 150,
      type: "spelling",
      content: {
        instructions: "Look at the hint and spell the word.",
        questions: [
          { prompt: "A furry pet that says 'meow'", answer: "cat" },
          { prompt: "The opposite of night", answer: "day" },
          { prompt: "You read this object", answer: "book" },
          { prompt: "A color of the sky on a sunny day", answer: "blue" },
        ],
      },
    },
    {
      title: "Picture Match",
      description: "Match each word to its picture.",
      subjectId: english.id,
      difficultyLevel: 1,
      points: 100,
      type: "matching",
      content: {
        instructions: "Match the word with its emoji picture.",
        pairs: [
          { word: "Dog", match: "🐶" },
          { word: "Apple", match: "🍎" },
          { word: "Sun", match: "☀️" },
          { word: "Car", match: "🚗" },
          { word: "Tree", match: "🌳" },
        ],
      },
    },
    {
      title: "Simple Sentences",
      description: "Pick the word that completes the sentence.",
      subjectId: english.id,
      difficultyLevel: 2,
      points: 150,
      type: "quiz",
      content: {
        instructions: "Complete each sentence.",
        questions: [
          { prompt: "The cat ___ on the mat.", answer: "sat", options: ["sat", "run", "eat", "blue"] },
          { prompt: "I ___ an apple for lunch.", answer: "ate", options: ["ate", "sky", "fast", "green"] },
          { prompt: "She ___ to school every day.", answer: "walks", options: ["walks", "table", "happy", "water"] },
        ],
      },
    },

    // ===== SCIENCE (extensibility demo) =====
    {
      title: "Animal Sounds",
      description: "Which animal makes this sound?",
      subjectId: science.id,
      difficultyLevel: 1,
      points: 100,
      type: "quiz",
      content: {
        instructions: "Choose the right animal.",
        questions: [
          { prompt: "Moo!", answer: "Cow", options: ["Cow", "Dog", "Cat", "Duck"] },
          { prompt: "Woof!", answer: "Dog", options: ["Cow", "Dog", "Sheep", "Frog"] },
          { prompt: "Quack!", answer: "Duck", options: ["Lion", "Duck", "Bird", "Bee"] },
        ],
      },
    },

    // ===== SPACE =====
    {
      title: "Planet Quiz",
      description: "Test your knowledge about our solar system!",
      subjectId: space.id,
      difficultyLevel: 1,
      points: 100,
      type: "quiz",
      content: {
        instructions: "Pick the correct answer about space.",
        questions: [
          { prompt: "Which planet is closest to the Sun?", answer: "Mercury", options: ["Earth", "Mars", "Mercury", "Venus"] },
          { prompt: "What is the largest planet?", answer: "Jupiter", options: ["Saturn", "Jupiter", "Mars", "Neptune"] },
          { prompt: "Which planet is known as the Red Planet?", answer: "Mars", options: ["Venus", "Mars", "Jupiter", "Mercury"] },
          { prompt: "How many moons does Earth have?", answer: "1", options: ["0", "1", "2", "3"] },
        ],
      },
    },
    {
      title: "Space Math",
      description: "Solve space-themed math problems!",
      subjectId: space.id,
      difficultyLevel: 2,
      points: 150,
      type: "math",
      content: {
        instructions: "Calculate the answer to each space problem.",
        questions: [
          { prompt: "A rocket travels 500 miles. How many more miles to reach 1000?", answer: 500, options: [400, 500, 600, 700] },
          { prompt: "If there are 8 planets and 3 are gas giants, how many are not?", answer: 5, options: [3, 4, 5, 6] },
          { prompt: "A star is 4.5 billion years old. How old in billions?", answer: 4.5, options: [3, 4, 4.5, 5] },
          { prompt: "5 astronauts × 2 spacesuits each = ?", answer: 10, options: [7, 8, 10, 12] },
        ],
      },
    },
    {
      title: "Constellation Match",
      description: "Match the constellation name to its description!",
      subjectId: space.id,
      difficultyLevel: 2,
      points: 150,
      type: "matching",
      content: {
        instructions: "Match each constellation to its description.",
        pairs: [
          { word: "Big Dipper", match: "🌟" },
          { word: "Orion", match: "🏹" },
          { word: "Cassiopeia", match: "👑" },
          { word: "Scorpius", match: "🦂" },
          { word: "Ursa Major", match: "🐻" },
        ],
      },
    },
    {
      title: "Space Spelling",
      description: "Spell space-related words correctly!",
      subjectId: space.id,
      difficultyLevel: 1,
      points: 100,
      type: "spelling",
      content: {
        instructions: "Look at the hint and spell the space word.",
        questions: [
          { prompt: "The planet we live on", answer: "Earth" },
          { prompt: "Our closest star", answer: "Sun" },
          { prompt: "Earth's natural satellite", answer: "Moon" },
          { prompt: "People who travel to space", answer: "astronaut" },
        ],
      },
    },
  ];

  for (const g of games) {
    await prisma.game.create({
      data: { ...g, content: JSON.stringify(g.content) },
    });
  }

  // --- Users ---
  const admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@kids.com", password: hash("admin123"), role: "admin" },
  });
  const parent = await prisma.user.create({
    data: { name: "Sam Parent", email: "parent@kids.com", password: hash("parent123"), role: "parent" },
  });
  const lily = await prisma.user.create({
    data: { name: "Lily", role: "child", parentId: parent.id },
  });
  const max = await prisma.user.create({
    data: { name: "Max", role: "child", parentId: parent.id },
  });

  // Some sample progress for Lily.
  const allGames = await prisma.game.findMany();
  await prisma.progress.create({ data: { userId: lily.id, gameId: allGames[0].id, score: 100, completed: true } });
  await prisma.progress.create({ data: { userId: lily.id, gameId: allGames[4].id, score: 80, completed: true } });

  console.log("Seed complete.");
  console.log("Logins:");
  console.log("  Admin  -> admin@kids.com / admin123");
  console.log("  Parent -> parent@kids.com / parent123");
  console.log(`  Children under parent: ${lily.name} (#${lily.id}), ${max.name} (#${max.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
