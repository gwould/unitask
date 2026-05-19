// src/data/mockData.ts
var jobsData = [
  {
    id: 1,
    logoText: "TN",
    logoGradient: "linear-gradient(135deg,#5B4FFF,#7C72FF)",
    title: "Frontend Developer (React + Tailwind)",
    company: "TechNova VN",
    companyId: "biz-1",
    verified: true,
    location: "H\u1ED3 Ch\xED Minh",
    tags: [
      { label: "\u{1F4BB} IT", variant: "p" },
      { label: "Remote", variant: "t" },
      { label: "\u{1F525} Hot", variant: "g" }
    ],
    spotsLeft: 2,
    spotsTotal: 5,
    pay: "2.500.000 \u2013 4.000.000 \u20AB",
    payMin: 25e5,
    payMax: 4e6,
    deadline: "C\xF2n 5 ng\xE0y",
    category: "it",
    featured: true,
    description: "TechNova VN \u0111ang t\xECm ki\u1EBFm sinh vi\xEAn c\xF3 k\u1EF9 n\u0103ng React \u0111\u1EC3 tham gia x\xE2y d\u1EF1ng giao di\u1EC7n cho s\u1EA3n ph\u1EA9m SaaS m\u1EDBi. B\u1EA1n s\u1EBD l\xE0m vi\u1EC7c tr\u1EF1c ti\u1EBFp v\u1EDBi team design, bi\u1EBFn mockup Figma th\xE0nh code React + Tailwind. \u0110\xE2y l\xE0 c\u01A1 h\u1ED9i th\u1EF1c chi\u1EBFn, kh\xF4ng ph\u1EA3i internship ng\u1ED3i ch\u01A1i!",
    requirements: [
      "Sinh vi\xEAn n\u0103m 3\u20134 ng\xE0nh CNTT ho\u1EB7c t\u01B0\u01A1ng \u0111\u01B0\u01A1ng",
      "Bi\u1EBFt React (hooks, state management c\u01A1 b\u1EA3n)",
      "C\xF3 kinh nghi\u1EC7m v\u1EDBi Tailwind CSS ho\u1EB7c CSS-in-JS",
      "Bi\u1EBFt Git c\u01A1 b\u1EA3n (clone, commit, push, branch)",
      "Ti\u1EBFng Anh \u0111\u1ECDc t\xE0i li\u1EC7u k\u1EF9 thu\u1EADt"
    ],
    deliverables: [
      "5 trang UI ho\xE0n ch\u1EC9nh responsive",
      "Code React s\u1EA1ch, c\xF3 TypeScript",
      "Pull request tr\xEAn GitHub repo c\u1EE7a team"
    ],
    duration: "2 tu\u1EA7n",
    postedAt: "2026-02-28",
    skills: ["React", "Tailwind CSS", "TypeScript", "Git"]
  },
  {
    id: 2,
    logoText: "CR",
    logoGradient: "linear-gradient(135deg,#FF6B35,#FF4D6B)",
    title: "Thi\u1EBFt k\u1EBF B\u1ED9 nh\u1EADn di\u1EC7n th\u01B0\u01A1ng hi\u1EC7u",
    company: "CreativeBox Studio",
    companyId: "biz-2",
    verified: true,
    location: "H\xE0 N\u1ED9i",
    tags: [
      { label: "\u{1F3A8} Thi\u1EBFt k\u1EBF", variant: "a" },
      { label: "Remote", variant: "t" }
    ],
    spotsLeft: 1,
    spotsTotal: 3,
    pay: "1.800.000 \u2013 3.000.000 \u20AB",
    payMin: 18e5,
    payMax: 3e6,
    deadline: "C\xF2n 8 ng\xE0y",
    category: "design",
    description: "CreativeBox c\u1EA7n sinh vi\xEAn thi\u1EBFt k\u1EBF b\u1ED9 nh\u1EADn di\u1EC7n th\u01B0\u01A1ng hi\u1EC7u (logo, m\xE0u s\u1EAFc, typography, namecard, b\xECa Facebook/Zalo) cho kh\xE1ch h\xE0ng F&B startup. B\u1EA1n s\u1EBD nh\u1EADn brief chi ti\u1EBFt v\xE0 feedback tr\u1EF1c ti\u1EBFp t\u1EEB Creative Director.",
    requirements: [
      "Th\xE0nh th\u1EA1o Figma ho\u1EB7c Adobe Illustrator",
      "Hi\u1EC3u c\u01A1 b\u1EA3n v\u1EC1 typography, color theory",
      "C\xF3 portfolio c\xE1 nh\xE2n (Behance/Dribbble ho\u1EB7c Google Drive)",
      "Sinh vi\xEAn Thi\u1EBFt k\u1EBF \u0111\u1ED3 h\u1ECDa, M\u1EF9 thu\u1EADt c\xF4ng nghi\u1EC7p"
    ],
    deliverables: [
      "Logo ch\xEDnh + bi\u1EBFn th\u1EC3 (d\u1ECDc, ngang, icon)",
      "Style guide (color, typography, spacing)",
      "Mockup namecard + social media cover",
      "File source Figma/AI"
    ],
    duration: "10 ng\xE0y",
    postedAt: "2026-02-25",
    skills: ["Figma", "Illustrator", "Branding", "Typography"]
  },
  {
    id: 3,
    logoText: "MH",
    logoGradient: "linear-gradient(135deg,#00D4AA,#00A882)",
    title: "Vi\u1EBFt 10 b\xE0i SEO Blog (chu\u1EA9n EEAT)",
    company: "MarketHub VN",
    companyId: "biz-3",
    verified: true,
    location: "Remote",
    tags: [
      { label: "\u270D\uFE0F Content", variant: "t" },
      { label: "M\u1EDBi \u0111\u0103ng", variant: "g" }
    ],
    spotsLeft: 3,
    spotsTotal: 4,
    pay: "1.200.000 \u2013 2.000.000 \u20AB",
    payMin: 12e5,
    payMax: 2e6,
    deadline: "C\xF2n 12 ng\xE0y",
    category: "content",
    description: "MarketHub \u0111ang m\u1EDF r\u1ED9ng blog content cho m\u1EA3ng Digital Marketing. C\u1EA7n 10 b\xE0i vi\u1EBFt SEO chu\u1EA9n EEAT (Experience, Expertise, Authoritativeness, Trustworthiness), m\u1ED7i b\xE0i 1.500\u20132.000 t\u1EEB. Topic \u0111\xE3 c\xF3 s\u1EB5n, b\u1EA1n ch\u1EC9 c\u1EA7n research v\xE0 vi\u1EBFt.",
    requirements: [
      "Vi\u1EBFt ti\u1EBFng Vi\u1EC7t l\u01B0u lo\xE1t, kh\xF4ng l\u1ED7i ch\xEDnh t\u1EA3",
      "Hi\u1EC3u c\u01A1 b\u1EA3n v\u1EC1 SEO on-page (heading, keyword density, meta)",
      "Bi\u1EBFt d\xF9ng Google Docs",
      "\u01AFu ti\xEAn sinh vi\xEAn Marketing, Truy\u1EC1n th\xF4ng, Ng\xF4n ng\u1EEF"
    ],
    deliverables: [
      "10 b\xE0i blog SEO (1.500\u20132.000 t\u1EEB/b\xE0i)",
      "Meta title + meta description cho m\u1ED7i b\xE0i",
      "Keyword research sheet"
    ],
    duration: "2 tu\u1EA7n",
    postedAt: "2026-03-01",
    skills: ["SEO Writing", "Content Marketing", "Research", "Google Docs"]
  },
  {
    id: 4,
    logoText: "GR",
    logoGradient: "linear-gradient(135deg,#FFB340,#FF8C00)",
    title: "Ch\u1EA1y qu\u1EA3ng c\xE1o Facebook Ads \u2014 F&B",
    company: "GreenBowl Restaurant",
    companyId: "biz-4",
    verified: true,
    location: "\u0110\xE0 N\u1EB5ng",
    tags: [
      { label: "\u{1F4E2} Marketing", variant: "g" },
      { label: "Onsite", variant: "a" }
    ],
    spotsLeft: 2,
    spotsTotal: 2,
    pay: "2.000.000 \u2013 3.500.000 \u20AB",
    payMin: 2e6,
    payMax: 35e5,
    deadline: "C\xF2n 3 ng\xE0y",
    category: "marketing",
    description: "GreenBowl c\u1EA7n ng\u01B0\u1EDDi ch\u1EA1y Facebook Ads cho chu\u1ED7i 3 nh\xE0 h\xE0ng t\u1EA1i \u0110\xE0 N\u1EB5ng. Budget 5 tri\u1EC7u/th\xE1ng, target kh\xE1ch h\xE0ng 18\u201335 tu\u1ED5i. C\u1EA7n setup campaign, t\u1ED1i \u01B0u A/B testing, b\xE1o c\xE1o hi\u1EC7u qu\u1EA3 h\xE0ng tu\u1EA7n.",
    requirements: [
      "C\xF3 kinh nghi\u1EC7m ch\u1EA1y Facebook Ads (d\xF9 l\xE0 project c\xE1 nh\xE2n)",
      "Hi\u1EC3u Facebook Ads Manager, Pixel tracking",
      "Bi\u1EBFt ph\xE2n t\xEDch s\u1ED1 li\u1EC7u c\u01A1 b\u1EA3n (CTR, CPC, ROAS)",
      "Sinh vi\xEAn Marketing, Kinh doanh"
    ],
    deliverables: [
      "Setup 3 ad campaigns",
      "A/B testing 2 ad sets m\u1ED7i campaign",
      "B\xE1o c\xE1o tu\u1EA7n (Google Sheets)",
      "T\u1ED1i \u01B0u h\xF3a d\u1EF1a tr\xEAn data th\u1EF1c t\u1EBF"
    ],
    duration: "1 th\xE1ng",
    postedAt: "2026-03-02",
    skills: ["Facebook Ads", "Google Analytics", "Data Analysis"]
  },
  {
    id: 5,
    logoText: "DS",
    logoGradient: "linear-gradient(135deg,#7C72FF,#5B4FFF)",
    title: "Fix Bug Python Flask API \u2014 E-commerce",
    company: "DevStack JSC",
    companyId: "biz-5",
    verified: true,
    location: "Remote",
    tags: [
      { label: "\u{1F4BB} IT", variant: "p" },
      { label: "Remote", variant: "t" },
      { label: "\u{1F525} G\u1EA5p", variant: "g" }
    ],
    spotsLeft: 1,
    spotsTotal: 1,
    pay: "3.000.000 \u2013 5.000.000 \u20AB",
    payMin: 3e6,
    payMax: 5e6,
    deadline: "C\xF2n 2 ng\xE0y",
    category: "it",
    description: "DevStack c\xF3 m\u1ED9t API Flask (Python) cho h\u1EC7 th\u1ED1ng e-commerce b\u1ECB l\u1ED7i checkout flow. C\u1EA7n debug, fix 5\u20137 bug \u0111\xE3 identified, vi\u1EBFt unit test. Codebase ~8k lines, c\xF3 documentation t\u1ED1t.",
    requirements: [
      "Bi\u1EBFt Python, Flask framework",
      "Hi\u1EC3u REST API, HTTP methods",
      "C\xF3 kinh nghi\u1EC7m debugging (breakpoints, logging)",
      "Bi\u1EBFt vi\u1EBFt unit test (pytest)"
    ],
    deliverables: [
      "Fix t\u1EA5t c\u1EA3 bug trong issue tracker",
      "Unit tests cho m\u1ED7i bug fix",
      "Pull request v\u1EDBi m\xF4 t\u1EA3 chi ti\u1EBFt"
    ],
    duration: "3\u20135 ng\xE0y",
    postedAt: "2026-03-03",
    skills: ["Python", "Flask", "REST API", "Unit Testing"]
  },
  {
    id: 6,
    logoText: "LM",
    logoGradient: "linear-gradient(135deg,#FF4D6B,#FF6B35)",
    title: "D\u1ECBch thu\u1EADt T\xE0i li\u1EC7u K\u1EF9 thu\u1EADt EN\u2192VI (5.000 t\u1EEB)",
    company: "LinguaMedia Corp",
    companyId: "biz-6",
    verified: true,
    location: "Remote",
    tags: [
      { label: "\u{1F310} Ng\xF4n ng\u1EEF", variant: "a" },
      { label: "Remote", variant: "t" }
    ],
    spotsLeft: 4,
    spotsTotal: 5,
    pay: "900.000 \u2013 1.500.000 \u20AB",
    payMin: 9e5,
    payMax: 15e5,
    deadline: "C\xF2n 15 ng\xE0y",
    category: "language",
    description: "LinguaMedia c\u1EA7n d\u1ECBch t\xE0i li\u1EC7u k\u1EF9 thu\u1EADt (h\u01B0\u1EDBng d\u1EABn s\u1EED d\u1EE5ng ph\u1EA7n m\u1EC1m) t\u1EEB ti\u1EBFng Anh sang ti\u1EBFng Vi\u1EC7t. Y\xEAu c\u1EA7u d\u1ECBch ch\xEDnh x\xE1c thu\u1EADt ng\u1EEF, \u0111\u1EA3m b\u1EA3o t\u1EF1 nhi\xEAn khi \u0111\u1ECDc b\u1EB1ng ti\u1EBFng Vi\u1EC7t.",
    requirements: [
      "Ti\u1EBFng Anh t\u1ED1t (IELTS 6.5+ ho\u1EB7c t\u01B0\u01A1ng \u0111\u01B0\u01A1ng)",
      "C\xF3 kinh nghi\u1EC7m d\u1ECBch thu\u1EADt (k\u1EC3 c\u1EA3 project c\xE1 nh\xE2n)",
      "Sinh vi\xEAn ng\xE0nh Ng\xF4n ng\u1EEF Anh, Phi\xEAn d\u1ECBch",
      "Hi\u1EC3u thu\u1EADt ng\u1EEF c\xF4ng ngh\u1EC7 c\u01A1 b\u1EA3n"
    ],
    deliverables: [
      "B\u1EA3n d\u1ECBch ho\xE0n ch\u1EC9nh 5.000 t\u1EEB",
      "Glossary (b\u1EA3ng thu\u1EADt ng\u1EEF) ti\u1EBFng Anh\u2013Vi\u1EC7t",
      "File Word format theo template c\xF3 s\u1EB5n"
    ],
    duration: "1 tu\u1EA7n",
    postedAt: "2026-02-20",
    skills: ["English", "Translation", "Technical Writing"]
  },
  {
    id: 7,
    logoText: "VP",
    logoGradient: "linear-gradient(135deg,#E040FB,#7C4DFF)",
    title: "Quay & Edit Video TikTok (10 videos)",
    company: "ViralPeak Media",
    companyId: "biz-7",
    verified: true,
    location: "H\u1ED3 Ch\xED Minh",
    tags: [
      { label: "\u{1F3AC} Video", variant: "a" },
      { label: "Onsite", variant: "g" }
    ],
    spotsLeft: 2,
    spotsTotal: 3,
    pay: "1.500.000 \u2013 2.500.000 \u20AB",
    payMin: 15e5,
    payMax: 25e5,
    deadline: "C\xF2n 10 ng\xE0y",
    category: "media",
    description: "ViralPeak c\u1EA7n sinh vi\xEAn quay v\xE0 edit 10 video TikTok (30\u201360s m\u1ED7i video) cho th\u01B0\u01A1ng hi\u1EC7u th\u1EDDi trang. N\u1ED9i dung \u0111\xE3 \u0111\u01B0\u1EE3c script s\u1EB5n, b\u1EA1n c\u1EA7n quay b\u1EB1ng \u0111i\u1EC7n tho\u1EA1i v\xE0 edit tr\xEAn CapCut/Premiere.",
    requirements: [
      "Bi\u1EBFt quay video b\u1EB1ng smartphone (stable, good lighting)",
      "Th\xE0nh th\u1EA1o CapCut ho\u1EB7c Premiere Pro",
      "Hi\u1EC3u trend TikTok, pacing, hook (3 gi\xE2y \u0111\u1EA7u)",
      "T\u1EA1i TP.HCM \u0111\u1EC3 quay onsite"
    ],
    deliverables: [
      "10 video TikTok 30\u201360s (export 1080x1920)",
      "File raw + file edit",
      "Caption suggestion cho m\u1ED7i video"
    ],
    duration: "2 tu\u1EA7n",
    postedAt: "2026-02-25",
    skills: ["Video Editing", "CapCut", "TikTok", "Content Creation"]
  },
  {
    id: 8,
    logoText: "AF",
    logoGradient: "linear-gradient(135deg,#00BCD4,#009688)",
    title: "Nh\u1EADp li\u1EC7u & Ph\xE2n t\xEDch Data Excel (500 rows)",
    company: "AlphaFinance",
    companyId: "biz-8",
    verified: true,
    location: "Remote",
    tags: [
      { label: "\u{1F4CA} Data", variant: "p" },
      { label: "Remote", variant: "t" }
    ],
    spotsLeft: 3,
    spotsTotal: 5,
    pay: "500.000 \u2013 800.000 \u20AB",
    payMin: 5e5,
    payMax: 8e5,
    deadline: "C\xF2n 7 ng\xE0y",
    category: "business",
    description: "AlphaFinance c\u1EA7n nh\u1EADp li\u1EC7u t\u1EEB scan PDF sang Excel (500 d\xF2ng), sau \u0111\xF3 t\u1EA1o c\xE1c b\u1EA3ng pivot, chart c\u01A1 b\u1EA3n \u0111\u1EC3 ph\u1EE5c v\u1EE5 b\xE1o c\xE1o n\u1ED9i b\u1ED9. Job \u0111\u01A1n gi\u1EA3n, ph\xF9 h\u1EE3p sinh vi\xEAn m\u1EDBi b\u1EAFt \u0111\u1EA7u.",
    requirements: [
      "Th\xE0nh th\u1EA1o Microsoft Excel (pivot table, VLOOKUP, chart)",
      "C\u1EA9n th\u1EADn, ch\xEDnh x\xE1c trong nh\u1EADp li\u1EC7u",
      "Sinh vi\xEAn K\u1EBF to\xE1n, T\xE0i ch\xEDnh, QTKD"
    ],
    deliverables: [
      "File Excel ho\xE0n ch\u1EC9nh 500 d\xF2ng",
      "3 b\u1EA3ng pivot table",
      "2 chart (bar + pie)"
    ],
    duration: "3 ng\xE0y",
    postedAt: "2026-02-28",
    skills: ["Excel", "Data Entry", "Pivot Tables"]
  },
  {
    id: 9,
    logoText: "SB",
    logoGradient: "linear-gradient(135deg,#FF5722,#E91E63)",
    title: "Thi\u1EBFt k\u1EBF UI/UX Mobile App \u2014 Health Tracker",
    company: "SmartBit Solutions",
    companyId: "biz-9",
    verified: true,
    location: "Remote",
    tags: [
      { label: "\u{1F3A8} Thi\u1EBFt k\u1EBF", variant: "a" },
      { label: "Remote", variant: "t" },
      { label: "\u{1F525} Hot", variant: "g" }
    ],
    spotsLeft: 1,
    spotsTotal: 2,
    pay: "3.000.000 \u2013 5.000.000 \u20AB",
    payMin: 3e6,
    payMax: 5e6,
    deadline: "C\xF2n 14 ng\xE0y",
    category: "design",
    featured: true,
    description: "SmartBit \u0111ang ph\xE1t tri\u1EC3n \u1EE9ng d\u1EE5ng Health Tracker cho ng\u01B0\u1EDDi Vi\u1EC7t. C\u1EA7n sinh vi\xEAn thi\u1EBFt k\u1EBF full UI/UX flow: onboarding, dashboard, tracking, profile. L\xE0m tr\xEAn Figma, c\xF3 Design System s\u1EB5n.",
    requirements: [
      "Th\xE0nh th\u1EA1o Figma (auto-layout, components, variants)",
      "Hi\u1EC3u UX flow, user journey mapping",
      "C\xF3 portfolio UI/UX (\xEDt nh\u1EA5t 2 projects)",
      "Bi\u1EBFt thi\u1EBFt k\u1EBF cho mobile (iOS/Android guidelines)"
    ],
    deliverables: [
      "15+ m\xE0n h\xECnh UI ho\xE0n ch\u1EC9nh",
      "Interactive prototype (Figma)",
      "Design system components",
      "Handoff notes cho developer"
    ],
    duration: "3 tu\u1EA7n",
    postedAt: "2026-02-20",
    skills: ["Figma", "UI/UX", "Mobile Design", "Prototyping"]
  },
  {
    id: 10,
    logoText: "EC",
    logoGradient: "linear-gradient(135deg,#4CAF50,#8BC34A)",
    title: "Kh\u1EA3o s\xE1t th\u1ECB tr\u01B0\u1EDDng Online \u2014 Ng\xE0nh FMCG",
    company: "EcoConsult VN",
    companyId: "biz-10",
    verified: true,
    location: "Remote",
    tags: [
      { label: "\u{1F4CA} Kinh doanh", variant: "p" },
      { label: "Remote", variant: "t" }
    ],
    spotsLeft: 5,
    spotsTotal: 8,
    pay: "600.000 \u2013 1.000.000 \u20AB",
    payMin: 6e5,
    payMax: 1e6,
    deadline: "C\xF2n 20 ng\xE0y",
    category: "business",
    description: "EcoConsult c\u1EA7n team sinh vi\xEAn th\u1EF1c hi\u1EC7n kh\u1EA3o s\xE1t th\u1ECB tr\u01B0\u1EDDng online (Google Forms) cho ng\xE0nh FMCG. Thu th\u1EADp 200 responses, ph\xE2n t\xEDch data, t\u1EA1o b\xE1o c\xE1o PowerPoint.",
    requirements: [
      "Bi\u1EBFt t\u1EA1o Google Forms, thi\u1EBFt k\u1EBF b\u1EA3ng h\u1ECFi",
      "C\xF3 k\u1EF9 n\u0103ng ph\xE2n t\xEDch data c\u01A1 b\u1EA3n",
      "Bi\u1EBFt PowerPoint / Google Slides",
      "Sinh vi\xEAn Marketing, QTKD, Nghi\xEAn c\u1EE9u th\u1ECB tr\u01B0\u1EDDng"
    ],
    deliverables: [
      "B\u1EA3ng kh\u1EA3o s\xE1t Google Forms",
      "200 responses h\u1EE3p l\u1EC7",
      "File data raw (Excel)",
      "B\xE1o c\xE1o PowerPoint 15\u201320 slides"
    ],
    duration: "3 tu\u1EA7n",
    postedAt: "2026-02-15",
    skills: ["Market Research", "Google Forms", "PowerPoint", "Data Analysis"]
  },
  {
    id: 11,
    logoText: "NX",
    logoGradient: "linear-gradient(135deg,#3F51B5,#2196F3)",
    title: "Backend API Node.js \u2014 Chat App",
    company: "NextGen Labs",
    companyId: "biz-11",
    verified: true,
    location: "Remote",
    tags: [
      { label: "\u{1F4BB} IT", variant: "p" },
      { label: "Remote", variant: "t" }
    ],
    spotsLeft: 1,
    spotsTotal: 2,
    pay: "3.500.000 \u2013 6.000.000 \u20AB",
    payMin: 35e5,
    payMax: 6e6,
    deadline: "C\xF2n 9 ng\xE0y",
    category: "it",
    description: "NextGen Labs c\u1EA7n sinh vi\xEAn x\xE2y d\u1EF1ng REST API cho \u1EE9ng d\u1EE5ng chat real-time. S\u1EED d\u1EE5ng Node.js + Express + Socket.io + MongoDB. C\xF3 wireframe v\xE0 API spec s\u1EB5n.",
    requirements: [
      "Node.js + Express framework",
      "MongoDB / Mongoose",
      "Socket.io ho\u1EB7c WebSocket",
      "Authentication (JWT)",
      "Git workflow"
    ],
    deliverables: [
      "REST API ho\xE0n ch\u1EC9nh theo spec",
      "Real-time chat v\u1EDBi Socket.io",
      "JWT authentication",
      "API documentation (Swagger/Postman)",
      "Unit tests"
    ],
    duration: "3 tu\u1EA7n",
    postedAt: "2026-02-26",
    skills: ["Node.js", "Express", "MongoDB", "Socket.io", "JWT"]
  },
  {
    id: 12,
    logoText: "CW",
    logoGradient: "linear-gradient(135deg,#FF9800,#F44336)",
    title: "Vi\u1EBFt Email Marketing Series (5 emails)",
    company: "CopyWave Agency",
    companyId: "biz-12",
    verified: true,
    location: "Remote",
    tags: [
      { label: "\u270D\uFE0F Content", variant: "t" },
      { label: "\u{1F4E2} Marketing", variant: "g" }
    ],
    spotsLeft: 2,
    spotsTotal: 3,
    pay: "800.000 \u2013 1.200.000 \u20AB",
    payMin: 8e5,
    payMax: 12e5,
    deadline: "C\xF2n 6 ng\xE0y",
    category: "content",
    description: "CopyWave c\u1EA7n vi\u1EBFt email marketing series (welcome sequence 5 emails) cho startup EdTech. Tone: th\xE2n thi\u1EC7n, tr\u1EBB trung. M\u1EE5c ti\xEAu: nurture leads \u2192 chuy\u1EC3n \u0111\u1ED5i mua kh\xF3a h\u1ECDc.",
    requirements: [
      "K\u1EF9 n\u0103ng vi\u1EBFt thuy\u1EBFt ph\u1EE5c (copywriting)",
      "Hi\u1EC3u funnel marketing c\u01A1 b\u1EA3n",
      "Bi\u1EBFt c\u1EA5u tr\xFAc email marketing (subject, preview, CTA)",
      "Ti\u1EBFng Vi\u1EC7t t\u1ED1t, s\xE1ng t\u1EA1o"
    ],
    deliverables: [
      "5 email ho\xE0n ch\u1EC9nh (subject + body + CTA)",
      "A/B subject lines cho m\u1ED7i email",
      "Timeline g\u1EE3i \xFD g\u1EEDi (ng\xE0y n\xE0o g\u1EEDi email n\xE0o)"
    ],
    duration: "5 ng\xE0y",
    postedAt: "2026-02-28",
    skills: ["Copywriting", "Email Marketing", "Funnel"]
  }
];
var applicationsData = [
  {
    id: "app-1",
    jobId: 1,
    userId: "stu-1",
    coverLetter: "Em c\xF3 2 n\u0103m kinh nghi\u1EC7m React, \u0111\xE3 l\xE0m 3 project c\xE1 nh\xE2n...",
    status: "accepted",
    appliedAt: "2026-03-01"
  },
  {
    id: "app-2",
    jobId: 3,
    userId: "stu-1",
    coverLetter: "Em vi\u1EBFt blog c\xE1 nh\xE2n 6 th\xE1ng, quen SEO on-page...",
    status: "completed",
    appliedAt: "2026-02-20"
  }
];
var categoriesData = [
  { icon: "\u{1F4BB}", bg: "rgba(91,79,255,.15)", name: "IT / L\u1EADp tr\xECnh", count: "284 job \u0111ang m\u1EDF", slug: "it" },
  { icon: "\u{1F3A8}", bg: "rgba(255,107,53,.12)", name: "Thi\u1EBFt k\u1EBF", count: "167 job \u0111ang m\u1EDF", slug: "design" },
  { icon: "\u{1F4E2}", bg: "rgba(0,212,170,.1)", name: "Marketing", count: "215 job \u0111ang m\u1EDF", slug: "marketing" },
  { icon: "\u270D\uFE0F", bg: "rgba(255,179,64,.1)", name: "Content / Vi\u1EBFt l\xE1ch", count: "143 job \u0111ang m\u1EDF", slug: "content" },
  { icon: "\u{1F4CA}", bg: "rgba(91,79,255,.15)", name: "Kinh doanh", count: "98 job \u0111ang m\u1EDF", slug: "business" },
  { icon: "\u{1F310}", bg: "rgba(0,212,170,.1)", name: "Ng\xF4n ng\u1EEF / D\u1ECBch thu\u1EADt", count: "76 job \u0111ang m\u1EDF", slug: "language" },
  { icon: "\u{1F4B0}", bg: "rgba(255,107,53,.12)", name: "K\u1EBF to\xE1n / T\xE0i ch\xEDnh", count: "54 job \u0111ang m\u1EDF", slug: "finance" },
  { icon: "\u{1F3AC}", bg: "rgba(255,179,64,.1)", name: "Video / Media", count: "89 job \u0111ang m\u1EDF", slug: "media" }
];
var studentSteps = [
  { num: "01", icon: "\u{1F393}", title: "\u0110\u0103ng k\xFD & X\xE1c th\u1EF1c", desc: "T\u1EA1o t\xE0i kho\u1EA3n v\u1EDBi email .edu ho\u1EB7c th\u1EBB sinh vi\xEAn. H\u1EC7 th\u1ED1ng x\xE1c minh trong 24h." },
  { num: "02", icon: "\u{1F916}", title: "Smart Matching", desc: "H\u1EC7 th\u1ED1ng g\u1EE3i \xFD job ph\xF9 h\u1EE3p v\u1EDBi ng\xE0nh h\u1ECDc v\xE0 k\u1EF9 n\u0103ng b\u1EA1n \u0111\xE3 c\xF3 s\u1EB5n." },
  { num: "03", icon: "\u26A1", title: "L\xE0m vi\u1EC7c & N\u1ED9p b\xE0i", desc: "Nh\u1EADn job, th\u1EF1c hi\u1EC7n, n\u1ED9p s\u1EA3n ph\u1EA9m qua h\u1EC7 th\u1ED1ng. Doanh nghi\u1EC7p review tr\u1EF1c tuy\u1EBFn." },
  { num: "04", icon: "\u{1F3C6}", title: "Nh\u1EADn ti\u1EC1n + H\u1ED3 s\u01A1 s\u1ED1", desc: "Ti\u1EC1n Escrow t\u1EF1 \u0111\u1ED9ng chuy\u1EC3n v\xED. Project t\u1EF1 \u0111\u1ED9ng c\u1EADp nh\u1EADt v\xE0o CV \u0111i\u1EC7n t\u1EED c\u1EE7a b\u1EA1n." }
];
var businessSteps = [
  { num: "01", icon: "\u{1F3E2}", title: "\u0110\u0103ng k\xFD Doanh nghi\u1EC7p", desc: "T\u1EA1o t\xE0i kho\u1EA3n, x\xE1c th\u1EF1c th\xF4ng tin DN. Qu\xE1 tr\xECnh nhanh ch\xF3ng, ho\xE0n th\xE0nh trong ng\xE0y." },
  { num: "02", icon: "\u{1F4B0}", title: "N\u1EA1p ti\u1EC1n Escrow", desc: "N\u1EA1p ng\xE2n s\xE1ch v\xE0o h\u1EC7 th\u1ED1ng. Ti\u1EC1n ch\u1EC9 tr\u1EA3 khi b\u1EA1n duy\u1EC7t s\u1EA3n ph\u1EA9m ho\xE0n ch\u1EC9nh." },
  { num: "03", icon: "\u{1F4CB}", title: "\u0110\u0103ng Job & Ch\u1ECDn \u1EE9ng vi\xEAn", desc: "M\xF4 t\u1EA3 job ng\u1EAFn g\u1ECDn. H\u1EC7 th\u1ED1ng t\u1EF1 g\u1EE3i \xFD sinh vi\xEAn ph\xF9 h\u1EE3p, b\u1EA1n ch\u1ECDn v\xE0 ph\xEA duy\u1EC7t." },
  { num: "04", icon: "\u2705", title: "Duy\u1EC7t & Thanh to\xE1n", desc: "Review s\u1EA3n ph\u1EA9m, \u0111\xE1nh gi\xE1 k\u1EF9 n\u0103ng sinh vi\xEAn. Gi\u1EA3i ph\xF3ng ti\u1EC1n khi h\xE0i l\xF2ng." }
];
var testimonialsData = [
  {
    stars: 5,
    text: "M\xECnh \u0111\xE3 l\xE0m 8 project tr\xEAn UniTask t\u1EEB n\u0103m 3. Khi ra tr\u01B0\u1EDDng, CV c\u1EE7a m\xECnh c\xF3 8 d\u1EF1 \xE1n th\u1EF1c t\u1EBF r\xF5 r\xE0ng. Nh\xE0 tuy\u1EC3n d\u1EE5ng r\u1EA5t \u1EA5n t\u01B0\u1EE3ng, m\xECnh nh\u1EADn offer ngay v\xF2ng 1!",
    avatarLetter: "N",
    avatarGradient: "linear-gradient(135deg,#5B4FFF,#7C72FF)",
    name: "Nguy\u1EC5n Minh Khoa",
    role: "SV n\u0103m 4 \u2014 CNTT, HCMUT \xB7 Frontend Dev"
  },
  {
    stars: 5,
    text: "Tr\u01B0\u1EDBc \u0111\xE2y m\xECnh s\u1EE3 l\xE0m freelance v\xEC hay b\u1ECB b\xF9ng ti\u1EC1n. UniTask c\xF3 Escrow n\xEAn m\xECnh ho\xE0n to\xE0n y\xEAn t\xE2m. 5 th\xE1ng m\xECnh ki\u1EBFm \u0111\u01B0\u1EE3c g\u1EA7n 18 tri\u1EC7u t\u1EEB vi\u1EC7c d\u1ECBch thu\u1EADt.",
    avatarLetter: "T",
    avatarGradient: "linear-gradient(135deg,#FF6B35,#FF4D6B)",
    name: "Tr\u1EA7n Ph\u01B0\u01A1ng Linh",
    role: "SV n\u0103m 3 \u2014 Ng\xF4n ng\u1EEF Anh, ULIS \xB7 D\u1ECBch thu\u1EADt"
  },
  {
    stars: 5,
    text: "Tuy\u1EC3n d\u1EE5ng qua UniTask ti\u1EBFt ki\u1EC7m 60% chi ph\xED so v\u1EDBi d\xF9ng headhunter. Sinh vi\xEAn \u0111\u01B0\u1EE3c x\xE1c th\u1EF1c v\xE0 c\xF3 k\u1EF9 n\u0103ng r\xF5 r\xE0ng, m\xECnh kh\xF4ng ph\u1EA3i lo ng\u1EA1i ch\u1EA5t l\u01B0\u1EE3ng.",
    avatarLetter: "H",
    avatarGradient: "linear-gradient(135deg,#00D4AA,#00A882)",
    name: "Hu\u1EF3nh Thanh T\xF9ng",
    role: "Co-founder \u2014 BrandSpace Startup \xB7 Kh\xE1ch h\xE0ng DN"
  }
];
var featuresData = [
  {
    icon: "\u{1F6E1}\uFE0F",
    iconBg: "rgba(91,79,255,.15)",
    title: "H\u1EC7 th\u1ED1ng Escrow \u2014 Kh\xF4ng bao gi\u1EDD b\u1ECB b\xF9ng ti\u1EC1n",
    desc: "Doanh nghi\u1EC7p n\u1EA1p ti\u1EC1n v\xE0o h\u1EC7 th\u1ED1ng tr\u01B0\u1EDBc khi job b\u1EAFt \u0111\u1EA7u. Ti\u1EC1n ch\u1EC9 \u0111\u01B0\u1EE3c gi\u1EA3i ph\xF3ng khi b\u1EA1n ho\xE0n th\xE0nh v\xE0 \u0111\u01B0\u1EE3c duy\u1EC7t. UniTask l\xE0m trung gian b\u1EA3o v\u1EC7 quy\u1EC1n l\u1EE3i c\u1EA3 hai ph\xEDa.",
    large: true,
    list: [
      "Ti\u1EC1n gi\u1EEF an to\xE0n trong t\xE0i kho\u1EA3n Escrow",
      "Tranh ch\u1EA5p c\xF3 \u0111\u1ED9i ng\u0169 h\u1ED7 tr\u1EE3 gi\u1EA3i quy\u1EBFt",
      "L\u1ECBch s\u1EED giao d\u1ECBch minh b\u1EA1ch 100%",
      "R\xFAt ti\u1EC1n v\u1EC1 v\xED/bank trong 24h"
    ]
  },
  {
    icon: "\u{1F916}",
    iconBg: "rgba(0,212,170,.1)",
    title: "Smart Matching theo ng\xE0nh h\u1ECDc",
    desc: "Sinh vi\xEAn Ng\xF4n ng\u1EEF Anh th\u1EA5y job d\u1ECBch thu\u1EADt. Sinh vi\xEAn IT th\u1EA5y job code. Kh\xF4ng l\xE3ng ph\xED th\u1EDDi gian l\u1ECDc th\u1EE7 c\xF4ng."
  },
  {
    icon: "\u{1F4CB}",
    iconBg: "rgba(255,107,53,.1)",
    title: "H\u1ED3 s\u01A1 s\u1ED1 t\u1EF1 \u0111\u1ED9ng (Digital CV)",
    desc: "M\u1ED7i project ho\xE0n th\xE0nh t\u1EF1 \u0111\u1ED9ng c\u1EADp nh\u1EADt v\xE0o CV \u0111i\u1EC7n t\u1EED. Xu\u1EA5t PDF \u0111\u1EB9p, chia s\u1EBB link cho nh\xE0 tuy\u1EC3n d\u1EE5ng."
  },
  {
    icon: "\u2B50",
    iconBg: "rgba(255,179,64,.1)",
    title: "\u0110\xE1nh gi\xE1 2 chi\u1EC1u & Skill Endorsement",
    desc: "Doanh nghi\u1EC7p kh\xF4ng ch\u1EC9 ch\u1EA5m sao \u2014 h\u1ECD x\xE1c nh\u1EADn k\u1EF9 n\u0103ng c\u1EE5 th\u1EC3 c\u1EE7a b\u1EA1n. H\u1ED3 s\u01A1 ng\xE0y c\xE0ng gi\xE1 tr\u1ECB h\u01A1n."
  }
];
export {
  applicationsData,
  businessSteps,
  categoriesData,
  featuresData,
  jobsData,
  studentSteps,
  testimonialsData
};
