// Visual assignments for existing bank items + new multimodal questions.
// Every picture is checked against the exact audio/passage/options of its
// question, so the picture supports comprehension without replacing it.
import { Question, QVisual } from "./types";
import { cardVisual, clockVisual, mazeVisual, sceneVisual, stripVisual, townMap } from "./visuals";

const V: Record<string, QVisual> = {
  // ---------------- L0 ----------------
  "L0-R-1": stripVisual(
    "Picture strip: an apple, a book, a cat and an egg",
    [
      { emoji: "🍎", label: "Aa - apple" },
      { emoji: "📖", label: "Bb - book" },
      { emoji: "🐱", label: "Cc - cat" },
      { emoji: "🥚", label: "Ee - egg" },
    ]
  ),
  "L0-L-1": sceneVisual(
    "The morning sun rising over the school", { top: "#FFF3D6", bottom: "#E4F2EE" },
    [
      { emoji: "☀️", label: "the morning sun", x: 200, y: 90, size: 54 },
      { emoji: "🏫", label: "the school", x: 320, y: 190, size: 62 },
      { emoji: "🎒", label: "", x: 470, y: 195, size: 40 },
    ]
  ),
  "L0-L-2": stripVisual(
    "Classroom command cards: stand up, sit down, open the book, close the door",
    [
      { emoji: "🧍", label: "Stand up" },
      { emoji: "🪑", label: "Sit down" },
      { emoji: "📖", label: "Open the book" },
      { emoji: "🚪", label: "Close the door" },
    ]
  ),
  "L0-L-3": sceneVisual(
    "A teacher and a young student talking", { top: "#EFE9F7", bottom: "#FDF6EA" },
    [
      { emoji: "👩‍🏫", label: "Teacher", x: 180, y: 150, size: 56 },
      { emoji: "🧒", label: "Adam", x: 460, y: 150, size: 56 },
    ]
  ),
  "L0-L-4": stripVisual(
    "Command cards: touch your ears, clap your hands, touch your nose, stand up",
    [
      { emoji: "👂", label: "Touch your ears" },
      { emoji: "👏", label: "Clap your hands" },
      { emoji: "👃", label: "Touch your nose" },
      { emoji: "🧍", label: "Stand up" },
    ]
  ),
  "L0-L-5": sceneVisual(
    "A night sky with twelve stars", { top: "#31406E", bottom: "#31406E" },
    [
      { emoji: "⭐", x: 120, y: 100 }, { emoji: "⭐", x: 260, y: 100 }, { emoji: "⭐", x: 400, y: 100 }, { emoji: "⭐", x: 540, y: 100 },
      { emoji: "⭐", x: 120, y: 175 }, { emoji: "⭐", x: 260, y: 175 }, { emoji: "⭐", x: 400, y: 175 }, { emoji: "⭐", x: 540, y: 175 },
      { emoji: "⭐", x: 120, y: 250 }, { emoji: "⭐", x: 260, y: 250 }, { emoji: "⭐", x: 400, y: 250 }, { emoji: "⭐", x: 540, y: 250 },
    ]
  ),

  // ---------------- L1 ----------------
  "L1-R-1": stripVisual(
    "Mia's day: waking up, breakfast, school, evening reading",
    [
      { emoji: "🌅", label: "gets up - six thirty" },
      { emoji: "🥣", label: "breakfast - seven" },
      { emoji: "🎒", label: "school - eight" },
      { emoji: "📖", label: "reads - evening" },
    ]
  ),
  "L1-R-2": sceneVisual(
    "Leo's living room with a sofa, a door and a bright window", { top: "#E4F2EE", bottom: "#FDF6EA" },
    [
      { emoji: "🪟", label: "the window", x: 480, y: 110, size: 44 },
      { emoji: "🛋️", label: "the sofa", x: 300, y: 210, size: 62 },
      { emoji: "🐱", x: 300, y: 178, size: 30 },
      { emoji: "🚪", label: "the door", x: 110, y: 190, size: 46 },
    ]
  ),
  "L1-L-2": sceneVisual(
    "A bedroom with two beds, a table with a ball under it, a chair and a door", { top: "#EFE9F7", bottom: "#FDF6EA" },
    [
      { emoji: "🛏️", label: "the beds", x: 80, y: 205, size: 44 },
      { emoji: "🛏️", x: 160, y: 205, size: 44 },
      { emoji: "🚪", label: "the door", x: 575, y: 195, size: 46 },
      { emoji: "🪑", label: "the chair", x: 455, y: 195, size: 42 },
      { emoji: "⚽", x: 330, y: 252, size: 32 },
    ],
    330,
    `<rect x="270" y="200" width="130" height="12" rx="4" fill="#B08968"/>`
    + `<rect x="278" y="212" width="10" height="46" fill="#B08968"/>`
    + `<rect x="382" y="212" width="10" height="46" fill="#B08968"/>`
    + `<text x="335" y="196" text-anchor="middle" font-size="13" font-weight="700" fill="#8A7B63" font-family="'Baloo 2','Segoe UI',sans-serif">the table</text>`
  ),
  "L1-L-5": clockVisual(
    "A classroom wall clock - the short hand points to three, the long hand points to twelve", 3, 0
  ),

  // ---------------- L2 ----------------
  "L2-R-1": townMap(
    "A small town map with a start house, a park, a school, a cafe and a bank",
    [[295, 150, 50, 40], [0, 148, 640, 44]],
    [
      { emoji: "🏫", label: "School", x: 40, y: 40, w: 180, h: 85 },
      { emoji: "🌳", label: "Park", x: 400, y: 40, w: 180, h: 85 },
      { emoji: "🏠", label: "START", x: 285, y: 215, w: 110, h: 70 },
      { emoji: "☕", label: "Cafe", x: 40, y: 215, w: 180, h: 70 },
      { emoji: "🏦", label: "Bank", x: 400, y: 215, w: 180, h: 70 },
    ]
  ),
  "L2-R-2": cardVisual(
    "A shop price tag: shoes twenty-five dollars, sale socks three dollars",
    "🏷️ SHOP TAG", [{ head: "SHOES", text: "$25" }, { head: "SALE", text: "socks - $3" }]
  ),
  "L2-L-1": townMap(
    "A town map with a school, a park next to a bank, and a cafe",
    [[0, 148, 640, 44]],
    [
      { emoji: "🏫", label: "School", x: 60, y: 40, w: 180, h: 85 },
      { emoji: "🌳", label: "Park", x: 400, y: 40, w: 180, h: 85 },
      { emoji: "🏦", label: "Bank", x: 400, y: 215, w: 180, h: 70 },
      { emoji: "☕", label: "Cafe", x: 60, y: 215, w: 180, h: 70 },
    ]
  ),
  "L2-L-2": townMap(
    "A town map with a start house, a park, a school and a cafe",
    [[295, 150, 50, 40], [0, 148, 640, 44]],
    [
      { emoji: "🏫", label: "School", x: 40, y: 40, w: 180, h: 85 },
      { emoji: "🌳", label: "Park", x: 400, y: 40, w: 180, h: 85 },
      { emoji: "🏠", label: "START", x: 285, y: 215, w: 110, h: 70 },
      { emoji: "☕", label: "Cafe", x: 400, y: 215, w: 180, h: 70 },
    ]
  ),
  "L2-L-3": stripVisual(
    "Weather pictures: sunny, windy, rainy, snowy",
    [
      { emoji: "☀️", label: "sunny" },
      { emoji: "🌬️", label: "windy" },
      { emoji: "🌧️", label: "rainy" },
      { emoji: "❄️", label: "snowy" },
    ]
  ),
  "L2-L-4": sceneVisual(
    "A shop shelf with a bag, a cap, a book and a shirt, each with a price tag", { top: "#FFF3D6", bottom: "#FDF6EA" },
    [
      { emoji: "🛍️", label: "bag - $12", x: 130, y: 170, size: 48 },
      { emoji: "🧢", label: "cap - $20", x: 270, y: 170, size: 48 },
      { emoji: "📖", label: "book - $2", x: 410, y: 170, size: 48 },
      { emoji: "👕", label: "shirt - $30", x: 550, y: 170, size: 48 },
    ]
  ),
  "L2-L-5": townMap(
    "A town map with a start house, a park, a library, a school, a cafe and a station",
    [[0, 148, 640, 44]],
    [
      { emoji: "🌳", label: "Park", x: 50, y: 40, w: 150, h: 85 },
      { emoji: "📚", label: "Library", x: 245, y: 40, w: 150, h: 85 },
      { emoji: "🏫", label: "School", x: 440, y: 40, w: 150, h: 85 },
      { emoji: "🏠", label: "START", x: 50, y: 215, w: 150, h: 70 },
      { emoji: "☕", label: "Cafe", x: 245, y: 215, w: 150, h: 70 },
      { emoji: "🚉", label: "Station", x: 440, y: 215, w: 150, h: 70 },
    ]
  ),
  "L2-L-6": stripVisual(
    "Clothes pictures: a coat, boots, sunglasses and a T-shirt",
    [
      { emoji: "🧥", label: "a coat" },
      { emoji: "🥾", label: "boots" },
      { emoji: "🕶️", label: "sunglasses" },
      { emoji: "👕", label: "a T-shirt" },
    ],
    210
  ),

  // ---------------- L3 ----------------
  "L3-L-1": stripVisual(
    "Frequency cards: once a week, twice a week, every day, never",
    [
      { emoji: "1️⃣", label: "once a week" },
      { emoji: "2️⃣", label: "twice a week" },
      { emoji: "🔁", label: "every day" },
      { emoji: "🚫", label: "never" },
    ]
  ),
  "L3-L-2": townMap(
    "A town street with a start house, a cafe, a bank, a school opposite the bank and a station",
    [[370, 0, 40, 330], [0, 215, 640, 44]],
    [
      { emoji: "🏠", label: "START", x: 30, y: 120, w: 110, h: 70 },
      { emoji: "☕", label: "Cafe", x: 160, y: 120, w: 150, h: 70 },
      { emoji: "🏦", label: "Bank", x: 430, y: 120, w: 150, h: 70 },
      { emoji: "🏫", label: "School", x: 430, y: 272, w: 150, h: 52 },
      { emoji: "🚉", label: "Station", x: 160, y: 272, w: 150, h: 52 },
    ]
  ),
  "L3-L-3": sceneVisual(
    "A cafe counter with a sandwich, fish, a green salad, an orange juice, a coffee and water", { top: "#FFF3D6", bottom: "#FDF6EA" },
    [
      { emoji: "🥪", label: "sandwich", x: 110, y: 140, size: 44 },
      { emoji: "🐟", label: "fish", x: 240, y: 140, size: 44 },
      { emoji: "🥗", label: "green salad", x: 380, y: 140, size: 44 },
      { emoji: "🧃", label: "orange juice", x: 520, y: 140, size: 44 },
      { emoji: "☕", label: "coffee", x: 180, y: 255, size: 44 },
      { emoji: "💧", label: "water", x: 340, y: 255, size: 44 },
    ]
  ),
  "L3-L-4": sceneVisual(
    "Karim the taxi driver in the morning city", { top: "#FFF3D6", bottom: "#EDE4D2" },
    [
      { emoji: "🌅", label: "the morning sky", x: 160, y: 100, size: 50 },
      { emoji: "🏙️", label: "the city", x: 460, y: 110, size: 54 },
      { emoji: "🚕", label: "Karim's taxi", x: 320, y: 230, size: 60 },
    ]
  ),
  "L3-L-5": mazeVisual(
    "A maze with four lettered rooms: A the art room, B the library, C the gym, D the music room",
    [
      { letter: "A", emoji: "🎨", label: "the art room", x: 60, y: 80 },
      { letter: "B", emoji: "📚", label: "the library", x: 430, y: 80 },
      { letter: "C", emoji: "🏀", label: "the gym", x: 60, y: 175 },
      { letter: "D", emoji: "🎵", label: "the music room", x: 430, y: 175 },
    ]
  ),
  "L3-R-2": cardVisual(
    "A cafe menu with starters, main food and drinks and their prices",
    "📋 CAFE MENU",
    [
      { head: "STARTERS", text: "tomato soup $4 - green salad $5" },
      { head: "MAIN FOOD", text: "grilled fish $12 - chicken rice $11" },
      { head: "DRINKS", text: "orange juice $3 - water $1" },
    ]
  ),
  "L3-R-3": sceneVisual(
    "Amina the nurse at the city hospital", { top: "#E4F2EE", bottom: "#FDF6EA" },
    [
      { emoji: "🏥", label: "the city hospital", x: 320, y: 120, size: 66 },
      { emoji: "👩‍⚕️", label: "Amina the nurse", x: 140, y: 230, size: 52 },
      { emoji: "🩺", x: 500, y: 230, size: 44 },
    ]
  ),
};

// New multimodal items: audio + picture together (UDL Representation).
const EXTRA: Question[] = [
  {
    id: "L0-L-5", skill: "listening", level: 0, unit: 1, unitTitle: "First Words, First Class", lesson: 11, lessonTitle: "Numbers 11 to 20 + How old are you?",
    topic: "Counting 11 to 20 from a picture", type: "mcq",
    prompt: "Look at the night sky and listen. How many stars do you see?",
    audioText: "Look at the night sky. Count the stars with your eyes, one by one. How many stars do you see?",
    visual: V["L0-L-5"],
    options: ["Ten", "Eleven", "Twelve", "Thirteen"],
    answer: "Twelve",
    explain: "Count the stars: three rows with four stars in each row make twelve. Counting things you can see, from eleven to twenty, is the Lesson 11 skill.",
    wrongNotes: {
      "Ten": "Count again slowly - there are more than ten.",
      "Eleven": "Eleven is close, but the sky has one more.",
      "Thirteen": "Thirteen is one too many.",
    },
    bloom: "Remember", dok: 1, solo: "Unistructural", marzano: "Retrieval", ubd: "Explain", udl: "Representation", diff: 1,
  },
  {
    id: "L1-L-5", skill: "listening", level: 1, unit: 1, unitTitle: "Me and My Days", lesson: 3, lessonTitle: "What time is it?",
    topic: "Clock times by ear and by eye", type: "mcq",
    prompt: "Look at the clock and listen. What time is it?",
    audioText: "Look at the clock. The short hand points to three. The long hand points to twelve. What time is it?",
    visual: V["L1-L-5"],
    options: ["Three o'clock", "Six o'clock", "Nine o'clock", "Twelve o'clock"],
    answer: "Three o'clock",
    explain: "The short hand on three and the long hand on twelve means three o'clock exactly. Matching spoken hand positions to a clock face is the Lesson 3 skill.",
    wrongNotes: {
      "Six o'clock": "At six o'clock the short hand points to six.",
      "Nine o'clock": "At nine o'clock the short hand points to nine.",
      "Twelve o'clock": "At twelve o'clock the short hand points to twelve.",
    },
    bloom: "Understand", dok: 1, solo: "Unistructural", marzano: "Comprehension", ubd: "Explain", udl: "Representation", diff: 1,
  },
  {
    id: "L2-L-5", skill: "listening", level: 2, unit: 1, unitTitle: "Places Around Me", lesson: 4, lessonTitle: "Where is the park?",
    topic: "A spoken route on a town map", type: "mcq",
    prompt: "Look at the map and listen. Where does Maya stop?",
    audioText: "Maya is at the house. She goes straight to the street, then turns right. She stops at the building between the park and the school. Where does Maya stop?",
    visual: V["L2-L-5"],
    options: ["The library", "The cafe", "The station", "The park"],
    answer: "The library",
    explain: "The library sits between the park and the school on the map, so Maya stops at the library. Following a spoken route on a picture map is the Lesson 4 and 7 skill.",
    wrongNotes: {
      "The cafe": "The cafe is next to the START house, not between the park and the school.",
      "The station": "The station is next to the school, but it is not between the park and the school.",
      "The park": "The park is at the end of the row - Maya stops at the building between the park and the school.",
    },
    bloom: "Understand", dok: 2, solo: "Multistructural", marzano: "Comprehension", ubd: "Apply", udl: "Representation", diff: 2,
  },
  {
    id: "L2-L-6", skill: "listening", level: 2, unit: 2, unitTitle: "Shopping and Weather", lesson: 3, lessonTitle: "Weather picks the clothes",
    topic: "Weather and clothes together", type: "mcq",
    prompt: "Look at the clothes and listen about Sara. What does Sara wear?",
    audioText: "Look at the clothes. Listen about Sara's day. It is rainy and a little cold in London today. What does Sara wear?",
    visual: V["L2-L-3"],
    options: ["A coat and boots", "Sunglasses and a sun hat", "A T-shirt", "A swimming suit"],
    answer: "A coat and boots",
    explain: "Rainy and cold weather asks for a coat and boots. Connecting the weather you hear to the right clothes is the Lesson 3 skill.",
    wrongNotes: {
      "Sunglasses and a sun hat": "Sunglasses fit sunny weather, not rainy weather.",
      "A T-shirt": "A T-shirt is for warm weather.",
      "A swimming suit": "A swimming suit is for the beach or the pool, not a rainy day.",
    },
    bloom: "Understand", dok: 2, solo: "Multistructural", marzano: "Comprehension", ubd: "Apply", udl: "Representation", diff: 2,
  },
  {
    id: "L3-L-5", skill: "listening", level: 3, unit: 2, unitTitle: "Out and About", lesson: 9, lessonTitle: "Following directions",
    topic: "A spoken route through a maze", type: "mcq",
    prompt: "Look at the maze and listen. Which room do you reach?",
    audioText: "Look at the maze. Start at the door. Go straight to the first junction. Do not turn left or right - keep straight to the second junction. There, turn left and go straight on. Which room do you reach?",
    visual: V["L3-L-5"],
    options: ["C - the gym", "A - the art room", "B - the library", "D - the music room"],
    answer: "C - the gym",
    explain: "Straight past the first junction, then left at the second junction leads to room C, the gym. Turning spoken directions into moves on a map is the Lesson 9 skill.",
    wrongNotes: {
      "A - the art room": "Room A is a left turn at the FIRST junction - you keep straight there.",
      "B - the library": "Room B is a right turn at the first junction - the route never turns right.",
      "D - the music room": "Room D is a right turn at the second junction - the route turns left there.",
    },
    bloom: "Apply", dok: 2, solo: "Relational", marzano: "Knowledge Utilization", ubd: "Apply", udl: "Representation", diff: 2,
  },
];

export function extraQuestionsForLevel(level: number): Question[] {
  return EXTRA.filter((q) => q.level === level);
}

export function visualFor(id: string): QVisual | undefined {
  return V[id];
}
