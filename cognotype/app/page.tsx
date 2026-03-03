"use client";
import { useState, useEffect, useRef } from "react";

// ============================================================
// SUPABASE CLIENT
// ============================================================
const SUPABASE_URL = "https://oxldcegwobpoqifbfxds.supabase.co";
const SUPABASE_KEY = "sb_publishable_y1_rgJrizcDv-0xSUegZ4Q_MP2YCdJc";

async function saveEmail(email, cognotype) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ email, cognotype })
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to save email:", e);
    return false;
  }
}

// ============================================================
// DATA: 36 Questions across 6 dimensions
// ============================================================
const QUESTIONS = [
  // ── Dimension 1: Attention Style (Q1-Q6) ──
  {
    id: 1, dim: "attention", type: "choice",
    en: "When you're working on something important, which describes you better?",
    options: [
      { text: "I can lock in for hours and lose track of time. The outside world fades away.", score: { attention: 5 } },
      { text: "My mind naturally drifts between what I'm doing and other thoughts, ideas, or things I notice around me.", score: { attention: -5 } }
    ]
  },
  {
    id: 2, dim: "attention", type: "choice",
    en: "You're reading an article. Halfway through, you hear an interesting conversation nearby. You:",
    options: [
      { text: "Barely notice it — you're absorbed in what you're reading.", score: { attention: 5 } },
      { text: "Tune in to the conversation, and might even find a surprising connection to what you're reading.", score: { attention: -5 } }
    ]
  },
  {
    id: 3, dim: "attention", type: "scale",
    en: "I find it easy to maintain focus on a single task for 60+ minutes without needing a break.",
    dim_key: "attention", direction: 1
  },
  {
    id: 4, dim: "attention", type: "scale",
    en: "My best ideas come to me when I'm NOT trying to think about the problem — like in the shower, on a walk, or right before sleep.",
    dim_key: "attention", direction: -1
  },
  {
    id: 5, dim: "attention", type: "choice",
    en: "You have a free Saturday afternoon. Which sounds more appealing?",
    options: [
      { text: "Spending 4 hours deep-diving into one topic that fascinates you.", score: { attention: 5 } },
      { text: "Exploring 3-4 different things — a podcast, a new café, a random article, a conversation.", score: { attention: -5 } }
    ]
  },
  {
    id: 6, dim: "attention", type: "scale",
    en: "In meetings or classes, I often notice details others miss — a change in someone's tone, background noise, or something visual.",
    dim_key: "attention", direction: -1
  },

  // ── Dimension 2: Cognitive Rhythm (Q7-Q12) ──
  {
    id: 7, dim: "rhythm", type: "triple",
    en: "If you had NO obligations tomorrow and could follow your body's natural rhythm, when would you wake up?",
    options: [
      { text: "Before 7:00 AM — I naturally wake up early and feel alert.", score: { rhythm_lark: 5 } },
      { text: "Between 7:00 and 9:00 AM — somewhere in the middle.", score: { rhythm_third: 5 } },
      { text: "After 9:00 AM — left to my own devices, I sleep in.", score: { rhythm_owl: 5 } }
    ]
  },
  {
    id: 8, dim: "rhythm", type: "triple",
    en: "When do you feel your mind is sharpest and most creative?",
    options: [
      { text: "Morning (before noon) — I do my best thinking early.", score: { rhythm_lark: 5 } },
      { text: "Afternoon (noon to 5pm) — I hit my stride mid-day.", score: { rhythm_third: 5 } },
      { text: "Evening/Night (after 5pm) — my brain really comes alive later.", score: { rhythm_owl: 5 } }
    ]
  },
  {
    id: 9, dim: "rhythm", type: "scale",
    en: "If I had an important exam or presentation, I would prefer to schedule it at 9:00 AM rather than 4:00 PM.",
    dim_key: "rhythm_lark", direction: 1
  },
  {
    id: 10, dim: "rhythm", type: "scale",
    en: "I often feel most energized and productive when most other people are winding down for the day.",
    dim_key: "rhythm_owl", direction: 1
  },
  {
    id: 11, dim: "rhythm", type: "triple",
    en: "On vacation with no schedule, you naturally tend to:",
    options: [
      { text: "Wake early, explore in the morning, and feel sleepy by 10 PM.", score: { rhythm_lark: 5 } },
      { text: "Keep a moderate schedule, flexible but not extreme either way.", score: { rhythm_third: 5 } },
      { text: "Stay up late enjoying the night, and sleep well past sunrise.", score: { rhythm_owl: 5 } }
    ]
  },
  {
    id: 12, dim: "rhythm", type: "scale",
    en: "I find it difficult to fall asleep before midnight, even when I try.",
    dim_key: "rhythm_owl", direction: 1
  },

  // ── Dimension 3: Working Memory (Q13-Q18) ──
  {
    id: 13, dim: "memory", type: "choice",
    en: "When working on projects, you tend to:",
    options: [
      { text: "Focus deeply on one thing until it's done. Switching tasks feels costly and disruptive.", score: { memory: 5 } },
      { text: "Keep several things going at once. You like variety and can jump between tasks easily.", score: { memory: -5 } }
    ]
  },
  {
    id: 14, dim: "memory", type: "choice",
    en: "You're preparing for an important decision. You prefer to:",
    options: [
      { text: "Go deep — research one option thoroughly, understand every angle before considering alternatives.", score: { memory: 5 } },
      { text: "Go broad — quickly survey multiple options, compare side by side, narrow down from there.", score: { memory: -5 } }
    ]
  },
  {
    id: 15, dim: "memory", type: "scale",
    en: "I get frustrated when I'm interrupted in the middle of a complex thought or task.",
    dim_key: "memory", direction: 1
  },
  {
    id: 16, dim: "memory", type: "scale",
    en: "I can comfortably hold a text conversation while listening to a podcast and still follow both.",
    dim_key: "memory", direction: -1
  },
  {
    id: 17, dim: "memory", type: "choice",
    en: "Your ideal workday looks more like:",
    options: [
      { text: "2-3 long blocks (90+ min each) of deep, uninterrupted work.", score: { memory: 5 } },
      { text: "Many shorter blocks (20-45 min) alternating between different types of tasks.", score: { memory: -5 } }
    ]
  },
  {
    id: 18, dim: "memory", type: "scale",
    en: "When learning something new, I prefer to master the fundamentals before moving to advanced topics.",
    dim_key: "memory", direction: 1
  },

  // ── Dimension 4: Reward Sensitivity (Q19-Q24) ──
  {
    id: 19, dim: "reward", type: "choice",
    en: "Which pattern sounds more like you?",
    options: [
      { text: "I get excited about new projects easily. Starting is the best part. But I sometimes struggle to finish.", score: { reward: 5 } },
      { text: "I'm slow to get excited, but once I commit, I stick with it. I don't need constant novelty.", score: { reward: -5 } }
    ]
  },
  {
    id: 20, dim: "reward", type: "choice",
    en: "When you see someone else achieving something impressive, your first reaction is:",
    options: [
      { text: "\"I want to do that too!\" — it fires you up and you start planning immediately.", score: { reward: 5 } },
      { text: "\"Good for them\" — you feel positive but it doesn't change what you're already working on.", score: { reward: -5 } }
    ]
  },
  {
    id: 21, dim: "reward", type: "scale",
    en: "I often find myself starting new hobbies, courses, or side projects, then losing interest before finishing them.",
    dim_key: "reward", direction: 1
  },
  {
    id: 22, dim: "reward", type: "scale",
    en: "I can work on a repetitive or routine task for a long time without feeling bored or needing variety.",
    dim_key: "reward", direction: -1
  },
  {
    id: 23, dim: "reward", type: "choice",
    en: "You've been on a long-term project for 3 months. A completely different, exciting opportunity appears. You:",
    options: [
      { text: "Seriously consider dropping the current project. The new thing feels too exciting to pass up.", score: { reward: 5 } },
      { text: "Note it down but stay the course. You'll explore it after you finish what you started.", score: { reward: -5 } }
    ]
  },
  {
    id: 24, dim: "reward", type: "scale",
    en: "Small wins and visible progress (like checking off a to-do list) significantly boost my motivation.",
    dim_key: "reward", direction: 1
  },

  // ── Dimension 5: Stress Response (Q25-Q30) ──
  {
    id: 25, dim: "stress", type: "triple",
    en: "A major deadline gets moved up by a week. Your most natural reaction is:",
    options: [
      { text: "Energy surge — \"Game on. Let me re-prioritize and power through.\" You work faster under pressure.", score: { stress_mob: 5 } },
      { text: "Mental blank — \"I can't think straight.\" Mind goes foggy, you stare at the screen.", score: { stress_freeze: 5 } },
      { text: "Avoidance — \"I'll deal with it later.\" You feel the urge to do something else entirely.", score: { stress_withdraw: 5 } }
    ]
  },
  {
    id: 26, dim: "stress", type: "triple",
    en: "You receive critical feedback on something you worked hard on. In the first few minutes, you:",
    options: [
      { text: "Feel a rush of determination — \"I'll fix this and make it better.\" Criticism fuels you.", score: { stress_mob: 5 } },
      { text: "Feel overwhelmed and stuck — your brain shuts down, hard to process what was said.", score: { stress_freeze: 5 } },
      { text: "Want to withdraw — you need space and time before engaging with the feedback.", score: { stress_withdraw: 5 } }
    ]
  },
  {
    id: 27, dim: "stress", type: "scale",
    en: "Under time pressure, my performance actually improves — I become sharper and more decisive.",
    dim_key: "stress_mob", direction: 1
  },
  {
    id: 28, dim: "stress", type: "scale",
    en: "When I'm stressed, my mind tends to go blank and I struggle to access information I normally know well.",
    dim_key: "stress_freeze", direction: 1
  },
  {
    id: 29, dim: "stress", type: "triple",
    en: "You're about to present to 50 people. With 5 minutes to go, you:",
    options: [
      { text: "Feel your heart racing but in an energizing way. You're ready.", score: { stress_mob: 5 } },
      { text: "Feel your mind going numb. You re-read notes but nothing sticks.", score: { stress_freeze: 5 } },
      { text: "Feel a strong urge to leave, postpone, or find a reason not to do it.", score: { stress_withdraw: 5 } }
    ]
  },
  {
    id: 30, dim: "stress", type: "scale",
    en: "After a stressful event, I recover quickly and get back to normal within minutes or hours, not days.",
    dim_key: "stress_mob", direction: 1
  },

  // ── Dimension 6: Social Cognition (Q31-Q36) ──
  {
    id: 31, dim: "social", type: "choice",
    en: "When meeting someone new, you naturally focus more on:",
    options: [
      { text: "Reading them — their emotions, body language, what they might be feeling.", score: { social: 5 } },
      { text: "Understanding them — their background, skills, how they think about problems.", score: { social: -5 } }
    ]
  },
  {
    id: 32, dim: "social", type: "choice",
    en: "When a friend comes to you with a problem, your instinct is to:",
    options: [
      { text: "Listen deeply, validate their feelings, and help them feel understood.", score: { social: 5 } },
      { text: "Analyze the situation, identify the root cause, and suggest a practical solution.", score: { social: -5 } }
    ]
  },
  {
    id: 33, dim: "social", type: "scale",
    en: "I often pick up on subtle emotional shifts in people around me — even before they say anything.",
    dim_key: "social", direction: 1
  },
  {
    id: 34, dim: "social", type: "scale",
    en: "I enjoy figuring out how complex systems work — the rules, patterns, and mechanics behind things.",
    dim_key: "social", direction: -1
  },
  {
    id: 35, dim: "social", type: "choice",
    en: "After a full day of social interaction, you:",
    options: [
      { text: "Feel energized but emotionally drained — you've absorbed a lot of other people's energy.", score: { social: 5 } },
      { text: "Feel mostly fine, but glad to have quiet time to think or work on your own projects.", score: { social: -5 } }
    ]
  },
  {
    id: 36, dim: "social", type: "scale",
    en: "I find it easier to understand a concept through a story about a person's experience than through a diagram or flowchart.",
    dim_key: "social", direction: 1
  }
];

// ============================================================
// DATA: 8 CognoTypes with full free + paid descriptions
// ============================================================
const COGNOTYPES = {
  deep_diver: {
    name: "The Deep Diver",
    emoji: "🫧",
    subtitle: "Your brain is a single-threaded supercomputer",
    color: "#0EA5E9",
    match: (d) => d.attnLabel === "Laser" && d.memLabel === "Depth" && d.rewLabel === "Steady",
    free: `You process the world by going deep — one thing at a time, with extraordinary intensity. Where others skim, you excavate. Your brain's dorsal attention network locks onto a target and holds it with remarkable stability, while your low reward sensitivity means you don't get pulled away by the next shiny thing.\n\nYour superpower is sustained, high-quality output. You're the person who reads the entire research paper while everyone else reads the abstract. You build things that are thorough, considered, and built to last. The world needs people who go all the way to the bottom.\n\nYour challenge is breadth. You may miss the forest for the trees, and context-switching costs you more than it costs most people. You may also struggle to start — because you know that once you begin, you're committing fully.`,
    paid: `## How Your Brain Works\n\nYour cognitive profile reveals a powerful alignment between three neural systems: a dominant dorsal attention network (DAN) that gives you exceptional sustained focus, a strong prefrontal-basal ganglia gating circuit that filters distractions before they reach your working memory, and a low-reactive dopaminergic reward system that keeps you on course without needing constant novelty.\n\nThis is a rare and valuable combination. In a world designed for distraction, your brain is built for depth.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Build your day around 2-3 deep work blocks of 90-120 minutes. Your ultradian rhythm (the brain's natural ~90-minute cycle) is your friend — don't fight it with 25-minute Pomodoros. You need longer runways.\n\n**Environment:** You need a low-stimulation workspace. Noise-cancelling headphones aren't optional — they're a productivity tool. Close every tab, notification, and app you're not actively using. Your prefrontal gating system is strong, but why waste its energy?\n\n**Task management:** Single-thread everything. Don't maintain a long to-do list — maintain a "doing now" and "doing next" list. When you finish one, move to the next. Context-switching is your kryptonite.\n\n**Communication:** Batch your emails and messages. Check 2-3 times per day at set times. Let people know your response time. Your best work happens when no one is interrupting you.\n\n## Learning Optimization\n\nYou learn best through immersion. When tackling a new subject, give yourself permission to spend days (not hours) on foundational material before moving forward. You'll feel slow at first, but your deep encoding means you retain far more than people who "speed-learn."\n\nAvoid courses that jump between topics. Look for deep, linear curricula. Books > bite-sized content for you.\n\n## Stress Management\n\nYour steady reward system is a double-edged sword under stress. You won't panic-react, but you may under-react — failing to mobilize energy when a deadline is genuinely urgent. Build external urgency cues: accountability partners, public commitments, visible countdown timers.\n\n## Team & Collaboration\n\nYou're the person teams need for their hardest, most complex problems. But you need protection from meeting culture. Advocate for "maker schedules" with at least one full day per week of zero meetings. When you must collaborate, prefer asynchronous communication (written docs > live meetings) so you can process deeply before responding.\n\n## Your Growth Edge\n\nPractice strategic shallow work. Not everything needs the full Deep Diver treatment. Build a "shallow work" muscle for quick decisions and rapid iteration — it'll make you more versatile without sacrificing your core strength.`
  },
  pathfinder: {
    name: "The Pathfinder",
    emoji: "🧭",
    subtitle: "Your brain is a radar scanner — always exploring new possibilities",
    color: "#F59E0B",
    match: (d) => d.attnLabel === "Lantern" && d.memLabel === "Breadth" && d.rewLabel === "Driver",
    free: `You experience the world in wide-angle. Your brain is constantly scanning, connecting, and jumping between ideas. Where others see separate domains, you see unexpected bridges. Your ventral attention network and default mode network work together in a dance that produces creative insights most people can't access.\n\nYour superpower is discovery. You're the one who finds the article no one else read, connects two ideas from different fields, and sees opportunities before they become obvious. You generate more ideas before breakfast than most people do in a week.\n\nYour challenge is completion. High reward sensitivity means you're drawn to the excitement of the new, and your broad working memory style means you have many plates spinning. The gap between your ideas and your finished projects may frustrate you.`,
    paid: `## How Your Brain Works\n\nYour cognitive architecture is optimized for exploration. A dominant ventral attention network means you're exceptionally responsive to unexpected stimuli — not because you're "distracted," but because your brain is wired to detect novelty and opportunity. Your flexible frontoparietal network allows you to rapidly switch between mental contexts, and your high dopaminergic reward sensitivity provides a powerful motivational engine for anything new.\n\nThis is the cognitive profile of innovators, entrepreneurs, and creative professionals.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Forget the single deep work block. Your brain thrives on variety. Structure your day as 4-6 shorter blocks (30-50 minutes) with deliberate transitions. Use transitions productively — a 5-minute walk between blocks helps your DMN consolidate insights.\n\n**Environment:** You may actually work better with moderate ambient stimulation (a café, music, background chatter). Complete silence can make your scanning brain turn inward in unproductive ways. Experiment with co-working spaces.\n\n**Task management:** Use a "capture system" religiously. Your brain generates ideas constantly — if you don't capture them, they'll nag at your attention. A quick-capture tool (voice notes, a notes app) frees your working memory. Then batch-process captured ideas once a week.\n\n**The 70% rule:** Ship at 70% quality. Your instinct is to move on when something is "good enough" — this is actually a feature, not a bug. Most projects don't need 100%. The exception: identify one project per quarter as your "deep commitment" and give it everything.\n\n## Learning Optimization\n\nYou learn best through connection, not depth. Instead of mastering one topic linearly, build a web of understanding across related topics. Interleaved learning (mixing topics in a study session) actually works better for your brain than blocked practice.\n\nPodcasts, video essays, and conversation-based learning > textbooks for you. Your DMN is active during narrative processing, which helps you encode information.\n\n## Stress Management\n\nYour high reward sensitivity means stress triggers a "flee to the new" response. Under pressure, you may abandon the current task for something more exciting. Counter this with pre-commitment devices: tell someone your deadline, put money on the line, or break the stressful task into micro-novelty chunks (do the hard task in a new location, with a new playlist, using a new tool).\n\n## Team & Collaboration\n\nYou're the team's idea generator and cross-pollinator. Pair yourself with a Deep Diver or Architect who can take your ideas and execute them systematically. In meetings, you add the most value in brainstorming phases — let others handle the follow-through planning.\n\n## Your Growth Edge\n\nBuild a "completion muscle." Choose ONE project and commit to shipping it fully before starting anything new. It'll feel uncomfortable. That's the growth. Use the Pathfinder's own trick: make the completion process novel — document it publicly, add a creative twist, challenge yourself to finish in a new way.`
  },
  commander: {
    name: "The Commander",
    emoji: "⚡",
    subtitle: "Your brain is a command center — sharpest under pressure",
    color: "#EF4444",
    match: (d) => d.attnLabel === "Laser" && d.stressLabel === "Mobilize" && d.socLabel === "Systemizer",
    free: `You're built for high-stakes situations. While other brains slow down under pressure, yours speeds up. Your strong dorsal attention network gives you laser focus, your mobilize stress response converts cortisol into performance fuel, and your systemizing cognitive style means you instinctively break complex situations into manageable components.\n\nYour superpower is crisis performance. You're the person others look to when everything is falling apart. You stay calm, see the structure of the problem, and execute decisively. Deadlines don't scare you — they sharpen you.\n\nYour challenge is peace. When there's no pressure, you may feel restless or unmotivated. You might unconsciously create urgency where none exists, or struggle with tasks that require patience without payoff.`,
    paid: `## How Your Brain Works\n\nYour neural architecture is optimized for performance under pressure. Your prefrontal cortex maintains effective top-down control even when your amygdala is highly activated — a coupling pattern that converts the stress response into focused energy rather than panic or shutdown. Combined with a systemizing cognitive style (strong parietal cortex engagement for pattern recognition and rule extraction), you naturally decompose chaos into order.\n\nThis is the cognitive profile of effective leaders, surgeons, litigators, and competitive athletes.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** You need stakes. Artificial urgency works: set aggressive deadlines, make public commitments, compete with yourself. A "boring Tuesday" is your worst enemy. Give every day a mission.\n\n**Environment:** You thrive in dynamic, slightly high-pressure environments. Open offices may work better for you than for most because the social pressure keeps you engaged. Or create your own pressure: a visible countdown timer, a standing desk, a bet with a friend.\n\n**Task management:** Work backward from deadlines. You naturally plan in reverse — use that. For long-term projects, create intermediate milestones with real consequences (share drafts publicly, schedule reviews).\n\n**Warning sign:** If you find yourself creating drama or conflict to feel stimulated, that's your brain craving activation. Channel it into legitimate high-stakes work instead.\n\n## Learning Optimization\n\nYou learn best under test conditions. Study by testing yourself, not by re-reading. Timed quizzes, mock exams, and teaching others activate your performance circuits. Low-stakes passive reading puts your brain to sleep.\n\nCompetitive learning environments (hackathons, debate clubs, timed challenges) accelerate your growth dramatically.\n\n## Stress Management\n\nYour challenge isn't stress — it's recovery. Your mobilize response means you can sustain high-intensity for remarkable periods, but you may not notice you're burning out until you crash. Build mandatory recovery protocols: a non-negotiable wind-down routine, regular days with zero stakes, and physical exercise to discharge the stress chemistry your body accumulates.\n\nWatch for chronic cortisol elevation signs: disrupted sleep, irritability, difficulty "turning off." These mean you've been in Commander mode too long without rest.\n\n## Team & Collaboration\n\nYou naturally take charge, especially in ambiguous or high-pressure situations. This is valuable — but be aware that your systemizing style may lead you to optimize for efficiency at the expense of team morale. Pair with Empath types (Alchemist, Catalyst) who can help you read the room.\n\nYour direct communication style works well with other Systemizers but may feel abrasive to more empathy-oriented types. Adjust, but don't apologize for your clarity.\n\n## Your Growth Edge\n\nLearn to operate without urgency. Practice tasks that have no deadline, no audience, and no competitive element. Meditation, journaling, or an open-ended creative hobby will stretch your brain into modes it doesn't naturally access.`
  },
  alchemist: {
    name: "The Alchemist",
    emoji: "✨",
    subtitle: "Your brain is a creative forge — blending depth with wide perception",
    color: "#A855F7",
    match: (d) => d.attnLabel === "Lantern" && d.memLabel === "Depth" && d.socLabel === "Empath",
    free: `You have one of the rarest cognitive profiles: deep processing combined with wide perception and high empathy. Your brain simultaneously scans the environment broadly (lantern attention) AND processes what it finds with unusual depth. Add empathic social cognition, and you're someone who understands both systems and the humans within them.\n\nYour superpower is original insight. You see patterns others miss because you're taking in more information AND processing it more thoroughly. Your creative output — whether in writing, design, strategy, or problem-solving — has a depth and humanity that purely systematic or purely empathic thinkers can't match.\n\nYour challenge is overwhelm. You're processing more than most brains, at greater depth, while also absorbing others' emotional states. Without careful energy management, you burn out.`,
    paid: `## How Your Brain Works\n\nYour brain has an unusual configuration: your ventral attention network and default mode network are both highly active (giving you wide-scanning, lantern-style attention), but your frontoparietal network also engages deeply with what your attention captures. Most people are either broad-but-shallow or narrow-but-deep. You're broad-and-deep.\n\nLayer on a highly active mentalizing network (medial prefrontal cortex, temporoparietal junction, superior temporal sulcus), and you're not just processing information — you're processing meaning. You naturally ask "what does this mean for people?" alongside "how does this work?"\n\n## Your Optimal Work Strategy\n\n**Daily structure:** You need a rhythm that alternates between input and processing. Morning: open, exploratory work (reading, conversations, research). Afternoon: deep, focused synthesis (writing, creating, building). Evening: recovery. Don't try to do both simultaneously — your depth processing needs dedicated time.\n\n**Environment:** You're more sensitive to your environment than most types. Noise, visual clutter, emotional tension in a room — you pick it all up, and it costs you processing bandwidth. Invest heavily in environment design: a calm, aesthetically pleasing workspace with control over sound and light.\n\n**Energy management:** Your cognitive battery drains faster than average because you're running more processes. Build in genuine rest (not "productive rest" like podcasts — actual stillness). A 20-minute eyes-closed break mid-day can double your afternoon output.\n\n**Creative output:** Your best work emerges after a period of broad input followed by solitary processing. Don't try to create and consume in the same block. Separate them.\n\n## Learning Optimization\n\nYou learn best through narrative + analysis. Read the case study, then build the model. Watch the documentary, then study the data. Your brain encodes information most effectively when it has both an emotional anchor (from your empathy) and a structural framework (from your depth processing).\n\nDiscussion-based learning is powerful for you — your empathic processing means you learn through understanding how others think.\n\n## Stress Management\n\nYour broad attention + deep processing + empathy means stress hits you on multiple channels simultaneously. The environment feels threatening, your deep processor gets stuck in loops, and you absorb others' anxiety. Your circuit-breaker: physical movement. Walking, yoga, or any embodied activity pulls your brain out of the empathy-rumination loop.\n\nAlso critical: boundary-setting with other people's emotions. You can sense what others feel, but you don't have to carry it. Practice compassionate detachment.\n\n## Team & Collaboration\n\nYou're the team's "meaning-maker" — the one who synthesizes diverse inputs into a coherent narrative that everyone can rally around. You bridge the gap between data-driven and people-driven team members. This is invaluable in cross-functional teams, product strategy, and leadership.\n\nProtect your solo processing time fiercely. You need more alone time than your empathic nature might suggest — the depth processing demands it.\n\n## Your Growth Edge\n\nLearn to produce before you feel "ready." Your broad input + deep processing means you always feel like you need more information. Set a cap: research for X hours, then create for X hours, regardless of whether you feel you have "enough." Your depth ensures that even your "incomplete" work is more thorough than most people's finished product.`
  },
  rhythmist: {
    name: "The Rhythmist",
    emoji: "🎵",
    subtitle: "Your brain is a precision clock — excellence through consistency",
    color: "#10B981",
    match: (d) => d.rhythmLabel === "Lark" && d.rewLabel === "Steady" && d.memLabel === "Depth",
    free: `You are the embodiment of reliable excellence. Your strong morning chronotype gives you a natural cognitive peak when the world is quiet, your low reward sensitivity means you don't chase novelty, and your deep processing style means you produce high-quality work consistently. Day after day, you deliver.\n\nYour superpower is compounding. While others have dramatic highs and lows, you steadily accumulate skill, knowledge, and output. Over months and years, this consistency produces extraordinary results. You're the tortoise who actually wins the race.\n\nYour challenge is adaptability. Disruptions to your routine hit you harder than most — travel, schedule changes, or unexpected demands can throw off your finely tuned system. You may also struggle to generate excitement about your work, even when it's objectively excellent.`,
    paid: `## How Your Brain Works\n\nYour suprachiasmatic nucleus (SCN) runs a strong, early-phase circadian rhythm, meaning your cortisol peaks early (fueling morning alertness) and your melatonin onset arrives early (supporting consistent sleep). This biological rhythm creates a predictable daily performance curve that you can optimize around.\n\nCombined with low dopaminergic reward sensitivity (you don't need external motivation hits) and deep working memory processing (you produce thorough, high-quality work), you have a cognitive architecture built for sustained excellence.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Your biological peak is roughly 2-4 hours after waking. If you wake at 6 AM, your golden window is 8 AM - 12 PM. Protect this window ruthlessly for your most important, cognitively demanding work. Schedule meetings, emails, and admin for the afternoon.\n\n**Routine is your infrastructure:** Don't fight your need for routine — engineer it. Same wake time (±30 min) every day, including weekends. Same deep work start time. Same pre-work ritual. Your brain's predictability is a feature: it reduces decision fatigue and lets you pour all cognitive resources into the actual work.\n\n**Afternoon strategy:** Your cognitive energy naturally dips post-lunch. Use this for lower-demand tasks: correspondence, organizing, reviewing (not creating). A 15-20 minute walk or rest around 2 PM can extend your useful day.\n\n**Evening:** Your brain is winding down. Don't fight it. Use evenings for leisure, social connection, and preparation for tomorrow.\n\n## Learning Optimization\n\nYour steady temperament and deep processing make you ideal for spaced repetition learning. Set up a daily review practice (Anki or equivalent) and your consistency will generate remarkable long-term retention. You won't feel the progress day-to-day, but look back after 3 months and you'll be amazed.\n\nLinear, structured curricula work best for you. Textbooks > random videos. Courses with clear progression > scattered resources.\n\n## Stress Management\n\nYour steady reward system means you handle chronic, moderate stress well — you don't overreact. But acute stress (sudden deadlines, unexpected conflict) can be destabilizing because it disrupts your rhythm. Build buffer time into your schedule so unexpected events don't cascade.\n\nYour morning routine is also your stress management system. If you protect it even during chaotic periods, you'll maintain your baseline performance.\n\n## Team & Collaboration\n\nYou're the reliability anchor every team needs. When projects go off the rails, your steady output keeps things moving. You're most valuable in roles that require sustained effort: editing, quality assurance, long-term project management, research.\n\nAdvocate for predictable schedules and clear expectations. Last-minute changes and ambiguity drain you disproportionately. If your team culture is chaotic, you may need to carve out your own island of structure.\n\n## Your Growth Edge\n\nIntroduce controlled novelty. Your rhythm is your strength, but it can become a cage. Once a month, deliberately break your routine: work from a different location, try a new method, start a project outside your comfort zone. The discomfort is the point — it builds the adaptability muscle your cognitive profile naturally under-develops.`
  },
  catalyst: {
    name: "The Catalyst",
    emoji: "🔥",
    subtitle: "Your brain is a chain reactor — igniting energy in yourself and others",
    color: "#F97316",
    match: (d) => d.rewLabel === "Driver" && d.stressLabel === "Mobilize" && d.socLabel === "Empath",
    free: `You're a high-energy connector. Your high reward sensitivity gives you an infectious enthusiasm for new ideas, your mobilize stress response means pressure fuels rather than paralyzes you, and your empathic social cognition means you naturally understand and motivate the people around you.\n\nYour superpower is activation — both self-activation and the activation of others. You can walk into a sluggish room and light it up. You generate momentum where there was none, and you pull people along with your energy. Startups, movements, and creative collaborations need Catalysts.\n\nYour challenge is sustainability. You burn bright, but you burn fast. Your high reward sensitivity means you may drop projects when the initial excitement fades, and your empathic absorption of others' energy means you can deplete yourself through over-giving.`,
    paid: `## How Your Brain Works\n\nYour cognitive profile combines three high-activation systems: a dopaminergic reward system that responds strongly to novelty and possibility, an amygdala-prefrontal circuit that converts stress into performance energy, and a highly active mentalizing network that makes you exquisitely attuned to others' emotional states.\n\nThis combination makes you a natural energizer. You feel more alive in the presence of possibility, pressure, and people — and your energy is contagious.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Front-load your day with your most exciting or social work. Your reward sensitivity means you need a motivational "hook" to pull you into the day. Boring admin first thing will kill your momentum. Start with something that excites you, build momentum, then ride that energy into harder tasks.\n\n**Social acceleration:** Unlike most productivity advice, you may actually work better with others present. Co-working sessions, body-doubling, or even a video call with a friend working alongside you can dramatically boost your output. Your empathic brain draws energy from social presence.\n\n**The accountability stack:** Your high reward sensitivity means intrinsic motivation alone isn't enough for long-term projects. Build external accountability: weekly check-ins with a partner, public progress updates, a mastermind group. You need the social-reward loop to sustain effort.\n\n**Energy cycling:** You naturally operate in bursts. 3-4 days of high-intensity output, then a recovery day. Don't try to maintain the same pace every day — plan your week to accommodate your natural cycle.\n\n## Learning Optimization\n\nYou learn best through teaching and discussion. The act of explaining something to someone else — powered by your empathic engagement — is your most effective encoding strategy. Study groups > solo study. Teaching > re-reading.\n\nYour high reward sensitivity also means you need visible progress. Use tools that show your learning streak, knowledge growth, or skill progression.\n\n## Stress Management\n\nYour mobilize response means you handle acute stress well — you actually perform better under pressure. Your risk is not stress itself, but empathic burnout: absorbing too much of others' anxiety, anger, or sadness.\n\nBuild "empathy firewalls": scheduled alone time after intense social interactions, physical exercise to discharge absorbed emotional energy, and clear boundaries about when you're "available" for others' emotional needs versus when you're recharging.\n\n## Team & Collaboration\n\nYou're the team's spark plug. You excel at kickoffs, brainstorming sessions, and rallying people around a vision. You also serve as the emotional barometer — you'll sense team tension before anyone else does.\n\nYour vulnerability: you may over-commit to helping others at the expense of your own work. Practice saying "I'd love to help — can we schedule it for Thursday?" instead of dropping everything immediately.\n\n## Your Growth Edge\n\nBuild a finishing practice. Your pattern is: ignite → accelerate → plateau → abandon → ignite something new. Break this cycle by partnering with a Steady type (Deep Diver, Rhythmist, Architect) who can hold you accountable through the unglamorous middle phase. Also: reframe "finishing" as its own reward. The dopamine hit of completion can be trained to be as strong as the hit of starting.`
  },
  observer: {
    name: "The Observer",
    emoji: "🔮",
    subtitle: "Your brain is a high-sensitivity receiver — deeply perceptive, carefully calibrated",
    color: "#6366F1",
    match: (d) => d.attnLabel === "Lantern" && d.socLabel === "Empath" && (d.stressLabel === "Freeze" || d.stressLabel === "Withdraw"),
    free: `You perceive more than almost anyone in the room. Your lantern attention takes in the full environment, your empathic social cognition reads every emotional undercurrent, and together they give you an almost uncanny ability to understand situations, people, and dynamics that others miss entirely.\n\nYour superpower is perception. You're the one who notices the thing no one else sees — the unspoken tension in a meeting, the flaw in a plan that everyone else overlooked, the emotional need that no one else addressed. In creative fields, counseling, writing, UX design, or any work requiring deep human understanding, you're exceptional.\n\nYour challenge is overload. Your freeze or withdraw stress response means that when the input becomes too much, your brain's protective mechanism kicks in — either shutting down processing or pulling away entirely. You need more recovery time than most, and you need it consistently.`,
    paid: `## How Your Brain Works\n\nYour brain is configured for maximum sensitivity. A dominant ventral attention network constantly scans the environment, a highly active mentalizing network (mPFC, TPJ, STS) processes social-emotional information in real-time, and your stress response system (freeze or withdraw) acts as a circuit breaker when input exceeds processing capacity.\n\nThis isn't a weakness — it's a sophisticated self-protection system. Your brain takes in more data than most, processes it more deeply, and has learned to shut down or retreat when overloaded rather than risk low-quality processing.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Plan your day around your energy, not your to-do list. Start with a gentle ramp-up (don't jump into high-stimulation tasks immediately). Place your most important work in your naturally calm period (this varies — you may need to experiment). Build in 15-20 minute buffers between activities.\n\n**Environment is everything:** You are the type most affected by your physical and social environment. Invest disproportionately in this: a private workspace, control over lighting and sound, the ability to close a door. Open offices are your nemesis.\n\n**Stimulus diet:** Curate your information intake carefully. Limit news consumption, social media scrolling, and exposure to others' crises. Your brain processes all of it, whether you want to or not. Be as intentional about your information diet as you would be about food.\n\n**The 60% rule:** Aim to use about 60% of your cognitive capacity on any given day. This feels like underperforming, but it prevents the crash-and-recover cycles that happen when you push to 100%. Consistent 60% > alternating 100% and 20%.\n\n## Learning Optimization\n\nYou learn best in calm, low-pressure environments. Timed tests, competitive settings, and public performance trigger your freeze/withdraw response and block learning. Instead: quiet reading, reflective journaling, one-on-one mentorship, and self-paced courses.\n\nYour deep empathic processing means you learn remarkably well through biography, narrative, and case studies. The emotional dimension anchors the information.\n\n## Stress Management\n\nThis is your most critical area. When stress exceeds your threshold:\n- **If you freeze:** Your prefrontal cortex temporarily loses control. The fastest reset is physiological: slow exhale (longer than inhale), cold water on wrists, or the "physiological sigh" (double inhale through nose, long exhale through mouth). This directly activates your vagus nerve and restores prefrontal function.\n- **If you withdraw:** Honor the impulse — partially. Give yourself a defined retreat period ("I'm going to step away for 20 minutes, then I'll come back to this"). The key is making the withdrawal time-bounded so it doesn't become avoidance.\n\nPreventive strategy: Build a daily nervous system regulation practice. This could be breathwork, gentle yoga, nature walks, or meditation. 10-15 minutes daily dramatically raises your stress threshold.\n\n## Team & Collaboration\n\nYou're the team's early warning system and its deepest listener. You notice problems before they escalate and understand stakeholders better than anyone. Your ideal role is advisor, reviewer, counselor, or quality guardian — positions where your perception is valued and you have some control over your exposure.\n\nAdvocate for written communication over live meetings when possible. You process complex information better when you can control the pace. In meetings, give yourself permission to listen rather than perform — your contributions after reflection are worth more than your real-time reactions.\n\n## Your Growth Edge\n\nBuild stress tolerance incrementally. Your freeze/withdraw response can be gradually expanded through controlled exposure. Start small: give a 2-minute talk to 3 people. Present to a friendly audience. Set a slightly uncomfortable deadline. Each time you complete the stressful task and recover, your threshold expands. Don't try to become a Commander — just widen your operating range.`
  },
  architect: {
    name: "The Architect",
    emoji: "📐",
    subtitle: "Your brain is a blueprint studio — building complex systems with precision",
    color: "#64748B",
    match: (d) => d.memLabel === "Depth" && d.socLabel === "Systemizer" && d.rewLabel === "Steady",
    free: `You think in structures. Your deep working memory naturally builds complex mental models, your systemizing cognitive style drives you to understand the rules and patterns behind everything, and your steady reward sensitivity means you can work on these models patiently, refining them over time.\n\nYour superpower is architecture — not just of buildings, but of ideas, systems, strategies, and frameworks. You see the underlying structure of things and can design solutions that are elegant, scalable, and robust. Where others see chaos, you see a system that just needs better design.\n\nYour challenge is the human element. Your systemizing style means you may underweight emotional and interpersonal factors in your plans. The "perfect" system fails if people don't want to use it. You may also struggle to communicate your complex mental models to others.`,
    paid: `## How Your Brain Works\n\nYour cognitive profile is defined by three interconnected strengths: a powerful frontoparietal network that maintains and manipulates complex information in working memory, a systemizing cognitive style driven by strong parietal cortex engagement (intraparietal sulcus, precuneus) for spatial reasoning and rule extraction, and low reward sensitivity that allows patient, iterative refinement.\n\nYou naturally think in abstractions, hierarchies, and systems. Where others see a list of facts, you see a tree structure. Where others see a process, you see a flowchart with optimization points.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** You need long, uninterrupted thinking blocks — even more than the Deep Diver. Your mental model-building requires sustained concentration and a "warm-up" period as you load the model into working memory. Plan for 120+ minute deep blocks with a 30-minute warm-up at the start (don't expect peak output immediately).\n\n**Externalize your thinking:** Your mental models are complex, and your working memory, while powerful, has limits. Use diagrams, mind maps, whiteboards, or structured note-taking systems to extend your cognitive workspace. The tool matters less than the habit of externalizing.\n\n**Version control your thinking:** You naturally iterate and refine. Keep versions of your work. Your V3 will be dramatically better than your V1, and having the history helps you understand your own thinking process.\n\n**Decision framework:** You may over-analyze. Give yourself a decision deadline for non-critical choices. For critical ones, your thorough analysis is an asset — just make sure the analysis phase has a clear endpoint.\n\n## Learning Optimization\n\nYou learn best by building models. When studying a new domain, your first question should be: "What is the structure of this field?" Build a taxonomy, a framework, or a diagram before diving into details. This gives your brain the scaffolding it needs to attach new information efficiently.\n\nYou may find textbooks frustrating if they don't present information structurally. Feel free to reorganize the material into your own framework as you learn — the reorganization itself is a powerful learning act.\n\n## Stress Management\n\nYour steady temperament handles chronic stress well, but your systemizing brain can get trapped in "optimization loops" under acute stress — endlessly analyzing the problem without acting. When you notice this, use a forcing function: "I will decide by 3 PM" or "I will ship whatever I have by Friday."\n\nPhysical activity is particularly important for you — it breaks the analytical loop and rebalances your nervous system.\n\n## Team & Collaboration\n\nYou're the team's systems thinker and long-term strategist. You excel at technical architecture, process design, strategic planning, and quality review. You catch structural flaws that others miss.\n\nYour growth area in teams is communication. Your mental models are complex, and translating them for non-Architects requires deliberate effort. Practice explaining your ideas in layers: start with the simplest version, then add complexity only as needed. Use visuals.\n\nPair with Catalysts or Pathfinders who can take your well-designed systems and sell them to stakeholders with energy and narrative.\n\n## Your Growth Edge\n\nDevelop your empathic channel. Your systemizing brain is a strength, but the most powerful architects design for humans, not for abstract optimization. Practice asking "How will this feel to use?" alongside "How does this work?" Read fiction, watch character-driven films, or spend time in user research — anything that exercises your mentalizing network.`
  }
};

// ============================================================
// SCORING LOGIC
// ============================================================
function computeResults(answers) {
  let scores = { attention: 18, memory: 18, reward: 18, social: 18 };
  let rhythm = { rhythm_lark: 0, rhythm_third: 0, rhythm_owl: 0 };
  let stress = { stress_mob: 0, stress_freeze: 0, stress_withdraw: 0 };

  answers.forEach((ans, idx) => {
    const q = QUESTIONS[idx];
    if (!ans && ans !== 0) return;
    if (q.type === "choice") {
      const chosen = q.options[ans];
      Object.entries(chosen.score).forEach(([k, v]) => {
        if (scores[k] !== undefined) scores[k] += v;
        if (rhythm[k] !== undefined) rhythm[k] += v;
        if (stress[k] !== undefined) stress[k] += v;
      });
    } else if (q.type === "triple") {
      const chosen = q.options[ans];
      Object.entries(chosen.score).forEach(([k, v]) => {
        if (rhythm[k] !== undefined) rhythm[k] += v;
        if (stress[k] !== undefined) stress[k] += v;
      });
    } else if (q.type === "scale") {
      const val = ans; // 0-4 → mapped to score
      const mapped = q.direction === 1
        ? [-(2), -(1), 0, 1, 2][val]
        : [2, 1, 0, -(1), -(2)][val];
      const key = q.dim_key;
      if (scores[key] !== undefined) scores[key] += mapped * 2.5;
      if (rhythm[key] !== undefined) rhythm[key] += (val + 1);
      if (stress[key] !== undefined) stress[key] += (val + 1);
    }
  });

  // Clamp scores
  Object.keys(scores).forEach(k => {
    scores[k] = Math.max(6, Math.min(30, Math.round(scores[k])));
  });

  // Determine labels
  const label = (s) => s >= 19 ? "high" : s <= 14 ? "low" : "mid";
  const attnLabel = scores.attention >= 19 ? "Laser" : scores.attention <= 14 ? "Lantern" : "Balanced";
  const memLabel = scores.memory >= 19 ? "Depth" : scores.memory <= 14 ? "Breadth" : "Balanced";
  const rewLabel = scores.reward >= 19 ? "Driver" : scores.reward <= 14 ? "Steady" : "Balanced";
  const socLabel = scores.social >= 19 ? "Empath" : scores.social <= 14 ? "Systemizer" : "Balanced";

  const rhythmArr = [
    { k: "Lark", v: rhythm.rhythm_lark },
    { k: "Third Bird", v: rhythm.rhythm_third },
    { k: "Owl", v: rhythm.rhythm_owl }
  ].sort((a, b) => b.v - a.v);
  const rhythmLabel = rhythmArr[0].v > 0 ? rhythmArr[0].k : "Third Bird";

  const stressArr = [
    { k: "Mobilize", v: stress.stress_mob },
    { k: "Freeze", v: stress.stress_freeze },
    { k: "Withdraw", v: stress.stress_withdraw }
  ].sort((a, b) => b.v - a.v);
  const stressLabel = stressArr[0].v > 0 ? stressArr[0].k : "Mobilize";

  const dims = { attnLabel, rhythmLabel, memLabel, rewLabel, stressLabel, socLabel };

  // Match type
  const typeKeys = Object.keys(COGNOTYPES);
  let matched = null;
  for (const k of typeKeys) {
    if (COGNOTYPES[k].match(dims)) { matched = k; break; }
  }
  // Fallback: weighted distance
  if (!matched) {
    let best = null, bestScore = -1;
    const attnNum = scores.attention;
    const memNum = scores.memory;
    const rewNum = scores.reward;
    const socNum = scores.social;
    // Simple heuristic matching
    if (attnLabel === "Laser" && memLabel === "Depth") matched = "deep_diver";
    else if (attnLabel === "Lantern" && rewLabel === "Driver") matched = "pathfinder";
    else if (stressLabel === "Mobilize" && socLabel === "Systemizer") matched = "commander";
    else if (attnLabel === "Lantern" && socLabel === "Empath") matched = stressLabel === "Freeze" || stressLabel === "Withdraw" ? "observer" : "alchemist";
    else if (rewLabel === "Steady" && memLabel === "Depth") matched = socLabel === "Systemizer" ? "architect" : "rhythmist";
    else if (rewLabel === "Driver" && socLabel === "Empath") matched = "catalyst";
    else if (rewLabel === "Driver") matched = "pathfinder";
    else matched = "architect";
  }

  return {
    scores,
    rhythm,
    stress,
    dims,
    typeKey: matched,
    type: COGNOTYPES[matched],
    radarData: [
      { label: "Focus", value: scores.attention, max: 30 },
      { label: "Rhythm", value: rhythmLabel === "Lark" ? 25 : rhythmLabel === "Owl" ? 10 : 18, max: 30 },
      { label: "Memory", value: scores.memory, max: 30 },
      { label: "Drive", value: scores.reward, max: 30 },
      { label: "Resilience", value: stressLabel === "Mobilize" ? 25 : stressLabel === "Freeze" ? 10 : 15, max: 30 },
      { label: "Empathy", value: scores.social, max: 30 }
    ]
  };
}

// ============================================================
// COMPONENTS
// ============================================================

// Radar chart using SVG
function RadarChart({ data, color, size = 280 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const pointAt = (i, val) => {
    const a = angleStep * i - Math.PI / 2;
    const ratio = val / 30;
    return { x: cx + r * ratio * Math.cos(a), y: cy + r * ratio * Math.sin(a) };
  };

  const gridLevels = [0.33, 0.66, 1];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {gridLevels.map((lv, i) => (
        <polygon key={i} points={data.map((_, j) => {
          const a = angleStep * j - Math.PI / 2;
          return `${cx + r * lv * Math.cos(a)},${cy + r * lv * Math.sin(a)}`;
        }).join(" ")} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const end = pointAt(i, 30);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      <polygon
        points={data.map((d, i) => { const p = pointAt(i, d.value); return `${p.x},${p.y}`; }).join(" ")}
        fill={color + "33"} stroke={color} strokeWidth="2.5"
      />
      {data.map((d, i) => {
        const p = pointAt(i, d.value);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />;
      })}
      {data.map((d, i) => {
        const labelR = r + 22;
        const a = angleStep * i - Math.PI / 2;
        const lx = cx + labelR * Math.cos(a);
        const ly = cy + labelR * Math.sin(a);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.7)" fontSize="11" fontFamily="inherit">{d.label}</text>
        );
      })}
    </svg>
  );
}

// Progress bar
function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #6366F1, #A855F7)", transition: "width 0.4s ease", borderRadius: 2 }} />
    </div>
  );
}

// Scale selector (1-5)
function ScaleSelector({ value, onChange }) {
  const labels = ["Strongly\nDisagree", "Disagree", "Neutral", "Agree", "Strongly\nAgree"];
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32 }}>
      {labels.map((lab, i) => (
        <button key={i} onClick={() => onChange(i)}
          style={{
            flex: 1, maxWidth: 90, padding: "16px 8px", borderRadius: 12,
            border: value === i ? "2px solid #A855F7" : "1px solid rgba(255,255,255,0.15)",
            background: value === i ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
            color: value === i ? "#E9D5FF" : "rgba(255,255,255,0.5)",
            cursor: "pointer", fontSize: 11, lineHeight: 1.3, whiteSpace: "pre-line",
            transition: "all 0.2s ease", fontFamily: "inherit"
          }}>
          {lab}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function CognoTypeApp() {
  const [screen, setScreen] = useState("landing"); // landing | quiz | result
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(36).fill(null));
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [fade, setFade] = useState(true);

  const containerRef = useRef(null);

  useEffect(() => { setFade(true); }, [qIndex, screen]);

  const currentQ = QUESTIONS[qIndex];

  const selectAnswer = (val) => {
    const newAns = [...answers];
    newAns[qIndex] = val;
    setAnswers(newAns);
    // Auto-advance after a short delay
    setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        if (qIndex < 35) {
          setQIndex(qIndex + 1);
        } else {
          const r = computeResults(newAns);
          setResult(r);
          setScreen("result");
        }
        setFade(true);
      }, 250);
    }, 300);
  };

  const goBack = () => {
    if (qIndex > 0) {
      setFade(false);
      setTimeout(() => { setQIndex(qIndex - 1); setFade(true); }, 250);
    }
  };

  // Shared styles
  const bg = "#0B0F1A";
  const cardBg = "rgba(255,255,255,0.04)";

  // ── LANDING ──
  if (screen === "landing") {
    return (
      <div style={{ minHeight: "100vh", background: bg, color: "#F1F5F9", fontFamily: "'Sora', 'Noto Sans SC', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-1px", margin: "0 0 8px", background: "linear-gradient(135deg, #A855F7, #6366F1, #0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          CognoType
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", margin: "0 0 32px", maxWidth: 460, lineHeight: 1.6 }}>
          Discover how your brain actually works.<br />
          <span style={{ fontSize: 14 }}>A neuroscience-based cognitive assessment. 36 questions. ~10 minutes.</span>
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 40, maxWidth: 500 }}>
          {["Attention Style", "Cognitive Rhythm", "Working Memory", "Reward Sensitivity", "Stress Response", "Social Cognition"].map((d, i) => (
            <span key={i} style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{d}</span>
          ))}
        </div>
        <button onClick={() => setScreen("quiz")}
          style={{
            padding: "16px 48px", fontSize: 17, fontWeight: 600, borderRadius: 14,
            border: "none", cursor: "pointer", fontFamily: "inherit",
            background: "linear-gradient(135deg, #7C3AED, #6366F1)",
            color: "white", boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onMouseEnter={e => { const el = e.target as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 6px 32px rgba(99,102,241,0.5)"; }}
          onMouseLeave={e => { const el = e.target as HTMLElement; el.style.transform = ""; el.style.boxShadow = "0 4px 24px rgba(99,102,241,0.4)"; }}>
          Take the Free Test →
        </button>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 20 }}>Based on peer-reviewed neuroscience research</p>
      </div>
    );
  }

  // ── QUIZ ──
  if (screen === "quiz") {
    const dimNames = { attention: "Attention Style", rhythm: "Cognitive Rhythm", memory: "Working Memory", reward: "Reward Sensitivity", stress: "Stress Response", social: "Social Cognition" };
    return (
      <div style={{ minHeight: "100vh", background: bg, color: "#F1F5F9", fontFamily: "'Sora', 'Noto Sans SC', system-ui, sans-serif", display: "flex", flexDirection: "column", padding: "24px 16px" }}>
        <div style={{ maxWidth: 600, width: "100%", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={goBack} disabled={qIndex === 0}
              style={{ background: "none", border: "none", color: qIndex === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)", cursor: qIndex === 0 ? "default" : "pointer", fontSize: 14, fontFamily: "inherit" }}>
              ← Back
            </button>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{qIndex + 1} / 36</span>
            <span style={{ fontSize: 11, color: "rgba(168,85,247,0.7)", padding: "3px 10px", borderRadius: 12, background: "rgba(168,85,247,0.1)" }}>
              {dimNames[currentQ.dim]}
            </span>
          </div>
          <ProgressBar current={qIndex} total={36} />

          {/* Question */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.25s ease, transform 0.25s ease" }}>
            <p style={{ fontSize: 19, lineHeight: 1.65, fontWeight: 500, marginBottom: 32, marginTop: 40, textAlign: "center", maxWidth: 520, alignSelf: "center" }}>
              {currentQ.en}
            </p>

            {(currentQ.type === "choice" || currentQ.type === "triple") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {currentQ.options.map((opt, i) => (
                  <button key={i} onClick={() => selectAnswer(i)}
                    style={{
                      padding: "18px 20px", borderRadius: 14, textAlign: "left",
                      border: answers[qIndex] === i ? "2px solid #A855F7" : "1px solid rgba(255,255,255,0.1)",
                      background: answers[qIndex] === i ? "rgba(168,85,247,0.12)" : cardBg,
                      color: answers[qIndex] === i ? "#E9D5FF" : "rgba(255,255,255,0.75)",
                      cursor: "pointer", fontSize: 15, lineHeight: 1.5, fontFamily: "inherit",
                      transition: "all 0.2s ease"
                    }}>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === "scale" && (
              <ScaleSelector value={answers[qIndex]} onChange={selectAnswer} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (screen === "result" && result) {
    const t = result.type;
    const dims = result.dims;
    return (
      <div style={{ minHeight: "100vh", background: bg, color: "#F1F5F9", fontFamily: "'Sora', 'Noto Sans SC', system-ui, sans-serif", padding: "32px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Type header */}
          <div style={{ textAlign: "center", marginBottom: 40, opacity: fade ? 1 : 0, transition: "opacity 0.6s ease" }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{t.emoji}</div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 8px", color: t.color }}>{t.name}</h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", margin: 0, fontStyle: "italic" }}>{t.subtitle}</p>
          </div>

          {/* Dimension tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
            {[
              { label: dims.attnLabel, dim: "Attention" },
              { label: dims.rhythmLabel, dim: "Rhythm" },
              { label: dims.memLabel, dim: "Memory" },
              { label: dims.rewLabel, dim: "Drive" },
              { label: dims.stressLabel, dim: "Stress" },
              { label: dims.socLabel, dim: "Social" }
            ].map((d, i) => (
              <span key={i} style={{ padding: "5px 12px", borderRadius: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {d.dim}: <strong style={{ color: "rgba(255,255,255,0.85)" }}>{d.label}</strong>
              </span>
            ))}
          </div>

          {/* Radar chart */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <RadarChart data={result.radarData} color={t.color} />
          </div>

          {/* Free description */}
          <div style={{ background: cardBg, borderRadius: 16, padding: 28, marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>Your Cognitive Profile</h2>
            {t.free.split("\n\n").map((p, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", margin: "0 0 16px" }}>{p}</p>
            ))}
          </div>

          {/* Share button */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
            <button onClick={() => {
              const text = `I'm ${t.name} ${t.emoji} — ${t.subtitle}. Discover your brain type → cognotype.com`;
              if (navigator.share) { navigator.share({ text }); }
              else if (navigator.clipboard) { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); }
            }} style={{ padding: "12px 28px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
              Share Your Type 🔗
            </button>
            <button onClick={() => { setScreen("quiz"); setQIndex(0); setAnswers(Array(36).fill(null)); setResult(null); }}
              style={{ padding: "12px 28px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
              Retake ↻
            </button>
          </div>

          {/* Blurred Report Preview + Email Wall */}
          <div style={{ background: cardBg, borderRadius: 16, padding: 28, marginBottom: 32, border: `1px solid ${t.color}33`, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ background: t.color + "22", color: t.color, padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>FULL REPORT</span>
              <span style={{ fontSize: 20, fontWeight: 600 }}>{t.name}</span>
            </div>

            {/* Show first 2 sections as blurred teaser */}
            {t.paid.split("\n\n").slice(0, 6).map((p, i) => {
              if (p.startsWith("## ")) {
                return <h3 key={i} style={{ fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 12, color: t.color }}>{p.replace("## ", "")}</h3>;
              }
              return <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.65)", margin: "0 0 14px", filter: i > 2 ? "blur(5px)" : "none", userSelect: i > 2 ? "none" : "auto" }}>{p.replace(/\*\*/g, "")}</p>;
            })}

            {/* Blur overlay */}
            <div style={{ position: "relative", marginTop: -20 }}>
              {/* More blurred lines as teaser */}
              {t.paid.split("\n\n").slice(6, 14).map((p, i) => {
                if (p.startsWith("## ")) {
                  return <h3 key={i} style={{ fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 12, color: t.color, filter: "blur(6px)", userSelect: "none" }}>{p.replace("## ", "")}</h3>;
                }
                return <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.65)", margin: "0 0 14px", filter: "blur(6px)", userSelect: "none" }}>{p.replace(/\*\*/g, "")}</p>;
              })}

              {/* Gradient fade overlay */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "linear-gradient(180deg, rgba(11,15,26,0) 0%, rgba(11,15,26,0.7) 30%, rgba(11,15,26,0.95) 60%, rgba(11,15,26,1) 100%)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 20
              }}>
              </div>
            </div>

            {/* Email collection CTA */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginTop: -60, paddingTop: 40 }}>
              {!emailSubmitted ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>Your Full Report is Almost Ready</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 4px", lineHeight: 1.6 }}>
                    Personalized work strategy • Learning optimization • Stress management
                  </p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 20px", lineHeight: 1.6 }}>
                    Team compatibility • Detailed neuroscience breakdown
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 20px" }}>
                    ~2,000 words of neuroscience-backed insights specific to {t.name}
                  </p>
                  <div style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && email.includes("@")) {
                          setEmailSubmitted(true);
                          saveEmail(email, result.type.name);
                        }
                      }}
                      style={{
                        flex: 1, minWidth: 220, padding: "14px 18px", borderRadius: 12,
                        border: "1px solid rgba(168,85,247,0.3)", background: "rgba(255,255,255,0.05)",
                        color: "#F1F5F9", fontSize: 15, outline: "none", fontFamily: "inherit"
                      }}
                    />
                    <button
                      onClick={() => {
                        if (email.includes("@")) {
                          setEmailSubmitted(true);
                          saveEmail(email, result.type.name);
                        }
                      }}
                      style={{
                        padding: "14px 28px", fontSize: 15, fontWeight: 600, borderRadius: 12,
                        border: "none", cursor: "pointer", fontFamily: "inherit",
                        background: "linear-gradient(135deg, #7C3AED, #6366F1)", color: "white",
                        boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
                        opacity: email.includes("@") ? 1 : 0.5
                      }}>
                      Notify Me
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>We'll email you when the full report launches. No spam.</p>
                </>
              ) : (
                <div style={{ padding: "20px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>You're on the list!</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 4px", lineHeight: 1.6 }}>
                    We'll send your full {t.name} report as soon as it's ready.
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
                    In the meantime — share your type with friends ↓
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NeuroFlow CTA */}
          <div style={{ background: "rgba(14,165,233,0.08)", borderRadius: 16, padding: 28, textAlign: "center", border: "1px solid rgba(14,165,233,0.15)", marginBottom: 40 }}>
            <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 8px", color: "rgba(255,255,255,0.8)" }}>Now you know your CognoType. Ready to put it into action?</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>NeuroFlow — a deep work system designed for YOUR brain type. Coming soon.</p>
            <button style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(14,165,233,0.3)", background: "rgba(14,165,233,0.1)", color: "#7DD3FC", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
              Join the Waitlist →
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", paddingBottom: 40 }}>
            CognoType™ — Based on peer-reviewed neuroscience research<br />
            Dimensions informed by: Corbetta & Shulman (2002), Vogel & Machizawa (2004), Baron-Cohen E-S Theory, and more.
          </p>
        </div>
      </div>
    );
  }

  return null;
}