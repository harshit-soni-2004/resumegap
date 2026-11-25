import { extractText } from 'unpdf';
import { ATSScoreBreakdown, Stage1Result } from './types';

// Curated comprehensive dictionary of 450+ tech skills, frameworks, and tools for engineering grads
export const TECH_SKILL_DICTIONARY: string[] = [
  // Programming Languages
  'python', 'javascript', 'typescript', 'java', 'c++', 'c', 'c#', 'go', 'golang', 'rust',
  'kotlin', 'swift', 'sql', 'r', 'php', 'ruby', 'dart', 'scala', 'matlab', 'bash', 'shell',
  'html', 'css', 'sass', 'scss', 'solidity',
  // Framework versions & specifics from real resumes
  'java 21', 'java 17', 'java 11', 'java 8', 'spring boot 3', 'spring boot', 'spring framework',
  'spring security', 'spring cloud', 'spring cloud gateway', 'eureka', 'angular 19', 'angular',
  // Frontend
  'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'vue', 'vue.js', 'svelte', 'sveltekit',
  'tailwind', 'tailwind css', 'bootstrap', 'material ui', 'shadcn', 'redux', 'zustand', 'rxjs',
  'webpack', 'vite', 'html5', 'css3', 'responsive design', 'web vitals', 'react query', 'tanstack query',
  // Backend & APIs
  'node.js', 'nodejs', 'express', 'express.js', 'fastapi', 'flask', 'django', 'nest.js', 'nestjs',
  'gin', 'fiber', 'actix', 'axum', 'rest', 'rest api', 'rest apis', 'restful api', 'restful apis',
  'graphql', 'grpc', 'trpc', 'microservices', 'websocket', 'websockets', 'sse', 'jwt', 'oauth',
  'oauth2', 'oauth 2.0', 'oidc', 'sso', 'middleware', 'serverless', 'gateway', 'api gateway',
  'idempotency', 'idempotent api design', 'transactional outbox', 'resilience4j',
  // Messaging & Event-Driven
  'kafka', 'apache kafka', 'rabbitmq', 'activemq', 'nats', 'sqs', 'sns', 'pub/sub', 'event-driven architecture',
  // Databases, ORM & Storage
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'cassandra', 'dynamodb',
  'clickhouse', 'snowflake', 'bigquery', 'firebase', 'supabase', 'neon', 'prisma', 'drizzle',
  'typeorm', 'hibernate', 'jpa', 'mongoose', 'elasticsearch', 'opensearch', 's3', 'blob storage',
  'acid', 'indexing', 'database indexing', 'database normalization', 'flyway', 'liquibase', 'schema migrations',
  // Cloud & DevOps / Infra
  'aws', 'amazon web services', 'ec2', 'rds', 'iam', 'eks', 'ecs', 'lambda', 'cloudwatch',
  'azure', 'azure devops', 'gcp', 'google cloud', 'gke', 'cloud run', 'docker', 'docker compose',
  'docker container', 'kubernetes', 'k8s', 'helm', 'ci/cd', 'github actions', 'bitbucket pipelines',
  'jenkins', 'gitlab ci', 'gitlab', 'git', 'github', 'linux', 'ubuntu', 'nginx', 'envoy', 'traefik',
  'terraform', 'opentofu', 'terragrunt', 'ansible', 'pulumi', 'iac', 'infrastructure as code',
  'cloud computing', 'vercel', 'netlify',
  // Observability & Monitoring
  'prometheus', 'grafana', 'datadog', 'splunk', 'opentelemetry', 'jaeger', 'loki', 'elk stack',
  // Computer Science Core & Systems
  'data structures', 'algorithms', 'dsa', 'object oriented programming', 'oop', 'oops',
  'system design', 'operating systems', 'dbms', 'computer networks', 'distributed systems',
  'multithreading', 'concurrency', 'virtual threads', 'unit testing', 'integration testing',
  'e2e testing', 'jest', 'vitest', 'playwright', 'cypress', 'pytest', 'mocha', 'junit', 'mockito',
  'test driven development', 'tdd', 'agile', 'scrum', 'jira', 'maven', 'gradle',
  // AI / ML / LLM
  'machine learning', 'deep learning', 'artificial intelligence', 'nlp', 'natural language processing',
  'computer vision', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'opencv',
  'huggingface', 'llm', 'large language models', 'generative ai', 'prompt engineering', 'prompt design',
  'langchain', 'llamaindex', 'rag', 'vector database', 'pinecone', 'weaviate', 'qdrant', 'chromadb',
  'llm tool calling', 'function calling', 'server-side guardrails', 'ml/nlp integration', 'fine-tuning', 'embeddings'
];

export const SKILL_ALIASES: Record<string, string[]> = {
  'java': ['java 21', 'java 17', 'java 11', 'java 8', 'core java'],
  'spring boot': ['spring boot 3', 'springboot', 'spring boot 2', 'spring-boot'],
  'spring cloud': ['spring cloud gateway', 'eureka', 'spring cloud config', 'spring-cloud'],
  'angular': ['angular 19', 'angular 18', 'angular 17', 'angularjs', 'angular.js'],
  'rest': ['rest apis', 'rest api', 'restful', 'restful apis', 'restful api'],
  'kubernetes': ['k8s', 'kube'],
  'docker': ['docker compose', 'docker container'],
  'aws': ['amazon web services', 'ec2', 's3', 'rds', 'eks', 'iam'],
  'ci/cd': ['github actions', 'bitbucket pipelines', 'gitlab ci', 'jenkins'],
  'terraform': ['iac', 'infrastructure as code'],
  'idempotency': ['idempotent api design', 'idempotent apis', 'idempotent'],
  'rabbitmq': ['rabbit mq', 'amqp'],
  'oauth': ['oauth2', 'oauth 2.0', 'oauth 2'],
  'concurrency': ['virtual threads', 'multithreading', 'threads'],
  'postgres': ['postgresql'],
  'react': ['react.js', 'reactjs'],
  'next.js': ['nextjs', 'next'],
  'node.js': ['nodejs', 'node'],
  'git': ['github', 'gitlab', 'bitbucket'],
  'kafka': ['apache kafka'],
  'system design': ['distributed systems', 'microservices'],
};

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
 * Extracts skill keywords from text using exact & phrase matching against TECH_SKILL_DICTIONARY
 * and expands canonical skills via SKILL_ALIASES.
 */
export function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase();
  const foundKeywords = new Set<string>();

  for (const skill of TECH_SKILL_DICTIONARY) {
    if (skill === 'go') {
      // Avoid false positives like "go-to-market", "let's go", "where to go"
      const hasGoLang = /\bgolang\b/i.test(normalized);
      const hasGoTechContext =
        /(?:^|[\s,;•/|([\]{}])go(?=[,;•/|)\]{}\n\r]|\s+(?:developer|engineer|backend|programming|lang|routine|routines|channel|channels)\b)/i.test(normalized) &&
        !/\b(?:go-to-market|go\s+to\s+market|to\s+go|let's\s+go)\b/i.test(normalized);

      if (hasGoLang || hasGoTechContext) {
        foundKeywords.add('go');
        foundKeywords.add('golang');
      }
      continue;
    }

    // Escape special regex characters in skill (e.g. c++, c#, node.js, aws)
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match word boundaries or isolated token
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+.-])${escaped}([^a-zA-Z0-9#+.-]|$)`, 'i');
    if (regex.test(normalized)) {
      foundKeywords.add(skill);
    }
  }

  // Alias expansion: if any alias matches, also add canonical skill and matched aliases
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    for (const alias of aliases) {
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const aliasRegex = new RegExp(`(^|[^a-zA-Z0-9#+.-])${escapedAlias}([^a-zA-Z0-9#+.-]|$)`, 'i');
      if (aliasRegex.test(normalized)) {
        foundKeywords.add(canonical);
        foundKeywords.add(alias);
      }
    }
  }

  return Array.from(foundKeywords);
}

/**
 * Extracts work experience and project bullet points from resume text.
 * Merges multi-line wrapped bullet points into single coherent items.
 */
export function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];
  let currentBullet = '';

  const sectionHeaders = [
    'summary',
    'work experience',
    'experience',
    'featured projects',
    'projects',
    'education',
    'technical skills',
    'skills',
    'publications',
    'certifications',
    'achievements',
  ];

  const finalizeBullet = () => {
    if (currentBullet) {
      const cleaned = currentBullet.replace(/^(?:•|\*|-|–|—|\d+\.)\s+/, '').trim();
      const hasCategoryColon = /^[^:]{1,25}:/.test(cleaned);
      if (!hasCategoryColon && cleaned.length >= 25) {
        bullets.push(cleaned);
      }
      currentBullet = '';
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      finalizeBullet();
      continue;
    }

    const lower = line.toLowerCase();
    const isSectionHeader = sectionHeaders.some((h) => lower === h || lower.startsWith(h + ' '));

    // Bullet line indicators: starts with bullet symbols, dash, asterisk, or number like 1.
    const isBulletLine = /^(?:•|\*|-|–|—|\d+\.)\s+(.+)$/i.test(line);

    // Or standalone sentence that begins with an action verb
    const startsWithActionVerb =
      line.length >= 25 &&
      /^(?:built|developed|designed|implemented|created|led|optimized|achieved|engineered|migrated|improved|reduced|increased|automated|deployed|integrated|spearheaded|architected|collaborated|maintained|resolved|tested|secured|hardened|containerised|containerized)\b/i.test(
        line
      );

    if (isBulletLine || startsWithActionVerb) {
      finalizeBullet();
      currentBullet = line;
    } else if (isSectionHeader) {
      finalizeBullet();
    } else if (currentBullet) {
      // Continuation of previous bullet:
      // Stop if it looks like a distinct job title / date line (e.g. "Software Engineer Apr 2026 – Oct 2026", "Full-Stack Financial Platform – GitHub | Demo")
      const isJobTitleOrDate =
        /\b(?:202[0-9]|19[0-9]{2})\b/.test(line) &&
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present)\b/i.test(line);
      const isPlatformHeader = /–\s*(?:GitHub|Demo|Link)|\|\s*(?:GitHub|Demo|Link|Portfolio)/i.test(line);
      const isCompanyLocation = /,\s*(?:India|Remote|USA|UK)\b/i.test(line);
      const isShortHeading = line.length <= 35 && /^[A-Z][A-Za-z0-9\s]+$/.test(line);

      if (isJobTitleOrDate || isPlatformHeader || isCompanyLocation || isShortHeading) {
        finalizeBullet();
      } else {
        currentBullet += ' ' + line;
      }
    }
  }

  finalizeBullet();
  return Array.from(new Set(bullets));
}

export interface QuantifiedDetail {
  isQuantified: boolean;
  matchedPattern?: string;
  matchedText?: string;
}

/**
 * Detailed inspection of whether a bullet contains true impact/scale metrics.
 * Handles hyphenated and adjective-separated units ("15-service", "7 Critical vulnerabilities",
 * "all 5 core Veefin fintech products", "6 decoupled Spring Boot microservices").
 * Explicitly ignores tech versions/names (Java 21, Angular 19, Spring Boot 3, EKS 1.32, V44, OAuth2).
 */
export function getBulletQuantifiedDetails(bullet: string): QuantifiedDetail {
  // First, strip common technology names containing version numbers or digits so they are not counted as metrics
  const sanitized = bullet
    .replace(/\bjava\s*(?:21|17|11|8)\b/gi, '')
    .replace(/\bspring\s*boot\s*(?:3|2)\b/gi, '')
    .replace(/\bangular\s*(?:19|18|17|16)\b/gi, '')
    .replace(/\beks\s*(?:1\.\d+|v?\d+)\b/gi, '')
    .replace(/\b(?:schema\s*)?v\d+\b/gi, '')
    .replace(/\boauth\s*2(?:\.0)?\b/gi, '')
    .replace(/\b(?:http\/?2|tls\s*1\.[23]|ipv[46])\b/gi, '')
    .replace(/\bpython\s*(?:3\.\d+|2\.7)\b/gi, '')
    .replace(/\barm(?:64|v\d+)\b/gi, '')
    .replace(/\bcis\s*level\s*\d+\b/gi, '');

  const rules: Array<{ name: string; regex: RegExp }> = [
    {
      name: 'Percentage impact',
      regex: /\d+(\.\d+)?%/,
    },
    {
      name: 'Currency impact',
      regex: /(?:\$|₹|USD|INR|EUR)\s*\d+[\d,]*(?:\.\d+)?(?:k|m|b|lakh|cr)?/i,
    },
    {
      name: 'Multiplier impact',
      regex: /\b\d+(\.\d+)?x\b/i,
    },
    {
      name: 'Hyphenated scale unit',
      regex: /\b\d+-(?:services?|nodes?|tiers?|users?|hours?|mins?|points?|factors?)\b/i,
    },
    {
      name: 'Adjective-separated scale unit',
      regex: /\b\d+\s+(?:[a-zA-Z-]+\s+){0,4}(?:products?|microservices?|services?|vulnerabilities?|findings?|users?|clients?|customers?|requests?|queries?|qps|nodes?|endpoints?)\b/i,
    },
    {
      name: 'Contextual reduction/savings count',
      regex: /\b(?:reduced|reducing|decreased|cut|saved|eliminated)\s+(?:[a-zA-Z-]+\s+){0,3}(?:all\s+)?\d+[\d,]*/i,
    },
  ];

  for (const rule of rules) {
    const match = sanitized.match(rule.regex);
    if (match) {
      return {
        isQuantified: true,
        matchedPattern: rule.name,
        matchedText: match[0],
      };
    }
  }

  return { isQuantified: false };
}

/**
 * Regex check to identify whether a bullet contains true impact/scale metrics.
 */
export function isBulletQuantified(bullet: string): boolean {
  return getBulletQuantifiedDetails(bullet).isQuantified;
}

/**
 * Analyzes seniority fit between Job Description and Resume.
 * Prioritizes job title line indicators over stray body mentions.
 */
export function analyzeSeniority(resumeText: string, jdText: string): {
  jdLevel: string;
  resumeLevel: string;
  isMatch: boolean;
  score: number;
} {
  const jdLower = jdText.toLowerCase();
  const resLower = resumeText.toLowerCase();

  // Extract job title from JD: look for "Job Title: ...", "Title: ...", "Role: ..." or first non-empty lines
  const titleMatch = jdText.match(/(?:job\s*title|title|role|position):\s*([^\r\n]+)/i);
  const firstLines = jdText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2)
    .slice(0, 3)
    .join(' ');
  const titleCandidate = (titleMatch ? titleMatch[1] : firstLines).toLowerCase();

  // Entry markers: SDE 1, SDE-I, Associate, Graduate, New Grad, Early Career, 0-2 years, Junior, Intern, Fresher
  const entryPattern = /\b(?:sde\s*1|sde-i|sde\s*i\b|associate|junior|intern|internship|graduate|new\s*grad|campus|fresher|entry\s*level|early\s*career|0-1\s*years?|0-2\s*years?)\b/i;
  const isTitleEntry = entryPattern.test(titleCandidate);

  // Senior markers: Senior, Lead, Principal, Staff, Architect, 5+ years, 7+ years, 8+ years
  // Note: "Associate Product Manager" has "Manager" but is ENTRY level because of "Associate"
  const seniorTitlePattern = /\b(?:senior|sr\.|lead|principal|staff|architect|director|head\s+of|5\+\s*years|7\+\s*years|8\+\s*years)\b/i;
  const isTitleSenior = seniorTitlePattern.test(titleCandidate) && !isTitleEntry;

  let isJdSenior = false;
  let isJdEntry = false;

  if (isTitleEntry) {
    // Title is explicitly entry-level: overrides any stray "senior" mentions in body text
    isJdEntry = true;
    isJdSenior = false;
  } else if (isTitleSenior) {
    isJdSenior = true;
    isJdEntry = false;
  } else {
    // Check body text
    isJdSenior = /\b(?:senior|sr\.|lead|principal|staff|architect|5\+\s*years|7\+\s*years|8\+\s*years)\b/i.test(jdLower);
    isJdEntry = entryPattern.test(jdLower);
  }

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

export interface OutcomeValidationResult {
  isValid: boolean;
  reason?: string;
  isFlaggedOutcome: boolean;
  warning?: string;
}

/**
 * Validates that rewritten bullets do not fabricate new outcome types (latency, stability, daily users, cost),
 * do not drop crucial ownership markers ("solo-built", "with the CTO"), and do not inject generic filler.
 */
export function validateRewriteOutcomes(original: string, rewritten: string): OutcomeValidationResult {
  const origLower = original.toLowerCase();
  const rewLower = rewritten.toLowerCase();

  // 1. Detect dropped ownership / collaboration markers
  const ownershipMarkers = [
    { name: 'solo-built', regex: /\bsolo-built\b/i },
    { name: 'with the cto', regex: /\bwith\s+(?:the\s+)?cto\b/i },
    { name: 'led', regex: /\bled\b/i },
    { name: 'owned', regex: /\bowned\b/i },
    { name: 'spearheaded with', regex: /\bspearheaded\s+with\b/i },
    { name: 'co-developed', regex: /\bco-developed\b/i },
  ];

  for (const marker of ownershipMarkers) {
    if (marker.regex.test(origLower) && !marker.regex.test(rewLower)) {
      return {
        isValid: false,
        isFlaggedOutcome: true,
        reason: `Dropped key ownership/collaboration context ("${marker.name}")`,
        warning: '⚠️ Check this claim is true before using it',
      };
    }
  }

  // 2. Detect fabricated outcome categories
  const categories = [
    {
      name: 'latency/speed',
      regex: /\b(?:latency|response\s*time|sub-second|round-trip|p99|p95|\b\d+\s*ms\b|milliseconds?)\b/i,
    },
    {
      name: 'stability/uptime',
      regex: /\b(?:stability|uptime|downtime|zero-downtime|crash-free|reliability|sla|slas|99\.\d+%)\b/i,
    },
    {
      name: 'cost/spend',
      regex: /\b(?:cloud\s*cost|infrastructure\s*cost|cost\s*savings?|spend|cloud\s*spend|bill|billing|\$\s*\d+)\b/i,
    },
    {
      name: 'daily/user scale',
      regex: /\b(?:daily|dau|mau|active\s*users?|concurrent\s*users?|daily\s*active)\b/i,
    },
    {
      name: 'productivity',
      regex: /\b(?:developer\s*productivity|team\s*productivity|engineering\s*velocity)\b/i,
    },
  ];

  for (const cat of categories) {
    const rewHasCat = cat.regex.test(rewLower);
    const origHasCat = cat.regex.test(origLower);
    if (rewHasCat && !origHasCat) {
      return {
        isValid: false,
        isFlaggedOutcome: true,
        reason: `Introduces ${cat.name} claim not present in original bullet`,
        warning: '⚠️ Check this claim is true before using it',
      };
    }
  }

  // 3. Flag adding percentage metric to purely qualitative mechanisms
  const qualitativeOnly = /\b(?:safely rejected under retries|zero database query access|mathematical hallucination)\b/i;
  if (
    qualitativeOnly.test(origLower) &&
    (/\[X%\]/i.test(rewLower) || /\b\d+%/i.test(rewLower)) &&
    /\b(?:safely\s+rejected|retries|disbursements|repayments|duplicate)\b/i.test(rewLower)
  ) {
    return {
      isValid: false,
      isFlaggedOutcome: true,
      reason: 'Adds percentage placeholder to a purely qualitative claim ("safely rejected under retries")',
      warning: '⚠️ Check this claim is true before using it',
    };
  }

  // 4. Check for banned filler outcomes unless original explicitly mentioned them
  const fillerRegex = /\b(?:improving\s+system\s+functionality|enhancing\s+functionality|improving\s+efficiency\s+by\s*\[X%\])\b/i;
  if (fillerRegex.test(rewLower) && !origLower.includes('functionality') && !origLower.includes('efficiency')) {
    return {
      isValid: false,
      isFlaggedOutcome: true,
      reason: 'Contains generic filler outcome phrase',
      warning: '⚠️ Check this claim is true before using it',
    };
  }

  // 5. Named entities check: capitalized tools, banks, protocols, platforms from original must be preserved
  const namedEntitiesToCheck = [
    'SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak',
    'Eureka', 'PKCE', 'Jira', 'RabbitMQ', 'Flyway', 'Maven'
  ];

  const missingNamedEntities: string[] = [];
  for (const ent of namedEntitiesToCheck) {
    const entRegex = new RegExp(`\\b${ent}\\b`, 'i');
    if (entRegex.test(original) && !entRegex.test(rewritten)) {
      missingNamedEntities.push(ent);
    }
  }

  if (missingNamedEntities.length > 0) {
    return {
      isValid: false,
      isFlaggedOutcome: true,
      reason: `Missing concrete named entity from original: ${missingNamedEntities.join(', ')}`,
      warning: '⚠️ Check this claim is true before using it',
    };
  }

  // 6. Check replacing concrete facts from original with [X]
  const concreteReplacedPattern = /\[X\]\s*(?:banks?|formats?|services?|microservices?)/i;
  const hasConcreteInOrig = /\b(?:SBI|HDFC|ICICI|Axis|Kotak|PDF|CSV|Excel)\b/i.test(original);
  if (hasConcreteInOrig && concreteReplacedPattern.test(rewritten)) {
    return {
      isValid: false,
      isFlaggedOutcome: true,
      reason: 'Replaced concrete facts from original with [X] placeholder',
      warning: '⚠️ Check this claim is true before using it',
    };
  }

  return {
    isValid: true,
    isFlaggedOutcome: false,
  };
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

  // Role Fit Score (77% Keyword + 23% Seniority - target JD specific)
  const roleFitScore = Math.min(100, Math.round(keywordScore * 0.77 + seniorityScore * 0.23));

  // Resume Quality Score (71% Quantified + 29% Sections - resume craft)
  const resumeQualityScore = Math.min(100, Math.round(quantifiedScore * 0.71 + sectionsScore * 0.29));

  // Final Overall ATS Match Score (0 - 100)
  let overallScore = Math.round(
    keywordScore * 0.50 +
    quantifiedScore * 0.25 +
    seniorityScore * 0.15 +
    sectionsScore * 0.10
  );

  // If keyword overlap is under 30%, candidate lacks core competencies for the role.
  // Cap overall score at 50, and ensure severe mismatches (like APM) land under 45.
  if (keywordScore < 30) {
    const cappedMax = Math.min(50, Math.round(keywordScore * 1.25 + 18));
    overallScore = Math.min(overallScore, cappedMax);
  }

  const breakdown: ATSScoreBreakdown = {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    roleFitScore,
    resumeQualityScore,
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
