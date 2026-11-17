import { extractText } from 'unpdf';
import { ATSScoreBreakdown, Stage1Result } from './types';

// Curated list of 400+ tech skills, frameworks, concepts for engineering grads
export const TECH_SKILL_DICTIONARY: string[] = [
  // Programming Languages
  'python', 'javascript', 'typescript', 'java', 'c++', 'c', 'c#', 'go', 'golang', 'rust',
  'kotlin', 'swift', 'sql', 'r', 'php', 'ruby', 'dart', 'scala', 'matlab', 'bash', 'shell',
  'html', 'css', 'sass', 'scss',
  // Frontend
  'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'angular', 'vue', 'vue.js', 'svelte',
  'tailwind', 'tailwind css', 'bootstrap', 'material ui', 'shadcn', 'redux', 'zustand',
  'webpack', 'vite', 'html5', 'css3', 'responsive design', 'web vitals',
  // Backend & APIs
  'node.js', 'nodejs', 'express', 'express.js', 'fastapi', 'flask', 'django', 'spring boot',
  'spring', 'nest.js', 'nestjs', 'rest', 'rest api', 'restful api', 'graphql', 'grpc',
  'microservices', 'websocket', 'websockets', 'jwt', 'oauth', 'middleware', 'serverless',
  // Databases & Storage
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'cassandra', 'dynamodb',
  'firebase', 'supabase', 'neon', 'prisma', 'typeorm', 'mongoose', 'elasticsearch', 's3',
  'blob storage', 'acid', 'indexing', 'database normalization',
  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'docker container',
  'kubernetes', 'k8s', 'ci/cd', 'github actions', 'jenkins', 'gitlab', 'git', 'github',
  'linux', 'ubuntu', 'nginx', 'terraform', 'cloud computing', 'vercel', 'netlify',
  // Computer Science Core
  'data structures', 'algorithms', 'dsa', 'object oriented programming', 'oop', 'oops',
  'system design', 'operating systems', 'dbms', 'computer networks', 'distributed systems',
  'multithreading', 'concurrency', 'unit testing', 'integration testing', 'jest', 'pytest',
  'mocha', 'junit', 'test driven development', 'tdd', 'agile', 'scrum', 'jira',
  // AI / ML / Data
  'machine learning', 'deep learning', 'artificial intelligence', 'nlp', 'natural language processing',
  'computer vision', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'opencv',
  'huggingface', 'llm', 'generative ai', 'prompt engineering', 'langchain', 'vector database'
];

/**
 * Extracts plain text from a PDF Buffer or Uint8Array.
 * Validates text density to detect scanned/image-only PDFs.
 */
export async function extractTextFromPdf(pdfBuffer: ArrayBuffer | Uint8Array): Promise<{
  text: string;
  pageCount: number;
  isScannedOrImagePdf: boolean;
}> {
  const result = await extractText(new Uint8Array(pdfBuffer));
  const pages = Array.isArray(result.text) ? result.text : [String(result.text || '')];
  const combinedText = pages.join('\n').trim();
  const pageCount = result.totalPages || pages.length || 1;

  // If text is suspiciously short (< 50 chars for the entire PDF), it's likely a scanned image
  const isScannedOrImagePdf = combinedText.length < 50;

  return {
    text: combinedText,
    pageCount,
    isScannedOrImagePdf,
  };
}

/**
 * Sanitizes raw resume text by normalizing whitespace, bullet points, and special characters.
 */
export function cleanText(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '•') // Standardize bullet glyphs
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Extracts skill keywords from text using exact & phrase matching against TECH_SKILL_DICTIONARY.
 */
export function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase();
  const foundKeywords = new Set<string>();

  for (const skill of TECH_SKILL_DICTIONARY) {
    // Escape special regex characters in skill (e.g. c++, c#, node.js)
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match word boundaries or isolated token
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+.])${escaped}([^a-zA-Z0-9#+.]|$)`, 'i');
    if (regex.test(normalized)) {
      foundKeywords.add(skill);
    }
  }

  return Array.from(foundKeywords);
}

/**
 * Extracts work experience and project bullet points from resume text.
 */
export function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Bullet line indicators: starts with bullet symbols, dash, asterisk, or number like 1.
    const isBulletLine = /^(?:•|\*|-|–|—|\d+\.)\s+(.+)$/i.test(line);

    if (isBulletLine) {
      const cleaned = line.replace(/^(?:•|\*|-|–|—|\d+\.)\s+/, '').trim();
      // Skip skills lists, coursework, or metadata lines with colons in the first 25 chars (e.g. "Languages:", "Backend & APIs:")
      const hasCategoryColon = /^[^:]{1,25}:/.test(cleaned);
      if (!hasCategoryColon && cleaned.length >= 25) {
        bullets.push(cleaned);
      }
    } else if (line.length >= 40 && line.length <= 300) {
      // Standalone sentence that begins with an action verb
      const startsWithActionVerb = /^(?:built|developed|designed|implemented|created|led|optimized|achieved|engineered|migrated|improved|reduced|increased|automated|deployed|integrated|spearheaded|architected|collaborated|maintained|resolved|tested)\b/i.test(line);
      if (startsWithActionVerb) {
        bullets.push(line);
      }
    }
  }

  // De-duplicate bullets
  return Array.from(new Set(bullets));
}

/**
 * Regex check to identify whether a bullet contains quantified impact metrics.
 * Looks for percentages, numbers, currency, multipliers, or latency metrics.
 */
export function isBulletQuantified(bullet: string): boolean {
  const metricPatterns = [
    /\d+(\.\d+)?%/, // percentages e.g. 40%, 99.9%
    /(?:\$|₹|USD|INR|EUR)\s*\d+[\d,]*(?:\.\d+)?(?:k|m|b|lakh|cr)?/i, // Currency e.g. $50k, ₹10L
    /\b\d+[\d,]*(?:\.\d+)?\s*(?:users|clients|customers|requests|queries|qps|ms|seconds|sec|mins|hours|stars|downloads|endpoints|gb|tb|mb)\b/i, // Units
    /\b\d+(?:\.\d+)?x\b/i, // 2x, 10x, 0.5x
    /\b(?:by|over|top|first|saved|reduced|increased|improved|scaled|cut|accelerated)\s+\d+/i, // Contextual numbers
    /\b\d+\s*%/i,
    /\b\d{2,}\b/ // Any explicit number >= 10
  ];

  return metricPatterns.some((pattern) => pattern.test(bullet));
}

/**
 * Analyzes seniority fit between Job Description and Resume.
 */
export function analyzeSeniority(resumeText: string, jdText: string): {
  jdLevel: string;
  resumeLevel: string;
  isMatch: boolean;
  score: number;
} {
  const jdLower = jdText.toLowerCase();
  const resLower = resumeText.toLowerCase();

  const isJdSenior = /\b(?:senior|sr\.|lead|principal|staff|architect|manager|5\+\s*years|7\+\s*years)\b/i.test(jdLower);
  const isJdEntry = /\b(?:intern|internship|fresher|junior|entry\s*level|associate|graduate|campus|new\s*grad|0-1\s*year|0-2\s*year)\b/i.test(jdLower);

  const isResJunior = /\b(?:intern|b\.?tech|b\.?e\.?|bachelor|student|graduat(?:ing|ed|e)|202[3-7]|entry|junior)\b/i.test(resLower);

  let jdLevel = 'Mid / General SDE';
  if (isJdSenior) jdLevel = 'Senior / Staff / Lead';
  else if (isJdEntry) jdLevel = 'Entry-level / Intern / New Grad';

  let resumeLevel = 'Mid-level / Experienced';
  if (isResJunior) resumeLevel = 'Entry-level / New Grad / Student';

  // Engineering grads applying to entry-level / general SDE roles get top marks
  let isMatch = true;
  let score = 90;

  if (isJdSenior && isResJunior) {
    isMatch = false;
    score = 55; // Senior role mismatch penalty
  } else if (isJdEntry && isResJunior) {
    isMatch = true;
    score = 100; // Perfect grad fit
  } else if (!isJdSenior) {
    isMatch = true;
    score = 90;
  }

  return { jdLevel, resumeLevel, isMatch, score };
}

/**
 * Validates presence of critical ATS sections in the resume.
 */
export function checkSectionCompleteness(text: string): {
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  hasProjects: boolean;
  hasContact: boolean;
  score: number;
} {
  const lower = text.toLowerCase();

  const hasExperience = /\b(?:experience|employment|work\s*history|internships?|work\s*experience)\b/i.test(lower);
  const hasEducation = /\b(?:education|academic|degree|university|college|b\.?tech|b\.?e\.?|bachelor)\b/i.test(lower);
  const hasSkills = /\b(?:skills|technical\s*skills|technologies|proficiencies|competencies)\b/i.test(lower);
  const hasProjects = /\b(?:projects|personal\s*projects|academic\s*projects|portfolio)\b/i.test(lower);
  const hasContact = /\b(?:email|phone|github|linkedin|gmail\.com|@)\b/i.test(lower);

  const sections = [hasExperience, hasEducation, hasSkills, hasProjects, hasContact];
  const count = sections.filter(Boolean).length;
  // Score: 20 pts per core section up to 100
  const score = Math.min(100, count * 20);

  return {
    hasExperience,
    hasEducation,
    hasSkills,
    hasProjects,
    hasContact,
    score,
  };
}

/**
 * Computes the complete Stage 1 deterministic analysis and ATS Match score.
 */
export function runStage1Analysis(
  rawResumeText: string,
  pageCount: number,
  jdText: string
): Stage1Result {
  const clean = cleanText(rawResumeText);
  const resumeKeywords = extractKeywords(clean);
  const jdKeywords = extractKeywords(jdText);

  // Calculate matched and missing keywords
  const resumeKeywordSet = new Set(resumeKeywords);
  const matchedKeywords = jdKeywords.filter((kw) => resumeKeywordSet.has(kw));
  const missingKeywordsStage1 = jdKeywords.filter((kw) => !resumeKeywordSet.has(kw));

  // Keyword Score: 50% weight
  // If JD has few explicit tech keywords, baseline against minimum 5
  const baseJdCount = Math.max(jdKeywords.length, 5);
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / baseJdCount) * 100));

  // Bullets & Quantified Impact: 25% weight
  const bullets = extractBulletPoints(clean);
  const quantifiedBullets = bullets.filter(isBulletQuantified);
  const quantifiedRatio = bullets.length > 0 ? quantifiedBullets.length / bullets.length : 0;
  // Target 50% quantified bullets for 100% score
  const quantifiedScore = Math.min(100, Math.round((quantifiedRatio / 0.5) * 100));

  // Seniority Match: 15% weight
  const seniority = analyzeSeniority(clean, jdText);
  const seniorityScore = seniority.score;

  // Section Completeness: 10% weight
  const sections = checkSectionCompleteness(clean);
  const sectionsScore = sections.score;

  // Final Overall ATS Match Score (0 - 100)
  const overallScore = Math.round(
    keywordScore * 0.50 +
    quantifiedScore * 0.25 +
    seniorityScore * 0.15 +
    sectionsScore * 0.10
  );

  const breakdown: ATSScoreBreakdown = {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    keywordScore,
    quantifiedScore,
    seniorityScore,
    sectionsScore,
    details: {
      totalJdKeywords: jdKeywords.length,
      matchedKeywordsCount: matchedKeywords.length,
      matchedKeywords,
      missingKeywordsStage1,
      totalBulletsDetected: bullets.length,
      quantifiedBulletsDetected: quantifiedBullets.length,
      quantifiedRatio,
      detectedSeniority: {
        jdLevel: seniority.jdLevel,
        resumeLevel: seniority.resumeLevel,
        isMatch: seniority.isMatch,
      },
      detectedSections: {
        hasExperience: sections.hasExperience,
        hasEducation: sections.hasEducation,
        hasSkills: sections.hasSkills,
        hasProjects: sections.hasProjects,
        hasContact: sections.hasContact,
      },
    },
  };

  const words = clean.split(/\s+/).filter(Boolean);

  return {
    rawResumeText,
    cleanResumeText: clean,
    pageCount,
    wordCount: words.length,
    bullets,
    breakdown,
  };
}
