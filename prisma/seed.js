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
    {
      title: "Number Memory",
      description: "Match number pairs!",
      subjectId: math.id,
      difficultyLevel: 1,
      points: 100,
      type: "memory",
      content: {
        instructions: "Flip cards to find matching number pairs.",
        cards: [
          { id: 1, icon: "1️⃣" },
          { id: 1, icon: "1️⃣" },
          { id: 2, icon: "2️⃣" },
          { id: 2, icon: "2️⃣" },
          { id: 3, icon: "3️⃣" },
          { id: 3, icon: "3️⃣" },
          { id: 4, icon: "4️⃣" },
          { id: 4, icon: "4️⃣" },
          { id: 5, icon: "5️⃣" },
          { id: 5, icon: "5️⃣" },
          { id: 6, icon: "6️⃣" },
          { id: 6, icon: "6️⃣" },
        ],
      },
    },
    {
      title: "Number Sorting",
      description: "Sort numbers in ascending order!",
      subjectId: math.id,
      difficultyLevel: 1,
      points: 100,
      type: "sorting",
      content: {
        instructions: "Sort the numbers from smallest to largest.",
        sortBy: "ascending order",
        items: [
          { id: 1, icon: "1️⃣", label: "5", order: 3 },
          { id: 2, icon: "2️⃣", label: "2", order: 1 },
          { id: 3, icon: "3️⃣", label: "8", order: 4 },
          { id: 4, icon: "4️⃣", label: "3", order: 2 },
        ],
      },
    },
    {
      title: "Math Runner",
      description: "Run and solve math problems before time runs out!",
      subjectId: math.id,
      difficultyLevel: 2,
      points: 200,
      type: "mathrunner",
      content: {
        instructions: "Solve math problems before time runs out!",
      },
    },
    {
      title: "Math Battle RPG",
      description: "Battle monsters using math skills!",
      subjectId: math.id,
      difficultyLevel: 3,
      points: 300,
      type: "grammarguardian",
      content: {
        instructions: "Battle monsters using correct math answers!",
        battles: [
          { monster: "👾", name: "Number Goblin", question: "15 + 27 = ?", correct: "42", options: ["40", "42", "44", "46"], hp: 100 },
          { monster: "🐉", name: "Calculation Dragon", question: "8 × 7 = ?", correct: "56", options: ["48", "54", "56", "64"], hp: 120 },
          { monster: "👻", name: "Fraction Phantom", question: "100 ÷ 4 = ?", correct: "25", options: ["20", "25", "30", "35"], hp: 90 },
        ],
      },
    },
    {
      title: "Number World Odyssey",
      description: "Travel between number cities with math puzzles!",
      subjectId: math.id,
      difficultyLevel: 3,
      points: 300,
      type: "wordworldodyssey",
      content: {
        instructions: "Travel between cities by solving math puzzles!",
        cities: [
          { id: 1, name: "Addition Town", icon: "➕", color: "bg-blue-400", puzzle: { word: "42", hint: "20 + 22" } },
          { id: 2, name: "Multiplication City", icon: "✖️", color: "bg-amber-400", puzzle: { word: "56", hint: "8 × 7" } },
          { id: 3, name: "Division Village", icon: "➗", color: "bg-purple-400", puzzle: { word: "25", hint: "100 ÷ 4" } },
        ],
      },
    },

    // ===== ENGLISH =====
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
    {
      title: "Word Memory",
      description: "Match word pairs!",
      subjectId: english.id,
      difficultyLevel: 1,
      points: 100,
      type: "memory",
      content: {
        instructions: "Flip cards to find matching word pairs.",
        cards: [
          { id: 1, icon: "🐕" },
          { id: 1, icon: "🐕" },
          { id: 2, icon: "🐱" },
          { id: 2, icon: "🐱" },
          { id: 3, icon: "🐰" },
          { id: 3, icon: "🐰" },
          { id: 4, icon: "🦊" },
          { id: 4, icon: "🦊" },
          { id: 5, icon: "🐻" },
          { id: 5, icon: "🐻" },
          { id: 6, icon: "🦁" },
          { id: 6, icon: "🦁" },
        ],
      },
    },
    {
      title: "Alphabet Sorting",
      description: "Sort words alphabetically!",
      subjectId: english.id,
      difficultyLevel: 1,
      points: 100,
      type: "sorting",
      content: {
        instructions: "Sort the words in alphabetical order (A-Z).",
        sortBy: "alphabetical order",
        items: [
          { id: 1, icon: "🍎", label: "Apple", order: 1 },
          { id: 2, icon: "🍌", label: "Banana", order: 2 },
          { id: 3, icon: "🍒", label: "Cherry", order: 3 },
          { id: 4, icon: "🍇", label: "Grape", order: 4 },
        ],
      },
    },
    {
      title: "Word Runner",
      description: "Run and collect words before time runs out!",
      subjectId: english.id,
      difficultyLevel: 2,
      points: 200,
      type: "wordrunner",
      content: {
        instructions: "Collect all the words before time runs out!",
        words: ["CAT", "DOG", "SUN", "RUN", "FUN", "WIN"],
      },
    },
    {
      title: "Grammar Guardian",
      description: "Battle monsters using correct grammar!",
      subjectId: english.id,
      difficultyLevel: 3,
      points: 300,
      type: "grammarguardian",
      content: {
        instructions: "Battle monsters using correct grammar!",
      },
    },
    {
      title: "Spelling Quest RPG",
      description: "RPG-style game with spelling levels!",
      subjectId: english.id,
      difficultyLevel: 3,
      points: 300,
      type: "spellingquestrpg",
      content: {
        instructions: "Level up by improving spelling skills!",
      },
    },
    {
      title: "Word World Odyssey",
      description: "Travel between cities with word puzzles!",
      subjectId: english.id,
      difficultyLevel: 3,
      points: 300,
      type: "wordworldodyssey",
      content: {
        instructions: "Travel between cities by solving word puzzles!",
      },
    },
    {
      title: "Sentence Builder Adventure",
      description: "Build sentences to unlock doors and paths!",
      subjectId: english.id,
      difficultyLevel: 3,
      points: 300,
      type: "sentencebuilder",
      content: {
        instructions: "Build correct sentences to unlock doors and paths!",
      },
    },
    {
      title: "Language Mystery Island",
      description: "Escape island with hidden clues and puzzles!",
      subjectId: english.id,
      difficultyLevel: 3,
      points: 300,
      type: "languagemysteryisland",
      content: {
        instructions: "Escape the island by solving language puzzles!",
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
    {
      title: "Animal Drag & Drop",
      description: "Drag animals to their habitats!",
      subjectId: science.id,
      difficultyLevel: 1,
      points: 100,
      type: "dragdrop",
      content: {
        instructions: "Drag each animal to its correct habitat.",
        items: [
          { id: 1, icon: "🐟", label: "Fish", correctZoneId: 1 },
          { id: 2, icon: "🐦", label: "Bird", correctZoneId: 2 },
          { id: 3, icon: "🦁", label: "Lion", correctZoneId: 3 },
          { id: 4, icon: "🐻", label: "Bear", correctZoneId: 4 },
        ],
        zones: [
          { id: 1, icon: "🌊", label: "Water" },
          { id: 2, icon: "☁️", label: "Sky" },
          { id: 3, icon: "🌍", label: "Savanna" },
          { id: 4, icon: "🌲", label: "Forest" },
        ],
      },
    },
    {
      title: "Animal Memory",
      description: "Match animal pairs!",
      subjectId: science.id,
      difficultyLevel: 1,
      points: 100,
      type: "memory",
      content: {
        instructions: "Flip cards to find matching animal pairs.",
        cards: [
          { id: 1, icon: "🐶" },
          { id: 1, icon: "🐶" },
          { id: 2, icon: "🐱" },
          { id: 2, icon: "🐱" },
          { id: 3, icon: "🐭" },
          { id: 3, icon: "🐭" },
          { id: 4, icon: "🐹" },
          { id: 4, icon: "🐹" },
          { id: 5, icon: "🐰" },
          { id: 5, icon: "🐰" },
          { id: 6, icon: "🦊" },
          { id: 6, icon: "🦊" },
        ],
      },
    },
    {
      title: "Animal Rescue",
      description: "Rescue animals before time runs out!",
      subjectId: science.id,
      difficultyLevel: 2,
      points: 200,
      type: "animalrescue",
      content: {
        instructions: "Rescue animals before time runs out!",
      },
    },
    {
      title: "Science Battle RPG",
      description: "Battle monsters using science knowledge!",
      subjectId: science.id,
      difficultyLevel: 3,
      points: 300,
      type: "grammarguardian",
      content: {
        instructions: "Battle monsters using correct science answers!",
        battles: [
          { monster: "🦠", name: "Virus Villain", question: "What gives plants their green color?", correct: "Chlorophyll", options: ["Water", "Chlorophyll", "Sunlight", "Air"], hp: 100 },
          { monster: "🌋", name: "Volcano Beast", question: "What is the center of Earth called?", correct: "Core", options: ["Crust", "Mantle", "Core", "Surface"], hp: 120 },
          { monster: "⚡", name: "Lightning Lord", question: "What do we call animals that eat only plants?", correct: "Herbivores", options: ["Carnivores", "Herbivores", "Omnivores", "Insectivores"], hp: 90 },
        ],
      },
    },
    {
      title: "Nature World Odyssey",
      description: "Travel between nature locations with science puzzles!",
      subjectId: science.id,
      difficultyLevel: 3,
      points: 300,
      type: "wordworldodyssey",
      content: {
        instructions: "Travel between locations by solving science puzzles!",
        cities: [
          { id: 1, name: "Forest Zone", icon: "🌲", color: "bg-green-400", puzzle: { word: "TREE", hint: "Tall plant with leaves" } },
          { id: 2, name: "Ocean Zone", icon: "🌊", color: "bg-blue-400", puzzle: { word: "WATER", hint: "H2O" } },
          { id: 3, name: "Mountain Zone", icon: "⛰️", color: "bg-gray-400", puzzle: { word: "ROCK", hint: "Hard material from earth" } },
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
      title: "Planet Drag & Drop",
      description: "Drag planets to their correct zones!",
      subjectId: space.id,
      difficultyLevel: 1,
      points: 100,
      type: "dragdrop",
      content: {
        instructions: "Drag each planet to its correct zone.",
        items: [
          { id: 1, icon: "🪐", label: "Saturn", correctZoneId: 1 },
          { id: 2, icon: "🌍", label: "Earth", correctZoneId: 2 },
          { id: 3, icon: "🔴", label: "Mars", correctZoneId: 3 },
          { id: 4, icon: "🌕", label: "Moon", correctZoneId: 4 },
        ],
        zones: [
          { id: 1, icon: "🪐", label: "Gas Giant" },
          { id: 2, icon: "🌍", label: "Habitable" },
          { id: 3, icon: "🔴", label: "Rocky Planet" },
          { id: 4, icon: "🌕", label: "Satellite" },
        ],
      },
    },
    {
      title: "Space Memory",
      description: "Match space-themed cards!",
      subjectId: space.id,
      difficultyLevel: 1,
      points: 100,
      type: "memory",
      content: {
        instructions: "Flip cards to find matching pairs.",
        cards: [
          { id: 1, icon: "🚀" },
          { id: 1, icon: "🚀" },
          { id: 2, icon: "🌟" },
          { id: 2, icon: "🌟" },
          { id: 3, icon: "🌙" },
          { id: 3, icon: "🌙" },
          { id: 4, icon: "🪐" },
          { id: 4, icon: "🪐" },
          { id: 5, icon: "☄️" },
          { id: 5, icon: "☄️" },
          { id: 6, icon: "🌍" },
          { id: 6, icon: "🌍" },
        ],
      },
    },
    {
      title: "Space Word Builder",
      description: "Build space-related words!",
      subjectId: space.id,
      difficultyLevel: 1,
      points: 100,
      type: "wordbuilder",
      content: {
        instructions: "Arrange the letters to form the correct word.",
        words: [
          { word: "MOON", hint: "Earth's natural satellite" },
          { word: "STAR", hint: "A bright object in the night sky" },
          { word: "MARS", hint: "The Red Planet" },
          { word: "ORBIT", hint: "Path around a planet" },
        ],
      },
    },
    {
      title: "Rocket Mission",
      description: "Launch your rocket to space!",
      subjectId: space.id,
      difficultyLevel: 2,
      points: 200,
      type: "rocketmission",
      content: {
        instructions: "Launch your rocket to space! Collect stars and avoid asteroids!",
      },
    },
    {
      title: "Planet Hopper",
      description: "Jump between planets!",
      subjectId: space.id,
      difficultyLevel: 2,
      points: 200,
      type: "planethopper",
      content: {
        instructions: "Jump between planets to explore the solar system!",
      },
    },
    {
      title: "Galaxy Battle RPG",
      description: "Battle space monsters using space knowledge!",
      subjectId: space.id,
      difficultyLevel: 3,
      points: 300,
      type: "grammarguardian",
      content: {
        instructions: "Battle monsters using correct space answers!",
        battles: [
          { monster: "👽", name: "Alien Invader", question: "What is the closest planet to the Sun?", correct: "Mercury", options: ["Venus", "Mercury", "Mars", "Earth"], hp: 100 },
          { monster: "☄️", name: "Comet Crusher", question: "What is the name of our galaxy?", correct: "Milky Way", options: ["Andromeda", "Milky Way", "Whirlpool", "Sombrero"], hp: 120 },
          { monster: "🌑", name: "Eclipse Emperor", question: "What causes a solar eclipse?", correct: "Moon blocking Sun", options: ["Earth blocking Sun", "Moon blocking Sun", "Sun blocking Moon", "Stars blocking Sun"], hp: 90 },
        ],
      },
    },
    {
      title: "Galaxy World Odyssey",
      description: "Travel between planets with space puzzles!",
      subjectId: space.id,
      difficultyLevel: 3,
      points: 300,
      type: "wordworldodyssey",
      content: {
        instructions: "Travel between planets by solving space puzzles!",
        cities: [
          { id: 1, name: "Mercury Base", icon: "⚪", color: "bg-gray-400", puzzle: { word: "HOT", hint: "Closest to the Sun" } },
          { id: 2, name: "Mars Colony", icon: "🔴", color: "bg-red-400", puzzle: { word: "RED", hint: "The Red Planet" } },
          { id: 3, name: "Jupiter Station", icon: "🟠", color: "bg-orange-400", puzzle: { word: "BIG", hint: "Largest planet" } },
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
