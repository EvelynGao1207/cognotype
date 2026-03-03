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
// 36 Questions - Chinese
// ============================================================
const QUESTIONS = [
  // D1: 注意力模式
  { id:1, dim:"attention", type:"choice",
    text:"当你在做一件重要的事情时，哪种描述更像你？",
    options:[
      { text:"我能连续专注好几个小时，完全忘记时间。外界的一切都自动消失了。", score:{attention:5} },
      { text:"我的思绪会自然地在手头的事和其他想法之间来回跳跃，脑子里总会冒出别的念头。", score:{attention:-5} }
    ]},
  { id:2, dim:"attention", type:"choice",
    text:"你正在读一篇文章，读到一半时，旁边传来一段有趣的对话。你会：",
    options:[
      { text:"几乎没注意到——我完全沉浸在阅读中。", score:{attention:5} },
      { text:"会听一下那个对话，甚至可能发现它和我在读的内容有意想不到的联系。", score:{attention:-5} }
    ]},
  { id:3, dim:"attention", type:"scale",
    text:"我可以很轻松地连续专注一件事60分钟以上，中间不需要休息。",
    dim_key:"attention", direction:1 },
  { id:4, dim:"attention", type:"scale",
    text:"我最好的想法往往不是在刻意思考时产生的——而是在洗澡、散步或临睡前突然冒出来的。",
    dim_key:"attention", direction:-1 },
  { id:5, dim:"attention", type:"choice",
    text:"周末下午你有一段自由时间，哪种安排更吸引你？",
    options:[
      { text:"花4个小时深入研究一个让我着迷的主题。", score:{attention:5} },
      { text:"做3-4件不同的事——听个播客、探索一家新店、读篇随机文章、找朋友聊天。", score:{attention:-5} }
    ]},
  { id:6, dim:"attention", type:"scale",
    text:"在会议或课堂上，我经常注意到别人忽略的细节——比如某人语气的变化、背景声音或视觉上的小变化。",
    dim_key:"attention", direction:-1 },

  // D2: 认知节律
  { id:7, dim:"rhythm", type:"triple",
    text:"如果明天完全没有安排，可以完全跟随身体的自然节奏，你会几点醒来？",
    options:[
      { text:"7点之前——我天生就会早起，醒来就很清醒。", score:{rhythm_lark:5} },
      { text:"7点到9点之间——不算早也不算晚。", score:{rhythm_third:5} },
      { text:"9点之后——没人叫我的话，我会一直睡。", score:{rhythm_owl:5} }
    ]},
  { id:8, dim:"rhythm", type:"triple",
    text:"你觉得自己的大脑在什么时候最清醒、最有创造力？",
    options:[
      { text:"上午（中午之前）——我的最佳思考时间在早上。", score:{rhythm_lark:5} },
      { text:"下午（中午到5点）——我在下午才进入最佳状态。", score:{rhythm_third:5} },
      { text:"傍晚/深夜（5点之后）——我的大脑越到晚上越活跃。", score:{rhythm_owl:5} }
    ]},
  { id:9, dim:"rhythm", type:"scale",
    text:"如果有一场重要的考试或演讲，比起下午4点，我更愿意安排在早上9点。",
    dim_key:"rhythm_lark", direction:1 },
  { id:10, dim:"rhythm", type:"scale",
    text:"当大多数人开始放松的时候，我反而觉得精力最充沛、效率最高。",
    dim_key:"rhythm_owl", direction:1 },
  { id:11, dim:"rhythm", type:"triple",
    text:"度假时没有任何日程安排，你的自然作息会是：",
    options:[
      { text:"早起，上午出去玩，晚上10点就困了。", score:{rhythm_lark:5} },
      { text:"作息比较适中，不会特别早也不会特别晚。", score:{rhythm_third:5} },
      { text:"玩到深夜享受夜生活，然后一觉睡到日上三竿。", score:{rhythm_owl:5} }
    ]},
  { id:12, dim:"rhythm", type:"scale",
    text:"即使我刻意早睡，在午夜之前也很难入睡。",
    dim_key:"rhythm_owl", direction:1 },

  // D3: 工作记忆
  { id:13, dim:"memory", type:"choice",
    text:"做项目时，你通常倾向于：",
    options:[
      { text:"集中精力做一件事直到完成。切换任务对我来说代价很大，会打断我的思路。", score:{memory:5} },
      { text:"同时推进好几件事。我喜欢有变化，在不同任务之间切换对我来说很轻松。", score:{memory:-5} }
    ]},
  { id:14, dim:"memory", type:"choice",
    text:"你要做一个重要决定时，更倾向于：",
    options:[
      { text:"深入研究——把一个选项彻底研究透，了解每个角度，再考虑其他方案。", score:{memory:5} },
      { text:"广泛了解——快速浏览多个选项，放在一起比较，然后逐步缩小范围。", score:{memory:-5} }
    ]},
  { id:15, dim:"memory", type:"scale",
    text:"当我正在进行复杂的思考或任务时被打断，我会感到很沮丧。",
    dim_key:"memory", direction:1 },
  { id:16, dim:"memory", type:"scale",
    text:"我可以一边回微信消息一边听播客，两边都能跟上。",
    dim_key:"memory", direction:-1 },
  { id:17, dim:"memory", type:"choice",
    text:"你理想的工作日安排更像是：",
    options:[
      { text:"2-3个长时段（每段90分钟以上）的深度、不被打扰的工作。", score:{memory:5} },
      { text:"很多短时段（每段20-45分钟），在不同类型的任务之间交替进行。", score:{memory:-5} }
    ]},
  { id:18, dim:"memory", type:"scale",
    text:"学习新东西时，我更喜欢先把基础打牢，再进入进阶内容。",
    dim_key:"memory", direction:1 },

  // D4: 奖赏敏感性
  { id:19, dim:"reward", type:"choice",
    text:"哪种模式更像你？",
    options:[
      { text:"我很容易对新项目感到兴奋。开始是最棒的部分。但有时候我很难坚持到最后。", score:{reward:5} },
      { text:"我不容易兴奋，但一旦决定做某件事，就会坚持下去。我不需要不断的新鲜感。", score:{reward:-5} }
    ]},
  { id:20, dim:"reward", type:"choice",
    text:"当你看到别人取得了令人印象深刻的成就时，你的第一反应是：",
    options:[
      { text:"\u300c我也要做到！\u300d——立刻被点燃，马上开始规划。", score:{reward:5} },
      { text:"\u300c挺好的\u300d——觉得不错，但不会改变我正在做的事情。", score:{reward:-5} }
    ]},
  { id:21, dim:"reward", type:"scale",
    text:"我经常会开始新的爱好、课程或副业项目，但在完成之前就失去了兴趣。",
    dim_key:"reward", direction:1 },
  { id:22, dim:"reward", type:"scale",
    text:"我可以长时间做重复或日常的工作，不会觉得无聊或需要换换花样。",
    dim_key:"reward", direction:-1 },
  { id:23, dim:"reward", type:"choice",
    text:"你已经做了3个月的长期项目。这时一个完全不同的、令人兴奋的机会出现了。你会：",
    options:[
      { text:"认真考虑放弃当前项目。新的东西太诱人了，不想错过。", score:{reward:5} },
      { text:"记下来，但继续当前的工作。做完手头的事再去探索新机会。", score:{reward:-5} }
    ]},
  { id:24, dim:"reward", type:"scale",
    text:"小成就和可见的进展（比如划掉待办事项）能大大提升我的动力。",
    dim_key:"reward", direction:1 },

  // D5: 压力反应
  { id:25, dim:"stress", type:"triple",
    text:"一个重要的截止日期突然提前了一周。你最自然的反应是：",
    options:[
      { text:"能量爆发——\u300c来吧！让我重新排优先级，全力冲刺。\u300d压力让我更高效。", score:{stress_mob:5} },
      { text:"大脑一片空白——\u300c我完全想不了了。\u300d脑子像卡住了，盯着屏幕发呆。", score:{stress_freeze:5} },
      { text:"想逃避——\u300c我晚点再处理。\u300d忍不住想去做点别的事情。", score:{stress_withdraw:5} }
    ]},
  { id:26, dim:"stress", type:"triple",
    text:"你花了很多心血的作品收到了批评意见。在最初几分钟里，你：",
    options:[
      { text:"感到一股斗志——\u300c我来改进它，做得更好。\u300d批评反而激发了我。", score:{stress_mob:5} },
      { text:"感到不知所措和僵住——大脑关机了，很难消化对方说了什么。", score:{stress_freeze:5} },
      { text:"想要退缩——我需要先一个人待着，过一段时间再去面对这些反馈。", score:{stress_withdraw:5} }
    ]},
  { id:27, dim:"stress", type:"scale",
    text:"在时间压力下，我的表现反而会提升——我会变得更敏锐、更果断。",
    dim_key:"stress_mob", direction:1 },
  { id:28, dim:"stress", type:"scale",
    text:"压力大的时候，我的大脑容易一片空白，平时明明知道的东西也想不起来了。",
    dim_key:"stress_freeze", direction:1 },
  { id:29, dim:"stress", type:"triple",
    text:"你即将面对50个人做演讲。还有5分钟就要上场，你：",
    options:[
      { text:"心跳加速，但这种感觉是振奋的。我准备好了。", score:{stress_mob:5} },
      { text:"感觉大脑在发麻。反复看笔记但什么都记不住。", score:{stress_freeze:5} },
      { text:"强烈地想离开、推迟，或者找个理由不上场。", score:{stress_withdraw:5} }
    ]},
  { id:30, dim:"stress", type:"scale",
    text:"经历压力事件后，我能在几分钟到几小时内恢复正常，不会拖上好几天。",
    dim_key:"stress_mob", direction:1 },

  // D6: 社会认知
  { id:31, dim:"social", type:"choice",
    text:"认识一个新朋友时，你自然会更关注：",
    options:[
      { text:"感受他们——他们的情绪、肢体语言、此刻可能在想什么。", score:{social:5} },
      { text:"了解他们——他们的背景、技能、思考问题的方式。", score:{social:-5} }
    ]},
  { id:32, dim:"social", type:"choice",
    text:"朋友来找你倾诉一个困难，你的本能反应是：",
    options:[
      { text:"认真倾听，认可他们的感受，让他们感到被理解。", score:{social:5} },
      { text:"分析情况，找到问题的根源，提出一个切实的解决方案。", score:{social:-5} }
    ]},
  { id:33, dim:"social", type:"scale",
    text:"我经常能察觉到周围人微妙的情绪变化——甚至在他们开口之前。",
    dim_key:"social", direction:1 },
  { id:34, dim:"social", type:"scale",
    text:"我喜欢研究复杂系统的运作方式——规则、模式和背后的机制。",
    dim_key:"social", direction:-1 },
  { id:35, dim:"social", type:"choice",
    text:"经过一整天高强度的社交活动后，你：",
    options:[
      { text:"感觉被激发但情绪上很疲惫——我吸收了太多别人的情绪能量。", score:{social:5} },
      { text:"感觉还好，但很开心终于有安静的时间，可以独处思考或做自己的事了。", score:{social:-5} }
    ]},
  { id:36, dim:"social", type:"scale",
    text:"比起图表或流程图，我更容易通过一个人的真实经历故事来理解一个概念。",
    dim_key:"social", direction:1 }
];

// ============================================================
// 8 COGNOTYPES - Bilingual
// ============================================================
const COGNOTYPES = {
  deep_diver: {
    name: { en: "The Deep Diver", zh: "深潜者" },
    emoji: "\u{1FAE7}",
    subtitle: { en: "Your brain is a single-threaded supercomputer", zh: "你的大脑是一台单线程超级计算机" },
    color: "#0EA5E9",
    match: (d) => d.attnLabel === "Laser" && d.memLabel === "Depth" && d.rewLabel === "Steady",
    free: {
      en: `You process the world by going deep \u2014 one thing at a time, with extraordinary intensity. Where others skim, you excavate. Your brain's dorsal attention network locks onto a target and holds it with remarkable stability, while your low reward sensitivity means you don't get pulled away by the next shiny thing.\n\nYour superpower is sustained, high-quality output. You're the person who reads the entire research paper while everyone else reads the abstract. You build things that are thorough, considered, and built to last. The world needs people who go all the way to the bottom.\n\nYour challenge is breadth. You may miss the forest for the trees, and context-switching costs you more than it costs most people. You may also struggle to start \u2014 because you know that once you begin, you're committing fully.`,
      zh: `你通过深入来认识世界——一次只做一件事，投入惊人的专注力。别人浅尝辄止的地方，你会一直挖下去。你大脑的背侧注意网络能够锁定一个目标并保持异常稳定的关注，而较低的奖赏敏感性意味着你不会被下一个新鲜事物轻易带走。\n\n你的超能力是持续、高质量的产出。你是那个在所有人只看摘要的时候，把整篇研究论文从头读到尾的人。你做出来的东西——周到、严谨、经得起时间考验。\n\n你的挑战在于广度。你可能会"只见树木不见森林"，而且上下文切换对你来说比对大多数人更费力。你可能也不太容易"开始"——因为你知道一旦开始，你就是全力以赴。`
    },
    paid: {
      en: `## How Your Brain Works\n\nYour cognitive profile reveals a powerful alignment between three neural systems: a dominant dorsal attention network (DAN) that gives you exceptional sustained focus, a strong prefrontal-basal ganglia gating circuit that filters distractions before they reach your working memory, and a low-reactive dopaminergic reward system that keeps you on course without needing constant novelty.\n\nThis is a rare and valuable combination. In a world designed for distraction, your brain is built for depth.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Build your day around 2-3 deep work blocks of 90-120 minutes. Your ultradian rhythm is your friend \u2014 don't fight it with 25-minute Pomodoros.\n\n**Environment:** You need a low-stimulation workspace. Noise-cancelling headphones aren't optional \u2014 they're a productivity tool.\n\n**Task management:** Single-thread everything. Don't maintain a long to-do list \u2014 maintain a "doing now" and "doing next" list.\n\n## Learning Optimization\n\nYou learn best through immersion. Give yourself permission to spend days on foundational material. Avoid courses that jump between topics. Books > bite-sized content.\n\n## Stress Management\n\nYour steady reward system is a double-edged sword under stress. Build external urgency cues: accountability partners, public commitments, visible countdown timers.\n\n## Team & Collaboration\n\nYou're the person teams need for their hardest problems. Advocate for "maker schedules" with zero-meeting days. Prefer asynchronous communication.\n\n## Your Growth Edge\n\nPractice strategic shallow work. Build a "shallow work" muscle for quick decisions and rapid iteration.`,
      zh: `## 你的大脑是怎么运作的\n\n你的认知特征揭示了三个神经系统的强大协同：一个主导性的背侧注意网络(DAN)赋予你卓越的持续专注力，一个强大的前额叶-基底节门控回路在干扰信息进入工作记忆之前就过滤掉它们，以及一个低反应性的多巴胺奖赏系统让你保持航向。\n\n这是一种稀有且宝贵的组合。在一个为分散注意力而设计的世界里，你的大脑天生就是为深度而生的。\n\n## 你的最佳工作策略\n\n**日常安排：** 围绕2-3个90-120分钟的深度工作时段来规划你的一天。你的超日节律是你的盟友——不要用25分钟的番茄钟来对抗它。\n\n**环境设计：** 你需要低刺激的工作空间。降噪耳机不是可选项——它是你的生产力工具。\n\n**任务管理：** 一切都单线程处理。只维护"正在做"和"下一个做"的清单。上下文切换是你的致命弱点。\n\n## 学习优化\n\n你通过沉浸来学习效果最好。允许自己花几天在基础材料上。避免跳来跳去的课程。书本 > 碎片化内容。\n\n## 压力管理\n\n你稳定的奖赏系统在压力下是双刃剑。建立外部紧迫感线索：问责伙伴，公开承诺，倒计时器。\n\n## 团队协作\n\n你是团队中解决最难问题的人。争取每周至少一整天零会议。优先选择异步沟通。\n\n## 你的成长方向\n\n练习有策略的"浅工作"。培养快速决策和快速迭代的能力。`
    }
  },
  pathfinder: {
    name: { en: "The Pathfinder", zh: "探路者" },
    emoji: "\u{1F9ED}",
    subtitle: { en: "Your brain is a radar scanner \u2014 always exploring new possibilities", zh: "你的大脑是一台雷达扫描仪——永远在探索新的可能性" },
    color: "#F59E0B",
    match: (d) => d.attnLabel === "Lantern" && d.memLabel === "Breadth" && d.rewLabel === "Driver",
    free: {
      en: `You experience the world in wide-angle. Your brain is constantly scanning, connecting, and jumping between ideas. Where others see separate domains, you see unexpected bridges. Your ventral attention network and default mode network work together in a dance that produces creative insights most people can't access.\n\nYour superpower is discovery. You're the one who finds the article no one else read, connects two ideas from different fields, and sees opportunities before they become obvious.\n\nYour challenge is completion. High reward sensitivity means you're drawn to the excitement of the new. The gap between your ideas and your finished projects may frustrate you.`,
      zh: `你用广角镜头体验世界。你的大脑在不停地扫描、连接，在不同的想法之间跳跃。别人看到的是各自独立的领域，你看到的是意想不到的桥梁。你的腹侧注意网络和默认模式网络协同工作，产生大多数人无法触及的创造性洞察。\n\n你的超能力是发现。你是那个找到没人读过的文章、连接两个不同领域的想法、在机会变得显而易见之前就看到它的人。\n\n你的挑战在于完成。高奖赏敏感性意味着你总被新事物的兴奋感吸引。想法和完成品之间的差距可能会让你感到沮丧。`
    },
    paid: {
      en: `## How Your Brain Works\n\nYour cognitive architecture is optimized for exploration. A dominant ventral attention network means you're exceptionally responsive to unexpected stimuli. Your flexible frontoparietal network allows rapid context-switching, and high dopaminergic reward sensitivity provides a powerful motivational engine.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Structure your day as 4-6 shorter blocks (30-50 min) with deliberate transitions. A 5-minute walk between blocks helps consolidate insights.\n\n**Task management:** Use a "capture system" religiously. Quick-capture tools free your working memory. Batch-process ideas weekly.\n\n**The 70% rule:** Ship at 70% quality. Pick one project per quarter as your "deep commitment."\n\n## Learning Optimization\n\nInterleaved learning works better for your brain than blocked practice. Podcasts and discussion > textbooks.\n\n## Stress Management\n\nStress triggers a "flee to the new" response. Counter with pre-commitment devices and micro-novelty chunks.\n\n## Team & Collaboration\n\nYou're the team's idea generator. Pair with a Deep Diver or Architect for execution.\n\n## Your Growth Edge\n\nBuild a "completion muscle." Choose ONE project and commit to shipping it fully before starting anything new.`,
      zh: `## 你的大脑是怎么运作的\n\n你的认知架构为探索而优化。主导性的腹侧注意网络让你对意外刺激有超强反应。灵活的额顶网络让你快速切换心理情境，高多巴胺奖赏敏感性为新事物提供强大动力引擎。\n\n## 你的最佳工作策略\n\n**日常安排：** 安排4-6个较短时段（30-50分钟），时段之间有刻意的过渡。5分钟散步能帮助整合洞察。\n\n**任务管理：** 虔诚地使用"捕捉系统"。快速捕捉工具能释放工作记忆。每周批量处理一次。\n\n**70%法则：** 在70%完成度时就发布。每季度选一个项目作为"深度承诺"。\n\n## 学习优化\n\n交叉学习比集中练习更有效。播客和讨论 > 教科书。\n\n## 压力管理\n\n压力会触发"逃向新事物"的反应。用预先承诺和"微新鲜感"小块来对抗。\n\n## 团队协作\n\n你是团队的创意发生器。和深潜者或建筑师搭档执行。\n\n## 你的成长方向\n\n培养"完成肌肉"。选一个项目，承诺完整交付后再开始新事物。`
    }
  },
  commander: {
    name: { en: "The Commander", zh: "指挥官" },
    emoji: "\u26A1",
    subtitle: { en: "Your brain is a command center \u2014 sharpest under pressure", zh: "你的大脑是一个指挥中心——在压力下最为敏锐" },
    color: "#EF4444",
    match: (d) => d.attnLabel === "Laser" && d.stressLabel === "Mobilize" && d.socLabel === "Systemizer",
    free: {
      en: `You're built for high-stakes situations. While other brains slow down under pressure, yours speeds up. Your strong dorsal attention network gives you laser focus, your mobilize stress response converts cortisol into performance fuel, and your systemizing cognitive style means you instinctively break complex situations into manageable components.\n\nYour superpower is crisis performance. You're the person others look to when everything is falling apart. You stay calm, see the structure of the problem, and execute decisively.\n\nYour challenge is peace. When there's no pressure, you may feel restless or unmotivated. You might unconsciously create urgency where none exists.`,
      zh: `你天生适合高风险场景。当别人的大脑在压力下变慢时，你的却在加速。强大的背侧注意网络给你激光般的聚焦力，"激活型"压力反应把压力荷尔蒙转化为表现燃料，而系统导向的认知风格意味着你本能地把复杂问题拆解为可管理的组件。\n\n你的超能力是危机表现。你是那个在一切崩溃时所有人都会看向的人。你保持冷静，看清问题的结构，果断执行。\n\n你的挑战在于平静。当没有压力时，你可能感到焦躁或缺乏动力。你可能会无意识地制造紧迫感。`
    },
    paid: {
      en: `## How Your Brain Works\n\nYour prefrontal cortex maintains effective top-down control even when your amygdala is highly activated \u2014 converting stress into focused energy rather than panic.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** You need stakes. Set aggressive deadlines, make public commitments. Give every day a mission.\n\n**Warning sign:** If you're creating drama for stimulation, channel it into legitimate high-stakes work.\n\n## Learning Optimization\n\nYou learn best under test conditions. Timed quizzes, mock exams, and teaching others activate your performance circuits.\n\n## Stress Management\n\nYour challenge isn't stress \u2014 it's recovery. Build mandatory recovery protocols and watch for chronic cortisol elevation signs.\n\n## Team & Collaboration\n\nYou naturally take charge in ambiguous situations. Pair with Empath types who can help you read the room.\n\n## Your Growth Edge\n\nLearn to operate without urgency. Practice tasks with no deadline, no audience, and no competitive element.`,
      zh: `## 你的大脑是怎么运作的\n\n即使杏仁核高度激活时，你的前额叶皮层仍能维持有效的自上而下控制——把应激反应转化为聚焦能量而非恐慌。\n\n## 你的最佳工作策略\n\n**日常安排：** 你需要"赌注"。设定激进的截止日期，做出公开承诺。给每一天赋予一个使命。\n\n**警告信号：** 如果你在制造戏剧性事件来获得刺激感，把它引导到有意义的高风险工作中。\n\n## 学习优化\n\n你在测试条件下学习效果最好。计时测验、模拟考试、教别人会激活你的表现回路。\n\n## 压力管理\n\n你的挑战不是压力——是恢复。建立强制恢复机制，注意慢性皮质醇升高的信号。\n\n## 团队协作\n\n你在高压情境中自然接管领导权。和共情导向类型搭档解读团队氛围。\n\n## 你的成长方向\n\n学会在没有紧迫感的状态下运作。练习没有截止日期、没有观众的任务。`
    }
  },
  alchemist: {
    name: { en: "The Alchemist", zh: "炼金师" },
    emoji: "\u2728",
    subtitle: { en: "Your brain is a creative forge \u2014 blending depth with wide perception", zh: "你的大脑是一座创意熔炉——深度加工与广阔感知的融合" },
    color: "#A855F7",
    match: (d) => d.attnLabel === "Lantern" && d.memLabel === "Depth" && d.socLabel === "Empath",
    free: {
      en: `You have one of the rarest cognitive profiles: deep processing combined with wide perception and high empathy. Your brain simultaneously scans the environment broadly AND processes what it finds with unusual depth. Add empathic social cognition, and you're someone who understands both systems and the humans within them.\n\nYour superpower is original insight. You see patterns others miss because you're taking in more information AND processing it more thoroughly.\n\nYour challenge is overwhelm. You're processing more than most brains, at greater depth, while also absorbing others' emotional states. Without careful energy management, you burn out.`,
      zh: `你拥有最稀有的认知特征之一：深度加工与广阔感知和高共情力的结合。你的大脑同时做着广角扫描和对捕捉到的信息进行异常深入的加工。加上共情导向的社会认知，你既能理解系统又能理解系统中的人。\n\n你的超能力是原创洞察。你能看到别人错过的模式，因为你吸收了更多信息，同时加工得更深入。\n\n你的挑战在于不堪重负。你的大脑处理的信息比大多数人更多更深，同时还在吸收他人的情绪状态。没有小心的能量管理，你会燃尽。`
    },
    paid: {
      en: `## How Your Brain Works\n\nYour ventral attention network and default mode network are both highly active, but your frontoparietal network also engages deeply. Most people are either broad-but-shallow or narrow-but-deep. You're broad-and-deep.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Alternate between input and processing. Morning: open exploration. Afternoon: deep synthesis. Evening: recovery.\n\n**Energy management:** Your cognitive battery drains faster. Build in genuine rest \u2014 not podcasts, actual stillness. A 20-minute eyes-closed break can double your afternoon output.\n\n## Learning Optimization\n\nYou learn best through narrative + analysis. Read the case study, then build the model.\n\n## Stress Management\n\nYour circuit-breaker: physical movement. Walking or yoga pulls your brain out of the empathy-rumination loop.\n\n## Team & Collaboration\n\nYou're the team's "meaning-maker." Protect your solo processing time fiercely.\n\n## Your Growth Edge\n\nLearn to produce before you feel "ready." Set a cap: research for X hours, then create for X hours.`,
      zh: `## 你的大脑是怎么运作的\n\n你的腹侧注意网络和默认模式网络都高度活跃，但额顶网络也深度参与。大多数人要么"广但浅"要么"窄但深"。你是"广且深"。\n\n## 你的最佳工作策略\n\n**日常安排：** 在输入和加工之间交替。上午：开放探索。下午：深度综合。晚上：恢复。\n\n**能量管理：** 你的认知电池消耗更快。安排真正的休息——不是听播客，是真正的安静。下午闭眼20分钟可以让下午产出翻倍。\n\n## 学习优化\n\n你通过"叙事+分析"学习最好。先读案例再建模型。\n\n## 压力管理\n\n你的"断路器"：身体运动。散步或瑜伽能把大脑从共情-反刍循环中拉出来。\n\n## 团队协作\n\n你是团队的"意义构建者"。坚决保护独处加工时间。\n\n## 你的成长方向\n\n学会在感觉"还没准备好"时就开始产出。设上限：研究X小时，然后创造X小时。`
    }
  },
  rhythmist: {
    name: { en: "The Rhythmist", zh: "节律师" },
    emoji: "\u{1F3B5}",
    subtitle: { en: "Your brain is a precision clock \u2014 excellence through consistency", zh: "你的大脑是一架精密时钟——通过持续一致达成卓越" },
    color: "#10B981",
    match: (d) => d.rhythmLabel === "Lark" && d.rewLabel === "Steady" && d.memLabel === "Depth",
    free: {
      en: `You are the embodiment of reliable excellence. Your strong morning chronotype gives you a natural cognitive peak when the world is quiet, your low reward sensitivity means you don't chase novelty, and your deep processing style means you produce high-quality work consistently.\n\nYour superpower is compounding. While others have dramatic highs and lows, you steadily accumulate skill, knowledge, and output. Over months and years, this consistency produces extraordinary results.\n\nYour challenge is adaptability. Disruptions to your routine hit you harder than most \u2014 travel, schedule changes, or unexpected demands can throw off your finely tuned system.`,
      zh: `你是可靠卓越的化身。强烈的早起型生物钟给你一个天然认知高峰——恰好在世界还很安静的时候。低奖赏敏感性意味着你不追逐新鲜感，深度加工风格确保你的产出质量始终如一。\n\n你的超能力是复利效应。当别人经历大起大落时，你在稳步积累技能、知识和产出。经过数月和数年，这种持续性会产生非凡的成果。\n\n你的挑战在于适应性。日常节奏的打破对你影响比对大多数人更大——出差、时间表变化都可能打乱你精心调校的系统。`
    },
    paid: {
      en: `## How Your Brain Works\n\nYour SCN runs a strong, early-phase circadian rhythm. Combined with low dopaminergic reward sensitivity and deep working memory processing, you have a cognitive architecture built for sustained excellence.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Your golden window is roughly 2-4 hours after waking. Protect it ruthlessly for your most important work.\n\n**Routine is your infrastructure:** Same wake time (\u00b130 min) every day, including weekends.\n\n## Learning Optimization\n\nYou're ideal for spaced repetition learning. Linear, structured curricula work best.\n\n## Stress Management\n\nAcute stress can be destabilizing because it disrupts your rhythm. Build buffer time into your schedule. Your morning routine is also your stress management system.\n\n## Team & Collaboration\n\nYou're the reliability anchor every team needs. Advocate for predictable schedules.\n\n## Your Growth Edge\n\nIntroduce controlled novelty. Once a month, deliberately break your routine.`,
      zh: `## 你的大脑是怎么运作的\n\n你的视交叉上核(SCN)运行着强力的早期相位昼夜节律。结合低多巴胺奖赏敏感性和深度工作记忆加工，你拥有为持续卓越而构建的认知架构。\n\n## 你的最佳工作策略\n\n**日常安排：** 你的黄金窗口大约在醒来后2-4小时。不惜一切代价保护这个时段。\n\n**规律就是你的基础设施：** 每天（含周末）相同的起床时间（±30分钟）。\n\n## 学习优化\n\n你非常适合间隔重复学习法。线性、结构化的课程体系最适合你。\n\n## 压力管理\n\n急性压力可能打乱你的节奏。在日程中留出缓冲时间。晨间仪式同时也是你的压力管理系统。\n\n## 团队协作\n\n你是每个团队都需要的稳定锚。为可预测的日程发声。\n\n## 你的成长方向\n\n引入可控的新鲜感。每月一次刻意打破常规。`
    }
  },
  catalyst: {
    name: { en: "The Catalyst", zh: "催化者" },
    emoji: "\u{1F525}",
    subtitle: { en: "Your brain is a chain reactor \u2014 igniting energy in yourself and others", zh: "你的大脑是一台链式反应器——点燃自己和他人的能量" },
    color: "#F97316",
    match: (d) => d.rewLabel === "Driver" && d.stressLabel === "Mobilize" && d.socLabel === "Empath",
    free: {
      en: `You're a high-energy connector. Your high reward sensitivity gives you infectious enthusiasm for new ideas, your mobilize stress response means pressure fuels you, and your empathic social cognition means you naturally understand and motivate the people around you.\n\nYour superpower is activation \u2014 both self-activation and the activation of others. You can walk into a sluggish room and light it up.\n\nYour challenge is sustainability. You burn bright, but you burn fast. Your high reward sensitivity means you may drop projects when the initial excitement fades.`,
      zh: `你是一个高能量连接者。高奖赏敏感性给你对新想法的感染力十足的热情，激活型压力反应意味着压力为你提供燃料，而共情导向的社会认知意味着你天然理解和激励周围的人。\n\n你的超能力是激活——既能自我激活，也能激活他人。你能走进一个沉闷的房间并点亮它。\n\n你的挑战在于可持续性。你燃烧得明亮，但也燃烧得快。高奖赏敏感性意味着初始兴奋消退后你可能会放弃项目。`
    },
    paid: {
      en: `## How Your Brain Works\n\nYour profile combines three high-activation systems: a dopaminergic reward system, an amygdala-prefrontal circuit that converts stress into energy, and a highly active mentalizing network.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Front-load exciting or social work. You need a motivational "hook" to start the day.\n\n**Social acceleration:** You may work better with others present. Co-working sessions boost your output.\n\n**Accountability stack:** Build external accountability: weekly check-ins, public progress updates.\n\n## Learning Optimization\n\nYou learn best through teaching and discussion. Study groups > solo study.\n\n## Stress Management\n\nYour risk is empathic burnout. Build "empathy firewalls": scheduled alone time after intense social interactions.\n\n## Team & Collaboration\n\nYou're the team's spark plug. Don't over-commit to helping others at your own expense.\n\n## Your Growth Edge\n\nBuild a finishing practice. Partner with Steady types to break the ignite-abandon cycle.`,
      zh: `## 你的大脑是怎么运作的\n\n你的认知特征组合了三个高激活系统：强烈反应新奇的多巴胺奖赏系统，将压力转化为能量的杏仁核-前额叶回路，以及高度活跃的心智化网络。\n\n## 你的最佳工作策略\n\n**日常安排：** 把最让你兴奋的工作放在一天前面。你需要动力"钩子"来拉进一天的节奏。\n\n**社交加速：** 你可能在有人在场时工作更好。共同工作时段能提升产出。\n\n**问责堆栈：** 建立外部问责：每周和伙伴check-in，公开发布进度。\n\n## 学习优化\n\n你通过教和讨论学习最好。学习小组 > 独自学习。\n\n## 压力管理\n\n你的风险是共情倦怠。建立"共情防火墙"：高强度社交后安排独处时间。\n\n## 团队协作\n\n你是团队的"火花塞"。注意不要过度承诺帮助他人。\n\n## 你的成长方向\n\n建立"完成实践"。和稳定型伙伴搭档打破"点燃-放弃"循环。`
    }
  },
  observer: {
    name: { en: "The Observer", zh: "观察者" },
    emoji: "\u{1F52E}",
    subtitle: { en: "Your brain is a high-sensitivity receiver \u2014 deeply perceptive, carefully calibrated", zh: "你的大脑是一台高灵敏度接收器——深度感知，精密校准" },
    color: "#6366F1",
    match: (d) => d.attnLabel === "Lantern" && d.socLabel === "Empath" && (d.stressLabel === "Freeze" || d.stressLabel === "Withdraw"),
    free: {
      en: `You perceive more than almost anyone in the room. Your lantern attention takes in the full environment, your empathic social cognition reads every emotional undercurrent, and together they give you an almost uncanny ability to understand situations, people, and dynamics that others miss entirely.\n\nYour superpower is perception. You're the one who notices the thing no one else sees \u2014 the unspoken tension in a meeting, the flaw in a plan that everyone else overlooked.\n\nYour challenge is overload. Your freeze or withdraw stress response means that when the input becomes too much, your brain's protective mechanism kicks in. You need more recovery time than most.`,
      zh: `你感知到的东西比房间里几乎任何人都多。灯塔式注意力接收完整的环境信息，共情社会认知解读每一个情绪暗流，两者结合让你拥有近乎不可思议的能力——理解别人忽略的情境、人和动态。\n\n你的超能力是感知力。你是注意到没人看到的东西的人——会议中未说出口的紧张、方案中所有人都忽略的缺陷。\n\n你的挑战在于过载。冻结型或退缩型压力反应意味着，当输入变得过多时，大脑的保护机制就会启动。你比大多数人需要更多的恢复时间。`
    },
    paid: {
      en: `## How Your Brain Works\n\nYour brain is configured for maximum sensitivity. Your stress response system acts as a circuit breaker when input exceeds processing capacity. This isn't a weakness \u2014 it's a sophisticated self-protection system.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Plan around your energy, not your to-do list. Build in 15-20 minute buffers between activities.\n\n**Environment is everything:** Invest in a private workspace with control over sound and light. Open offices are your nemesis.\n\n**The 60% rule:** Aim for about 60% cognitive capacity daily. Consistent 60% > alternating 100% and 20%.\n\n## Learning Optimization\n\nYou learn best in calm, low-pressure environments. Self-paced courses and one-on-one mentorship work best.\n\n## Stress Management\n\n**If you freeze:** Use physiological resets \u2014 slow exhale, cold water on wrists, the "physiological sigh."\n**If you withdraw:** Give yourself time-bounded retreat periods.\n\n## Team & Collaboration\n\nYou're the team's early warning system. Prefer written communication over live meetings.\n\n## Your Growth Edge\n\nBuild stress tolerance incrementally through controlled exposure. Start small and expand your operating range.`,
      zh: `## 你的大脑是怎么运作的\n\n你的大脑配置为最大灵敏度。压力反应系统在输入超出处理能力时充当断路器。这不是弱点——是精密的自我保护系统。\n\n## 你的最佳工作策略\n\n**日常安排：** 围绕你的能量来规划，不是围绕待办清单。在不同活动之间留出15-20分钟缓冲。\n\n**环境就是一切：** 投资私密工作空间，控制光线和声音。开放式办公室是你的天敌。\n\n**60%法则：** 目标是只使用约60%的认知容量。持续的60% > 交替的100%和20%。\n\n## 学习优化\n\n你在平静、低压环境中学习最好。自主进度课程和一对一指导最有效。\n\n## 压力管理\n\n**如果你冻结：** 用生理性重启——缓慢呼气，冷水冲手腕，"生理叹息"。\n**如果你退缩：** 给自己有时间边界的撤退。\n\n## 团队协作\n\n你是团队的"预警系统"。尽可能争取书面沟通代替实时会议。\n\n## 你的成长方向\n\n通过可控暴露逐步建立压力耐受力。从小事开始，拓宽运作范围。`
    }
  },
  architect: {
    name: { en: "The Architect", zh: "建筑师" },
    emoji: "\u{1F4D0}",
    subtitle: { en: "Your brain is a blueprint studio \u2014 building complex systems with precision", zh: "你的大脑是一间蓝图工作室——以精确性构建复杂系统" },
    color: "#64748B",
    match: (d) => d.memLabel === "Depth" && d.socLabel === "Systemizer" && d.rewLabel === "Steady",
    free: {
      en: `You think in structures. Your deep working memory naturally builds complex mental models, your systemizing cognitive style drives you to understand rules and patterns, and your steady reward sensitivity means you can work on these models patiently.\n\nYour superpower is architecture \u2014 not just of buildings, but of ideas, systems, strategies, and frameworks. You see the underlying structure of things and design elegant, scalable solutions.\n\nYour challenge is the human element. Your systemizing style may underweight emotional and interpersonal factors. You may also struggle to communicate your complex mental models to others.`,
      zh: `你用结构来思考。深度型的工作记忆自然地构建复杂的心理模型，系统导向的认知风格驱动你理解规则和模式，而稳定的奖赏敏感性意味着你可以耐心地打磨这些模型。\n\n你的超能力是架构设计——不仅是建筑，而是思想、系统、策略和框架的架构。你能看到事物的底层结构，设计出优雅、可扩展的解决方案。\n\n你的挑战在于人的因素。系统导向风格意味着你可能低估计划中的情感和人际因素。你也可能很难把复杂的心理模型传达给别人。`
    },
    paid: {
      en: `## How Your Brain Works\n\nA powerful frontoparietal network maintains complex information in working memory. Low reward sensitivity allows patient, iterative refinement. You naturally think in abstractions, hierarchies, and systems.\n\n## Your Optimal Work Strategy\n\n**Daily structure:** Plan for 120+ minute deep blocks with a 30-minute warm-up.\n\n**Externalize your thinking:** Use diagrams, mind maps, whiteboards, or structured note-taking to extend your cognitive workspace.\n\n**Version control your thinking:** Keep versions of your work. Your V3 will be dramatically better than V1.\n\n## Learning Optimization\n\nYou learn best by building models. First question for any new domain: "What is the structure of this field?"\n\n## Stress Management\n\nYour systemizing brain can get trapped in "optimization loops." Use forcing functions: "I will decide by 3 PM."\n\n## Team & Collaboration\n\nYou're the systems thinker and long-term strategist. Practice explaining ideas in layers: start simple, add complexity as needed.\n\n## Your Growth Edge\n\nDevelop your empathic channel. Practice asking "How will this feel to use?" alongside "How does this work?"`,
      zh: `## 你的大脑是怎么运作的\n\n强大的额顶网络在工作记忆中维持复杂信息。低奖赏敏感性允许耐心的迭代精炼。你天然用抽象、层级和系统来思考。\n\n## 你的最佳工作策略\n\n**日常安排：** 规划120分钟以上的深度时段，开始留30分钟热身。\n\n**外化你的思考：** 使用图表、思维导图、白板来扩展认知工作空间。\n\n**版本控制你的思考：** 保留工作的版本。V3会比V1好得多。\n\n## 学习优化\n\n你通过构建模型来学习最好。学新领域时先问"这个领域的结构是什么？"\n\n## 压力管理\n\n系统导向大脑可能陷入"优化循环"。用强制函数打断："下午3点之前做出决定"。\n\n## 团队协作\n\n你是系统思考者和长期战略家。练习分层解释想法，从最简版本开始。\n\n## 你的成长方向\n\n发展共情通道。练习在"怎么运作？"的同时问"使用这个会是什么感受？"`
    }
  }
};

// ============================================================
// UI LABELS - Bilingual
// ============================================================
const UI = {
  en: {
    tagline: "Discover how your brain actually works.",
    sub: "A neuroscience-based cognitive assessment. 36 questions. ~10 minutes.",
    dims: ["Attention Style", "Cognitive Rhythm", "Working Memory", "Reward Sensitivity", "Stress Response", "Social Cognition"],
    startBtn: "Take the Free Test →",
    footer: "Based on peer-reviewed neuroscience research",
    back: "← Back",
    dimNames: { attention: "Attention Style", rhythm: "Cognitive Rhythm", memory: "Working Memory", reward: "Reward Sensitivity", stress: "Stress Response", social: "Social Cognition" },
    scaleLabels: ["Strongly\nDisagree", "Disagree", "Neutral", "Agree", "Strongly\nAgree"],
    profileTitle: "Your Cognitive Profile",
    shareBtn: "Share Your Type 🔗",
    retakeBtn: "Retake ↻",
    fullReport: "FULL REPORT",
    lockTitle: "Your Full Report is Almost Ready",
    lockSub1: "Personalized work strategy • Learning optimization • Stress management",
    lockSub2: "Team compatibility • Detailed neuroscience breakdown",
    lockWords: "~2,000 words of neuroscience-backed insights specific to",
    emailPlaceholder: "Your email address",
    notifyBtn: "Notify Me",
    noSpam: "We'll email you when the full report launches. No spam.",
    doneTitle: "You're on the list!",
    doneSub: "We'll send your full {name} report as soon as it's ready.",
    doneShare: "In the meantime — share your type with friends ↓",
    nfTitle: "Now you know your CognoType. Ready to put it into action?",
    nfSub: "NeuroFlow — a deep work system designed for YOUR brain type. Coming soon.",
    nfBtn: "Join the Waitlist →",
    refFooter: "CognoType™ — Based on peer-reviewed neuroscience research\nDimensions informed by: Corbetta & Shulman (2002), Vogel & Machizawa (2004), Baron-Cohen E-S Theory, and more.",
    shareText: (name, emoji, subtitle) => `I'm ${name} ${emoji} — ${subtitle}. Discover your brain type → cognotype.vercel.app`,
    copied: "Copied to clipboard!",
    dimLabels: { "Laser":"Laser", "Lantern":"Lantern", "Balanced":"Balanced", "Lark":"Lark", "Third Bird":"Third Bird", "Owl":"Owl", "Depth":"Depth", "Breadth":"Breadth", "Driver":"Driver", "Steady":"Steady", "Mobilize":"Mobilize", "Freeze":"Freeze", "Withdraw":"Withdraw", "Empath":"Empath", "Systemizer":"Systemizer" },
    dimDisplayNames: { attnLabel:"Attention", rhythmLabel:"Rhythm", memLabel:"Memory", rewLabel:"Drive", stressLabel:"Stress", socLabel:"Social" },
    radarLabels: ["Focus", "Rhythm", "Memory", "Drive", "Resilience", "Empathy"]
  },
  zh: {
    tagline: "发现你的大脑真正的运作方式",
    sub: "基于认知神经科学的个体差异评估 · 36题 · 约10分钟",
    dims: ["注意力模式", "认知节律", "工作记忆", "奖赏敏感性", "压力反应", "社会认知"],
    startBtn: "开始免费测评 →",
    footer: "基于经过同行评审的神经科学研究",
    back: "← 上一题",
    dimNames: { attention: "注意力模式", rhythm: "认知节律", memory: "工作记忆", reward: "奖赏敏感性", stress: "压力反应", social: "社会认知" },
    scaleLabels: ["非常\n不同意", "不同意", "中立", "同意", "非常\n同意"],
    profileTitle: "你的认知画像",
    shareBtn: "分享你的类型 🔗",
    retakeBtn: "重新测评 ↻",
    fullReport: "完整报告",
    lockTitle: "你的完整报告即将准备就绪",
    lockSub1: "个性化工作策略 · 学习优化方案 · 压力管理指南",
    lockSub2: "团队协作建议 · 详细神经科学解读",
    lockWords: "约2000字的神经科学支撑洞察，专属于你的",
    emailPlaceholder: "请输入你的邮箱地址",
    notifyBtn: "通知我",
    noSpam: "完整报告上线后我们会第一时间通知你，不会发送垃圾邮件。",
    doneTitle: "你已加入等待名单！",
    doneSub: "完整的{name}报告准备好后，我们会第一时间发送给你。",
    doneShare: "现在先把你的类型分享给朋友吧 ↓",
    nfTitle: "现在你已经知道了自己的 CognoType，准备好将它付诸实践了吗？",
    nfSub: "NeuroFlow —— 为你的大脑类型量身设计的深度工作系统，即将上线。",
    nfBtn: "加入等待名单 →",
    refFooter: "CognoType™ —— 基于经过同行评审的神经科学研究\n维度框架参考：Corbetta & Shulman (2002)、Vogel & Machizawa (2004)、Baron-Cohen E-S 理论等",
    shareText: (name, emoji, subtitle) => `我是${name} ${emoji}——${subtitle}。来发现你的大脑类型 → cognotype.vercel.app`,
    copied: "已复制到剪贴板！",
    dimLabels: { "Laser":"聚焦型", "Lantern":"发散型", "Balanced":"均衡型", "Lark":"早鸟型", "Third Bird":"中间型", "Owl":"夜猫型", "Depth":"深度型", "Breadth":"广度型", "Driver":"驱动型", "Steady":"稳定型", "Mobilize":"激活型", "Freeze":"冻结型", "Withdraw":"退缩型", "Empath":"共情导向", "Systemizer":"系统导向" },
    dimDisplayNames: { attnLabel:"注意力", rhythmLabel:"节律", memLabel:"记忆", rewLabel:"驱动力", stressLabel:"压力", socLabel:"社交" },
    radarLabels: ["专注力", "节律", "记忆", "驱动力", "韧性", "共情力"]
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
      const val = ans;
      const mapped = q.direction === 1 ? [-(2), -(1), 0, 1, 2][val] : [2, 1, 0, -(1), -(2)][val];
      const key = q.dim_key;
      if (scores[key] !== undefined) scores[key] += mapped * 2.5;
      if (rhythm[key] !== undefined) rhythm[key] += (val + 1);
      if (stress[key] !== undefined) stress[key] += (val + 1);
    }
  });
  Object.keys(scores).forEach(k => { scores[k] = Math.max(6, Math.min(30, Math.round(scores[k]))); });

  const attnLabel = scores.attention >= 19 ? "Laser" : scores.attention <= 14 ? "Lantern" : "Balanced";
  const memLabel = scores.memory >= 19 ? "Depth" : scores.memory <= 14 ? "Breadth" : "Balanced";
  const rewLabel = scores.reward >= 19 ? "Driver" : scores.reward <= 14 ? "Steady" : "Balanced";
  const socLabel = scores.social >= 19 ? "Empath" : scores.social <= 14 ? "Systemizer" : "Balanced";
  const rhythmArr = [{k:"Lark",v:rhythm.rhythm_lark},{k:"Third Bird",v:rhythm.rhythm_third},{k:"Owl",v:rhythm.rhythm_owl}].sort((a,b)=>b.v-a.v);
  const rhythmLabel = rhythmArr[0].v > 0 ? rhythmArr[0].k : "Third Bird";
  const stressArr = [{k:"Mobilize",v:stress.stress_mob},{k:"Freeze",v:stress.stress_freeze},{k:"Withdraw",v:stress.stress_withdraw}].sort((a,b)=>b.v-a.v);
  const stressLabel = stressArr[0].v > 0 ? stressArr[0].k : "Mobilize";

  const dims = { attnLabel, rhythmLabel, memLabel, rewLabel, stressLabel, socLabel };
  let matched = null;
  for (const k of Object.keys(COGNOTYPES)) { if (COGNOTYPES[k].match(dims)) { matched = k; break; } }
  if (!matched) {
    if (attnLabel==="Laser"&&memLabel==="Depth") matched="deep_diver";
    else if (attnLabel==="Lantern"&&rewLabel==="Driver") matched="pathfinder";
    else if (stressLabel==="Mobilize"&&socLabel==="Systemizer") matched="commander";
    else if (attnLabel==="Lantern"&&socLabel==="Empath") matched=stressLabel==="Freeze"||stressLabel==="Withdraw"?"observer":"alchemist";
    else if (rewLabel==="Steady"&&memLabel==="Depth") matched=socLabel==="Systemizer"?"architect":"rhythmist";
    else if (rewLabel==="Driver"&&socLabel==="Empath") matched="catalyst";
    else if (rewLabel==="Driver") matched="pathfinder";
    else matched="architect";
  }

  return { scores, rhythm, stress, dims, typeKey: matched, type: COGNOTYPES[matched],
    radarValues: [scores.attention, rhythmLabel==="Lark"?25:rhythmLabel==="Owl"?10:18, scores.memory, scores.reward, stressLabel==="Mobilize"?25:stressLabel==="Freeze"?10:15, scores.social]
  };
}

// ============================================================
// COMPONENTS
// ============================================================
function RadarChart({ data, labels, color, size = 280 }) {
  const cx = size/2, cy = size/2, r = size*0.38, n = data.length;
  const angleStep = (2*Math.PI)/n;
  const pointAt = (i, val) => { const a = angleStep*i - Math.PI/2; const ratio = val/30; return { x: cx+r*ratio*Math.cos(a), y: cy+r*ratio*Math.sin(a) }; };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {[0.33,0.66,1].map((lv,i) => <polygon key={i} points={data.map((_,j)=>{const a=angleStep*j-Math.PI/2;return `${cx+r*lv*Math.cos(a)},${cy+r*lv*Math.sin(a)}`;}).join(" ")} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>)}
      {data.map((_,i)=>{const end=pointAt(i,30);return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>;} )}
      <polygon points={data.map((v,i)=>{const p=pointAt(i,v);return `${p.x},${p.y}`;}).join(" ")} fill={color+"33"} stroke={color} strokeWidth="2.5"/>
      {data.map((v,i)=>{const p=pointAt(i,v);return <circle key={i} cx={p.x} cy={p.y} r="4" fill={color}/>;} )}
      {labels.map((lb,i)=>{const lr=r+22;const a=angleStep*i-Math.PI/2;return <text key={i} x={cx+lr*Math.cos(a)} y={cy+lr*Math.sin(a)} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.7)" fontSize="11" fontFamily="inherit">{lb}</text>;})}
    </svg>
  );
}

function ProgressBar({ current, total }) {
  return (<div style={{width:"100%",height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,overflow:"hidden"}}><div style={{width:`${((current+1)/total)*100}%`,height:"100%",background:"linear-gradient(90deg,#6366F1,#A855F7)",transition:"width 0.4s ease",borderRadius:2}}/></div>);
}

function ScaleSelector({ value, onChange, labels }) {
  return (
    <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:32}}>
      {labels.map((lab,i)=>(<button key={i} onClick={()=>onChange(i)} style={{flex:1,maxWidth:90,padding:"16px 8px",borderRadius:12,border:value===i?"2px solid #A855F7":"1px solid rgba(255,255,255,0.15)",background:value===i?"rgba(168,85,247,0.15)":"rgba(255,255,255,0.03)",color:value===i?"#E9D5FF":"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:12,lineHeight:1.3,whiteSpace:"pre-line",transition:"all 0.2s ease",fontFamily:"inherit"}}>{lab}</button>))}
    </div>
  );
}

function LangSwitch({ lang, setLang }) {
  return (
    <button onClick={() => setLang(lang === "en" ? "zh" : "en")}
      style={{ position:"fixed", top:16, right:16, zIndex:999, padding:"6px 14px", borderRadius:20, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:13, fontFamily:"inherit", backdropFilter:"blur(8px)", transition:"all 0.2s" }}>
      {lang === "en" ? "中文" : "EN"}
    </button>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function CognoTypeApp() {
  const [lang, setLang] = useState("en");
  const [screen, setScreen] = useState("landing");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(36).fill(null));
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [fade, setFade] = useState(true);

  // Auto-detect Chinese browser
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const browserLang = navigator.language || "";
      if (browserLang.startsWith("zh")) setLang("zh");
    }
  }, []);

  useEffect(() => { setFade(true); }, [qIndex, screen]);

  const L = UI[lang];
  const t = (obj) => (typeof obj === "object" && obj !== null && !Array.isArray(obj) && (obj.en || obj.zh)) ? (obj[lang] || obj.en) : obj;
  const currentQ = QUESTIONS[qIndex];

  const selectAnswer = (val) => {
    const newAns = [...answers]; newAns[qIndex] = val; setAnswers(newAns);
    setTimeout(() => { setFade(false); setTimeout(() => {
      if (qIndex < 35) setQIndex(qIndex + 1);
      else { setResult(computeResults(newAns)); setScreen("result"); }
      setFade(true);
    }, 250); }, 300);
  };
  const goBack = () => { if (qIndex > 0) { setFade(false); setTimeout(() => { setQIndex(qIndex-1); setFade(true); }, 250); } };

  const bg = "#0B0F1A";
  const cardBg = "rgba(255,255,255,0.04)";
  const font = lang === "zh" ? "'Noto Sans SC', 'Sora', system-ui, sans-serif" : "'Sora', 'Noto Sans SC', system-ui, sans-serif";

  // ── LANDING ──
  if (screen === "landing") {
    return (
      <div style={{minHeight:"100vh",background:bg,color:"#F1F5F9",fontFamily:font,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        <LangSwitch lang={lang} setLang={setLang} />
        <div style={{fontSize:48,marginBottom:8}}>🧠</div>
        <h1 style={{fontSize:42,fontWeight:700,letterSpacing:"-1px",margin:"0 0 8px",background:"linear-gradient(135deg,#A855F7,#6366F1,#0EA5E9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>CognoType</h1>
        {lang === "zh" && <p style={{fontSize:16,color:"rgba(255,255,255,0.5)",margin:"0 0 6px"}}>认知基因型测评</p>}
        <p style={{fontSize:17,color:"rgba(255,255,255,0.6)",margin:"0 0 32px",maxWidth:460,lineHeight:1.7}}>{L.tagline}<br/><span style={{fontSize:14}}>{L.sub}</span></p>
        <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",marginBottom:40,maxWidth:500}}>
          {L.dims.map((d,i)=>(<span key={i} style={{padding:"6px 14px",borderRadius:20,background:"rgba(168,85,247,0.1)",border:"1px solid rgba(168,85,247,0.2)",fontSize:12,color:"rgba(255,255,255,0.6)"}}>{d}</span>))}
        </div>
        <button onClick={()=>setScreen("quiz")} style={{padding:"16px 48px",fontSize:17,fontWeight:600,borderRadius:14,border:"none",cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"white",boxShadow:"0 4px 24px rgba(99,102,241,0.4)",transition:"transform 0.2s,box-shadow 0.2s"}}
          onMouseEnter={e=>{const el=e.target as HTMLElement;el.style.transform="translateY(-2px)";el.style.boxShadow="0 6px 32px rgba(99,102,241,0.5)";}}
          onMouseLeave={e=>{const el=e.target as HTMLElement;el.style.transform="";el.style.boxShadow="0 4px 24px rgba(99,102,241,0.4)";}}>
          {L.startBtn}
        </button>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:20}}>{L.footer}</p>
      </div>
    );
  }

  // ── QUIZ ──
  if (screen === "quiz") {
    return (
      <div style={{minHeight:"100vh",background:bg,color:"#F1F5F9",fontFamily:font,display:"flex",flexDirection:"column",padding:"24px 16px"}}>
        <LangSwitch lang={lang} setLang={setLang} />
        <div style={{maxWidth:600,width:"100%",margin:"0 auto",flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <button onClick={goBack} disabled={qIndex===0} style={{background:"none",border:"none",color:qIndex===0?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.5)",cursor:qIndex===0?"default":"pointer",fontSize:14,fontFamily:"inherit"}}>{L.back}</button>
            <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>{qIndex+1} / 36</span>
            <span style={{fontSize:11,color:"rgba(168,85,247,0.7)",padding:"3px 10px",borderRadius:12,background:"rgba(168,85,247,0.1)"}}>{L.dimNames[currentQ.dim]}</span>
          </div>
          <ProgressBar current={qIndex} total={36}/>
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",opacity:fade?1:0,transform:fade?"translateY(0)":"translateY(10px)",transition:"opacity 0.25s ease,transform 0.25s ease"}}>
            <p style={{fontSize:18,lineHeight:1.7,fontWeight:500,marginBottom:32,marginTop:40,textAlign:"center",maxWidth:520,alignSelf:"center"}}>{currentQ[lang] || currentQ.text || currentQ.en}</p>
            {(currentQ.type==="choice"||currentQ.type==="triple") && (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {currentQ.options.map((opt,i)=>(<button key={i} onClick={()=>selectAnswer(i)} style={{padding:"18px 20px",borderRadius:14,textAlign:"left",border:answers[qIndex]===i?"2px solid #A855F7":"1px solid rgba(255,255,255,0.1)",background:answers[qIndex]===i?"rgba(168,85,247,0.12)":cardBg,color:answers[qIndex]===i?"#E9D5FF":"rgba(255,255,255,0.75)",cursor:"pointer",fontSize:15,lineHeight:1.6,fontFamily:"inherit",transition:"all 0.2s ease"}}>{opt[lang] || opt.text || opt.en}</button>))}
              </div>
            )}
            {currentQ.type==="scale" && <ScaleSelector value={answers[qIndex]} onChange={selectAnswer} labels={L.scaleLabels}/>}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (screen === "result" && result) {
    const tp = result.type;
    const dims = result.dims;
    const tName = t(tp.name);
    const tSub = t(tp.subtitle);
    const tFree = t(tp.free);
    const tPaid = t(tp.paid);
    const color = tp.color;
    const radarLabels = L.radarLabels;

    return (
      <div style={{minHeight:"100vh",background:bg,color:"#F1F5F9",fontFamily:font,padding:"32px 16px"}}>
        <LangSwitch lang={lang} setLang={setLang} />
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{fontSize:56,marginBottom:8}}>{tp.emoji}</div>
            <h1 style={{fontSize:36,fontWeight:700,margin:"0 0 4px",color}}>{tName}</h1>
            {lang==="zh" && <p style={{fontSize:14,color:"rgba(255,255,255,0.35)",margin:"0 0 8px"}}>{tp.name.en}</p>}
            <p style={{fontSize:16,color:"rgba(255,255,255,0.5)",margin:0,fontStyle:"italic"}}>{tSub}</p>
          </div>

          <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:32}}>
            {Object.keys(L.dimDisplayNames).map((k,i)=>(<span key={i} style={{padding:"5px 12px",borderRadius:16,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",fontSize:12,color:"rgba(255,255,255,0.6)"}}>{L.dimDisplayNames[k]}{lang==="zh"?"：":": "}<strong style={{color:"rgba(255,255,255,0.85)"}}>{L.dimLabels[dims[k]]||dims[k]}</strong></span>))}
          </div>

          <div style={{display:"flex",justifyContent:"center",marginBottom:32}}>
            <RadarChart data={result.radarValues} labels={radarLabels} color={color}/>
          </div>

          <div style={{background:cardBg,borderRadius:16,padding:28,marginBottom:24,border:"1px solid rgba(255,255,255,0.06)"}}>
            <h2 style={{fontSize:18,fontWeight:600,marginTop:0,marginBottom:16,color:"rgba(255,255,255,0.9)"}}>{L.profileTitle}</h2>
            {tFree.split("\n\n").map((p,i)=>(<p key={i} style={{fontSize:15,lineHeight:1.8,color:"rgba(255,255,255,0.7)",margin:"0 0 16px"}}>{p}</p>))}
          </div>

          <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:32}}>
            <button onClick={()=>{const text=L.shareText(tName,tp.emoji,tSub);if(navigator.share)navigator.share({text});else if(navigator.clipboard){navigator.clipboard.writeText(text);alert(L.copied);}}} style={{padding:"12px 28px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.8)",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>{L.shareBtn}</button>
            <button onClick={()=>{setScreen("quiz");setQIndex(0);setAnswers(Array(36).fill(null));setResult(null);}} style={{padding:"12px 28px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>{L.retakeBtn}</button>
          </div>

          {/* Blurred Report + Email */}
          <div style={{background:cardBg,borderRadius:16,padding:28,marginBottom:32,border:`1px solid ${color}33`,position:"relative",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
              <span style={{background:color+"22",color,padding:"3px 10px",borderRadius:8,fontSize:11,fontWeight:600}}>{L.fullReport}</span>
              <span style={{fontSize:20,fontWeight:600}}>{tName}</span>
            </div>
            {tPaid.split("\n\n").slice(0,6).map((p,i)=>{
              if(p.startsWith("## "))return <h3 key={i} style={{fontSize:17,fontWeight:600,marginTop:28,marginBottom:12,color}}>{p.replace("## ","")}</h3>;
              return <p key={i} style={{fontSize:14,lineHeight:1.8,color:"rgba(255,255,255,0.65)",margin:"0 0 14px",filter:i>2?"blur(5px)":"none",userSelect:i>2?"none":"auto"}}>{p.replace(/\*\*/g,"")}</p>;
            })}
            <div style={{position:"relative",marginTop:-20}}>
              {tPaid.split("\n\n").slice(6,14).map((p,i)=>{
                if(p.startsWith("## "))return <h3 key={i} style={{fontSize:17,fontWeight:600,marginTop:28,marginBottom:12,color,filter:"blur(6px)",userSelect:"none"}}>{p.replace("## ","")}</h3>;
                return <p key={i} style={{fontSize:14,lineHeight:1.8,color:"rgba(255,255,255,0.65)",margin:"0 0 14px",filter:"blur(6px)",userSelect:"none"}}>{p.replace(/\*\*/g,"")}</p>;
              })}
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"linear-gradient(180deg,rgba(11,15,26,0) 0%,rgba(11,15,26,0.7) 30%,rgba(11,15,26,0.95) 60%,rgba(11,15,26,1) 100%)"}}/>
            </div>
            <div style={{position:"relative",zIndex:2,textAlign:"center",marginTop:-60,paddingTop:40}}>
              {!emailSubmitted?(
                <>
                  <div style={{fontSize:32,marginBottom:12}}>🔒</div>
                  <h3 style={{fontSize:20,fontWeight:600,margin:"0 0 8px"}}>{L.lockTitle}</h3>
                  <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",margin:"0 0 4px",lineHeight:1.6}}>{L.lockSub1}</p>
                  <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",margin:"0 0 20px",lineHeight:1.6}}>{L.lockSub2}</p>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",margin:"0 0 20px"}}>{L.lockWords}{tName}</p>
                  <div style={{display:"flex",gap:10,maxWidth:420,margin:"0 auto",flexWrap:"wrap",justifyContent:"center"}}>
                    <input type="email" placeholder={L.emailPlaceholder} value={email} onChange={e=>setEmail(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&email.includes("@")){setEmailSubmitted(true);saveEmail(email,tName);}}}
                      style={{flex:1,minWidth:220,padding:"14px 18px",borderRadius:12,border:"1px solid rgba(168,85,247,0.3)",background:"rgba(255,255,255,0.05)",color:"#F1F5F9",fontSize:15,outline:"none",fontFamily:"inherit"}}/>
                    <button onClick={()=>{if(email.includes("@")){setEmailSubmitted(true);saveEmail(email,tName);}}} style={{padding:"14px 28px",fontSize:15,fontWeight:600,borderRadius:12,border:"none",cursor:"pointer",fontFamily:"inherit",background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"white",boxShadow:"0 4px 24px rgba(99,102,241,0.3)",opacity:email.includes("@")?1:0.5}}>{L.notifyBtn}</button>
                  </div>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:12}}>{L.noSpam}</p>
                </>
              ):(
                <div style={{padding:"20px 0"}}>
                  <div style={{fontSize:40,marginBottom:12}}>✅</div>
                  <h3 style={{fontSize:20,fontWeight:600,margin:"0 0 8px"}}>{L.doneTitle}</h3>
                  <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",margin:"0 0 4px",lineHeight:1.6}}>{L.doneSub.replace("{name}",tName)}</p>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.35)",marginTop:12}}>{L.doneShare}</p>
                </div>
              )}
            </div>
          </div>

          <div style={{background:"rgba(14,165,233,0.08)",borderRadius:16,padding:28,textAlign:"center",border:"1px solid rgba(14,165,233,0.15)",marginBottom:40}}>
            <p style={{fontSize:15,fontWeight:500,margin:"0 0 8px",color:"rgba(255,255,255,0.8)"}}>{L.nfTitle}</p>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",margin:"0 0 16px"}}>{L.nfSub}</p>
            <button style={{padding:"10px 24px",borderRadius:10,border:"1px solid rgba(14,165,233,0.3)",background:"rgba(14,165,233,0.1)",color:"#7DD3FC",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>{L.nfBtn}</button>
          </div>

          <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.2)",paddingBottom:40,whiteSpace:"pre-line"}}>{L.refFooter}</p>
        </div>
      </div>
    );
  }
  return null;
}