// ─── ALL PORTFOLIO CONTENT IN ONE PLACE ───────────────────────────────────────

export const personalInfo = {
  name: "Hassan Mohamed Samhan",
  shortName: "Hassan Samhan",
  initials: "HS",
  title: "Full-stack & Frontend Developer",
  email: "hassan700019@gmail.com",
  phone: "+20 1111761352",
  phone2: "+20 1002128517",
  location: "Cairo, Egypt",
  linkedin: "https://www.linkedin.com/in/hassan-samhan-194889247/",
  github: "https://github.com/HassanSamhann",
  portfolio: "https://hassansamhan.vercel.app/",
  cvUrl: "https://drive.google.com/file/d/1v7RFS7Z9AGfD-SEsM3tU1zhnMUfTZ1EP/view?usp=sharing",
  availableForWork: true,
  roles: [
    "Full-stack Developer",
    "React Specialist",
    "Next.js Developer",
    "Angular Developer",
    "IT Infrastructure Expert",
  ],
  tagline:
    "I turn complex problems into clean, fast, and user-friendly web products.",
  bio: {
    chapter1: {
      title: "The Beginning",
      text: `My journey started with a curiosity about how websites worked — that magic moment when code becomes something you can see and touch. What began as tinkering with HTML quickly turned into a genuine passion for building things on the web. I earned my Diploma in Medical Records and Statistics, but the developer path kept calling.`,
    },
    chapter2: {
      title: "The Growth",
      text: `I dove deep into structured learning through ALX's Front-End Program, FWD, and DEPI — programs that sharpened not just my code, but my thinking. I discovered that great frontend work isn't just about making things look good; it's about understanding users, performance, and systems. That's what pushed me into IT infrastructure alongside my development career.`,
    },
    chapter3: {
      title: "The Mission",
      text: `Today, at the Egyptian Ministry of Health, I build internal web tools that real people rely on daily — from data dashboards to user management systems. I bridge the gap between development and IT: writing clean React and Angular code in the morning, then configuring servers and solving network issues in the afternoon. I'm open to new opportunities where I can grow and deliver real impact.`,
    },
  },
  whatIBring: [
    {
      icon: "Code2",
      title: "Clean, Maintainable Code",
      desc: "I write code that future-me (and teammates) can actually read and extend.",
    },
    {
      icon: "Zap",
      title: "Fast Delivery",
      desc: "I move quickly without cutting corners — balancing speed with quality.",
    },
    {
      icon: "Server",
      title: "IT & Infrastructure Know-How",
      desc: "I understand the full stack — from the browser to the server room.",
    },
    {
      icon: "Brain",
      title: "Problem-First Thinking",
      desc: "I ask 'what problem are we solving?' before touching the keyboard.",
    },
  ],
  stats: [
    { label: "Years Experience", value: "3+" },
    { label: "Projects Shipped", value: "10+" },
    { label: "Patient Records", value: "10K+" },
    { label: "Technologies", value: "20+" },
  ],
};

export const skills = [
  {
    category: "Frontend",
    color: "#6c63ff",
    items: [
      { name: "Next.js 15", level: 88 },
      { name: "React 19", level: 92 },
      // { name: "Angular", level: 85 },
      { name: "TypeScript", level: 82 },
      { name: "JavaScript (ES6+)", level: 93 },
      { name: "HTML5 & CSS3", level: 95 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Responsive Design", level: 93 },
    ],
  },
  {
    category: "Backend & Data",
    color: "#43e97b",
    items: [
      { name: "PostgreSQL", level: 78 },
      { name: "Prisma ORM", level: 80 },
      { name: "Supabase", level: 82 },
      { name: "Next-Auth / JWT", level: 80 },
      { name: "REST API Integration", level: 90 },
    ],
  },
  {
    category: "IT & Infrastructure",
    color: "#ff6584",
    items: [
      { name: "Networking", level: 85 },
      { name: "Windows Server", level: 82 },
      { name: "Troubleshooting", level: 90 },
      { name: "Domain Management", level: 80 },
    ],
  },
  {
    category: "Tools & Workflow",
    color: "#f6c90e",
    items: [
      { name: "Git & GitHub", level: 88 },
      { name: "AI-Assisted Dev", level: 90 },
      { name: "SEO Fundamentals", level: 78 },
      { name: "Terminal/CLI", level: 82 },
    ],
  },
];

export const experience = [
  {
    id: 1,
    role: "Frontend Developer",
    company: "Egyptian Ministry of Health",
    period: "Oct 2022 – Present",
    type: "Full-time",
    location: "Cairo, Egypt",
    color: "#6c63ff",
    highlights: [
      "Optimized 15+ web modules, increasing accessibility and ease-of-use by 30% for healthcare professionals",
      "Built Advanced Patient Management System handling 10,000+ medical records with RBAC & JWT security",
      "Developed Healthcare Sector Reports Platform generating 500+ accurate PDF reports weekly",
      "Reduced development cycles by 20% through creation of a shared React component library",
      "Leveraged AI tools to accelerate full-stack development and reduce delivery time by ~40%",
      "Managed IT infrastructure: networks, Windows Server, and domain environments",
    ],
  },
  {
    id: 2,
    role: "IT Support Engineer",
    company: "Makin Research Center",
    period: "Jan 2021 – Sep 2022",
    type: "Full-time",
    location: "Cairo, Egypt",
    color: "#43e97b",
    highlights: [
      "Maintained 99.9% uptime for 100+ workstations and mission-critical research networking hardware",
      "Managed the local area network connecting 50+ devices to central servers",
      "Created and administered Windows Server domains and user accounts",
      "Handled hardware and software troubleshooting for research staff",
    ],
  },
  {
    id: 3,
    role: "Education & Certifications",
    company: "Academic Background",
    period: "2019 – 2022",
    type: "Training",
    location: "Egypt",
    color: "#ff6584",
    highlights: [
      "Diploma — Medical Records & Statistics",
      "Digital Egypt Professional Initiative (DEPI) — Frontend Track",
      "ALX-Africa — Certified Graduate, Front-End Web Development",
      "FWD (Future Work is Digital) — Front-End Web Development",
    ],
  },
];

export const projects = [
  {
    id: 1,
    title: "Advanced Patient Management System",
    category: "Next.js",
    tags: ["Next.js 15", "React 19", "TypeScript", "Prisma ORM", "PostgreSQL", "Next-Auth", "Supabase"],
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=450&fit=crop",
    problem:
      "The Ministry of Health needed a high-security, scalable system to manage 10,000+ patient medical records across multiple hospital departments — the existing process was fragmented, slow, and error-prone.",
    solution:
      "Built a full-stack Next.js 15 application with Role-Based Access Control (RBAC) and Next-Auth JWT authentication. Architected a secure file management system for 5,000+ medical images using Supabase storage and PostgreSQL via Prisma ORM. Included a medical follow-up module with automated appointment scheduling.",
    impact: [
      "Manages 10,000+ patient records with 50% faster data retrieval",
      "RBAC + JWT securing sensitive data for multiple departments",
      "Automated scheduling improved appointment compliance by 25%",
      "Secure storage for 5,000+ medical images",
    ],
    liveUrl: "#",
    githubUrl: null,
    featured: true,
    year: "2024 – 2025",
  },
  {
    id: 2,
    title: "Healthcare Sector Reports Platform",
    category: "Next.js",
    tags: ["Next.js 14", "React", "TypeScript", "Tailwind CSS", "Supabase", "Chart.js"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    problem:
      "Department leads had no unified view of field team operations or medical KPIs, making strategic decisions slow and inaccurate.",
    solution:
      "Engineered an integrated reporting & analytics dashboard tracking 20+ field teams. Developed dynamic multi-format report generators (PDF/Print) and integrated Chart.js statistical visualizations to surface actionable medical KPIs for department leads.",
    impact: [
      "Tracks 20+ field teams with 30% boost in monitoring efficiency",
      "Delivers 500+ accurate PDF/Print reports weekly",
      "Statistical dashboards provide real-time KPI insights",
    ],
    liveUrl: "#",
    githubUrl: null,
    featured: true,
    year: "2023 – 2024",
  },
  {
    id: 3,
    title: "Ministry of Health — Staff Portal",
    category: "React",
    tags: ["React", "PostgreSQL", "Supabase", "Tailwind"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop",
    problem:
      "The Ministry needed an internal tool to manage staff data, user roles, and department records — previously done on spreadsheets, causing errors and delays.",
    solution:
      "Built a full React web application with role-based authentication, data tables, modals, and a PostgreSQL backend via Supabase. Implemented city/role management and real-time sync.",
    impact: [
      "Replaced 100% of manual spreadsheet workflows",
      "Used by 200+ staff across multiple departments",
      "Cut data retrieval time from minutes to seconds",
    ],
    liveUrl: "#",
    githubUrl: null,
    featured: false,
    year: "2022 – 2023",
  },
  {
    id: 4,
    title: "Book Library",
    category: "React",
    tags: ["React", "Open Library API", "Responsive Design"],
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop",
    problem:
      "Readers needed a fast, clean way to discover and explore books without navigating bloated platforms.",
    solution:
      "Built a React SPA integrating the Open Library API — search, browse, and view book details with a clean UI and instant search results.",
    impact: [
      "Sub-200ms search response via API optimisation",
      "Fully responsive across mobile, tablet, desktop",
      "Clean component architecture — easy to extend",
    ],
    liveUrl: "https://fe-capstone-project-nu.vercel.app/book",
    githubUrl: "https://github.com/HassanSamhann",
    featured: false,
  },
  {
    id: 5,
    title: "Florence Kitchen",
    category: "HTML+JS",
    tags: ["HTML", "CSS", "JavaScript"],
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop",
    problem:
      "A food brand needed a visually appealing, lightweight site that loads fast and works on any device.",
    solution:
      "Crafted a pure HTML/CSS/JS website with custom animations, responsive layouts, and an intuitive browsing experience — zero frameworks, maximum performance.",
    impact: [
      "100 Lighthouse performance score",
      "Zero dependencies — lightning-fast load",
      "Pixel-perfect on all screen sizes",
    ],
    liveUrl: "https://hassansamhann.github.io/Florence-project/",
    githubUrl: "https://github.com/HassanSamhann",
    featured: false,
  },
  {
    id: 6,
    title: "Travel Blog Platform",
    category: "Angular",
    tags: ["Angular", "TypeScript", "Responsive Design"],
    image:
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=450&fit=crop",
    problem:
      "A team needed a collaborative platform for travel writers to publish stories, showcase destinations, and engage readers.",
    solution:
      "Developed an Angular application with dynamic routing, component-driven architecture, and responsive design — built collaboratively with clean, maintainable TypeScript.",
    impact: [
      "Collaborative build with clean git workflow",
      "Dynamic content routing for dozens of destinations",
      "Fully responsive UX across devices",
    ],
    liveUrl: "https://travel-blog-five-wine.vercel.app/home",
    githubUrl: "https://github.com/HassanSamhann",
    featured: false,
  },
  {
    id: 7,
    title: "Dr. Mohamed — Medical Portfolio",
    category: "Angular",
    tags: ["Angular", "TypeScript", "CSS"],
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop",
    problem:
      "A medical professional needed a credible, professional online presence for patient appointments and service listings.",
    solution:
      "Built a clean Angular portfolio with service sections, appointment info, and contact details — optimized for trust, readability, and mobile accessibility.",
    impact: [
      "Professional online presence established",
      "Clear service sections with SEO-friendly markup",
      "Fully mobile-responsive design",
    ],
    liveUrl: "https://dr-mohamed.vercel.app/",
    githubUrl: "https://github.com/HassanSamhann",
    featured: false,
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Ahmed Khalil",
    role: "Senior IT Manager",
    company: "Egyptian Ministry of Health",
    avatar: "AK",
    color: "#6c63ff",
    text: "Hassan consistently delivers beyond expectations. The staff portal he built transformed how our departments operate — what used to take hours now takes seconds. His ability to handle both development and IT issues in the same day is rare and invaluable.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Nour",
    role: "ALX Program Mentor",
    company: "ALX Africa",
    avatar: "SN",
    color: "#43e97b",
    text: "Hassan stood out in the program for his problem-first approach. He never just copied solutions — he understood the why. His projects consistently showed thoughtful UX and clean code structure. I'd recommend him for any frontend role without hesitation.",
    rating: 5,
  },
  {
    id: 3,
    name: "Mohamed Fathy",
    role: "Colleague & Angular Developer",
    company: "Travel Blog Project",
    avatar: "MF",
    color: "#ff6584",
    text: "Working with Hassan on the Travel Blog was a great experience. He communicates clearly, writes clean maintainable code, and always keeps the end-user in mind. He's the kind of developer you want on your team.",
    rating: 5,
  },
];

export const nowSection = {
  learning: {
    icon: "BookOpen",
    title: "Currently Learning",
    items: [
      "Next.js 14 App Router & Server Components",
      "AI integration in web applications",
      "Advanced TypeScript patterns",
    ],
  },
  building: {
    icon: "Hammer",
    title: "Currently Building",
    items: [
      "Upgrading this portfolio to Next.js",
      "Hospital staff management system",
      "Exploring AI-powered UI components",
    ],
  },
  reading: {
    icon: "Newspaper",
    title: "Currently Exploring",
    items: [
      "Clean Architecture by Robert Martin",
      "Frontend system design patterns",
      "The latest in React 19 features",
    ],
  },
};

export const blogPosts = [
  {
    id: 1,
    title: "Why Every Frontend Developer Should Learn Networking Basics",
    excerpt:
      "Understanding DNS, HTTP, and basic networking concepts makes you a better developer — and a more valuable one. Here's what I learned working in IT.",
    category: "Career",
    readTime: "5 min read",
    date: "April 2025",
    url: "#",
    color: "#6c63ff",
  },
  {
    id: 2,
    title: "From Spreadsheets to Web App: Building Internal Tools That People Actually Use",
    excerpt:
      "I built a staff portal for 200+ government employees. Here's what I learned about designing for non-technical users and handling real-world data.",
    category: "Case Study",
    readTime: "8 min read",
    date: "March 2025",
    url: "#",
    color: "#43e97b",
  },
  {
    id: 3,
    title: "How I Use AI Tools to Build Faster Without Sacrificing Quality",
    excerpt:
      "AI-assisted development is a skill, not a shortcut. Here's my workflow for using Copilot and ChatGPT to move fast while staying in control of my codebase.",
    category: "Productivity",
    readTime: "6 min read",
    date: "February 2025",
    url: "#",
    color: "#ff6584",
  },
];
