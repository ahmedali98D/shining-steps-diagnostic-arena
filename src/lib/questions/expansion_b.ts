// Expansion bank, part B: Level 2 and Level 3.
// Every new map question names the starting point (the red YOU ARE HERE pin)
// and every route is written to match the drawn geometry exactly.
import { Question, QVisual } from "./types";
import { FW } from "./expansion_helpers";
import { mazeVisual, townMap } from "./visuals";

const MAZE_ROOMS = [
  { letter: "A", glyph: "palette" as const, label: "the art room", x: 60, y: 80 },
  { letter: "B", glyph: "book" as const, label: "the library", x: 430, y: 80 },
  { letter: "C", glyph: "ball" as const, label: "the gym", x: 60, y: 175 },
  { letter: "D", glyph: "note" as const, label: "the music room", x: 430, y: 175 },
];

const mazeLib = mazeVisual(
  "A maze with four lettered rooms: A the art room, B the library, C the gym, D the music room",
  MAZE_ROOMS
);

// Cebu map: house west of the small street, cafe east of it, library and park on the top row.
const mapCebu = townMap(
  "A town map in Cebu: a library and a park on the top row, a house and a cafe on the bottom row",
  [[0, 148, 640, 44], [300, 8, 44, 314]],
  [
    { type: "library", label: "Library", x: 40, y: 40, w: 180, h: 85 },
    { type: "park", label: "Park", x: 400, y: 40, w: 180, h: 85 },
    { type: "house", label: "House", x: 180, y: 215, w: 110, h: 70, start: true },
    { type: "cafe", label: "Cafe", x: 348, y: 215, w: 150, h: 70 },
  ],
  "Cebu"
);

// Muscat map: house at the west end, school and bank along the top row.
const mapMuscat = townMap(
  "A town map in Muscat: a school and a bank on the top row, a house, a cafe and a station on the bottom row",
  [[0, 148, 640, 44], [210, 8, 44, 314]],
  [
    { type: "school", label: "School", x: 260, y: 40, w: 150, h: 85 },
    { type: "bank", label: "Bank", x: 450, y: 40, w: 150, h: 85 },
    { type: "house", label: "House", x: 40, y: 215, w: 150, h: 70, start: true },
    { type: "cafe", label: "Cafe", x: 260, y: 215, w: 150, h: 70 },
    { type: "station", label: "Station", x: 450, y: 215, w: 150, h: 70 },
  ],
  "Muscat"
);

// Dubai map: house at the west end, cafe, library and park walking east on the top row.
const mapDubai = townMap(
  "A town map in Dubai: a cafe, a library and a park on the top row, a house, a school and a bank on the bottom row",
  [[0, 148, 640, 44], [430, 8, 44, 314]],
  [
    { type: "cafe", label: "Cafe", x: 60, y: 40, w: 170, h: 85 },
    { type: "library", label: "Library", x: 250, y: 40, w: 150, h: 85 },
    { type: "park", label: "Park", x: 480, y: 40, w: 120, h: 85 },
    { type: "house", label: "House", x: 60, y: 215, w: 170, h: 70, start: true },
    { type: "school", label: "School", x: 250, y: 215, w: 150, h: 70 },
    { type: "bank", label: "Bank", x: 480, y: 215, w: 120, h: 70 },
  ],
  "Dubai"
);

// Kyoto map: house on the right, bank, park and school walking west on the top row.
const mapKyoto = townMap(
  "A town map in Kyoto: a bank, a park and a school on the top row, a cafe and a house on the bottom row",
  [[0, 148, 640, 44], [160, 8, 44, 314]],
  [
    { type: "bank", label: "Bank", x: 40, y: 40, w: 110, h: 85 },
    { type: "park", label: "Park", x: 210, y: 40, w: 160, h: 85 },
    { type: "school", label: "School", x: 430, y: 40, w: 170, h: 85 },
    { type: "cafe", label: "Cafe", x: 210, y: 215, w: 160, h: 70 },
    { type: "house", label: "House", x: 430, y: 215, w: 170, h: 70, start: true },
  ],
  "Kyoto"
);

const A: Question[] = [
  // ---------------- L2 READING ----------------
  {
    id: "L2-R-21", skill: "reading", level: 2, unit: 1, unitTitle: "Places Around Me", lesson: 7, lessonTitle: "Follow the map",
    topic: "Following map directions", type: "mcq",
    prompt: "This map shows a street in Cebu. You are standing at the red pin marked YOU ARE HERE, outside the house. Read and follow the directions. Where do you stop?\n'Walk straight up to the main street. Turn right there. Cross the small street. On your left you will see a big green park, across the street from the cafe. Stop there.'",
    visual: mapCebu,
    options: ["At the park", "At the library", "At the cafe", "At the house"],
    answer: "At the park",
    explain: "From the red pin you go up to the main street and turn right (east). After the small street, the park is on the north side of the street - on your left - so you stop at the park.",
    wrongNotes: {
      "At the library": "The library is behind you, on the west side - the walk goes east.",
      "At the cafe": "The cafe is on the south side of the street - you pass it but do not stop.",
      "At the house": "The house is where you started.",
    },
    ...FW.app2,
  },
  {
    id: "L2-R-22", skill: "reading", level: 2, unit: 1, unitTitle: "Places Around Me", lesson: 8, lessonTitle: "Giving directions",
    topic: "Reading a longer route", type: "mcq",
    prompt: "This map shows a street in Muscat. You are standing at the red pin marked YOU ARE HERE, at the west end of the street. Read and follow the directions. Where do you stop?\n'Walk straight up to the main street. Turn right. Walk past the school - it is on your left. The bank is at the end of the street, also on your left. Stop there.'",
    visual: mapMuscat,
    options: ["At the bank", "At the school", "At the cafe", "At the station"],
    answer: "At the bank",
    explain: "From the red pin you turn right (east) onto the main street. The school and the bank are both on the north side, which is your left, and the bank is the last building - so you stop at the bank.",
    wrongNotes: {
      "At the school": "You walk past the school, but you keep going to the end of the street.",
      "At the cafe": "The cafe is on the south side, below the street - on your right, not your stop.",
      "At the station": "The station is on the right side of the street - the directions keep you on the left.",
    },
    ...FW.app2,
  },
  {
    id: "L2-R-23", skill: "reading", level: 2, unit: 2, unitTitle: "Shopping and Weather", lesson: 9, lessonTitle: "Reading: tags and notices",
    topic: "Reading a weather report", type: "mcq",
    prompt: "Read the weather report. What should you take?\n'WEATHER TODAY - Nairobi: Sunny and warm in the morning. Very hot at midday. Strong sun all day. Drink a lot of water.'",
    options: ["A sun hat and water", "A big coat", "An umbrella for rain", "Snow boots"],
    answer: "A sun hat and water",
    explain: "The report says sunny, warm and very hot with strong sun - so you need a sun hat and water. Reading a weather report and choosing what to take is the Lesson 9 skill.",
    wrongNotes: {
      "A big coat": "Coats are for cold days, not hot sunny ones.",
      "An umbrella for rain": "Nobody said rain - the day is sunny.",
      "Snow boots": "There is no snow in a hot sunny report.",
    },
    ...FW.und2,
  },
  {
    id: "L2-R-24", skill: "reading", level: 2, unit: 3, unitTitle: "My Week, My Stories", lesson: 9, lessonTitle: "Story time: the gingerbread man",
    topic: "Story event order", type: "mcq",
    prompt: "Read the four story lines. What happened LAST?\n1. Grandmother baked a small cake.\n2. The cake jumped out of the window.\n3. The horse ran after the cake.\n4. The fox ate the cake by the river.",
    options: ["Grandmother baked a small cake.", "The cake jumped out of the window.", "The horse ran after the cake.", "The fox ate the cake by the river."],
    answer: "The fox ate the cake by the river.",
    explain: "Baking comes first, then the jump, then the chase, and the fox eating the cake is the last event. Ordering four story events is the Lesson 9 skill.",
    wrongNotes: {
      "Grandmother baked a small cake.": "Baking is the first event, not the last.",
      "The cake jumped out of the window.": "The jump is second.",
      "The horse ran after the cake.": "The chase is third - the fox comes after it.",
    },
    ...FW.ana2,
  },
  // ---------------- L2 LISTENING ----------------
  {
    id: "L2-L-21", skill: "listening", level: 2, unit: 1, unitTitle: "Places Around Me", lesson: 4, lessonTitle: "Where is the park?",
    topic: "A spoken route on a city map", type: "mcq",
    prompt: "This map shows a street in Dubai. You are standing at the red pin marked YOU ARE HERE. Listen and follow the route. Where do you stop?",
    audioText: "You are standing at the red pin, next to the house. Walk straight up to the main street. Turn right. Walk past the library - it is on your left. Keep walking to the end of the street. Stop at the park at the end.",
    visual: mapDubai,
    options: ["The park", "The library", "The school", "The bank"],
    answer: "The park",
    explain: "From the red pin you turn right (east). The library is passed on your left, and the park is the last building at the end of the street - so you stop at the park.",
    wrongNotes: {
      "The library": "You walk past the library, but you keep going to the end.",
      "The school": "The school is below the street on the right - the route stops on the left side.",
      "The bank": "The bank is below the street on the right - not your stop.",
    },
    ...FW.app2,
  },
  {
    id: "L2-L-22", skill: "listening", level: 2, unit: 1, unitTitle: "Places Around Me", lesson: 6, lessonTitle: "Turn left, turn right",
    topic: "Left and right by ear", type: "mcq",
    prompt: "This map shows a street in Kyoto. You are standing at the red pin marked YOU ARE HERE. Listen. Which way do you turn?",
    audioText: "You are standing at the red pin, next to the house. Walk straight up to the main street. Then turn left. Walk past the park - it is on your right. Stop at the bank at the end of the street.",
    visual: mapKyoto,
    options: ["Turn left", "Turn right", "Do not turn", "Turn around"],
    answer: "Turn left",
    explain: "From the red pin you walk up to the main street and turn left (west). Walking west, the park and the bank are on the north side, which is your right.",
    wrongNotes: {
      "Turn right": "Turning right would take you east, away from the bank.",
      "Do not turn": "You must turn onto the main street first.",
      "Turn around": "You never turn around in these directions.",
    },
    ...FW.app2,
  },
  {
    id: "L2-L-23", skill: "listening", level: 2, unit: 2, unitTitle: "Shopping and Weather", lesson: 8, lessonTitle: "How much is it?",
    topic: "Prices in a shop dialogue", type: "mcq",
    prompt: "Listen to the shop dialogue. How much does Lucas pay?",
    speakerLines: [
      { speaker: "Customer", line: "How much is this T-shirt?" },
      { speaker: "Shop assistant", line: "The T-shirt is twenty dollars." },
      { speaker: "Customer", line: "And the cap?" },
      { speaker: "Shop assistant", line: "The cap is ten dollars." },
      { speaker: "Customer", line: "I take the T-shirt, please." },
    ],
    options: ["Ten dollars", "Twenty dollars", "Thirty dollars", "Fifteen dollars"],
    answer: "Twenty dollars",
    explain: "Lucas buys only the T-shirt, and the T-shirt is twenty dollars. Following a five-line shop dialogue is the Lesson 8 skill.",
    wrongNotes: {
      "Ten dollars": "Ten dollars is the cap - he does not buy the cap.",
      "Thirty dollars": "That is both prices together, but he buys one thing.",
      "Fifteen dollars": "Nobody said fifteen dollars.",
    },
    ...FW.und2,
  },
  {
    id: "L2-L-24", skill: "listening", level: 2, unit: 2, unitTitle: "Shopping and Weather", lesson: 3, lessonTitle: "Weather picks the clothes",
    topic: "Weather and clothes by ear", type: "mcq",
    prompt: "Listen to the weather talk. What does Elif wear today?",
    audioText: "It is snowy and very cold in Istanbul today. Elif opens the wardrobe. What does she wear? She wears her big coat and her warm boots.",
    options: ["A big coat and warm boots", "Sunglasses and a sun hat", "A swimming suit", "A T-shirt and shorts"],
    answer: "A big coat and warm boots",
    explain: "Snowy and very cold weather asks for a big coat and warm boots. Connecting the weather you hear to the right clothes is the Lesson 3 skill.",
    wrongNotes: {
      "Sunglasses and a sun hat": "Those fit hot sunny days, not snow.",
      "A swimming suit": "A swimming suit is for the pool, not a snowy street.",
      "A T-shirt and shorts": "T-shirts and shorts are for hot weather.",
    },
    ...FW.und2,
  },
  // ---------------- L2 WRITING ----------------
  {
    id: "L2-W-21", skill: "writing", level: 2, unit: 1, unitTitle: "Places Around Me", lesson: 11, lessonTitle: "Reading and writing: around my town",
    topic: "there is and there are", type: "fill",
    prompt: "Complete with is or are: 'There ___ three parks in my city.'",
    answer: "are",
    explain: "Three parks is more than one thing, so the line uses 'There are'. Lesson 11 trains there is and there are in town writing.",
    ...FW.app2,
  },
  {
    id: "L2-W-22", skill: "writing", level: 2, unit: 2, unitTitle: "Shopping and Weather", lesson: 7, lessonTitle: "Numbers to 100",
    topic: "Writing prices in words", type: "fill",
    prompt: "Complete with the price in words: 'The hat is $15. It is ___ dollars.'",
    answer: "fifteen",
    accepted: ["Fifteen"],
    explain: "$15 is fifteen dollars. Lesson 7 and 11 train reading and writing numbers to 100.",
    ...FW.rem1,
  },
  {
    id: "L2-W-23", skill: "writing", level: 2, unit: 2, unitTitle: "Shopping and Weather", lesson: 6, lessonTitle: "This, that, these, those",
    topic: "Near pointers in writing", type: "mcq",
    prompt: "You hold one book in your hand. Which line is correct?",
    options: ["This book is new.", "That book is new.", "These book is new.", "Those book is new."],
    answer: "This book is new.",
    explain: "One thing near you takes 'this': 'This book is new.' Lesson 6 trains this, that, these, those in shopping writing.",
    wrongNotes: {
      "That book is new.": "'That' is for one thing far away.",
      "These book is new.": "'These' is for many things, and 'book' is one thing.",
      "Those book is new.": "'Those' is for many things far away.",
    },
    ...FW.app2,
  },
  {
    id: "L2-W-24", skill: "writing", level: 2, unit: 3, unitTitle: "My Week, My Stories", lesson: 10, lessonTitle: "Writing: my week",
    topic: "Building a week sentence", type: "order",
    prompt: "Tap the words in the right order to build the week sentence.",
    orderTokens: ["I", "play football", "on", "Saturday."],
    answer: "I;;play football;;on;;Saturday.",
    explain: "A week sentence follows the shape: I + action + on + day - 'I play football on Saturday.' Lesson 10 trains writing the week.",
    ...FW.app2,
  },
  {
    id: "L2-W-25", skill: "writing", level: 2, unit: 1, unitTitle: "Places Around Me", lesson: 3, lessonTitle: "Next to, between, behind",
    topic: "Position words in town writing", type: "fill",
    prompt: "Complete with one position word: 'The cafe is ___ the school.' (they are side by side)",
    answer: "next to",
    accepted: ["Next to", "nextto"],
    explain: "Two buildings side by side are 'next to' each other: 'The cafe is next to the school.' Lesson 3 teaches the position set: next to, between, behind, in front of.",
    ...FW.app2,
  },
  // ---------------- L3 READING ----------------
  {
    id: "L3-R-21", skill: "reading", level: 3, unit: 2, unitTitle: "Out and About", lesson: 5, lessonTitle: "Reading: the menu",
    topic: "Reading a cafe menu", type: "mcq",
    prompt: "Read the menu. How much is the chicken adobo?",
    visual: undefined,
    options: ["Ninety pesos", "One hundred forty pesos", "One hundred sixty pesos", "Fifty pesos"],
    answer: "One hundred forty pesos",
    explain: "Under MAIN FOOD, the chicken adobo is P140, which is one hundred forty pesos. Reading a real menu with sections and prices is the Lesson 5 skill.",
    wrongNotes: {
      "Ninety pesos": "Ninety pesos is the mango shake.",
      "One hundred sixty pesos": "One hundred sixty pesos is the grilled fish.",
      "Fifty pesos": "Fifty pesos is the hot soup.",
    },
    ...FW.und1,
  },
  {
    id: "L3-R-22", skill: "reading", level: 3, unit: 2, unitTitle: "Out and About", lesson: 5, lessonTitle: "Reading: the menu",
    topic: "Comparing menu prices", type: "mcq",
    prompt: "Read the menu. Which main food costs the most?",
    visual: undefined,
    options: ["Grilled kofta", "Koshari", "Lentil soup", "Mint tea"],
    answer: "Grilled kofta",
    explain: "The grilled kofta is $9 - more than the koshari at $6, the soup at $3 and the tea at $2. Comparing prices across a menu is the Lesson 5 skill.",
    wrongNotes: {
      "Koshari": "Koshari is $6 - three dollars less than the kofta.",
      "Lentil soup": "The soup is a starter, and only $3.",
      "Mint tea": "The tea is a drink at $2 - the cheapest item.",
    },
    ...FW.ana2,
  },
  {
    id: "L3-R-23", skill: "reading", level: 3, unit: 1, unitTitle: "Personal Worlds", lesson: 11, lessonTitle: "Reading: the neighborhood notice",
    topic: "Reading a library notice", type: "mcq",
    prompt: "Read the notice. When does the library close on Friday?\n'SCHOOL LIBRARY: Open Monday to Friday, 8 in the morning to 4 in the afternoon. On Fridays we close early, at 12 in the morning. No food or drinks inside, please.'",
    options: ["At 4 in the afternoon", "At 12 in the morning", "At 8 in the morning", "It is closed on Friday"],
    answer: "At 12 in the morning",
    explain: "The notice says 'On Fridays we close early, at 12 in the morning'. Finding the exception line in a notice is the Lesson 11 skill.",
    wrongNotes: {
      "At 4 in the afternoon": "That is the normal closing time - Friday is early.",
      "At 8 in the morning": "Eight is the opening time.",
      "It is closed on Friday": "The library opens on Friday, it just closes early.",
    },
    ...FW.und2,
  },
  {
    id: "L3-R-24", skill: "reading", level: 3, unit: 1, unitTitle: "Personal Worlds", lesson: 14, lessonTitle: "Glue words: because, but, so",
    topic: "Choosing glue words", type: "mcq",
    prompt: "Choose the best glue word: 'I was very tired, ___ I went to bed early.'",
    options: ["so", "because", "but", "although"],
    answer: "so",
    explain: "Being tired is the cause, going to bed early is the result - and 'so' joins a cause to its result. Lesson 14 trains because, but and so.",
    wrongNotes: {
      "because": "'because' introduces the reason - here the tiredness comes first.",
      "but": "'but' joins opposites; tiredness and early bed are not opposites.",
      "although": "'although' shows contrast between two clauses.",
    },
    ...FW.app2,
  },
  {
    id: "L3-R-25", skill: "reading", level: 3, unit: 3, unitTitle: "Work, Study and My Town", lesson: 9, lessonTitle: "The job ad",
    topic: "Reading a short job ad", type: "mcq",
    prompt: "Read the job ad. Which days does the waiter work?\n'JOB: Waiter at the Star Cafe, Doha. Days: Wednesday to Sunday. Hours: 10 in the morning to 6 in the evening. Pay: good. Ask for Mr. Rashid.'",
    options: ["Monday to Friday", "Wednesday to Sunday", "Saturday and Sunday only", "Every day"],
    answer: "Wednesday to Sunday",
    explain: "The ad says 'Days: Wednesday to Sunday'. Pulling the exact fact from a job ad is the Lesson 9 skill.",
    wrongNotes: {
      "Monday to Friday": "The ad never says Monday or Tuesday.",
      "Saturday and Sunday only": "The job is five days, not a weekend job.",
      "Every day": "The ad names five days - not all seven.",
    },
    ...FW.und1,
  },
  // ---------------- L3 LISTENING ----------------
  {
    id: "L3-L-21", skill: "listening", level: 3, unit: 2, unitTitle: "Out and About", lesson: 9, lessonTitle: "Following directions",
    topic: "A maze route: first turn right", type: "mcq",
    prompt: "Look at the maze. You start at the red START door at the top. Listen and follow the route. Which room do you reach?",
    audioText: "Start at the red START door at the top of the maze. Go straight down to the first junction. Turn right there and go straight on. Which room do you reach?",
    visual: mazeLib,
    options: ["B - the library", "A - the art room", "C - the gym", "D - the music room"],
    answer: "B - the library",
    explain: "A right turn at the first junction leads straight to room B, the library. Turning spoken directions into moves on a map is the Lesson 9 skill.",
    wrongNotes: {
      "A - the art room": "Room A is a LEFT turn at the first junction.",
      "C - the gym": "Room C is a left turn at the SECOND junction - you turned at the first one.",
      "D - the music room": "Room D is a right turn at the second junction - you turned at the first one.",
    },
    ...FW.app2,
  },
  {
    id: "L3-L-22", skill: "listening", level: 3, unit: 2, unitTitle: "Out and About", lesson: 9, lessonTitle: "Following directions",
    topic: "A maze route: two junctions", type: "mcq",
    prompt: "Look at the maze. You start at the red START door at the top. Listen and follow the route. Which room do you reach?",
    audioText: "Start at the red START door at the top of the maze. Go straight down past the first junction. At the second junction, turn right and go straight on. Which room do you reach?",
    visual: mazeLib,
    options: ["D - the music room", "C - the gym", "B - the library", "A - the art room"],
    answer: "D - the music room",
    explain: "Straight past the first junction, then right at the second junction leads to room D, the music room. Longer routes with two junctions are the Lesson 9 skill.",
    wrongNotes: {
      "C - the gym": "Room C is a LEFT turn at the second junction.",
      "B - the library": "Room B is a right turn at the FIRST junction - you passed it.",
      "A - the art room": "Room A is a left turn at the first junction - you passed it.",
    },
    ...FW.app2,
  },
  {
    id: "L3-L-23", skill: "listening", level: 3, unit: 3, unitTitle: "Work, Study and My Town", lesson: 2, lessonTitle: "What does he do?",
    topic: "A spoken workday description", type: "mcq",
    prompt: "Listen about Amina's workday. What time does she finish work?",
    audioText: "Amina is a doctor in Muscat. She starts work at eight in the morning. She sees patients all day and finishes at four in the afternoon.",
    options: ["At eight in the morning", "At four in the afternoon", "At six in the morning", "At nine in the evening"],
    answer: "At four in the afternoon",
    explain: "The speaker says 'finishes at four in the afternoon'. Catching the finish time in a spoken workday is the Lesson 2 skill.",
    wrongNotes: {
      "At eight in the morning": "Eight is her starting time.",
      "At six in the morning": "Six was not said.",
      "At nine in the evening": "Nine was not said - she finishes at four.",
    },
    ...FW.und1,
  },
  {
    id: "L3-L-24", skill: "listening", level: 3, unit: 1, unitTitle: "Personal Worlds", lesson: 6, lessonTitle: "How often?",
    topic: "Frequency phrases by ear", type: "mcq",
    prompt: "Listen to the talk. How often does Salim swim?",
    speakerLines: [
      { speaker: "Teacher", line: "How often do you swim, Salim?" },
      { speaker: "Salim", line: "Three times a week - on Sundays, Tuesdays and Thursdays." },
    ],
    options: ["Once a week", "Twice a week", "Three times a week", "Every day"],
    answer: "Three times a week",
    explain: "Salim names three days and says 'three times a week'. Counting frequency phrases by ear is the Lesson 6 skill.",
    wrongNotes: {
      "Once a week": "Salim named three days, not one.",
      "Twice a week": "Three days is more than twice.",
      "Every day": "Monday, Wednesday, Friday and Saturday are not swim days.",
    },
    ...FW.und1,
  },
  {
    id: "L3-L-25", skill: "listening", level: 3, unit: 2, unitTitle: "Out and About", lesson: 4, lessonTitle: "At the cafe",
    topic: "Cafe order by ear", type: "mcq",
    prompt: "Listen to the cafe dialogue. What does Carmen order?",
    speakerLines: [
      { speaker: "Waiter", line: "Good evening! What can I get you?" },
      { speaker: "Carmen", line: "A lentil soup and a mint tea, please." },
      { speaker: "Waiter", line: "Would you like anything else?" },
      { speaker: "Carmen", line: "Yes - one koshari, please." },
    ],
    options: ["Soup and tea", "Soup, tea and one koshari", "One koshari only", "Soup and lemon juice"],
    answer: "Soup, tea and one koshari",
    explain: "Carmen orders a lentil soup, a mint tea, and then adds one koshari - three things. Catching an added order is the Lesson 4 skill.",
    wrongNotes: {
      "Soup and tea": "She added one more thing after the waiter asked.",
      "One koshari only": "The koshari came after the soup and tea.",
      "Soup and lemon juice": "Nobody said lemon juice.",
    },
    ...FW.und2,
  },
  {
    id: "L3-L-26", skill: "listening", level: 3, unit: 1, unitTitle: "Personal Worlds", lesson: 12, lessonTitle: "Questions, questions",
    topic: "Job questions by ear", type: "mcq",
    prompt: "Listen to the interview. Where does Marco work?",
    speakerLines: [
      { speaker: "Teacher", line: "Where do you work, Marco?" },
      { speaker: "Marco", line: "I work at the big hospital in Rome. I am a nurse." },
    ],
    options: ["At a school in Rome", "At the big hospital in Rome", "At a cafe in Rome", "At a hospital in Milan"],
    answer: "At the big hospital in Rome",
    explain: "Marco says 'I work at the big hospital in Rome'. Catching the workplace in a short interview is the Lesson 12 skill.",
    wrongNotes: {
      "At a school in Rome": "Marco is a nurse, not a teacher.",
      "At a cafe in Rome": "Nobody said a cafe.",
      "At a hospital in Milan": "The hospital is in Rome, not Milan.",
    },
    ...FW.und1,
  },
  // ---------------- L3 WRITING ----------------
  {
    id: "L3-W-21", skill: "writing", level: 3, unit: 2, unitTitle: "Out and About", lesson: 2, lessonTitle: "Some and any",
    topic: "some in positive lines", type: "fill",
    prompt: "Complete with some or any: 'There is ___ juice in the fridge.'",
    answer: "some",
    explain: "Positive lines take 'some': 'There is some juice in the fridge.' Lesson 2 trains some in positives and any in questions and negatives.",
    ...FW.app2,
  },
  {
    id: "L3-W-22", skill: "writing", level: 3, unit: 1, unitTitle: "Personal Worlds", lesson: 8, lessonTitle: "Last week, last year",
    topic: "Past simple forms", type: "fill",
    prompt: "Complete with the past form: 'Yesterday I ___ (visit) my grandmother in Alexandria.'",
    answer: "visited",
    explain: "Visit is a regular verb, so the past form adds -ed: visited. Lesson 8 trains regular past forms.",
    ...FW.app2,
  },
  {
    id: "L3-W-23", skill: "writing", level: 3, unit: 2, unitTitle: "Out and About", lesson: 15, lessonTitle: "Writing: my directions note",
    topic: "Ordering a directions note", type: "order",
    prompt: "Put the four lines of a directions note in the best order, so a stranger can follow the walk.",
    orderTokens: ["Walk to the main street.", "Turn right at the cafe.", "The school is on your left.", "Stop at the school gate."],
    answer: "Walk to the main street.;;Turn right at the cafe.;;The school is on your left.;;Stop at the school gate.",
    explain: "A good note orders the walk step by step: street first, then the turn, then what you see, and the stop comes last. Lesson 15 trains writing a note a stranger can really follow.",
    ...FW.cre3,
  },
  {
    id: "L3-W-24", skill: "writing", level: 3, unit: 2, unitTitle: "Out and About", lesson: 12, lessonTitle: "Money and prices",
    topic: "Saying bigger prices", type: "mcq",
    prompt: "The price is $12.75. Which line says it correctly?",
    options: ["Twelve dollars and seventy-five cents.", "Twelve dollars and seven five cents.", "Twelve seventy five dollars cents.", "Ten dollars and seventy-five cents."],
    answer: "Twelve dollars and seventy-five cents.",
    explain: "$12.75 is spoken 'twelve dollars and seventy-five cents'. Lesson 12 trains saying and writing prices with cents.",
    wrongNotes: {
      "Twelve dollars and seven five cents.": "Say seventy-five, not seven five.",
      "Twelve seventy five dollars cents.": "The word order is not English.",
      "Ten dollars and seventy-five cents.": "The price is twelve dollars, not ten.",
    },
    ...FW.app2,
  },
  {
    id: "L3-W-25", skill: "writing", level: 3, unit: 3, unitTitle: "Work, Study and My Town", lesson: 5, lessonTitle: "Jobs and workplaces",
    topic: "Work lines with in and at", type: "mcq",
    prompt: "Which line is written correctly?",
    options: ["She works in a hospital.", "She work in a hospital.", "She works at hospital.", "She is work in hospital."],
    answer: "She works in a hospital.",
    explain: "With she, the verb takes -s, and places take an article: 'She works in a hospital.' Lesson 5 trains job and workplace sentences.",
    wrongNotes: {
      "She work in a hospital.": "'She' needs 'works'.",
      "She works at hospital.": "Say 'in a hospital' or 'at the hospital'.",
      "She is work in hospital.": "That mixes two verb shapes.",
    },
    ...FW.app2,
  },
];

// Menu card visuals for the two Manila and Cairo menu questions.
const menuManila: QVisual = {
  kind: "card",
  alt: "A cafe menu from Manila: lumpia, hot soup, chicken adobo, grilled fish, mango shake, water",
  title: "SEA BREEZE CAFE - MANILA",
  items: [
    { group: "STARTERS" },
    { name: "Lumpia (spring rolls)", price: "P80" },
    { name: "Hot soup", price: "P50" },
    { group: "MAIN FOOD" },
    { name: "Chicken adobo", price: "P140" },
    { name: "Grilled fish", price: "P160" },
    { group: "DRINKS" },
    { name: "Mango shake", price: "P90" },
    { name: "Water", price: "P20" },
  ],
};
const menuCairo: QVisual = {
  kind: "card",
  alt: "A cafe menu from Cairo: lentil soup, fattoush salad, koshari, grilled kofta, mint tea, lemon juice",
  title: "NILE CORNER CAFE - CAIRO",
  items: [
    { group: "STARTERS" },
    { name: "Lentil soup", price: "$3" },
    { name: "Fattoush salad", price: "$4" },
    { group: "MAIN FOOD" },
    { name: "Koshari", price: "$6" },
    { name: "Grilled kofta", price: "$9" },
    { group: "DRINKS" },
    { name: "Mint tea", price: "$2" },
    { name: "Lemon juice", price: "$3" },
  ],
};
for (const q of A) {
  if (q.id === "L3-R-21") q.visual = menuManila;
  if (q.id === "L3-R-22") q.visual = menuCairo;
}

export default A;
