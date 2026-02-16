/**
 * Multiple viral TikTok script variations for the VerticalChallenge format.
 * Each script has its own text + WPM segments.
 * Import whichever you want into Root.tsx to register as a composition.
 */

export interface WPMSegment {
  startWordIndex: number;
  wpm: number;
  displayWpm?: number;
}

export interface ChallengeScript {
  id: string;           // Composition ID suffix
  title: string;        // Title shown at top of video
  text: string;
  segments: WPMSegment[];
  style: "minimal" | "terminal"; // Which component to use
  format?: "standard" | "elimination" | "speedrun"; // defaults "standard"
  categoryLabel?: string;   // Speedrun category label
  attemptNumber?: number;   // Speedrun attempt counter
}

// ─────────────────────────────────────────────
// 1. "FOCUS COOKED" — Attention-deficit hook
// ─────────────────────────────────────────────
export const FOCUS_COOKED: ChallengeScript = {
  id: "FocusCooked",
  title: "Is your focus cooked?",
  style: "minimal",
  text: `Stop. Scrolling. Is your focus cooked? Let's find out right now. If you can read this without looking away you might be fine. But most people can't anymore. The average attention span has dropped to 8 seconds. That's less than a goldfish. And it's not your fault. Every app on your phone is designed to hijack your focus. Short videos. Push notifications. Infinite feeds. Your brain has been rewired to crave constant stimulation. So here's a test. Just keep reading. Don't look away. Don't check that notification. We're going to speed up and your only job is to stay locked in. Ready? Let's go a little faster now. This is 400 words per minute. Most people read at about 230. You're already beating the average. The trick is to stop saying each word in your head. That inner voice is a bottleneck. Your eyes can process way faster than your mouth can speak. Think about how you recognize a stop sign. You don't spell out S T O P. You just see it and know. That's what we're training your brain to do with every word. See it. Know it. Move on. Now we're at 500 words per minute. If you're still here your focus is not cooked. Your brain is locking in. This is what flow state feels like. Everything else disappears. No notifications. No distractions. Just words and meaning. This is the zone that every productivity guru talks about but most people never reach. You're in it right now. And honestly this is a superpower. While everyone else is doom scrolling you're training your brain to absorb information at twice the normal speed. Imagine reading an entire book in an hour. Blasting through research papers. Consuming articles in seconds instead of minutes. That's not a fantasy. That's what speed reading unlocks. Let's push it further. We're hitting 700 now. This is where it gets real. Your brain has to fully commit. No half attention. No multitasking. Pure focus. If you can still follow along you're in the top tier of readers. Most people tapped out a long time ago. But you're still here. That says something about you. Your focus isn't cooked. It just needed the right challenge. One more push. Final level. This is over 800 words per minute. Elite territory. If the words are blurring that's normal. Your brain is doing something incredible right now. It's predicting words before they appear. Using context and pattern recognition instead of reading each letter. This is your brain at full power. Not bad for someone who was just mindlessly scrolling a minute ago right? If you made it this far your attention span is better than you think. You just proved it. Now imagine what you could do if you trained this every day. Check out SpeedRead in the App Store and turn your scroll time into brain gains.`,
  segments: [
    { startWordIndex: 0, wpm: 250 },      // Slow hook — "Stop. Scrolling."
    { startWordIndex: 30, wpm: 300 },      // Warm up
    { startWordIndex: 95, wpm: 400 },      // "Let's go a little faster"
    { startWordIndex: 195, wpm: 500 },     // "Now we're at 500"
    { startWordIndex: 305, wpm: 700 },     // "We're hitting 700"
    { startWordIndex: 385, wpm: 850, displayWpm: 900 }, // Final sprint
  ],
};

// ─────────────────────────────────────────────
// 2. "BRAIN ROT DETOX" — Gen Z / brain rot angle
// ─────────────────────────────────────────────
export const BRAIN_ROT_DETOX: ChallengeScript = {
  id: "BrainRotDetox",
  title: "Brain rot detox",
  style: "minimal",
  text: `This is a brain rot detox. For the next 60 seconds you're going to do something your brain hasn't done in months. Focus on one thing. No switching tabs. No checking your phone. No skipping ahead. Just read. That's it. Right now your brain is already fighting you. It wants to swipe. It wants something new. That urge you're feeling? That's the brain rot. The constant need for new stimulation is literally rewiring your neural pathways. Every time you switch apps your brain gets a tiny hit of dopamine. And just like any other habit it gets harder to stop. But here's the thing. You can reverse it. And this is how. Speed reading forces your brain into single-task mode. There is no room for distraction when words are flying at you this fast. Your brain has to choose. Focus or fall behind. Let's pick it up. We're at 400 now. Notice how the outside world is starting to fade? That's your prefrontal cortex taking over. This is the part of your brain responsible for deep focus and complex thinking. The part that social media has been slowly shutting down. But right now it's waking up. You're activating neural pathways that have been dormant. Think of this like a gym session for your brain. Every second you spend reading at this speed is building your attention muscle back up. Now we're at 550 words per minute. You're reading faster than 95 percent of people. And you're doing it on a phone. The same device that was rotting your brain five minutes ago is now training it. Ironic right? But that's the whole point. The tool isn't the problem. It's how you use it. One more level. Let's see what you're made of. 750 words per minute. If you're still tracking every word your brain is performing at an elite level. The average person would have given up by now. They would have swiped away to another video. But not you. You chose to stay. You chose focus over distraction. That's not just reading. That's discipline. And discipline is the antidote to brain rot. Final push. We're blasting past 800 now. This is maximum effort. Let your eyes relax and trust your brain. It knows more than you think. You don't need to read every letter. Your brain is filling in the gaps using context. This is pattern recognition at its finest. If you made it here congratulations. You just proved that your brain still works. The rot hasn't won. Not even close. Keep training. SpeedRead is free on the App Store. Turn brain rot into brain gains.`,
  segments: [
    { startWordIndex: 0, wpm: 250 },      // Slow deliberate hook
    { startWordIndex: 25, wpm: 300 },      // Settling in
    { startWordIndex: 115, wpm: 400 },     // "Let's pick it up"
    { startWordIndex: 210, wpm: 550 },     // "Now we're at 550"
    { startWordIndex: 290, wpm: 750 },     // "One more level"
    { startWordIndex: 370, wpm: 850, displayWpm: 900 }, // Final blast
  ],
};

// ─────────────────────────────────────────────
// 3. "IQ TEST" — Competitive / intelligence angle
// ─────────────────────────────────────────────
export const IQ_TEST: ChallengeScript = {
  id: "IQTest",
  title: "This will tell you your IQ",
  style: "terminal",
  text: `Only 4 percent of people can finish this video. This isn't a normal reading test. The speed is going to increase every few seconds and if you can keep up until the end you have an elite level brain. No joke. Processing speed is one of the strongest predictors of cognitive ability. The faster you can absorb and understand new information the sharper your mind is. Right now we're cruising at 300 words per minute. That's above average but nothing crazy. If this feels comfortable you're already ahead of most people. The real question is how far can you go. Let's jump to 400. Still with me? Good. At this speed your brain is starting to suppress subvocalization. That's the little voice in your head that reads each word out loud. Slow readers are completely dependent on it. Fast readers learn to bypass it entirely. You're making that transition right now. Your visual cortex is taking over from your auditory processing centers. This is literally a different mode of reading. Now 550 words per minute. This is where it separates casual readers from serious ones. At this speed your brain can't afford to wander. Every ounce of cognitive bandwidth is being used. Your working memory is firing on all cylinders to keep up with the incoming stream of information. If the words still make sense to you that's impressive. Genuinely. Most people are lost by now. They see words but the meaning stops registering. Their brain hits a wall. But yours hasn't. Jumping to 700. Now we're in the realm of speed readers and competitive learners. People who read at this speed can consume an entire book in under two hours while retaining most of the information. It's not a gimmick. It's a trained skill. And your brain is showing it has the raw capacity for it right now. You just need to practice. Final level. This is 900 words per minute. If you are reading this and understanding it you are genuinely in the top one percent of readers on the planet. Your processing speed is exceptional. Your focus is razor sharp. And your brain is operating at a level that most people will never experience. This isn't flattery. This is neuroscience. The ability to decode language at this speed requires extraordinary coordination between your visual cortex working memory and language centers. If you made it here you should be proud. Now stop wasting that brain on TikTok and go read a book. Or download SpeedRead and train with real articles every day.`,
  segments: [
    { startWordIndex: 0, wpm: 300 },      // Opening hook
    { startWordIndex: 75, wpm: 400 },      // "Let's jump to 400"
    { startWordIndex: 155, wpm: 550 },     // "Now 550"
    { startWordIndex: 255, wpm: 700 },     // "Jumping to 700"
    { startWordIndex: 335, wpm: 850, displayWpm: 900 }, // "Final level"
  ],
};

// ─────────────────────────────────────────────
// 4. "READING SPEED TIER LIST" — Tier list / ranking angle
// ─────────────────────────────────────────────
export const TIER_LIST: ChallengeScript = {
  id: "TierList",
  title: "What's your reading tier?",
  style: "minimal",
  text: `Let's rank your reading speed. By the end of this video you'll know exactly where you fall on the tier list. We're starting at F tier. 250 words per minute. This is below average. If you need to read this slowly that's okay but there's a lot of room to grow. Most elementary school students read at this speed. No offense. Moving up to D tier. 300 words per minute. This is where the average adult sits. Nothing wrong with it but nothing special either. You can read a news article in about four minutes at this pace. Most people stay at this level their entire life because nobody ever taught them to read faster. C tier now. 350 words per minute. You're officially above average. You probably read a decent amount. Maybe a few books a year. At this speed you're more efficient than about 60 percent of adults. Not bad. But we're just getting warmed up. B tier. 450 words per minute. Now we're talking. This is where avid readers and college students who actually do the readings tend to fall. Your brain is learning to chunk words together instead of processing them one by one. You're starting to see phrases as single units of meaning. This is a key breakthrough in reading speed. A tier. 600 words per minute. Welcome to the big leagues. You are now reading faster than roughly 95 percent of the adult population. At this speed you could finish a 300 page book in about two hours. Your brain has almost completely silenced that inner reading voice. You're processing language visually now. Pure pattern recognition. This is genuinely impressive. S tier. 750 words per minute. This is elite. Competitive speed readers operate around this level. Your brain is working at near maximum linguistic processing capacity. Every neural pathway related to reading is firing simultaneously. If you're still comprehending the meaning of these sentences you have a seriously powerful brain. And now the final level. S plus tier. 900 words per minute. This is the ceiling for most humans. If you can read and understand text at this speed you are operating at the absolute peak of human reading performance. Very few people on Earth can genuinely comprehend new material this fast. You are watching your brain perform at its theoretical maximum. Whether you could follow every word or tapped out at B tier doesn't really matter. What matters is that you now know your baseline. And with practice you can move up. SpeedRead lets you train with any article at any speed. Find your tier and then break through it.`,
  segments: [
    { startWordIndex: 0, wpm: 250 },      // F tier
    { startWordIndex: 45, wpm: 300 },      // D tier
    { startWordIndex: 100, wpm: 350 },     // C tier
    { startWordIndex: 155, wpm: 450 },     // B tier
    { startWordIndex: 220, wpm: 600 },     // A tier
    { startWordIndex: 290, wpm: 750 },     // S tier
    { startWordIndex: 350, wpm: 850, displayWpm: 900 }, // S+ tier
  ],
};

// ─────────────────────────────────────────────
// 5. "AURA CHECK" — Meme / aura points angle
// ─────────────────────────────────────────────
export const AURA_CHECK: ChallengeScript = {
  id: "AuraCheck",
  title: "Reading speed aura check",
  style: "minimal",
  text: `Aura check. Your reading speed says more about you than you think. If you can make it to the end of this video without looking away you get infinite aura. If you tap out early negative aura. Sorry I don't make the rules. We're starting slow. 300 words per minute. This is the tutorial level. If you're struggling here I have bad news for you. But don't worry most people can handle this. You're basically reading at normal human speed. Nothing to flex about yet but you're in the game. The thing about reading speed is it's basically a cheat code for life. The faster you can read the more you can learn. The more you learn the smarter your decisions. The smarter your decisions the better your life gets. It's that simple. People spend thousands on courses and coaching when the real hack is just learning to read faster. Anyway let's crank it up. 450 words per minute. You just earned plus 100 aura for making it this far. At this speed you're reading almost twice as fast as the average person. Your brain is doing something cool right now. It's starting to skip the inner monologue and process words visually. Like how you don't sound out the word McDonald's when you see the golden arches. You just know. That's what your brain is learning to do with every word. Level up. 600 words per minute. Plus 500 aura. You are now in rare territory. If this were a game you just entered the boss fight. Most people cannot read at this speed and understand what they're reading. But the fact that you're still here means your brain is built different. Not everyone's neural pathways can handle this kind of throughput. Yours can. Now let's see if you're actually elite or if you've been faking it. 750 words per minute. Plus 1000 aura if you're still locked in. At this speed the words should feel like they're flowing directly into your consciousness. You're not reading anymore. You're absorbing. Your brain is predicting the next word before it even appears. That's pattern recognition operating at peak performance. Final boss. 900 words per minute. If you can read this you have maximum aura. Infinite. Uncapped. Your brain is operating at the theoretical limit of human language processing. The fact that these words still make sense to you means you have exceptional cognitive ability. No cap. Most people swiped away 30 seconds ago. But you're still here. That focus. That discipline. That's real aura. Not the made up internet kind. If you want to keep this energy going download SpeedRead and train every day. Your aura will be untouchable.`,
  segments: [
    { startWordIndex: 0, wpm: 300 },      // Tutorial level
    { startWordIndex: 110, wpm: 450 },     // "let's crank it up"
    { startWordIndex: 210, wpm: 600 },     // "Level up"
    { startWordIndex: 295, wpm: 750 },     // Boss fight
    { startWordIndex: 365, wpm: 850, displayWpm: 900 }, // Final boss
  ],
};

// ─────────────────────────────────────────────
// 6. "SCREEN TIME COPE" — Screen time guilt angle
// ─────────────────────────────────────────────
export const SCREEN_TIME_COPE: ChallengeScript = {
  id: "ScreenTimeCope",
  title: "Justify your screen time",
  style: "minimal",
  text: `Your screen time report just dropped and it says 7 hours. Before you spiral let me offer you a deal. If you can keep up with this entire video you can officially say those 7 hours were productive. We're starting at 300 words per minute. Easy. You do this every time you skim a text from someone you're ignoring. The difference is this time you're actually training your brain. See most people don't realize that reading speed is a skill you can improve. It's not fixed at birth. Your brain is incredibly plastic and it responds to training just like a muscle. The problem is nobody trains it. We just accept whatever reading speed we developed in middle school and carry it for the rest of our lives. That's like never upgrading from a flip phone. Let's bump it up. 400 words per minute. Your brain barely noticed the switch right? That's because you have way more capacity than you use. Studies show the average person reads at about 230 words per minute but can comprehend text at nearly double that speed. The bottleneck isn't your brain. It's your habits. The main culprit is subvocalization. That's the voice in your head reading every single word out loud. It made sense when you were six and learning to read. It doesn't make sense now. You're an adult with a fully developed visual cortex that can process entire words as images. Let it do its job. 550 now. This is where the magic happens. At this speed your phone screen time actually starts to make sense. Imagine scrolling through articles at this pace. That 20 minute longread becomes a 5 minute briefing. That research paper your professor assigned becomes manageable. That backlog of saved articles you'll never read? Gone in an afternoon. This is the real life hack that nobody talks about because it's not flashy enough for a viral video. Except here we are. Going faster. 700 words per minute. At this speed you could read every top story on the internet in your morning commute. You could consume an entire book on a flight. You could actually read the terms and conditions. Okay maybe not that far. But you get the point. Speed reading doesn't just save time. It changes your relationship with information entirely. You stop avoiding long content and start seeking it out. Final push. 850 words per minute. If you're still here you just turned 60 seconds of screen time into genuine cognitive training. That's more than most people accomplish in their entire 7 hour screen time report. Next time your phone judges you just open SpeedRead and train. Screen time justified.`,
  segments: [
    { startWordIndex: 0, wpm: 300 },
    { startWordIndex: 105, wpm: 400 },
    { startWordIndex: 200, wpm: 550 },
    { startWordIndex: 295, wpm: 700 },
    { startWordIndex: 370, wpm: 850, displayWpm: 900 },
  ],
};

// ─────────────────────────────────────────────
// 7. "NIGHT OWL" — Late night doomscroll angle
// ─────────────────────────────────────────────
export const NIGHT_OWL: ChallengeScript = {
  id: "NightOwl",
  title: "It's 3am. Read this.",
  style: "minimal",
  text: `It's 3am. You should be asleep but here you are scrolling through TikTok with one eye open. I'm not going to tell you to go to sleep. Instead I'm going to make this scroll worth it. Keep reading. Don't stop. We're going at 300 words per minute right now and if you can keep up until the end I promise this will be the most productive thing you do at 3am all week. Here's a fact that might keep you up even longer. The reason you can't stop scrolling is the same reason you can't stop eating chips. Variable reward schedules. Every swipe might give you something amazing or something boring and your brain is addicted to finding out which one. It's the same mechanism that makes slot machines work. But right now there is no variable reward. Just words. And your brain is locked in anyway. Interesting right? Picking it up to 450 now. Here's another thing about reading at night. Your brain is actually in a different state right now. The prefrontal cortex the part responsible for willpower and decision making is basically offline. That's why you're doom scrolling instead of sleeping. But the parts of your brain that process language and store memories? Those are still firing. Some researchers even suggest that information absorbed right before sleep is consolidated more effectively into long term memory. So technically this might be the best time to train your reading speed. 600 words per minute. The city is quiet. Your notifications have stopped. Nobody is texting you. For once in your life there are zero distractions. This is actually the perfect environment for deep focus. No meetings. No obligations. No one asking you for anything. Just you and these words moving faster and faster across your screen. Use it. 750 now. If you're still reading at this speed at 3am your brain is genuinely impressive. Most people's cognitive function drops significantly when sleep deprived. But speed reading requires peak visual processing and working memory. If you can maintain comprehension right now imagine what you could do fully rested. You'd be unstoppable. Last one. 850 words per minute at 3 in the morning. If you made it here you're either a genius or completely unhinged. Either way I respect it. Now go to sleep. But first download SpeedRead so you can do this again tomorrow. Maybe at a reasonable hour.`,
  segments: [
    { startWordIndex: 0, wpm: 300 },
    { startWordIndex: 115, wpm: 450 },
    { startWordIndex: 210, wpm: 600 },
    { startWordIndex: 290, wpm: 750 },
    { startWordIndex: 360, wpm: 850, displayWpm: 900 },
  ],
};

// All scripts for easy iteration
export const ALL_CHALLENGE_SCRIPTS: ChallengeScript[] = [
  FOCUS_COOKED,
  BRAIN_ROT_DETOX,
  IQ_TEST,
  TIER_LIST,
  AURA_CHECK,
  SCREEN_TIME_COPE,
  NIGHT_OWL,
];
