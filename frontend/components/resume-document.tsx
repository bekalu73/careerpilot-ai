"use client";

import React, { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { Candidate, Experience, Education } from "@/lib/api";

export interface ResumeData {
  name?: string;
  subtitle?: string;
  contactInfo?: {
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    portfolioUrl?: string | null;
  };
  professionalSummary?: string;
  orderedSkills?: Array<{ category: string; skills: string[] }>;
  tailoredExperiences?: Array<{
    experienceId?: string;
    company: string;
    jobTitle: string;
    location?: string | null;
    dateRange?: string | null;
    orderedBullets: string[];
    emphasizedTechnologies?: string[];
  }>;
  tailoredProjects?: Array<{
    projectId?: string;
    name: string;
    description?: string | null;
    orderedBullets: string[];
  }>;
  educations?: Array<{
    institution: string;
    degree: string;
    field?: string | null;
    location?: string | null;
    dateRange?: string | null;
    bullets: string[];
  }>;
  certifications?: string[];
}

function formatDate(d?: string | Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d).replace(/[—–]/g, "-");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function cleanText(str?: string | null): string {
  if (!str) return "";
  return str.replace(/[—–]/g, "-");
}

function formatExperienceDateRange(exp: Partial<Experience>): string {
  const start = formatDate(exp.startDate);
  const end = exp.isCurrent ? "Present" : formatDate(exp.endDate);
  if (!start && !end) return "";
  if (!end) return start;
  return `${start} - ${end}`;
}

function formatEducationDateRange(edu: Partial<Education>): string {
  const start = formatDate(edu.startDate);
  const end = formatDate(edu.endDate);
  if (!start && !end) return "";
  if (!end) return start;
  return `${start} - ${end}`;
}

interface ResumeDocumentProps {
  content: string | ResumeData;
  candidate?: Candidate | null;
  jobTitle?: string;
  onEdit?: () => void;
}

export function ResumeDocument({
  content,
  candidate,
  jobTitle,
  onEdit,
}: ResumeDocumentProps) {
  const resumeContainerRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse resume content
  let parsedResume: ResumeData = {};
  if (typeof content === "string") {
    try {
      parsedResume = JSON.parse(content);
    } catch {
      parsedResume = { professionalSummary: content };
    }
  } else if (content && typeof content === "object") {
    parsedResume = content;
  }

  // Merged Header Data
  const name = cleanText(
    parsedResume.name ||
    candidate?.name ||
    "Bekalu Sisay Iticha"
  );

  const subtitle = cleanText(
    parsedResume.subtitle ||
    (jobTitle
      ? `${jobTitle} Specialist | Full Stack & AI Engineer`
      : "Full Stack & AI Engineer | MERN, RAG Systems, Generative AI & ML")
  );

  const email = cleanText(
    parsedResume.contactInfo?.email ||
    candidate?.email ||
    "bekalusisay2010@gmail.com"
  );

  const phone = cleanText(
    parsedResume.contactInfo?.phone ||
    candidate?.phone ||
    "+251 946931271"
  );

  const location = cleanText(
    parsedResume.contactInfo?.location ||
    candidate?.location ||
    "Addis Ababa, Ethiopia"
  );

  const portfolioUrl = cleanText(
    parsedResume.contactInfo?.portfolioUrl ||
    candidate?.portfolioUrl ||
    "https://bekalu-sisay.vercel.app/"
  );

  const portfolioDisplay = portfolioUrl
    ? portfolioUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
    : "bekalu-sisay.vercel.app";

  const linkedinUrl = cleanText(
    parsedResume.contactInfo?.linkedinUrl ||
    candidate?.linkedinUrl ||
    "https://linkedin.com/in/bekalusisay"
  );

  const linkedinDisplay = linkedinUrl
    ? linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")
    : "linkedin.com/in/bekalusisay";

  // Summary
  const professionalSummary = cleanText(
    parsedResume.professionalSummary ||
    candidate?.professionalSummary ||
    "Full Stack and AI Engineer with expertise in building scalable web applications and intelligent AI solutions using RAG systems, Generative AI, AI chatbots, and ML engineering alongside MongoDB, Express, React, and Node.js. Skilled in PostgreSQL, Python, and Next.js, with a proven track record of delivering high-performance architectures and innovative user experiences."
  );

  // Experiences
  const experiences = (
    parsedResume.tailoredExperiences && parsedResume.tailoredExperiences.length > 0
      ? parsedResume.tailoredExperiences.map((tailoredExp) => {
          const match = candidate?.experiences?.find(
            (e) =>
              (tailoredExp.experienceId && e.id === tailoredExp.experienceId) ||
              e.company.toLowerCase() === tailoredExp.company.toLowerCase() ||
              e.jobTitle.toLowerCase() === tailoredExp.jobTitle.toLowerCase()
          );
          return {
            company: cleanText(tailoredExp.company || match?.company || "Company"),
            jobTitle: cleanText(tailoredExp.jobTitle || match?.jobTitle || "Role"),
            location: cleanText(tailoredExp.location || match?.location || "Addis Ababa, Ethiopia"),
            dateRange: cleanText(
              tailoredExp.dateRange ||
              (match ? formatExperienceDateRange(match) : "Feb 2026 - Present")
            ),
            bullets: (
              tailoredExp.orderedBullets && tailoredExp.orderedBullets.length > 0
                ? tailoredExp.orderedBullets
                : match?.responsibilities || []
            ).map(cleanText),
          };
        })
      : (candidate?.experiences || []).map((exp) => ({
          company: cleanText(exp.company),
          jobTitle: cleanText(exp.jobTitle),
          location: cleanText(exp.location || "Addis Ababa, Ethiopia"),
          dateRange: cleanText(formatExperienceDateRange(exp)),
          bullets: (
            exp.responsibilities && exp.responsibilities.length > 0
              ? exp.responsibilities
              : exp.achievements || []
          ).map(cleanText),
        }))
  );

  // Projects
  const projects = (
    parsedResume.tailoredProjects && parsedResume.tailoredProjects.length > 0
      ? parsedResume.tailoredProjects.map((tailoredProj) => {
          const match = candidate?.projects?.find(
            (p) =>
              (tailoredProj.projectId && p.id === tailoredProj.projectId) ||
              p.name.toLowerCase().includes(tailoredProj.name.toLowerCase()) ||
              tailoredProj.name.toLowerCase().includes(p.name.toLowerCase())
          );
          return {
            name: cleanText(tailoredProj.name),
            description: cleanText(tailoredProj.description || match?.description || ""),
            bullets: (
              tailoredProj.orderedBullets && tailoredProj.orderedBullets.length > 0
                ? tailoredProj.orderedBullets
                : match?.responsibilities && match.responsibilities.length > 0
                ? match.responsibilities
                : match?.technologies?.length
                ? [`Built using ${match.technologies.join(", ")}.`]
                : []
            ).map(cleanText),
          };
        })
      : (candidate?.projects || []).slice(0, 5).map((proj) => ({
          name: cleanText(proj.name),
          description: cleanText(proj.description || ""),
          bullets: (
            proj.responsibilities && proj.responsibilities.length > 0
              ? proj.responsibilities
              : proj.technologies && proj.technologies.length > 0
              ? [`Built with ${proj.technologies.join(", ")}.`]
              : []
          ).map(cleanText),
        }))
  );

  // Education
  const educations = (
    parsedResume.educations && parsedResume.educations.length > 0
      ? parsedResume.educations.map((edu) => ({
          institution: cleanText(edu.institution),
          degree: cleanText(edu.field ? `${edu.degree}, ${edu.field}` : edu.degree || "Degree"),
          location: cleanText(edu.location || "Addis Ababa, Ethiopia"),
          dateRange: cleanText(edu.dateRange || ""),
          bullets: (edu.bullets || []).map(cleanText),
        }))
      : (candidate?.educations || []).map((edu) => ({
          institution: cleanText(edu.institution),
          degree: cleanText(edu.field ? `${edu.degree}, ${edu.field}` : edu.degree || "Degree"),
          location: "Addis Ababa, Ethiopia",
          dateRange: cleanText(formatEducationDateRange(edu)),
          bullets: edu.description
            ? [cleanText(edu.description)]
            : edu.gpa
            ? [`Awarded ${edu.gpa} for academic excellence.`]
            : [],
        }))
  );

  // Skills
  const skillsCategories = (
    parsedResume.orderedSkills && parsedResume.orderedSkills.length > 0
      ? parsedResume.orderedSkills.map((cat) => ({
          category: cleanText(cat.category),
          skills: cat.skills.map(cleanText),
        }))
      : [
          {
            category: "AI/ML & Generative AI",
            skills: ["RAG Systems", "Generative AI", "AI Chatbots", "ML Engineering", "LLM Integration", "Prompt Engineering"],
          },
          {
            category: "Languages/Frameworks",
            skills: ["JavaScript", "TypeScript", "Python", "React", "Next.js", "Node.js", "Express"],
          },
          {
            category: "Databases",
            skills: ["MongoDB", "PostgreSQL", "MySQL", "Vector DBs"],
          },
          {
            category: "Tools",
            skills: ["Git", "Docker", "CI/CD", "Webpack", "Prisma"],
          },
          {
            category: "Other",
            skills: ["RESTful APIs", "Agile Methodologies", "System Architecture", "Performance Optimization"],
          },
        ]
  );

  // Certifications
  const certifications = (
    parsedResume.certifications && parsedResume.certifications.length > 0
      ? parsedResume.certifications.map(cleanText)
      : [
          "Recognition Certificate - Dashen SuperApp Project, for outstanding contribution to the Boch Boch Portal.",
          "Quarterly Highest Achiever Award - Ashewa Technology Solution, awarded for exceptional performance and impact.",
        ]
  );

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);

    try {
      const doc = new jsPDF({
        unit: "pt",
        format: "letter",
        orientation: "portrait",
      });

      const pageWidth = 612;
      const pageHeight = 792;
      const margin = 38;
      const rightMargin = pageWidth - margin;
      const contentWidth = pageWidth - margin * 2;
      const bottomThreshold = pageHeight - margin;

      let y = 42;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > bottomThreshold) {
          doc.addPage();
          y = 42;
        }
      };

      // Header - Name
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(name.toUpperCase(), pageWidth / 2, y, { align: "center" });
      y += 16;

      // Subtitle
      if (subtitle) {
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.text(subtitle, pageWidth / 2, y, { align: "center" });
        y += 14;
      }

      // Contact Line 1: Email | Phone | Portfolio | LinkedIn
      const contactParts: string[] = [];
      if (email) contactParts.push(email);
      if (phone) contactParts.push(phone);
      if (portfolioUrl) {
        contactParts.push(portfolioDisplay);
      }
      if (linkedinUrl) {
        contactParts.push(linkedinDisplay);
      }

      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      doc.text(contactParts.join("  |  "), pageWidth / 2, y, { align: "center" });
      y += 12;

      if (location) {
        doc.text(location, pageWidth / 2, y, { align: "center" });
        y += 14;
      }

      const renderSectionHeader = (title: string) => {
        checkPageBreak(30);
        y += 4;
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, y);
        y += 4;
        doc.setDrawColor(90, 90, 90);
        doc.setLineWidth(0.6);
        doc.line(margin, y, rightMargin, y);
        y += 10;
      };

      // 1. Professional Summary
      if (professionalSummary) {
        renderSectionHeader("Professional Summary");
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(professionalSummary, contentWidth);
        checkPageBreak(summaryLines.length * 12 + 6);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 12 + 6;
      }

      // 2. Work Experience
      if (experiences && experiences.length > 0) {
        renderSectionHeader("Work Experience");

        for (const exp of experiences) {
          checkPageBreak(35);

          // Job Title (left bold) & Company (right bold)
          doc.setFont("times", "bold");
          doc.setFontSize(10.5);
          doc.text(exp.jobTitle, margin, y);
          doc.text(exp.company, rightMargin, y, { align: "right" });
          y += 12;

          // Date Range (left italic) & Location (right italic)
          doc.setFont("times", "italic");
          doc.setFontSize(9.5);
          doc.setTextColor(70, 70, 70);
          doc.text(exp.dateRange, margin, y);
          doc.text(exp.location, rightMargin, y, { align: "right" });
          doc.setTextColor(0, 0, 0);
          y += 10;

          // Bullets
          if (exp.bullets && exp.bullets.length > 0) {
            doc.setFont("times", "normal");
            doc.setFontSize(9.5);
            for (const bullet of exp.bullets) {
              const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
              checkPageBreak(bulletLines.length * 11.5 + 3);
              doc.text("•", margin + 4, y);
              doc.text(bulletLines, margin + 14, y);
              y += bulletLines.length * 11.5 + 3;
            }
          }
          y += 4;
        }
      }

      // 3. Projects
      if (projects && projects.length > 0) {
        renderSectionHeader("Projects");

        for (const proj of projects) {
          checkPageBreak(30);

          doc.setFont("times", "bold");
          doc.setFontSize(10.5);
          doc.text(proj.name, margin, y);
          y += 12;

          if (proj.description) {
            doc.setFont("times", "normal");
            doc.setFontSize(9.5);
            const descLines = doc.splitTextToSize(proj.description, contentWidth);
            checkPageBreak(descLines.length * 11.5 + 3);
            doc.text(descLines, margin, y);
            y += descLines.length * 11.5 + 3;
          }

          if (proj.bullets && proj.bullets.length > 0) {
            doc.setFont("times", "normal");
            doc.setFontSize(9.5);
            for (const bullet of proj.bullets) {
              const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
              checkPageBreak(bulletLines.length * 11.5 + 3);
              doc.text("•", margin + 4, y);
              doc.text(bulletLines, margin + 14, y);
              y += bulletLines.length * 11.5 + 3;
            }
          }
          y += 4;
        }
      }

      // 4. Education
      if (educations && educations.length > 0) {
        renderSectionHeader("Education");

        for (const edu of educations) {
          checkPageBreak(30);

          doc.setFont("times", "bold");
          doc.setFontSize(10.5);
          doc.text(edu.degree, margin, y);
          doc.text(edu.institution, rightMargin, y, { align: "right" });
          y += 12;

          doc.setFont("times", "italic");
          doc.setFontSize(9.5);
          doc.setTextColor(70, 70, 70);
          if (edu.dateRange) doc.text(edu.dateRange, margin, y);
          if (edu.location) doc.text(edu.location, rightMargin, y, { align: "right" });
          doc.setTextColor(0, 0, 0);
          y += 10;

          if (edu.bullets && edu.bullets.length > 0) {
            doc.setFont("times", "normal");
            doc.setFontSize(9.5);
            for (const bullet of edu.bullets) {
              const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
              checkPageBreak(bulletLines.length * 11.5 + 3);
              doc.text("•", margin + 4, y);
              doc.text(bulletLines, margin + 14, y);
              y += bulletLines.length * 11.5 + 3;
            }
          }
          y += 4;
        }
      }

      // 5. Technical Skills
      if (skillsCategories && skillsCategories.length > 0) {
        renderSectionHeader("Technical Skills");

        for (const row of skillsCategories) {
          const categoryLabel = row.category.endsWith(":") ? row.category : `${row.category}:`;
          const skillsText = Array.isArray(row.skills) ? row.skills.join(", ") : String(row.skills);

          doc.setFont("times", "bold");
          doc.setFontSize(9.5);
          const catWidth = 145;

          doc.setFont("times", "normal");
          const textLines = doc.splitTextToSize(skillsText, contentWidth - catWidth);

          checkPageBreak(textLines.length * 12 + 4);

          doc.setFont("times", "bold");
          doc.text(categoryLabel, margin, y);

          doc.setFont("times", "normal");
          doc.text(textLines, margin + catWidth, y);

          y += Math.max(14, textLines.length * 12 + 4);
        }
      }

      // 6. Certifications & Recognition
      if (certifications && certifications.length > 0) {
        renderSectionHeader("Certifications & Recognition");

        doc.setFont("times", "normal");
        doc.setFontSize(9.5);
        for (const cert of certifications) {
          const certLines = doc.splitTextToSize(cert, contentWidth - 14);
          checkPageBreak(certLines.length * 11.5 + 3);
          doc.text("•", margin + 4, y);
          doc.text(certLines, margin + 14, y);
          y += certLines.length * 11.5 + 3;
        }
      }

      const safeFilename = `${name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Resume.pdf`;
      doc.save(safeFilename);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (!resumeContainerRef.current) return;
    const safeFilename = `${name.replace(/\s+/g, "_")}_Resume`;
    const resumeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Resume</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Times New Roman", Times, serif; line-height: 1.4; color: #000; background-color: #f3f4f6; padding: 24px 12px; }
    .no-print { margin: 0 auto 16px auto; max-width: 8.5in; display: flex; justify-content: flex-end; gap: 10px; }
    .action-btn {
      background: #000000;
      color: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.4);
      padding: 9px 20px;
      font-family: "Times New Roman", Times, serif;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s ease;
    }
    .action-btn:hover { background: #333333; }
    .action-btn-secondary {
      background: #ffffff;
      color: #000000;
    }
    .action-btn-secondary:hover { background: #e5e5e5; }
    .resume-container { max-width: 8.5in; margin: 0 auto; background: white; padding: 0.75in; box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
    h1 { font-size: 20pt; text-align: center; margin-bottom: 5px; font-weight: bold; text-transform: uppercase; }
    .subtitle { text-align: center; font-size: 12pt; margin-bottom: 15px; }
    .contact-info { text-align: center; font-size: 11pt; margin-bottom: 20px; }
    a { color: #000; text-decoration: none; }
    h2 { font-size: 14pt; margin: 20px 0 12px 0; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.4); font-weight: bold; text-transform: capitalize; }
    h3 { font-size: 12pt; margin: 0; font-weight: bold; }
    p { margin: 6px 0; font-size: 11pt; }
    ul { list-style-type: disc; margin: 8px 0 8px 20px; }
    li { margin-bottom: 6px; font-size: 11pt; }
    .job, .project, .education { margin-bottom: 18px; page-break-inside: avoid; }
    .job-header, .education-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .job-title-container, .education-title-container { flex: 2; }
    .job-info-container, .education-info-container { flex: 1; text-align: right; }
    .company, .institution { font-weight: bold; margin-bottom: 2px; }
    .date, .location { font-style: italic; color: #666; font-weight: normal; margin: 0; }
    .skill-row { margin-bottom: 10px; display: flex; }
    .skill-label { font-weight: bold; width: 200px; flex-shrink: 0; }
    .skill-items { flex: 1; }
    @media print {
      body { background: white; padding: 0; }
      .no-print { display: none !important; }
      .resume-container { box-shadow: none; padding: 0.5in; max-width: 100%; width: 100%; }
      .job, .project, .education { page-break-inside: avoid; }
      h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="action-btn" id="downloadPdfBtn">Download PDF</button>
    <button class="action-btn action-btn-secondary" onclick="window.print()">Print</button>
  </div>
  <div class="resume-container" id="resumeRoot">
    ${resumeContainerRef.current.innerHTML}
  </div>
  <script>
    document.getElementById("downloadPdfBtn")?.addEventListener("click", function () {
      const element = document.getElementById("resumeRoot");
      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: "${safeFilename}.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait", compress: true },
        pagebreak: { mode: ["css", "legacy"], avoid: ".job, .project, .education" }
      };
      if (typeof html2pdf !== "undefined") {
        html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([resumeHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleCopyText = async () => {
    if (!resumeContainerRef.current) return;
    const text = resumeContainerRef.current.innerText;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 border border-border/60 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Downloading PDF...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Download Resume (PDF)
              </>
            )}
          </button>

          <button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/70 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in New Tab
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/70 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Text
              </>
            )}
          </button>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-primary hover:underline font-medium"
          >
            Edit raw content
          </button>
        )}
      </div>

      {/* Embedded Resume Container - Styled Exactly as resume.html */}
      <div className="bg-[#f0f2f5] dark:bg-[#121418] p-4 sm:p-8 rounded-2xl overflow-x-auto flex justify-center border border-border/40 shadow-inner">
        <div
          ref={resumeContainerRef}
          className="resume-page-document"
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            lineHeight: 1.4,
            color: "#000000",
            backgroundColor: "#ffffff",
            width: "100%",
            maxWidth: "8.5in",
            minHeight: "11in",
            padding: "0.75in",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            boxSizing: "border-box",
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <h1
            style={{
              fontSize: "20pt",
              textAlign: "center",
              marginBottom: "5px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#000000",
            }}
          >
            {name}
          </h1>

          <p
            style={{
              textAlign: "center",
              fontSize: "12pt",
              marginBottom: "15px",
              color: "#000000",
              fontWeight: "500",
            }}
          >
            {subtitle}
          </p>

          <p
            style={{
              textAlign: "center",
              fontSize: "11pt",
              marginBottom: "20px",
              color: "#000000",
              lineHeight: 1.5,
            }}
          >
            {email && <span>{email}</span>}
            {phone && <span> | {phone}</span>}
            {portfolioUrl && (
              <span>
                {" "}
                |{" "}
                <a
                  href={portfolioUrl.startsWith("http") ? portfolioUrl : `https://${portfolioUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#000000", textDecoration: "none" }}
                >
                  {portfolioDisplay}
                </a>
              </span>
            )}
            {linkedinUrl && (
              <span>
                {" "}
                |{" "}
                <a
                  href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#000000", textDecoration: "none" }}
                >
                  {linkedinDisplay}
                </a>
              </span>
            )}
            {location && (
              <>
                <br />
                <span>{location}</span>
              </>
            )}
          </p>

          {/* Professional Summary */}
          {professionalSummary && (
            <div className="pdf-section" style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "14pt",
                  margin: "20px 0 12px 0",
                  paddingBottom: "5px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.4)",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  color: "#000000",
                }}
              >
                Professional Summary
              </h2>
              <p
                style={{
                  margin: "6px 0",
                  fontSize: "11pt",
                  color: "#000000",
                  textAlign: "justify",
                }}
              >
                {professionalSummary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {experiences && experiences.length > 0 && (
            <div className="pdf-section" style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "14pt",
                  margin: "20px 0 12px 0",
                  paddingBottom: "5px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.4)",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  color: "#000000",
                }}
              >
                Work Experience
              </h2>

              {experiences.map((job, idx) => (
                <div
                  key={idx}
                  className="job pdf-no-break"
                  style={{ marginBottom: "18px", pageBreakInside: "avoid" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ flex: "2" }}>
                      <h3
                        style={{
                          fontSize: "12pt",
                          margin: 0,
                          fontWeight: "bold",
                          color: "#000000",
                        }}
                      >
                        {job.jobTitle}
                      </h3>
                      <p
                        style={{
                          fontStyle: "italic",
                          color: "#666666",
                          fontWeight: "normal",
                          margin: "2px 0 0 0",
                          fontSize: "11pt",
                        }}
                      >
                        {job.dateRange}
                      </p>
                    </div>
                    <div style={{ flex: "1", textAlign: "right" }}>
                      <p
                        style={{
                          fontWeight: "bold",
                          marginBottom: "2px",
                          fontSize: "11pt",
                          color: "#000000",
                        }}
                      >
                        {job.company}
                      </p>
                      <p
                        style={{
                          fontStyle: "italic",
                          color: "#666666",
                          fontWeight: "normal",
                          margin: 0,
                          fontSize: "11pt",
                        }}
                      >
                        {job.location}
                      </p>
                    </div>
                  </div>

                  {job.bullets && job.bullets.length > 0 && (
                    <ul
                      style={{
                        listStyleType: "disc",
                        margin: "8px 0 8px 20px",
                        paddingLeft: 0,
                      }}
                    >
                      {job.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          style={{
                            marginBottom: "6px",
                            fontSize: "11pt",
                            color: "#000000",
                            lineHeight: 1.35,
                          }}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="pdf-section" style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "14pt",
                  margin: "20px 0 12px 0",
                  paddingBottom: "5px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.4)",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  color: "#000000",
                }}
              >
                Projects
              </h2>

              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="project pdf-no-break"
                  style={{ marginBottom: "18px", pageBreakInside: "avoid" }}
                >
                  <div style={{ marginBottom: "6px" }}>
                    <h3
                      style={{
                        fontSize: "12pt",
                        margin: 0,
                        fontWeight: "bold",
                        color: "#000000",
                      }}
                    >
                      {proj.name}
                    </h3>
                  </div>

                  {proj.description && (
                    <p
                      style={{
                        margin: "6px 0",
                        fontSize: "11pt",
                        color: "#000000",
                      }}
                    >
                      {proj.description}
                    </p>
                  )}

                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul
                      style={{
                        listStyleType: "disc",
                        margin: "8px 0 8px 20px",
                        paddingLeft: 0,
                      }}
                    >
                      {proj.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          style={{
                            marginBottom: "6px",
                            fontSize: "11pt",
                            color: "#000000",
                            lineHeight: 1.35,
                          }}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {educations && educations.length > 0 && (
            <div className="pdf-section" style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "14pt",
                  margin: "20px 0 12px 0",
                  paddingBottom: "5px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.4)",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  color: "#000000",
                }}
              >
                Education
              </h2>

              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="education pdf-no-break"
                  style={{ marginBottom: "18px", pageBreakInside: "avoid" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ flex: "2" }}>
                      <h3
                        style={{
                          fontSize: "12pt",
                          margin: 0,
                          fontWeight: "bold",
                          color: "#000000",
                        }}
                      >
                        {edu.degree}
                      </h3>
                      <p
                        style={{
                          fontStyle: "italic",
                          color: "#666666",
                          fontWeight: "normal",
                          margin: "2px 0 0 0",
                          fontSize: "11pt",
                        }}
                      >
                        {edu.dateRange}
                      </p>
                    </div>
                    <div style={{ flex: "1", textAlign: "right" }}>
                      <p
                        style={{
                          fontWeight: "bold",
                          marginBottom: "2px",
                          fontSize: "11pt",
                          color: "#000000",
                        }}
                      >
                        {edu.institution}
                      </p>
                      {edu.location && (
                        <p
                          style={{
                            fontStyle: "italic",
                            color: "#666666",
                            fontWeight: "normal",
                            margin: 0,
                            fontSize: "11pt",
                          }}
                        >
                          {edu.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {edu.bullets && edu.bullets.length > 0 && (
                    <ul
                      style={{
                        listStyleType: "disc",
                        margin: "8px 0 8px 20px",
                        paddingLeft: 0,
                      }}
                    >
                      {edu.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          style={{
                            marginBottom: "6px",
                            fontSize: "11pt",
                            color: "#000000",
                            lineHeight: 1.35,
                          }}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Technical Skills */}
          {skillsCategories && skillsCategories.length > 0 && (
            <div className="pdf-section" style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "14pt",
                  margin: "20px 0 12px 0",
                  paddingBottom: "5px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.4)",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  color: "#000000",
                }}
              >
                Technical Skills
              </h2>
              <div style={{ margin: "10px 0" }}>
                {skillsCategories.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      flexWrap: "wrap",
                      fontSize: "11pt",
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        width: "200px",
                        flexShrink: 0,
                        color: "#000000",
                      }}
                    >
                      {row.category.endsWith(":") ? row.category : `${row.category}:`}
                    </span>
                    <span style={{ flex: "1", color: "#000000" }}>
                      {Array.isArray(row.skills) ? row.skills.join(", ") : String(row.skills)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Recognition */}
          {certifications && certifications.length > 0 && (
            <div className="pdf-section" style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "14pt",
                  margin: "20px 0 12px 0",
                  paddingBottom: "5px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.4)",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                  color: "#000000",
                }}
              >
                Certifications & Recognition
              </h2>
              <ul
                style={{
                  listStyleType: "disc",
                  margin: "8px 0 8px 20px",
                  paddingLeft: 0,
                }}
              >
                {certifications.map((cert, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: "6px",
                      fontSize: "11pt",
                      color: "#000000",
                      lineHeight: 1.35,
                    }}
                  >
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
