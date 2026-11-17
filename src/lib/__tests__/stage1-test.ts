import { runStage1Analysis, isBulletQuantified } from '../stage1-detector';

async function testStage1() {
  console.log('--- Testing Stage 1 Deterministic Engine ---');

  const sampleResume = `
Rahul Sharma
Email: rahul.sharma@example.com | GitHub: github.com/rahul | LinkedIn: linkedin.com/in/rahul
B.Tech in Computer Science and Engineering, 2021 - 2025 (Expected)
Relevant Coursework: Data Structures, Algorithms, Operating Systems, DBMS, Computer Networks

TECHNICAL SKILLS:
Languages: Python, TypeScript, JavaScript, Java, C++, SQL
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Redux
Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, AWS, Git, GitHub

WORK EXPERIENCE:
Software Engineering Intern | TechCorp India (Jan 2024 - June 2024)
• Built RESTful APIs using Node.js and Express, improving endpoint response times by 35% for 50,000 active users.
• Developed interactive dashboard components in React and Tailwind CSS, reducing page load latency from 2.4s to 800ms.
• Managed PostgreSQL database migrations and integrated Redis caching, boosting query throughput by 2.5x.
• Collaborated in an Agile Scrum team with daily standups and bi-weekly sprint planning.

PROJECTS:
ResumeGap - AI Resume & ATS Gap Copilot
• Architected a full-stack Next.js web application utilizing TypeScript and Tailwind CSS.
• Integrated Google Gemini Flash API with structured JSON output, achieving sub-2s analysis latency.
• Handled PDF parsing and deterministic keyword matching across 400+ technical skills.

CodeShare - Realtime Collaborative Editor
• Engineered a collaborative code editing platform supporting 100+ concurrent WebSocket connections.
• Implemented JWT authentication and role-based access control with MongoDB.
`;

  const sampleJd = `
Role: Graduate Software Engineer / SDE 1
Location: Bengaluru / Remote

About the Role:
We are looking for a Final-Year Student or Recent Graduate (B.Tech / B.E in CS/IT) with strong foundations in Data Structures, Algorithms, and modern web technologies.

Requirements:
- Strong proficiency in TypeScript, React, Next.js, and Node.js.
- Experience building REST APIs with PostgreSQL or MongoDB.
- Familiarity with Docker, Git, CI/CD, and AWS.
- Knowledge of Redis caching and performance optimization.
- Strong problem-solving skills, understanding of OOP and System Design fundamentals.
- Ability to write clean, maintainable, and unit-tested code.
`;

  // 1. Test Quantified Bullet Regex
  console.log('\n[1] Testing isBulletQuantified:');
  const bullet1 = 'Built RESTful APIs using Node.js and Express, improving endpoint response times by 35% for 50,000 active users.';
  const bullet2 = 'Collaborated in an Agile Scrum team with daily standups.';
  console.log(`Bullet 1 quantified? ${isBulletQuantified(bullet1)} (Expected: true)`);
  console.log(`Bullet 2 quantified? ${isBulletQuantified(bullet2)} (Expected: false)`);

  // 2. Run Stage 1 Analysis
  console.log('\n[2] Running Stage 1 Full Analysis:');
  const result = runStage1Analysis(sampleResume, 1, sampleJd);

  console.log('Words detected:', result.wordCount);
  console.log('Bullets detected:', result.bullets.length);
  console.log('Matched keywords count:', result.breakdown.details.matchedKeywordsCount);
  console.log('Matched keywords:', result.breakdown.details.matchedKeywords.join(', '));
  console.log('Missing keywords in JD:', result.breakdown.details.missingKeywordsStage1.join(', '));
  console.log('\nATS Score Breakdown:');
  console.log('- Overall ATS Score:', result.breakdown.overallScore, '/ 100');
  console.log('- Keyword Score (50%):', result.breakdown.keywordScore, '/ 100');
  console.log('- Quantified Score (25%):', result.breakdown.quantifiedScore, '/ 100');
  console.log('- Seniority Score (15%):', result.breakdown.seniorityScore, '/ 100');
  console.log('- Sections Score (10%):', result.breakdown.sectionsScore, '/ 100');

  // Assertions
  if (result.breakdown.overallScore <= 0 || result.breakdown.overallScore > 100) {
    throw new Error('Overall score out of bounds');
  }
  if (result.breakdown.details.matchedKeywordsCount === 0) {
    throw new Error('Expected matched keywords, got 0');
  }

  console.log('\nStage 1 Deterministic Engine PASSED all checks!');
}

testStage1().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
