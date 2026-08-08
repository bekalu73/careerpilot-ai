"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
async function main() {
    console.log("Seeding Bekalu Sisay Iticha's career profile into CareerPilot database...");
    // Clean existing candidate
    await prisma_js_1.default.candidate.deleteMany();
    const candidate = await prisma_js_1.default.candidate.create({
        data: {
            name: "Bekalu Sisay Iticha",
            email: "bekalusisay2010@gmail.com",
            phone: "+251 946931271",
            location: "Addis Ababa, Ethiopia",
            professionalSummary: "MERN Fullstack Developer with expertise in building scalable, responsive web applications using MongoDB, Express, React, and Node.js. Skilled in PostgreSQL, MySQL, and Next.js, with a focus on delivering seamless user experiences and robust backend solutions. Passionate about collaborating with tech startups to drive innovation.",
            portfolioUrl: null,
            githubUrl: "https://github.com/bekalu73",
            linkedinUrl: "https://linkedin.com/in/bekalusisay",
            experiences: {
                create: [
                    {
                        company: "EagleLion System Technology",
                        jobTitle: "Mobile App Developer",
                        location: "Addis Ababa, Ethiopia",
                        startDate: new Date("2026-02-01"),
                        endDate: null,
                        isCurrent: true,
                        description: "Developing secure and scalable mobile banking features and cross-platform apps.",
                        responsibilities: [
                            "Developing secure and scalable mobile banking features using React Native.",
                            "Collaborated with cross-functional teams to implement scalable UI/UX designs, improving user engagement by 20%.",
                            "Optimized frontend performance, reducing load times by 15% through efficient state management and code refactoring.",
                        ],
                        technologies: ["React Native", "TypeScript", "TanStack Query", "Zustand", "Mobile Security"],
                        domains: ["FinTech", "Mobile Banking"],
                        achievements: ["Improved user engagement by 20%", "Reduced mobile app load times by 15%"],
                    },
                    {
                        company: "EagleLion System Technology",
                        jobTitle: "Frontend Developer",
                        location: "Addis Ababa, Ethiopia",
                        startDate: new Date("2025-03-01"),
                        endDate: new Date("2026-02-01"),
                        isCurrent: false,
                        description: "Developed dynamic and responsive frontend interfaces for enterprise web applications.",
                        responsibilities: [
                            "Developed dynamic and responsive frontend interfaces using Next.js and React for enterprise-level web applications.",
                            "Collaborated with cross-functional teams to implement scalable UI/UX designs, improving user engagement by 20%.",
                            "Optimized frontend performance, reducing load times by 15% through efficient state management and code refactoring.",
                        ],
                        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "Sanity CMS", "Turborepo"],
                        domains: ["Enterprise Web", "Banking Portals", "FinTech"],
                        achievements: ["Enterprise portal development for major banking client", "High-performance animations with GSAP"],
                    },
                    {
                        company: "Ashewa Technology Solution",
                        jobTitle: "Full-stack Developer",
                        location: "Addis Ababa, Ethiopia",
                        startDate: new Date("2024-10-01"),
                        endDate: new Date("2025-03-01"),
                        isCurrent: false,
                        description: "Built and maintained full-stack web applications using the MERN stack with high availability.",
                        responsibilities: [
                            "Built and maintained full-stack web applications using the MERN stack, ensuring high availability and security.",
                            "Designed and implemented RESTful APIs with Node.js and Express, integrating MongoDB and PostgreSQL for efficient data management.",
                            "Streamlined deployment processes using CI/CD pipelines, reducing deployment time by 25%.",
                        ],
                        technologies: ["Node.js", "Express", "MongoDB", "PostgreSQL", "React", "CI/CD", "Docker"],
                        domains: ["E-Commerce", "Web Applications", "Full-Stack Development"],
                        achievements: ["Quarterly Highest Achiever Award", "Reduced deployment time by 25% via CI/CD"],
                    },
                    {
                        company: "Olla App",
                        jobTitle: "Mobile App Developer",
                        location: "Addis Ababa, Ethiopia",
                        startDate: new Date("2023-07-01"),
                        endDate: new Date("2024-10-01"),
                        isCurrent: false,
                        description: "Developing secure and scalable mobile application using React Native, PostgreSQL, and MongoDB.",
                        responsibilities: [
                            "Developing secure and scalable mobile App using React Native.",
                            "Designed and managed databases using MongoDB and PostgreSQL, optimizing queries and improving data consistency.",
                            "Implemented authentication, authorization, and role-based access control.",
                            "Collaborated with frontend and mobile teams to integrate APIs and deliver end-to-end features efficiently.",
                        ],
                        technologies: ["React Native", "MongoDB", "PostgreSQL", "Node.js", "REST APIs"],
                        domains: ["Mobile Apps", "Ride Hailing / Logistics"],
                        achievements: ["Delivered core mobile app features with database query optimization"],
                    },
                ],
            },
            projects: {
                create: [
                    {
                        name: "Dashen SuperAPP – Boch Boch Portal",
                        role: "Frontend Lead",
                        description: "Enterprise dashboard for Dashen Bank's Boch Boch game within the SuperApp ecosystem. Features prize dashboards, player activity statistics, and real-time game insights.",
                        githubUrl: null,
                        demoUrl: null,
                        technologies: ["Next.js", "TypeScript", "Turborepo", "Tailwind CSS", "TanStack Query", "REST APIs"],
                        domains: ["FinTech", "Banking", "Gaming", "Enterprise Dashboards"],
                        keywords: ["Dashen Bank", "SuperApp", "Analytics Dashboard", "Enterprise Web", "High Scalability"],
                        responsibilities: [
                            "Built enterprise dashboard architecture using Next.js and Turborepo.",
                            "Developed real-time dashboards for prize allocation and player statistics.",
                            "Collaborated with banking stakeholders to guarantee security and compliance.",
                        ],
                        achievements: ["Received Recognition Certificate from Dashen SuperApp Project"],
                        displayOrder: 0,
                    },
                    {
                        name: "Dashen Bank Landing Page",
                        role: "Frontend Engineer",
                        description: "Marketing and product landing pages for Dashen Bank digital services featuring smooth scroll-based animations and CMS integration.",
                        githubUrl: null,
                        demoUrl: null,
                        technologies: ["Next.js", "Tailwind CSS", "GSAP", "Sanity CMS", "TypeScript"],
                        domains: ["FinTech", "Corporate Banking", "Marketing"],
                        keywords: ["Landing Page", "GSAP Animations", "Headless CMS", "Sanity", "SEO"],
                        responsibilities: [
                            "Developed responsive landing pages using Next.js and Tailwind CSS.",
                            "Implemented high-performance interactive animations using GSAP.",
                            "Integrated Sanity CMS for dynamic marketing updates.",
                        ],
                        achievements: ["Enhanced user engagement and conversion with fluid micro-interactions"],
                        displayOrder: 1,
                    },
                    {
                        name: "Choice Microfinance Mobile App",
                        role: "Mobile App Developer",
                        description: "Mobile financial services application providing customers with seamless digital banking, account management, transactions, and real-time financial tracking.",
                        githubUrl: null,
                        demoUrl: null,
                        technologies: ["React Native", "TypeScript", "TanStack Query", "Zustand", "Tailwind CSS"],
                        domains: ["Microfinance", "FinTech", "Mobile Banking"],
                        keywords: ["React Native", "State Management", "Transactions", "Account Management", "Mobile UX"],
                        responsibilities: [
                            "Developed cross-platform mobile app using React Native and TypeScript.",
                            "Implemented server-state management with TanStack Query and lightweight global store with Zustand.",
                            "Designed secure authentication flows and transaction confirmation modals.",
                        ],
                        achievements: ["Delivered smooth digital banking experience for thousands of microfinance users"],
                        displayOrder: 2,
                    },
                    {
                        name: "Ethiopost Agency Banking",
                        role: "Mobile App Developer",
                        description: "Mobile app for EthioPost agents delivering financial inclusion in remote and rural areas with cash-in, cash-out, balance inquiry, and offline-resilient UX.",
                        githubUrl: null,
                        demoUrl: null,
                        technologies: ["React Native", "TypeScript", "Offline Storage", "PIN Security", "REST APIs"],
                        domains: ["Agency Banking", "Postal Services", "Financial Inclusion", "FinTech"],
                        keywords: ["Agent Banking", "Low-Connectivity", "OTP Verification", "Cash In/Out", "Rural Banking"],
                        responsibilities: [
                            "Built cross-platform agent banking application for remote field agents.",
                            "Implemented cash-in, cash-out, balance inquiry, and OTP authentication.",
                            "Optimized UI for low-connectivity environments and field use.",
                        ],
                        achievements: ["Enabled financial access for underserved communities across Ethiopia"],
                        displayOrder: 3,
                    },
                    {
                        name: "Connect Ethiopia – CBE Remittance System",
                        role: "Frontend Engineer",
                        description: "International remittance platform for Commercial Bank of Ethiopia (CBE) enabling diaspora money transfers, beneficiary management, and transaction status tracking.",
                        githubUrl: null,
                        demoUrl: null,
                        technologies: ["React.js", "TypeScript", "Tailwind CSS", "RESTful APIs", "Axios"],
                        domains: ["International Remittance", "Commercial Banking", "FinTech"],
                        keywords: ["CBE", "Cross-Border Payments", "Remittance", "Transaction Tracking", "Beneficiary System"],
                        responsibilities: [
                            "Built frontend modules for diaspora-to-Ethiopia remittance flow.",
                            "Integrated secure backend APIs for live transaction tracking and beneficiary management.",
                        ],
                        achievements: ["Successfully deployed remittance portal for Ethiopia's largest commercial bank"],
                        displayOrder: 4,
                    },
                    {
                        name: "Eaglelion Corporate Platform",
                        role: "Frontend Engineer",
                        description: "Modern corporate landing page showcasing Eaglelion Systems Technology's services with GSAP scroll animations and scalable UI design system.",
                        githubUrl: null,
                        demoUrl: null,
                        technologies: ["Next.js", "Tailwind CSS", "GSAP", "TypeScript"],
                        domains: ["Corporate Web", "Software Agency", "Creative Tech"],
                        keywords: ["Design System", "GSAP ScrollTrigger", "Performance Optimization"],
                        responsibilities: [
                            "Engineered responsive corporate website with reusable component architecture.",
                            "Created scroll-driven interactive showcases.",
                        ],
                        achievements: ["Significantly boosted brand perception and client inquiries"],
                        displayOrder: 5,
                    },
                    {
                        name: "Hageregna Equb & Abronet Equb",
                        role: "Full-Stack Developer",
                        description: "Rotating savings group platforms (Equb) with tier-based contribution management, cycle-based payout automation, and member transparency.",
                        githubUrl: null,
                        demoUrl: null,
                        technologies: ["Prisma", "PostgreSQL", "MongoDB", "Node.js", "Express", "React.js"],
                        domains: ["FinTech", "Community Savings", "Social Finance"],
                        keywords: ["Equb", "Rotating Credit", "Automated Payouts", "Prisma ORM"],
                        responsibilities: [
                            "Designed relational database models in PostgreSQL using Prisma ORM.",
                            "Implemented payout cycle algorithms and contribution verification.",
                        ],
                        achievements: ["Digitized traditional community finance with automated trust verification"],
                        displayOrder: 6,
                    },
                ],
            },
            skills: {
                create: [
                    // Languages & Core
                    { name: "TypeScript", category: "Languages", proficiency: "EXPERT", yearsOfExp: 3, confirmed: true },
                    { name: "JavaScript (ES6+)", category: "Languages", proficiency: "EXPERT", yearsOfExp: 4, confirmed: true },
                    { name: "HTML5 / CSS3", category: "Languages", proficiency: "EXPERT", yearsOfExp: 4, confirmed: true },
                    { name: "SQL", category: "Languages", proficiency: "ADVANCED", yearsOfExp: 3, confirmed: true },
                    // Frontend
                    { name: "React.js", category: "Frontend", proficiency: "EXPERT", yearsOfExp: 4, confirmed: true },
                    { name: "Next.js (App Router)", category: "Frontend", proficiency: "EXPERT", yearsOfExp: 3, confirmed: true },
                    { name: "React Native", category: "Frontend", proficiency: "ADVANCED", yearsOfExp: 2, confirmed: true },
                    { name: "Tailwind CSS", category: "Frontend", proficiency: "EXPERT", yearsOfExp: 3, confirmed: true },
                    { name: "GSAP Animations", category: "Frontend", proficiency: "ADVANCED", yearsOfExp: 2, confirmed: true },
                    { name: "TanStack Query", category: "Frontend", proficiency: "EXPERT", yearsOfExp: 2, confirmed: true },
                    { name: "Zustand", category: "Frontend", proficiency: "EXPERT", yearsOfExp: 2, confirmed: true },
                    // Backend
                    { name: "Node.js", category: "Backend", proficiency: "EXPERT", yearsOfExp: 3, confirmed: true },
                    { name: "Express.js", category: "Backend", proficiency: "EXPERT", yearsOfExp: 3, confirmed: true },
                    { name: "RESTful API Design", category: "Backend", proficiency: "EXPERT", yearsOfExp: 3, confirmed: true },
                    { name: "Prisma ORM", category: "Backend", proficiency: "ADVANCED", yearsOfExp: 2, confirmed: true },
                    // Databases
                    { name: "PostgreSQL", category: "Database", proficiency: "ADVANCED", yearsOfExp: 3, confirmed: true },
                    { name: "MongoDB", category: "Database", proficiency: "EXPERT", yearsOfExp: 3, confirmed: true },
                    { name: "MySQL", category: "Database", proficiency: "INTERMEDIATE", yearsOfExp: 2, confirmed: true },
                    // DevOps & Tools
                    { name: "Git & GitHub", category: "Tools", proficiency: "EXPERT", yearsOfExp: 4, confirmed: true },
                    { name: "Docker", category: "Tools", proficiency: "INTERMEDIATE", yearsOfExp: 2, confirmed: true },
                    { name: "CI/CD Pipelines", category: "Tools", proficiency: "INTERMEDIATE", yearsOfExp: 2, confirmed: true },
                    { name: "Sanity CMS", category: "Tools", proficiency: "ADVANCED", yearsOfExp: 2, confirmed: true },
                    { name: "Turborepo", category: "Tools", proficiency: "ADVANCED", yearsOfExp: 2, confirmed: true },
                ],
            },
            educations: {
                create: [
                    {
                        institution: "Addis Ababa Science and Technology University",
                        degree: "Bachelor of Science",
                        field: "Electrical and Computer Engineering",
                        startDate: new Date("2018-09-01"),
                        endDate: new Date("2023-07-01"),
                        gpa: "Very Good Achiever",
                        description: "Awarded Very Good Achiever for academic excellence. Focused on software engineering, computer architectures, and data structures.",
                    },
                    {
                        institution: "Evangadi Tech",
                        degree: "Certificate of Completion",
                        field: "MERN Fullstack Website Development",
                        startDate: new Date("2023-02-01"),
                        endDate: new Date("2023-07-01"),
                        gpa: null,
                        description: "Intensive fullstack engineering program in MongoDB, Express, React, and Node.js.",
                    },
                ],
            },
            achievements: {
                create: [
                    {
                        title: "Recognition Certificate – Dashen SuperApp Project",
                        description: "Awarded for outstanding technical contribution to the Dashen SuperApp Boch Boch Portal.",
                        date: new Date("2025-11-01"),
                    },
                    {
                        title: "Quarterly Highest Achiever Award – Ashewa Technology Solution",
                        description: "Awarded for exceptional performance, delivering high availability MERN web applications and reducing CI/CD deployment times by 25%.",
                        date: new Date("2025-01-15"),
                    },
                ],
            },
        },
    });
    console.log("✅ Successfully seeded Bekalu's full career knowledge base! Candidate ID:", candidate.id);
    await prisma_js_1.default.$disconnect();
}
main().catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
});
//# sourceMappingURL=seed-profile.js.map