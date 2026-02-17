// Structured prompt data for all 9 TikTok slideshow scripts
// Parsed from data/content-queue/nanobanana-prompts.md
// Each slide prompt is the full JSON scene description for Gemini image generation

export interface SlidePrompt {
  name: string;
  prompt: string; // Full scene JSON stringified for Gemini
  overlayText: string; // Story text overlay for this slide
}

export interface ScriptData {
  number: number;
  slug: string;
  hook: string;
  caption: string;
  audience: string;
  slides: SlidePrompt[];
}

// Base prompt DNA included in every generation request
const BASE_DNA = `"hardware_and_optical_fidelity": {
  "camera_tier": "iPhone 15 Pro Max (Raw Mode)",
  "simulated_sensor": "Apple computational photography pipeline with Smart HDR 5",
  "lens_simulation": "iPhone 15 Pro main 24mm equivalent, subtle barrel distortion at edges, slight lens flare from overhead lights"
},
"post_processing": {
  "style": "Unedited iPhone photo, no filters, no color grading, native Apple photo processing only",
  "grain": "Minimal natural digital noise consistent with iPhone low-light",
  "imperfections": "Slight motion blur on hands, one slightly soft focus area, minor chromatic aberration at frame edges"
}`;

function buildPrompt(sceneJson: object): string {
  return JSON.stringify(sceneJson, null, 2);
}

export const SCRIPTS: ScriptData[] = [
  // ── Script 1: "200 pages the night before the exam" (Student) ──
  {
    number: 1,
    slug: "student-200-pages",
    hook: "POV: your professor just assigned 200 pages of reading... due tomorrow",
    caption:
      "POV: your professor assigns 200 pages the night before the exam... good thing I have Speed Read #college #studying #finals #studytok #productivity #speedreading #studentlife",
    audience: "Students",
    slides: [
      {
        name: "PANIC",
        overlayText:
          "POV: your professor just assigned 200 pages of reading... due tomorrow",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Amateur off-center framing, taken from across a small room, accidental ceiling in top of frame",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
            simulated_sensor: "Apple computational photography, Smart HDR 5",
            lens_simulation: "iPhone 15 Pro 24mm, subtle barrel distortion",
          },
          scene:
            "A 20-year-old college student sitting at a messy dorm desk at night, face illuminated by laptop screen glow, expression of pure panic and disbelief. Both hands on their head in a 'we're cooked' gesture. Overhead dorm fluorescent lighting mixed with warm laptop glow. Energy drink cans, scattered papers, highlighters, an unopened textbook. The student is wearing a wrinkled university hoodie with messy hair. Taken by the student's roommate from across the small dorm room. Candid, unposed, genuinely stressed. The desk is chaotic \u2014 post-it notes, a dead highlighter, crumpled paper.",
        }),
      },
      {
        name: "GROUP CHAT PANIC",
        overlayText: "everyone in the group chat is panicking",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Over-the-shoulder, looking down at person holding phone, slightly blurry and urgent",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A college student sitting on their dorm bed, holding their phone up with one hand, eyes wide with a panicked 'we're so cooked' expression as they read their group chat. Their other hand is covering their mouth or pulling at their hair. The phone screen is glowing but the messages are not readable. They're in a wrinkled hoodie, dorm room behind them with fairy lights and a messy bed. A roommate took this photo from a standing angle looking down \u2014 capturing the exact moment of reading the bad news. Late night dorm lighting, slightly grainy. The energy is pure collective panic. Candid, unposed, the exact face everyone makes when the group chat explodes.",
        }),
      },
      {
        name: "THE DISCOVERY",
        overlayText: "so I pulled up this app and started speed reading everything",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Side profile shot, person at desk, leaning forward with sudden energy and focus",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "Side profile of a college student at their dorm desk late at night, but their posture has shifted \u2014 they're sitting up straight, leaning forward with sudden determination and focus. Their expression has changed from panic to intense concentration. The laptop screen illuminates their face in blue-white light. The dorm window is pitch black behind them. An energy drink and scattered papers still on the desk, but the student's body language is completely different now \u2014 engaged, locked in, reading fast. A clock on the nightstand shows 1:47 AM. The vibe is 'okay I found something, let's go'. Taken candidly from the roommate's bed. Slightly grainy iPhone night mode.",
        }),
      },
      {
        name: "VICTORY",
        overlayText: "finished all 200 pages by 2am. Speed Read RSVP — link in bio",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Selfie-style, front camera, slightly below eye level, amateur framing with too much headroom",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max front camera (12MP TrueDepth)",
            simulated_sensor:
              "Apple front camera processing, slightly softer than rear camera",
            lens_simulation:
              "iPhone front camera 12mm equivalent, noticeable wide-angle distortion",
          },
          scene:
            "A college student taking a front-camera selfie at their dorm desk, slight smirk of relief and exhausted confidence. Arms raised in a small victory gesture. It's late at night \u2014 overhead fluorescent light casts slightly unflattering shadows under their eyes. Messy hair, university hoodie, tired but victorious expression. The selfie is slightly blurry from hand movement. Completely authentic and unpolished \u2014 the kind of photo someone would actually post on their Instagram story at 2am with the caption 'done'. Dark circles visible, but genuinely happy.",
        }),
      },
    ],
  },

  // ── Script 2: "ADHD \u2014 finished a 20-minute article in 4 minutes" (ADHD/Focus) ──
  {
    number: 2,
    slug: "adhd-finish-article",
    hook: "I have ADHD and I just finished a 20-minute article in 4 minutes",
    caption:
      "I have ADHD and I just finished a 20-minute article in 4 minutes... I'm literally crying #adhd #adhdtiktok #focushack #productivity #neurodivergent #speedreading #reading",
    audience: "ADHD/Focus",
    slides: [
      {
        name: "THE DISBELIEF",
        overlayText:
          "I have ADHD and I just finished a 20-minute article in 4 minutes",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Front-facing, person sitting on bed or couch, looking stunned and amazed at camera",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A person in their early 20s sitting cross-legged on their bed, looking directly at the camera with a stunned, amazed expression \u2014 mouth slightly open, eyes wide, the face of someone who genuinely cannot believe what just happened. They're in comfortable clothes \u2014 oversized t-shirt, messy bun or bedhead. A blanket tangled around them. The room has warm lamp lighting from a bedside lamp. Empty mugs and a water bottle on the nightstand. The expression is pure disbelief mixed with excitement \u2014 'did that actually just happen?' energy. Photo taken by a partner or roommate who they just turned to and said 'you're not going to believe this'. Candid, intimate, genuine shock. The kind of photo someone would screenshot and text to their friend group.",
        }),
      },
      {
        name: "BRAIN WON'T COOPERATE",
        overlayText: "normally I can't get past paragraph 2 without my brain checking out",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Medium shot, person slouched on bed with papers scattered around them, defeated posture",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A person in their early 20s slouched against their headboard on a messy bed, surrounded by scattered printed articles and highlighted papers they haven't been able to get through. They're staring blankly at the ceiling with a defeated, zoned-out expression — the look of someone whose brain has completely checked out. Oversized hoodie, messy hair, legs stretched out with papers sliding off their lap. A forgotten cup of tea on the nightstand has gone cold. Their body language screams 'I've been trying to read this for an hour and I've absorbed nothing.' Warm bedroom lamp light, slightly dim. Taken candidly by a roommate from the doorway. Natural, unposed, relatable ADHD frustration.",
        }),
      },
      {
        name: "THE SHIFT",
        overlayText: "this app shows one word at a time. your brain literally can't wander.",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Medium-wide shot, single person alone on bed, sitting up with sudden energy and alertness",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A single person alone in their bedroom, now sitting upright on the edge of their bed with completely different energy \u2014 alert, engaged, leaning slightly forward with genuine concentration. Their posture has transformed from defeated to locked-in. They're cross-legged, back straight, eyes focused forward. The scattered papers from before are pushed aside. Warm bedside lamp light illuminating them from the side. The blanket is bunched up behind them. Their expression is quietly intense \u2014 not dramatic, just genuinely absorbed in reading. The room is cozy and lived-in \u2014 mugs, a water bottle, clothes draped on a chair. Taken candidly from across the room. iPhone night mode grain, natural and unposed.",
        }),
      },
      {
        name: "THE EMOTION",
        overlayText: "I actually finished it. Speed Read RSVP — link in bio",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Front-facing, slightly below eye level, capturing genuine emotion",
          },
          hardware_and_optical_fidelity: {
            camera_tier:
              "iPhone 15 Pro Max front camera (12MP TrueDepth)",
          },
          scene:
            "A front-camera selfie of a person in their early 20s with a genuine expression of amazement and slight emotional overwhelm \u2014 like they just experienced something they didn't think was possible. Slightly watery eyes but smiling. They're in their bedroom, warm lamp light, messy background with clothes and books. The selfie is a little too close to their face \u2014 classic 'I just need to document this moment' energy. Hair is messy, no makeup, completely authentic. This looks like the kind of photo someone would post on TikTok with the caption 'I just finished an entire article without losing focus once'. Unfiltered, raw, emotional.",
        }),
      },
    ],
  },

  // ── Script 3: "Roommate thought I was cheating" (Student) ──
  {
    number: 3,
    slug: "student-roommate-cheating",
    hook: "my roommate literally thought I was cheating on our exam",
    caption:
      "my roommate literally thought I was cheating on our exam... had to show her my secret weapon #college #roommate #studying #cheating #speedreading #studentlife",
    audience: "Students",
    slides: [
      {
        name: "THE ACCUSATION",
        overlayText:
          "my roommate literally thought I was cheating on our exam",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Single person at dorm desk, turned around looking at camera, defensive gesture",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A female college student at her dorm desk, turned around in her chair to face the camera with both hands up in a defensive 'I swear I didn't cheat' gesture. Her expression is half-laughing, half-defensive \u2014 the face of someone being playfully accused by their roommate who is behind the camera, not visible. She's in a wrinkled university hoodie, messy ponytail. Her desk behind her has a laptop, textbooks, highlighters, and an energy drink. Typical dorm room \u2014 string lights, tapestry on the wall, photos pinned above the desk. Overhead fluorescent lighting. The photo was clearly taken by her roommate who just walked in demanding answers. Candid, mid-conversation, slightly chaotic energy.",
        }),
      },
      {
        name: "SHOWING THE PROOF",
        overlayText: "so I showed her the app I've been using to speed read all our assignments",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Single person on dorm bed, holding phone toward camera with smug vindicated expression",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A college girl sitting on her dorm bed, holding her phone out toward the camera with a smug, vindicated expression \u2014 one eyebrow raised, slight smirk, 'I told you so' energy. She's showing the camera something on her phone screen, but the screen content is not readable. Her body language is confident and playful. She's in comfortable clothes \u2014 oversized tee, hair in a messy bun. Dorm bed with fairy lights above the headboard, pillows and a blanket tangled. The photo is taken by her roommate who she's proving wrong. Warm ambient lighting from fairy lights and a bedside lamp. Genuine, playful, the energy of winning a friendly argument. Totally candid and unposed.",
        }),
      },
      {
        name: "THE REACTION",
        overlayText: "her face when she saw how fast it reads articles",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Front camera selfie, single person, shocked and excited expression",
          },
          hardware_and_optical_fidelity: {
            camera_tier:
              "iPhone 15 Pro Max front camera (12MP TrueDepth)",
          },
          scene:
            "A front-camera selfie of a college girl with a shocked, excited expression \u2014 mouth slightly open, eyes wide, genuine 'omg' reaction face. She just saw something that blew her mind. She's in her dorm room, fairy lights creating warm bokeh in the background. Messy hair, oversized tee, no makeup \u2014 this is a spontaneous reaction selfie. The photo is slightly too close to her face and a bit tilted \u2014 typical rushed excited selfie energy. Slightly wide-angle front camera distortion. The kind of selfie someone takes and immediately sends to the group chat. Authentic, excited, genuine surprise.",
        }),
      },
      {
        name: "BOTH HAPPY",
        overlayText: "she uses it now too lmao. Speed Read RSVP \u2014 link in bio",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Front camera selfie, single person smiling, cozy dorm vibes",
          },
          hardware_and_optical_fidelity: {
            camera_tier:
              "iPhone 15 Pro Max front camera (12MP TrueDepth)",
          },
          scene:
            "A front-camera selfie of a college girl smiling warmly at the camera, relaxed and happy. She's sitting on her dorm bed with blankets around her, fairy lights glowing in the background. Her expression is genuine and content \u2014 the kind of smile you have after sharing something good with a friend. Slightly messy hair, cozy oversized hoodie. The selfie has that classic 'end of a good night' warmth. Slightly wide-angle front camera distortion, casual framing with too much headroom. The kind of photo someone posts with the caption 'she uses it now too lmao'. Warm, authentic, cozy energy.",
        }),
      },
    ],
  },

  // ── Script 4: "30 articles a day, 45 minutes" (Professional) ──
  {
    number: 4,
    slug: "professional-30-articles",
    hook: "I read 30 articles a day and it takes me 45 minutes",
    caption:
      "I read 30 articles a day and it takes me 45 minutes... here's my morning routine #productivity #morningroutine #reading #careertips #worklife #speedreading",
    audience: "Professionals",
    slides: [
      {
        name: "MORNING SETUP",
        overlayText:
          "I read 30 articles a day and it takes me 45 minutes",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Casual morning flat-lay, top-down, person's shadow visible",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "Top-down photo of a minimalist morning setup on a white marble or wood kitchen counter. A steaming coffee in a ceramic mug, AirPods case, a small notebook with a pen, and a corner of a laptop visible. Early morning golden sunlight from a window casting long warm shadows across the surface. A few coffee drips on the counter. The person's shadow is cast over part of the scene. This looks like a quick morning routine photo someone posted to Instagram stories with the caption 'morning grind'. Clean but not staged \u2014 there's a crumb, a used paper towel at the edge. Real, aspirational but achievable.",
        }),
      },
      {
        name: "THE FOCUS",
        overlayText: "I speed read every article before my coffee gets cold",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Side profile, person at kitchen table, morning light wrapping around them",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "Side profile of a person in their late 20s sitting at a kitchen table in the early morning. Beautiful golden morning sunlight streaming through a window, lighting up one side of their face. They're wearing a comfortable t-shirt, hair slightly messy, looking down with intense focus \u2014 deeply absorbed in reading. A coffee mug in one hand. AirPods in. The scene is peaceful and productive \u2014 this is someone's quiet morning ritual before the chaos of the day starts. The light is warm and cinematic but the overall vibe is still iPhone-casual. A partner or roommate captured this candid moment from across the kitchen.",
        }),
      },
      {
        name: "CHECKING THE TIME",
        overlayText: "done before 8am. every single day.",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Wrist-level shot of smartwatch, background blurred",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A close-up of a person's wrist wearing an Apple Watch showing 7:42 AM. Their hand is wrapped around a coffee mug. The background is blurred but shows a bright kitchen with morning light. The implication is clear \u2014 it's not even 8am and they're already done with their morning reading routine. The watch face is in focus, everything else soft. Quick, casual wrist shot \u2014 the kind of photo someone takes to flex their early-morning productivity. Natural lighting, unforced.",
        }),
      },
      {
        name: "THE FLEX",
        overlayText: "Speed Read RSVP — link in bio",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Selfie, morning vibes, casual confidence, coffee-toast",
          },
          hardware_and_optical_fidelity: {
            camera_tier:
              "iPhone 15 Pro Max front camera (12MP TrueDepth)",
          },
          scene:
            "A young professional (late 20s) taking a front-camera selfie at a home office desk or kitchen table, slight confident smirk, coffee cup raised like a toast to the camera. They're in casual morning clothes \u2014 a nice t-shirt, hair done but not perfectly. Morning sunlight on their face creating a warm glow. The selfie has a 'good morning I'm already winning' energy. Slightly wide-angle front camera distortion. AirPods visible. Natural, not over-produced. The kind of story post that says 'already read 30 articles, what did you do before 8am?'",
        }),
      },
    ],
  },

  // ── Script 5: "This app forces your brain to read" (ADHD/Focus) ──
  {
    number: 5,
    slug: "adhd-brain-cant-wander",
    hook: "this app literally forces your brain to read",
    caption:
      "this app literally forces your brain to read... one word at a time, no escape, no wandering #adhd #focus #reading #productivity #brainhack #speedreading",
    audience: "ADHD/Focus",
    slides: [
      {
        name: "THE MYSTERY",
        overlayText: "this app literally forces your brain to read",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Dark room, person lit from below by unseen light source, moody and mysterious",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A person in a dark room, their face lit from below by a soft glow (as if from a device, but the device itself is not visible \u2014 only the light it casts). Their eyes are wide and locked forward, completely absorbed. The uplight creates dramatic shadows on their face. The background is completely dark. The expression is almost trance-like \u2014 deep focus, slightly intense. This looks like a partner captured them in a moment of total absorption \u2014 someone who literally cannot look away from what they're reading. Intimate, slightly eerie in how focused they look. Dark, moody, iPhone night mode grain.",
        }),
      },
      {
        name: "LOCKED IN",
        overlayText: "it shows you one word at a time. you literally cannot look away.",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Medium shot, person in dark room, face partially lit by warm glow, intense focus",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A person sitting in a dark room, their face partially illuminated by a warm glow from below. You can see them from the chest up. The light catches their cheekbones and the bridge of their nose, leaving the rest in shadow. Their expression is one of complete absorption \u2014 eyes locked forward, completely still and present. Their posture is alert and engaged. The background is completely dark. Natural skin texture \u2014 a few blemishes, real pores. The overall feeling is someone in a trance of focus \u2014 hypnotic concentration. Taken candidly by someone else in the dark room, the person doesn't know they're being photographed. iPhone night mode grain, moody, intimate.",
        }),
      },
      {
        name: "THE HYPNOSIS",
        overlayText: "I finished a 20-minute article without losing focus once",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Person from behind/side, silhouetted, staring at unseen light",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A silhouette of a person sitting on a bed or couch in a completely dark room. They are backlit slightly by the glow from something they're looking at (not visible). Their posture is straight and alert \u2014 leaning slightly forward, completely still, like a person who cannot look away. The shape of their body against the faint glow creates a striking silhouette. The room is dark except for this single glow. This captures the 'hypnotic' quality of one-word-at-a-time reading \u2014 the person is in a trance of focus. Moody, atmospheric, taken on iPhone with night mode grain.",
        }),
      },
      {
        name: "AMAZEMENT",
        overlayText: "wait... I actually just did that? Speed Read RSVP — link in bio",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Front camera selfie, person looking amazed, casual setting",
          },
          hardware_and_optical_fidelity: {
            camera_tier:
              "iPhone 15 Pro Max front camera (12MP TrueDepth)",
          },
          scene:
            "A front-camera selfie of someone on their couch, looking genuinely amazed and a little breathless \u2014 the expression of someone who just finished something they didn't expect to be able to do. A blanket around them, warm living room lighting. A half-eaten snack on the couch next to them. Their expression says 'wait... I actually just did that?' Slightly wide-angle, unpolished, authentic. The kind of selfie someone takes immediately after an experience to capture the raw reaction before it fades.",
        }),
      },
    ],
  },

  // ── Script 6: "2.8 GPA to Dean's List" (Student) ──
  {
    number: 6,
    slug: "student-deans-list",
    hook: "how I went from a 2.8 GPA to the Dean's List in one semester",
    caption:
      "how I went from a 2.8 GPA to the Dean's List in one semester... the secret was changing how I read #college #gpa #deanlist #studying #studytok #academicweapon #speedreading",
    audience: "Students",
    slides: [
      {
        name: "ROCK BOTTOM",
        overlayText:
          "how I went from a 2.8 GPA to the Dean's List in one semester",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Blurry, dark, slightly out of focus \u2014 aesthetically 'depressed era' vibes",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 14 Pro (low-light auto mode)",
            simulated_sensor: "Apple night mode with slight grain",
          },
          scene:
            "A dimly lit dorm room desk at night. Energy drink cans piled up, an unopened textbook with the spine uncracked, crumpled papers, a dead highlighter. No person visible \u2014 just the sad, defeated desk that tells the whole story. The photo is intentionally dark, slightly grainy, taken at night with iPhone night mode. The vibe is rock bottom. A cheap desk lamp providing the only light, casting harsh shadows. This looks like a 'this was my lowest point' photo someone saved in their camera roll to remember where they started. Melancholic, real.",
        }),
      },
      {
        name: "OVERWHELMED",
        overlayText: "I couldn't keep up with the reading. 300 pages a week, every week.",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Casual shot of a person surrounded by textbooks, looking overwhelmed",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A college student sitting on the floor of their dorm room surrounded by stacked textbooks, printed articles, and scattered notebooks. They're looking at the pile with a 'how am I going to do all this' expression \u2014 head in hands, not dramatic, just genuinely overwhelmed. They're in sweats and a hoodie. The room has typical dorm lighting \u2014 harsh overhead mixed with warm desk lamp. Laundry basket overflowing in the corner, empty coffee cups. This is a candid 'my roommate caught me having a moment' photo. Authentic, relatable, the universal college experience.",
        }),
      },
      {
        name: "THE TURNAROUND",
        overlayText: "then I found an app that let me speed read everything in half the time",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Clean study setup photo, morning light, organized energy",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A noticeably cleaner, more organized desk setup. Morning sunlight coming through a dorm window. A laptop open, a proper coffee mug (not an energy drink), and a notebook with actual neat notes \u2014 underlines, highlights, page references. The vibe has shifted from the previous slides \u2014 this is the 'after' energy. Still a dorm room, still not perfect, but organized and purposeful. The light is warmer, the energy is better. A few colorful tabs sticking out of a textbook showing it's actually been read. Like a 'new semester new me' photo someone would post. Natural, not styled.",
        }),
      },
      {
        name: "THE WIN",
        overlayText: "Dean's List. first time ever. Speed Read RSVP — link in bio",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Bright, celebratory, slightly overexposed from flash",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max with flash",
            simulated_sensor:
              "Apple flash photography \u2014 slightly washed out skin, red-eye reduction artifacts",
          },
          scene:
            "A college student taking a front-camera selfie, holding up a letter or printed notification next to their face with a huge genuine grin, maybe slightly watery eyes. The photo is taken with iPhone flash \u2014 creating that typical harsh, slightly unflattering but joyful look of real celebratory photos. Their dorm room hallway behind them. They're in casual clothes, this was completely unplanned. The flash makes it look amateur and REAL \u2014 this is exactly how actual celebration photos look on iPhone. Slightly overexposed, unflattering flash lighting, but radiating pure joy and achievement. The kind of photo that gets posted with 'DEAN'S LIST BABY' as the caption.",
        }),
      },
    ],
  },

  // ── Script 7: "CEO asked how I always know what's going on" (Professional) ──
  {
    number: 7,
    slug: "professional-ceo-informed",
    hook: "the CEO asked me how I always know what's going on in the industry",
    caption:
      "the CEO asked me how I always know what's going on in the industry... I read 30 articles before 8am every morning #corporate #ceo #careeradvice #productivity #speedreading",
    audience: "Professionals",
    slides: [
      {
        name: "THE ENCOUNTER",
        overlayText:
          "the CEO asked me how I always know what's going on in the industry",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Single person walking out of glass conference room, shot from a distance, sneaky coworker angle",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A single person in business casual walking out of a glass-walled conference room in a modern corporate office, glancing back with a subtle confident smile \u2014 the expression of someone who just had an impressive interaction with someone important. The photo is taken from a distance, partially obstructed by a monitor and a desk plant \u2014 a sneaky coworker photo. The glass meeting room behind them is empty now. Standard office LED panel lighting with blue tint. Open floor plan visible but no other people in clear focus. This looks like someone at their desk quickly photographed the moment and texted 'THE CEO JUST PULLED ME ASIDE'. Slightly blurry from distance and being taken quickly. Sneaky, excited energy.",
        }),
      },
      {
        name: "THE MORNING COMMUTE",
        overlayText: "I speed read 30 industry articles on my commute every morning",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "POV commuter shot, looking forward at the train/bus, atmospheric",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "First-person POV on a subway or bus, looking out the window at a city passing by in morning light. AirPods visible at the edge of the frame (in the person's ear). Their business casual sleeve and smartwatch visible. Other commuters blurred in the peripheral \u2014 someone reading a newspaper, someone sleeping. Morning golden light streaming through the windows creating beautiful streaks. The train or bus is in motion \u2014 slight blur on the passing cityscape outside. This captures the daily ritual \u2014 the calm productive commute. Authentic, everyday, peaceful. No devices visible, just the moment.",
        }),
      },
      {
        name: "THE PREPARED NOTEBOOK",
        overlayText: "I walk into every meeting knowing more than everyone else",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Top-down desk shot, notebook with notes, meeting context visible",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A top-down photo of a notebook on a conference table with handwritten notes \u2014 bullet points, article references, underlined key stats, arrows connecting ideas. The handwriting looks natural and real \u2014 slightly messy but organized. A coffee cup, a pen, and other meeting attendees' hands/arms visible around the table. The notebook shows someone who came PREPARED. The photo is taken looking down at your own notebook during a meeting, a bit sneaky, like documenting your own quiet flex. Conference room lighting, slightly blue from a presentation screen. Quick, casual, work-context photo.",
        }),
      },
      {
        name: "WALKING OUT CONFIDENT",
        overlayText: "Speed Read RSVP — link in bio",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Motion blur walking shot, urban background, slight tilt",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A photo taken while walking on a city sidewalk \u2014 slight motion blur on the background which shows a glass office building exterior and city trees. The person's blazer sleeve and a coffee cup in hand visible at the edge. AirPods in ear visible at the top. Morning city light. The stride is confident, purposeful. This captures the 'main character walking to work' energy. Urban, professional, efficient. Slightly blurry, slightly tilted, authentic movement. The kind of photo someone takes of themselves mid-walk feeling like they're winning at life.",
        }),
      },
    ],
  },

  // ── Script 8: "Delete your Read Later list" (Viral/Productivity) ──
  {
    number: 8,
    slug: "viral-delete-read-later",
    hook: "delete your entire Read Later list. I'm serious.",
    caption:
      "delete your entire Read Later list. I'm serious. here's why. #productivity #readlater #reading #minimalism #cleantok #speedreading",
    audience: "Productivity",
    slides: [
      {
        name: "THE SHAME",
        overlayText: "delete your entire Read Later list. I'm serious.",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Medium-wide shot, person sitting on floor next to desk, looking up at overwhelming pile of unread material",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A person sitting on the floor next to their desk, leaning against the desk leg, looking up at a comically large pile of printed articles, bookmarked magazines, and sticky notes stacked on the desk above them. Their expression is overwhelmed resignation \u2014 shoulders slumped, looking up at the mountain of unread material with a 'what have I done' face. The pile is absurdly tall \u2014 teetering, some articles sliding off. They're in comfortable clothes \u2014 sweats, messy hair. Natural daylight from a window. The photo is taken by a friend who found them in this state. The perspective from the floor looking up makes the pile look even more intimidating. Candid, slightly humorous, deeply relatable.",
        }),
      },
      {
        name: "THE PILE",
        overlayText: "this is what 6 months of 'I'll read that later' looks like",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Dramatic angle on a huge stack of unread material, shot from below to make it look even bigger",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A dramatic low-angle photo of a massive stack of books, printed articles, magazines, and notebooks \u2014 shot from below to make the pile look intimidatingly tall. The stack is on a desk or table, slightly leaning and chaotic. Post-it notes and bookmarks sticking out everywhere, all unread. A coffee mug barely visible behind the stack for scale. Natural lighting from a window. The whole vibe is 'this is what months of saving things to read later actually looks like in real life'. Overwhelming, humorous, relatable. The low angle makes it feel like a mountain you'll never climb.",
        }),
      },
      {
        name: "THE LIBERATION",
        overlayText: "I speed read my entire backlog in one weekend",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Bright, clean, airy \u2014 dramatic contrast from the cluttered previous slides",
          },
          hardware_and_optical_fidelity: {
            camera_tier: "iPhone 15 Pro Max (Raw Mode)",
          },
          scene:
            "A dramatically clean and empty desk. The same desk from before, but now cleared off \u2014 just a laptop, a single coffee mug, and a small plant. Bright natural daylight flooding in from a window. The surface is clean and spacious. The energy is light, free, unburdened \u2014 the opposite of the cluttered mess before. This is the 'after' photo \u2014 the reading list is conquered. The bright lighting and clean space create a feeling of relief and fresh starts. Simple, satisfying, aspirational. Like a 'that girl' aesthetic photo but authentic and not overly curated.",
        }),
      },
      {
        name: "THE SATISFACTION",
        overlayText: "inbox zero energy. Speed Read RSVP — link in bio",
        prompt: buildPrompt({
          frame_initialization: {
            aspect_ratio: "9:16",
            composition_guide:
              "Selfie, person looking relieved and satisfied, clean background",
          },
          hardware_and_optical_fidelity: {
            camera_tier:
              "iPhone 15 Pro Max front camera (12MP TrueDepth)",
          },
          scene:
            "A front-camera selfie of someone sitting at their now-clean desk, looking directly at the camera with a satisfied, slightly smug expression. A small smile that says 'I actually did it'. Behind them is the clean, organized space. Good natural lighting on their face. They look relaxed and unburdened \u2014 the weight of 200 unread articles has been lifted. The selfie is casual and quick \u2014 the kind someone takes to post with the caption 'cleared my entire reading list in one weekend, AMA'. Slightly wide-angle front camera distortion. Genuine, not performative.",
        }),
      },
    ],
  },
];

// Helper: get script by number (1-indexed)
export function getScript(num: number): ScriptData | undefined {
  return SCRIPTS.find((s) => s.number === num);
}
