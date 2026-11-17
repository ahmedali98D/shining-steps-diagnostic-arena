// Teacher-conducted speaking interview kits.
// Speaking is assessed live by a teacher-examiner, following the same adaptive ladder
// logic as the digital exam: start at the likely level, move up on success, drop and
// re-assess on struggle, confirm, then score six criteria on a 0-4 anchor scale.

export interface CriterionKey {
  key: "fluency" | "pronunciation" | "vocabulary" | "grammarAccuracy" | "comprehension" | "conversation";
  label: string;
  hint: string;
}

export const CRITERIA: CriterionKey[] = [
  { key: "fluency", label: "Fluency", hint: "Flow, pace, hesitation" },
  { key: "pronunciation", label: "Pronunciation", hint: "Sounds, stress, clarity" },
  { key: "vocabulary", label: "Vocabulary", hint: "Range and precision of words" },
  { key: "grammarAccuracy", label: "Grammar", hint: "Accuracy of structures" },
  { key: "comprehension", label: "Comprehension", hint: "Understanding the examiner" },
  { key: "conversation", label: "Conversation", hint: "Turn-taking, repair, appropriacy" },
];

// 0-4 anchors, aligned to the Shining Steps ladder (L0 Pre-A1 ... L8 B2+).
export const CRITERIA_ANCHORS: string[] = [
  "0 - Pre-A1: single words and memorized chunks, heavy support needed",
  "1 - A1: short isolated phrases, frequent pauses, basic words",
  "2 - A2: simple connected sentences on familiar topics, some errors",
  "3 - B1: sustained talk on everyday topics, rephrases when stuck",
  "4 - B2+: extended, precise and confident speech, self-corrects smoothly",
];

export interface InterviewPrompt {
  prompt: string;
  from: string; // the book unit and lesson this prompt comes from
  listenFor: string; // what the examiner should hear at this level
}

export interface InterviewKit {
  level: number;
  cefr: string;
  title: string;
  warmup: string;
  prompts: InterviewPrompt[];
  upCue: string;
  downCue: string;
}

export const INTERVIEW_KITS: InterviewKit[] = [
  {
    level: 0,
    cefr: "Pre-A1",
    title: "First words interview",
    warmup: "Smile and wave: 'Hello!' Wait for the greeting. Point to yourself: 'I am Ms ...'. Offer the hand signal for 'your turn'.",
    prompts: [
      { prompt: "Say hello and tell me your name.", from: "L0 U1 L1-L2: Hello! Four magic words / I am ...", listenFor: "Hello + 'I am (name)' with or without support" },
      { prompt: "Introduce your friend next to you.", from: "L0 U1 L3: This is ... (meet a friend)", listenFor: "'This is ...' with the friend's name" },
      { prompt: "Show me: stand up, open your book, touch your nose.", from: "L0 U1 L4-L5: Classroom words 1 and 2", listenFor: "Body responds to commands without translation" },
      { prompt: "How old are you?", from: "L0 U1 L11: Numbers 11-20 + How old are you?", listenFor: "'I am (number)'" },
    ],
    upCue: "If the student answers all four without help and volunteers extra words, continue with the Level 1 kit.",
    downCue: "If the student needs a model for every answer, stay at Level 0 and record the support given.",
  },
  {
    level: 1,
    cefr: "A1",
    title: "My days interview",
    warmup: "Good morning! How are you today?",
    prompts: [
      { prompt: "Tell me about your day. What time do you get up? What do you do after school?", from: "L1 U1 L4-L6: My morning / My afternoon and evening / I get up at six thirty", listenFor: "Four routine verbs in order with times" },
      { prompt: "Tell me about your family and your home. Who is in it? What is your favorite room?", from: "L1 U2 L1-L5: My bigger family / I have got / Rooms of my home", listenFor: "Family words, have got, there is / there are" },
      { prompt: "What food do you like? What food do you not like? Why?", from: "L1 U3 L3-L4: I like / I don't like / Do you like ...?", listenFor: "like + food words, yes/no reasons" },
      { prompt: "Can you cook? Can you swim? Ask me two Can you ...? questions.", from: "L1 U3 L7-L8: I can / Can you ...?", listenFor: "can / can't with activities, question form" },
    ],
    upCue: "Full sentences with times and a because-reason? Move to the Level 2 kit.",
    downCue: "Single words and heavy pauses? Drop to the Level 0 kit and confirm.",
  },
  {
    level: 2,
    cefr: "A1+",
    title: "My town interview",
    warmup: "Hi! Tell me about one thing you did this morning.",
    prompts: [
      { prompt: "Where do you live? What places are near your home?", from: "L2 U1 L1-L5: Places in town / There is There are / My neighborhood", listenFor: "There is / There are with place words" },
      { prompt: "Give me directions from your home to the nearest shop.", from: "L2 U1 L6-L8: Turn left turn right / Follow the map / Giving directions", listenFor: "Turn left, go straight, next to, behind" },
      { prompt: "Roleplay: I am the shopkeeper. Buy one thing from me and ask the price.", from: "L2 U2 L5-L10: I want / I would like / How much is it? / The shop dialog", listenFor: "would like, please and thank you, price words" },
      { prompt: "What is the weather like today? What do you wear in winter?", from: "L2 U2 L2-L4: Weather / Weather picks the clothes / The four seasons", listenFor: "Weather words + clothing choices" },
    ],
    upCue: "Directions in three clear steps with position words? Move to Level 3.",
    downCue: "Cannot sustain a four-line shop exchange? Confirm at Level 1.",
  },
  {
    level: 3,
    cefr: "A2",
    title: "My life and my town interview",
    warmup: "Describe what you did before you came here today.",
    prompts: [
      { prompt: "Describe your best friend: what does he or she look like? What is he or she like?", from: "L3 U1 L1-L2: My family / What does he look like?", listenFor: "Appearance and character words in linked phrases" },
      { prompt: "How often do you study English? Walk me through your study routine.", from: "L3 U1 L5-L7: My day / How often? / My day on the clock", listenFor: "always, usually, sometimes, never + clock times" },
      { prompt: "Roleplay: order your favorite meal in a cafe, then ask me where the station is.", from: "L3 U2 L4 / L8-L9: At the cafe / Asking the way / Following directions", listenFor: "Full cafe chain, three-step directions" },
      { prompt: "What do you want to be? Why?", from: "L3 U3 L3: What do you want to be?", listenFor: "Dream job + because-reason" },
    ],
    upCue: "Glue words (because, but, so) appear naturally? Move to Level 4.",
    downCue: "Verbs break down in the routine answer? Confirm at Level 2.",
  },
  {
    level: 4,
    cefr: "A2+",
    title: "My past and my plans interview",
    warmup: "Tell me one thing you did last weekend.",
    prompts: [
      { prompt: "Tell me about your first day at this school. What happened? How did you feel?", from: "L4 U1 L7 / L10 / L13: My first day / A special day / Past feelings", listenFor: "Past simple in order with feeling words" },
      { prompt: "Roleplay: you lost your bag at the station. Report the problem to me and ask for help.", from: "L4 U2 L8-L9: A travel problem / Polite help", listenFor: "Clear problem description + polite request" },
      { prompt: "Have you ever traveled to another city? Tell me about it, and tell me one plan you have.", from: "L4 U3 L1-L2: Have you ever ...? / The present perfect", listenFor: "Present perfect experience + going to plan" },
      { prompt: "What did you do yesterday that you will do differently next time?", from: "L4 U1 L8: Then and now", listenFor: "Past vs present contrast" },
    ],
    upCue: "Past, present perfect and plans all appear with control? Move to Level 5.",
    downCue: "Did you ...? forms break down? Confirm at Level 3.",
  },
  {
    level: 5,
    cefr: "B1",
    title: "My stories and my voice interview",
    warmup: "Tell me about a moment this month that made you laugh.",
    prompts: [
      { prompt: "Tell me a two-minute true story: what happened, where, and how it ended.", from: "L5 U1 L1-L5: Story starters / While it was happening / When and while / The story glue", listenFor: "Past continuous + past simple, time linkers" },
      { prompt: "Give me your opinion: is it better to study alone or in a group? Defend it, then respond when I disagree.", from: "L5 U2 L1-L5: What do you think? / Agree to disagree", listenFor: "Opinion + reasons + polite disagreement" },
      { prompt: "Roleplay: your internet stopped working. Call me, report the problem, and negotiate a solution.", from: "L5 U3 L5-L8: On the phone / The service call / Negotiating solutions", listenFor: "Six-line phone exchange, problem-action-promise" },
      { prompt: "If your plan for next summer fails, what will you do instead?", from: "L5 U5 L4 / L11: If it rains / What happens if?", listenFor: "First conditional if-plans" },
    ],
    upCue: "Story holds two minutes with linked events and a reaction? Move to Level 6.",
    downCue: "Past continuous missing or the phone call collapses? Confirm at Level 4.",
  },
  {
    level: 6,
    cefr: "B1+",
    title: "My case and my news interview",
    warmup: "Tell me about a person you admire and why.",
    prompts: [
      { prompt: "Here is a motion: 'Homework should be optional.' Give your position and answer my challenge.", from: "L6 U2 L2 / L7: I see your point but ... / Phones in school: for and against", listenFor: "Concession + two supported arguments" },
      { prompt: "Summarize a news story you know for a child, then for your headteacher. Same facts, different listener.", from: "L6 U4 L9: Relay it simply", listenFor: "Register change, main points kept" },
      { prompt: "An indirect question round: ask me three polite questions with Could you tell me ...? and Would you mind ...?", from: "L6 U5 L3-L4: Could you tell me ...? / Would you mind ...?", listenFor: "Correct indirect word order" },
      { prompt: "Describe one custom from your family that surprises visitors, and compare it with another culture.", from: "L6 U5 L1 / L6 / L8: Same and different / Both and neither / Table manners and taboos", listenFor: "Comparisons with both, neither, respect" },
    ],
    upCue: "Arguments carry evidence and the register switch is controlled? Move to Level 7.",
    downCue: "Although / however confusion or passive errors dominate? Confirm at Level 5.",
  },
  {
    level: 7,
    cefr: "B2",
    title: "My view and my evidence interview",
    warmup: "Pitch one change you would make to this school - in thirty seconds.",
    prompts: [
      { prompt: "Deliver a one-minute case for or against: 'Cities should ban private cars from the center.' Hedge one claim, boost one, concede one point, then rebut mine.", from: "L7 U1 L2-L5: Hedging / Boosting / Concession / Rebuttal", listenFor: "All five debate moves with a named source" },
      { prompt: "I will state a claim from a made-up article. Detect the stance, neutralize one loaded phrase, and paraphrase it.", from: "L7 U2 L3-L5: The writer's stance / Attribution verbs / Paraphrase", listenFor: "Stance detection + clean paraphrase" },
      { prompt: "Here are three numbers about our center. Present them for one minute with trend verbs and one cause.", from: "L7 U4 L2-L3 / L11: Trend verbs / Adverbs of change / Why numbers moved", listenFor: "Exact trend language + cause link" },
      { prompt: "If the island's water supply failed next year, what would you do? Build a two-step hypothetical chain.", from: "L7 U5 L2-L3 / L7: If we would ... / If we had ... / Cause chains", listenFor: "Second and third conditionals under control" },
    ],
    upCue: "Hedged claims, cited evidence and conditionals all land? Move to Level 8.",
    downCue: "Overclaiming or broken conditionals dominate? Confirm at Level 6.",
  },
  {
    level: 8,
    cefr: "B2+",
    title: "My voice, my craft interview",
    warmup: "Introduce the position you defended in your last debate - in one signposted sentence.",
    prompts: [
      { prompt: "Formal debate round: I give you a motion. Build a case with signposting, one named source, and a whereas-sentence; then answer my rebuttal in three beats.", from: "L8 U1 L2-L5: Signposting / Evidence in speech / Advanced concession / The rebuttal machine", listenFor: "Signposted case, citation, three-beat rebuttal" },
      { prompt: "Mediation: I will read two short disagreeing texts. Explain where they meet, where they split, and for whom each text works.", from: "L8 U2 L8-L9: Mediation I and II", listenFor: "Both claims kept intact, gap named" },
      { prompt: "Negotiation table: you want the training budget moved to a project. Find my interest, make offers and counters with exact conditionals, and close a deal.", from: "L8 U3 L9-L11: Interests vs positions / Conditionals close deals / The negotiation table", listenFor: "Interest-based offers, conditional forms" },
      { prompt: "Symposium defense: present your research question and method in one minute, then answer two hard questions with sources.", from: "L8 U6 L2-L3 / L12: Topic to question / The method plan / Defense preparation", listenFor: "Research register, hedged answers, named limits" },
    ],
    upCue: "Consistent B2+ control across all four tasks - the student is ready for Gate L8 and beyond.",
    downCue: "Formal register slips into informal mid-task? Confirm at Level 7.",
  },
];

export function kitFor(level: number): InterviewKit {
  const clamped = Math.max(0, Math.min(8, Math.round(level)));
  return INTERVIEW_KITS[clamped];
}

export function cefrOfLevel(level: number): string {
  const clamped = Math.max(0, Math.min(10, Math.round(level)));
  const map = ["Pre-A1", "A1", "A1+", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+"];
  return map[clamped];
}
