// Visual assignments for existing bank items + new multimodal questions.
// Every picture is checked against the exact audio/passage/options of its
// question, so the picture supports comprehension without replacing it.
import { Question, QVisual } from "./types";
import { clockVisual, frequencyStrip, mazeVisual, skyStars, townMap } from "./visuals";

// Illustrated assets generated for the platform (WebP, served from /visuals).
const IMG = {
  morningSchool: "/visuals/l0-l1-morning-school.webp",
  teacherStudent: "/visuals/l0-l3-teacher-student.webp",
  livingRoom: "/visuals/l1-r2-living-room.webp",
  bedroom: "/visuals/l1-l2-bedroom.webp",
  cafeCounter: "/visuals/l3-l3-cafe-counter.webp",
  taxiCity: "/visuals/l3-l4-taxi-city.webp",
  hospital: "/visuals/l3-r3-hospital.webp",
  tileApple: "/visuals/tile-apple.webp",
  tileBook: "/visuals/tile-book.webp",
  tileCat: "/visuals/tile-cat.webp",
  tileEgg: "/visuals/tile-egg.webp",
  tileStandUp: "/visuals/tile-stand-up.webp",
  tileSitDown: "/visuals/tile-sit-down.webp",
  tileOpenBook: "/visuals/tile-open-book.webp",
  tileCloseDoor: "/visuals/tile-close-door.webp",
  tileTouchEars: "/visuals/tile-touch-ears.webp",
  tileClapHands: "/visuals/tile-clap-hands.webp",
  tileTouchNose: "/visuals/tile-touch-nose.webp",
  tileWakeUp: "/visuals/tile-wake-up.webp",
  tileBreakfast: "/visuals/tile-breakfast.webp",
  tileSchool: "/visuals/tile-school.webp",
  tileRead: "/visuals/tile-read.webp",
  tileSunny: "/visuals/tile-sunny.webp",
  tileWindy: "/visuals/tile-windy.webp",
  tileRainy: "/visuals/tile-rainy.webp",
  tileSnowy: "/visuals/tile-snowy.webp",
  tileCoat: "/visuals/tile-coat.webp",
  tileBoots: "/visuals/tile-boots.webp",
  tileSunglasses: "/visuals/tile-sunglasses.webp",
  tileTshirt: "/visuals/tile-tshirt.webp",
  shelfBag: "/visuals/shelf-bag.webp",
  shelfCap: "/visuals/shelf-cap.webp",
  shelfBook: "/visuals/shelf-book.webp",
  shelfShirt: "/visuals/shelf-shirt.webp",
  thumbSoup: "/visuals/thumb-soup.webp",
  thumbSalad: "/visuals/thumb-salad.webp",
  thumbFish: "/visuals/thumb-fish.webp",
  thumbChickenRice: "/visuals/thumb-chicken-rice.webp",
  thumbJuice: "/visuals/thumb-juice.webp",
  thumbWater: "/visuals/thumb-water.webp",
  thumbShoes: "/visuals/thumb-shoes.webp",
  thumbSocks: "/visuals/thumb-socks.webp",
} as const;

const SCENE_AR = 1080 / 617;

function scene(alt: string, src: string): QVisual {
  return { kind: "scene", alt, src, ar: SCENE_AR };
}

function strip(alt: string, tiles: { src: string; label: string }[]): QVisual {
  return { kind: "strip", alt, tiles };
}

function card(alt: string, title: string, items: QVisual["items"]): QVisual {
  return { kind: "card", alt, title, items };
}

function shelf(alt: string, title: string, items: QVisual["items"]): QVisual {
  return { kind: "shelf", alt, title, items };
}

const V: Record<string, QVisual> = {
  // ---------------- L0 ----------------
  "L0-R-1": strip(
    "Picture strip: an apple, a book, a cat and an egg",
    [
      { src: IMG.tileApple, label: "Aa - apple" },
      { src: IMG.tileBook, label: "Bb - book" },
      { src: IMG.tileCat, label: "Cc - cat" },
      { src: IMG.tileEgg, label: "Ee - egg" },
    ]
  ),
  "L0-L-1": scene("The morning sun rising over the school", IMG.morningSchool),
  "L0-L-2": strip(
    "Classroom command cards: stand up, sit down, open the book, close the door",
    [
      { src: IMG.tileStandUp, label: "Stand up" },
      { src: IMG.tileSitDown, label: "Sit down" },
      { src: IMG.tileOpenBook, label: "Open the book" },
      { src: IMG.tileCloseDoor, label: "Close the door" },
    ]
  ),
  "L0-L-3": scene("A teacher and a young student talking", IMG.teacherStudent),
  "L0-L-4": strip(
    "Command cards: touch your ears, clap your hands, touch your nose, stand up",
    [
      { src: IMG.tileTouchEars, label: "Touch your ears" },
      { src: IMG.tileClapHands, label: "Clap your hands" },
      { src: IMG.tileTouchNose, label: "Touch your nose" },
      { src: IMG.tileStandUp, label: "Stand up" },
    ]
  ),
  "L0-L-5": skyStars("A night sky with twelve stars"),

  // ---------------- L1 ----------------
  "L1-R-1": strip(
    "Mia's day: waking up, breakfast, school, evening reading",
    [
      { src: IMG.tileWakeUp, label: "Gets up - six thirty" },
      { src: IMG.tileBreakfast, label: "Breakfast - seven" },
      { src: IMG.tileSchool, label: "School - eight" },
      { src: IMG.tileRead, label: "Reads - evening" },
    ]
  ),
  "L1-R-2": scene("Leo's living room with a sofa, a cat, a door and a bright window", IMG.livingRoom),
  "L1-L-2": scene("A bedroom with two beds, a table with a ball under it, a chair and a door", IMG.bedroom),
  "L1-L-5": clockVisual(
    "A classroom wall clock - the short hand points to three, the long hand points to twelve", 3, 0
  ),

  // ---------------- L2 ----------------
  "L2-R-1": townMap(
    "A small town map with a start house, a park, a school, a cafe and a bank",
    [[295, 150, 50, 40], [0, 148, 640, 44]],
    [
      { type: "school", label: "School", x: 40, y: 40, w: 180, h: 85 },
      { type: "park", label: "Park", x: 400, y: 40, w: 180, h: 85 },
      { type: "house", label: "START", x: 285, y: 215, w: 110, h: 70, start: true },
      { type: "cafe", label: "Cafe", x: 40, y: 215, w: 180, h: 70 },
      { type: "bank", label: "Bank", x: 400, y: 215, w: 180, h: 70 },
    ]
  ),
  "L2-R-2": card(
    "A shop price tag: shoes twenty-five dollars, sale socks three dollars",
    "SHOP TAG",
    [
      { name: "Shoes", price: "$25", src: IMG.thumbShoes },
      { name: "Socks", price: "$3", src: IMG.thumbSocks, badge: "SALE" },
    ]
  ),
  "L2-L-1": townMap(
    "A town map with a school, a park next to a bank, and a cafe",
    [[0, 148, 640, 44]],
    [
      { type: "school", label: "School", x: 60, y: 40, w: 180, h: 85 },
      { type: "park", label: "Park", x: 400, y: 40, w: 180, h: 85 },
      { type: "bank", label: "Bank", x: 400, y: 215, w: 180, h: 70 },
      { type: "cafe", label: "Cafe", x: 60, y: 215, w: 180, h: 70 },
    ]
  ),
  "L2-L-2": townMap(
    "A town map with a start house, a park, a school and a cafe",
    [[295, 150, 50, 40], [0, 148, 640, 44]],
    [
      { type: "school", label: "School", x: 40, y: 40, w: 180, h: 85 },
      { type: "park", label: "Park", x: 400, y: 40, w: 180, h: 85 },
      { type: "house", label: "START", x: 285, y: 215, w: 110, h: 70, start: true },
      { type: "cafe", label: "Cafe", x: 400, y: 215, w: 180, h: 70 },
    ]
  ),
  "L2-L-3": strip(
    "Weather pictures: sunny, windy, rainy, snowy",
    [
      { src: IMG.tileSunny, label: "Sunny" },
      { src: IMG.tileWindy, label: "Windy" },
      { src: IMG.tileRainy, label: "Rainy" },
      { src: IMG.tileSnowy, label: "Snowy" },
    ]
  ),
  "L2-L-4": shelf(
    "A shop shelf with a bag, a cap, a book and a shirt, each with a price tag",
    "TODAY'S PRICES",
    [
      { name: "Bag", price: "$12", src: IMG.shelfBag },
      { name: "Cap", price: "$20", src: IMG.shelfCap },
      { name: "Book", price: "$2", src: IMG.shelfBook },
      { name: "Shirt", price: "$30", src: IMG.shelfShirt },
    ]
  ),
  "L2-L-5": townMap(
    "A town map with a start house, a park, a library, a school, a cafe and a station",
    [[0, 148, 640, 44]],
    [
      { type: "park", label: "Park", x: 50, y: 40, w: 150, h: 85 },
      { type: "library", label: "Library", x: 245, y: 40, w: 150, h: 85 },
      { type: "school", label: "School", x: 440, y: 40, w: 150, h: 85 },
      { type: "house", label: "START", x: 50, y: 215, w: 150, h: 70, start: true },
      { type: "cafe", label: "Cafe", x: 245, y: 215, w: 150, h: 70 },
      { type: "station", label: "Station", x: 440, y: 215, w: 150, h: 70 },
    ]
  ),
  "L2-L-6": strip(
    "Clothes pictures: a coat, boots, sunglasses and a T-shirt",
    [
      { src: IMG.tileCoat, label: "A coat" },
      { src: IMG.tileBoots, label: "Boots" },
      { src: IMG.tileSunglasses, label: "Sunglasses" },
      { src: IMG.tileTshirt, label: "A T-shirt" },
    ]
  ),

  // ---------------- L3 ----------------
  "L3-L-1": frequencyStrip(
    "Frequency cards: once a week, twice a week, every day, never"
  ),
  "L3-L-2": townMap(
    "A town street with a start house, a cafe, a bank, a school opposite the bank and a station",
    [[370, 0, 40, 330], [0, 215, 640, 44]],
    [
      { type: "house", label: "START", x: 30, y: 120, w: 110, h: 70, start: true },
      { type: "cafe", label: "Cafe", x: 160, y: 120, w: 150, h: 70 },
      { type: "bank", label: "Bank", x: 430, y: 120, w: 150, h: 70 },
      { type: "school", label: "School", x: 430, y: 266, w: 150, h: 58 },
      { type: "station", label: "Station", x: 160, y: 266, w: 150, h: 58 },
    ]
  ),
  "L3-L-3": scene(
    "A cafe counter with a sandwich, fish, a green salad, an orange juice, a coffee and water",
    IMG.cafeCounter
  ),
  "L3-L-4": scene("Karim the taxi driver in the morning city", IMG.taxiCity),
  "L3-L-5": mazeVisual(
    "A maze with four lettered rooms: A the art room, B the library, C the gym, D the music room",
    [
      { letter: "A", glyph: "palette", label: "the art room", x: 60, y: 80 },
      { letter: "B", glyph: "book", label: "the library", x: 430, y: 80 },
      { letter: "C", glyph: "ball", label: "the gym", x: 60, y: 175 },
      { letter: "D", glyph: "note", label: "the music room", x: 430, y: 175 },
    ]
  ),
  "L3-R-2": card(
    "A cafe menu with starters, main food and drinks and their prices",
    "CAFE MENU",
    [
      { group: "STARTERS" },
      { name: "Tomato soup", price: "$4", src: IMG.thumbSoup },
      { name: "Green salad", price: "$5", src: IMG.thumbSalad },
      { group: "MAIN FOOD" },
      { name: "Grilled fish", price: "$12", src: IMG.thumbFish },
      { name: "Chicken rice", price: "$11", src: IMG.thumbChickenRice },
      { group: "DRINKS" },
      { name: "Orange juice", price: "$3", src: IMG.thumbJuice },
      { name: "Water", price: "$1", src: IMG.thumbWater },
    ]
  ),
  "L3-R-3": scene("Amina the nurse at the city hospital", IMG.hospital),
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
    prompt: "Look at the map. Maya is standing at the red pin marked YOU ARE HERE. Listen and follow her route. Where does Maya stop?",
    audioText: "Maya is standing at the red pin, next to the house. She walks straight up to the main street. She turns right and walks along the street, past the cafe. She stops at the building between the park and the school. Where does Maya stop?",
    visual: V["L2-L-5"],
    options: ["The library", "The cafe", "The station", "The park"],
    answer: "The library",
    explain: "From the red pin Maya turns right (east) and walks along the top row: the library sits between the park and the school, so she stops at the library. Following a spoken route from a clear starting point is the Lesson 4 and 7 skill.",
    wrongNotes: {
      "The cafe": "The cafe is below the street on the right side of her walk - she passes it but does not stop there.",
      "The station": "The station is at the far end, next to the school - not between the park and the school.",
      "The park": "The park is behind her, at the west end - the route goes east.",
    },
    bloom: "Understand", dok: 2, solo: "Multistructural", marzano: "Comprehension", ubd: "Apply", udl: "Representation", diff: 2,
  },
  {
    id: "L2-L-6", skill: "listening", level: 2, unit: 2, unitTitle: "Shopping and Weather", lesson: 3, lessonTitle: "Weather picks the clothes",
    topic: "Weather and clothes together", type: "mcq",
    prompt: "Look at the clothes and listen about Sara. What does Sara wear?",
    audioText: "Look at the clothes. Listen about Sara's day. It is rainy and a little cold in London today. What does Sara wear?",
    visual: V["L2-L-6"],
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
    prompt: "Look at the maze. You start at the red START door at the top. Listen and follow the route. Which room do you reach?",
    audioText: "Start at the red START door at the top of the maze. Go straight down to the first junction. Do not turn left or right - keep straight to the second junction. There, turn left and go straight on. Which room do you reach?",
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
