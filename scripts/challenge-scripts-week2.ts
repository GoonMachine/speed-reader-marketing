/**
 * Week 2 TikTok script variations for the VerticalChallenge format.
 * Mixed creative directions: Educational, Relatable, and Provocative.
 * Each script has its own text + WPM segments.
 */

import { ChallengeScript } from "./challenge-scripts";

// ─────────────────────────────────────────────
// MONDAY — "Why You Can Read Scrambled Words" (Educational)
// ─────────────────────────────────────────────
export const TYPOGLYCEMIA_TEST: ChallengeScript = {
  id: "TypoglycemiaTest",
  title: "Why you can read scrambled words",
  style: "terminal",
  text: `Aoccdrnig to rscheearch at Cmabrigde Uinervtisy it deosn't mttaer in waht oredr the ltteers in a wrod are. The olny iprmoatnt tihng is taht the frist and lsat ltteer be in the rghit pclae. You just read that perfectly. This is called typoglycemia and it reveals something incredible about how your brain actually processes text. You don't read letters. You read shapes. Your fusiform gyrus a region in your visual cortex has spent years building a library of word patterns. When you see a familiar word your brain matches the overall shape rather than decoding individual letters. This is why typos are so hard to catch in your own writing. Your brain autocorrects in real time. Now here's where it gets interesting. Most people think reading faster means processing letters faster. Wrong. Reading faster means recognizing word patterns faster. The RSVP method works because it forces your brain to rely on pattern recognition instead of letter-by-letter decoding. Right now you're reading faster than you've ever read before. And you're not missing anything. Studies show that proficient readers only fixate on about 60 percent of words. Your peripheral vision and predictive processing fill in the rest. Your brain is essentially autocomplete for reading. We're hitting 850 words per minute now. You're still understanding everything. That's not because you got smarter in the last 30 seconds. It's because you stopped getting in your own way. SpeedRead trains your brain to read the way it was designed to. Get it on the App Store.`,
  segments: [
    { startWordIndex: 0, wpm: 300 },
    { startWordIndex: 50, wpm: 400 },
    { startWordIndex: 110, wpm: 550 },
    { startWordIndex: 170, wpm: 700 },
    { startWordIndex: 230, wpm: 850, displayWpm: 850 },
    { startWordIndex: 270, wpm: 900 },
  ],
};

// ─────────────────────────────────────────────
// TUESDAY — "Read The Book Before Book Club" (Relatable)
// ─────────────────────────────────────────────
export const BOOK_CLUB_BLUFF: ChallengeScript = {
  id: "BookClubBluff",
  title: "Read the book before book club",
  style: "minimal",
  text: `Book club is in three hours. You've read exactly 40 pages out of 320. Everyone else has definitely finished it because they always finish it. You're about to show up and pretend you read the ending based on context clues from the discussion. We've all been there. The book sits on your nightstand for three weeks. You have good intentions. You open it every night read two pages fall asleep. Now it's Friday afternoon and you're cooked. Here's the reality. Most people don't hate reading. They hate how long it takes. The average person reads 200 to 250 words per minute. A 320 page book has roughly 80000 words. That's over five hours of reading time. Who has five uninterrupted hours? But watch this. We're starting at 280 words per minute. Already faster than average and you're comprehending just fine. Your brain isn't working harder it's just not being held back by inefficient eye movement. RSVP eliminates regression. That thing where you unconsciously re-read the same line three times because your eyes jumped wrong. Studies show regression wastes up to 30 percent of reading time. Just gone. Wasted on mechanical errors. We're at 500 words per minute now. At this pace that 80000 word book takes under three hours. Suddenly very doable on a Friday afternoon. You could actually show up to book club having read the actual ending. Cranking to 700. This is where reading stops feeling like work and starts feeling like downloading information directly into your brain. Pure data transfer. Here's 850 words per minute. You could finish the book in under two hours and still have time to make brownies for book club. SpeedRead trains this exact skill. App Store. Download it. Never show up unprepared again. Actually read the book. Blow everyone's mind with your opinions. See you at book club.`,
  segments: [
    { startWordIndex: 0, wpm: 280 },
    { startWordIndex: 80, wpm: 390 },
    { startWordIndex: 145, wpm: 540 },
    { startWordIndex: 205, wpm: 690 },
    { startWordIndex: 255, wpm: 820 },
    { startWordIndex: 290, wpm: 850, displayWpm: 900 },
  ],
};

// ─────────────────────────────────────────────
// WEDNESDAY — "They Don't Want You Reading This Fast" (Provocative)
// ─────────────────────────────────────────────
export const THEY_DONT_WANT_YOU: ChallengeScript = {
  id: "TheyDontWantYou",
  title: "They don't want you reading this fast",
  style: "terminal",
  text: `There is a reason they do not teach speed reading in school. If you could read 10 times faster you would learn 10 times more. That is dangerous. You are reading at a normal pace right now. Slow enough that your brain is coasting. This is by design. The education system optimized for obedience not optimization. The average adult reads at 250 words per minute. That is the same speed as an 8th grader. You stopped improving after middle school because nobody told you there was a higher level. Your eyes are the bottleneck. They fixate on each word for 250 milliseconds even though your brain only needs 13 milliseconds to recognize it. You are waiting on hardware that is lagging behind your software. We are accelerating now. This is where most people get uncomfortable. Their subvocalization cannot keep up so they assume they are losing comprehension. They are wrong. Studies show that eliminating subvocalization increases reading speed by 300 percent with zero loss in retention. Your inner voice is not helping you. It is limiting you. You are now reading faster than 95 percent of the population. This is not a party trick. This is a competitive advantage. Information is power and you just became more powerful. Executives at top companies pay thousands for speed reading courses. You are getting the same training for free right now. The RSVP method forces your brain to process visually instead of auditorily. We are pushing 850 words per minute. This is flow state. Your conscious mind is not narrating anymore. Your subconscious is pattern matching at maximum speed. The system wants you slow. Passive. Consuming entertainment instead of information. You just proved you are capable of more. Download SpeedRead on the App Store. Take back your cognitive freedom. Read at the speed you were designed for.`,
  segments: [
    { startWordIndex: 0, wpm: 250 },
    { startWordIndex: 50, wpm: 360 },
    { startWordIndex: 100, wpm: 490 },
    { startWordIndex: 150, wpm: 640 },
    { startWordIndex: 200, wpm: 800 },
    { startWordIndex: 250, wpm: 870, displayWpm: 900 },
  ],
};

// ─────────────────────────────────────────────
// THURSDAY — "Your Eyes Move 4 Times Per Second" (Educational)
// ─────────────────────────────────────────────
export const SACCADE_SCIENCE: ChallengeScript = {
  id: "SaccadeScience",
  title: "Your eyes move 4 times per second",
  style: "minimal",
  text: `Your eyes are lying to you right now. You think you're smoothly scanning this text from left to right. You're not. Your eyes move in rapid jumps called saccades. Four times per second when you read. Between each jump your vision is completely blurred. Your brain edits out the blur and stitches together a seamless image. This happens so fast you never notice. Each saccade takes about 200 milliseconds. During that time you're functionally blind. Your brain is literally fabricating a continuous experience from snapshots. Now here's the problem. When you read normally your eyes fixate on almost every word. That means constant stopping and starting. Constant saccades. Constant moments of blindness. It's wildly inefficient. RSVP eliminates saccades entirely. The words come to you. Your eyes stay still. No jumping. No blur. No wasted time. Studies from the University of California show this can triple reading speed immediately. You're experiencing it right now. We started at 270 words per minute. We're about to cross 800. Your comprehension hasn't dropped. Your eyes just stopped fighting you. The average person makes 3 to 4 saccades per second while reading. That's over 200 eye movements per minute. Each one lasting 200 milliseconds. Do the math. You spend 40 seconds of every minute literally blind while reading. SpeedRead gives you those 40 seconds back. Your eyes are designed to track moving objects not jump across static text. Stop making them do the wrong job. Download SpeedRead from the App Store and let your eyes actually rest.`,
  segments: [
    { startWordIndex: 0, wpm: 270 },
    { startWordIndex: 55, wpm: 370 },
    { startWordIndex: 115, wpm: 520 },
    { startWordIndex: 175, wpm: 680 },
    { startWordIndex: 235, wpm: 830 },
    { startWordIndex: 280, wpm: 900 },
  ],
};

// ─────────────────────────────────────────────
// FRIDAY — "Textbooks Cost $400. Use Them." (Relatable)
// ─────────────────────────────────────────────
export const TEXTBOOK_REVENGE: ChallengeScript = {
  id: "TextbookRevenge",
  title: "Textbooks cost $400. Use them.",
  style: "terminal",
  text: `You spent four hundred dollars on textbooks this semester. They're sitting on your desk right now spine still crispy pages still smell like the bookstore. You've opened exactly one of them. Once. For twenty minutes. Before you switched to scrolling TikTok. College students spend an average of 1200 dollars per year on textbooks. Most of them read less than half. The math is brutal. You're paying three dollars per page for information you're not even absorbing. But here's what nobody tells you. The problem isn't the textbook. It's how you're reading it. Your eyes move in tiny jumps called saccades. About four jumps per second. Each jump takes 200 milliseconds. That's where all your time goes. Not the actual reading but the mechanical movement of looking at words. Watch this. We're at 300 words per minute now. No eye movement needed. Just pure information flowing directly into your brain. Each word appears in the exact same spot. Your eyes stay still. Your brain does all the work. Research from Stanford shows that RSVP can increase reading speed by up to 400 percent without sacrificing comprehension. Four hundred percent. Imagine reading your entire biology textbook in one afternoon instead of one week. We're hitting 550 words per minute now. This is faster than most people think is humanly possible. But you're keeping up. Because your brain isn't slow your reading method is. Cranking it to 750. At this speed you could finish a 30 page chapter in under 15 minutes. That 400 dollar investment suddenly becomes worth it when you can actually consume the information before the exam. Here's 900 words per minute. Elite level. This is where knowledge stops being a chore and starts being a superpower. SpeedRead uses this exact RSVP method. Available on the App Store. Turn those expensive textbooks into the best investment you made all semester. Your GPA will thank you. Now go crack that spine.`,
  segments: [
    { startWordIndex: 0, wpm: 270 },
    { startWordIndex: 70, wpm: 380 },
    { startWordIndex: 130, wpm: 520 },
    { startWordIndex: 190, wpm: 680 },
    { startWordIndex: 240, wpm: 820 },
    { startWordIndex: 280, wpm: 900 },
  ],
};

// ─────────────────────────────────────────────
// SATURDAY — "Every Word Has a Secret Sweet Spot" (Educational)
// ─────────────────────────────────────────────
export const OPTIMAL_RECOGNITION_POINT: ChallengeScript = {
  id: "OptimalRecognitionPoint",
  title: "Every word has a secret sweet spot",
  style: "minimal",
  text: `There's a specific letter in every word where your eye should land for fastest recognition. It's called the Optimal Recognition Point usually just left of center in most words. When your eye hits this spot your brain recognizes the word faster than any other position. This was discovered in the 1980s by reading researchers studying eye-tracking patterns. Good readers unconsciously aim for this point. Poor readers scatter their fixations randomly. But even good readers miss the ORP about 40 percent of the time. Their eyes land too far left or too far right. Recognition slows. Reading slows. Now look at what's happening in this video. Every word appears in the exact same position. Your eyes don't move. But notice the red highlight. It marks the Optimal Recognition Point. We're literally showing you exactly where to focus for maximum processing speed. This isn't just convenient. It's neurologically optimized. Your brain is getting every word delivered to the exact coordinates where recognition happens fastest. We're at 750 words per minute now. You're hitting the ORP on every single word. Zero misses. Perfect targeting. Studies show this can improve recognition speed by 15 to 20 percent compared to random fixation points. Combine that with eliminated saccades no subvocalization and no regression and you're reading 4 to 5 times faster than normal. This is the endgame of reading efficiency. Every neurological advantage stacked in one method. SpeedRead is built on decades of cognitive science research. Download it on the App Store and experience reading the way your brain was designed to process it.`,
  segments: [
    { startWordIndex: 0, wpm: 290 },
    { startWordIndex: 55, wpm: 410 },
    { startWordIndex: 115, wpm: 550 },
    { startWordIndex: 175, wpm: 710 },
    { startWordIndex: 235, wpm: 860, displayWpm: 900 },
    { startWordIndex: 280, wpm: 900 },
  ],
};

// ─────────────────────────────────────────────
// SUNDAY — "Sunday Scaries Study Session" (Relatable)
// ─────────────────────────────────────────────
export const SUNDAY_SCARIES: ChallengeScript = {
  id: "SundayScaries",
  title: "Sunday scaries study session",
  style: "minimal",
  text: `It's Sunday night. That assignment is due tomorrow at 9am. You have to read six academic articles and write a response paper. The articles are on your desktop. You've opened exactly zero of them. The Sunday scaries are setting in hard. This is the exact moment where most people give up. Order pizza. Accept defeat. Plan to email the professor about a fake emergency. But here's the thing. You actually have more time than you think. Six academic articles average about 5000 words each. That's 30000 words total. At normal reading speed of 200 words per minute that's two and a half hours just for reading. Plus note-taking. Plus writing. You're looking at an all-nighter. But we're not reading at normal speed. We're starting at 290 words per minute and you're already keeping up perfectly. Academic writing is dense but RSVP actually helps with dense text because it forces you to process each word individually instead of skimming and missing key points. Research from MIT shows that RSVP reading improves comprehension of technical material by 45 percent compared to traditional reading methods. Why? Because you can't skip the hard words. They appear right in front of you. One at a time. Deal with them or lose the thread. We're at 550 words per minute now. Those six articles just became 55 minutes of reading time instead of 150 minutes. You just saved an hour and a half. That's enough time to actually write a good paper instead of a panicked mess. Pushing to 750. This is crisis-mode reading. Maximum efficiency. Full comprehension. Taking notes between articles. Actually learning instead of just surviving. Here's 870 words per minute. You might actually get sleep tonight. SpeedRead is on the App Store. Download it before next Sunday. Turn panic into productivity. Actually finish assignments with time to spare. Sleep is underrated anyway.`,
  segments: [
    { startWordIndex: 0, wpm: 290 },
    { startWordIndex: 75, wpm: 400 },
    { startWordIndex: 145, wpm: 550 },
    { startWordIndex: 205, wpm: 720 },
    { startWordIndex: 255, wpm: 850, displayWpm: 870 },
    { startWordIndex: 290, wpm: 870, displayWpm: 900 },
  ],
};

// All week 2 scripts for easy iteration
export const WEEK2_CHALLENGE_SCRIPTS: ChallengeScript[] = [
  TYPOGLYCEMIA_TEST,
  BOOK_CLUB_BLUFF,
  THEY_DONT_WANT_YOU,
  SACCADE_SCIENCE,
  TEXTBOOK_REVENGE,
  OPTIMAL_RECOGNITION_POINT,
  SUNDAY_SCARIES,
];
