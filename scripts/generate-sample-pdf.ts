import fs from 'fs';
import path from 'path';

function createPdfBuffer(): Buffer {
  const content = `
BT
/F1 16 Tf
50 750 Td
(Arjun Patel - Software Engineering Graduate) Tj
/F1 10 Tf
0 -20 Td
(Email: arjun.patel.dev@gmail.com | Phone: +91 98765 43210 | Bengaluru, India) Tj
0 -15 Td
(GitHub: github.com/arjunpatel | LinkedIn: linkedin.com/in/arjun-patel-dev) Tj

/F1 12 Tf
0 -30 Td
(EDUCATION) Tj
/F1 10 Tf
0 -16 Td
(B.Tech in Computer Science and Engineering | PES University, Bengaluru (2021 - 2025)) Tj
0 -14 Td
(CGPA: 8.7/10.0 | Relevant Coursework: Data Structures, Algorithms, DBMS, Operating Systems, Networks) Tj

/F1 12 Tf
0 -26 Td
(TECHNICAL SKILLS) Tj
/F1 10 Tf
0 -16 Td
(Languages: Java, Python, TypeScript, JavaScript, SQL, C++) Tj
0 -14 Td
(Frontend: React, Next.js, HTML5, CSS3, Tailwind CSS, Redux) Tj
0 -14 Td
(Backend & Databases: Node.js, Express, PostgreSQL, MongoDB, Redis, REST APIs, GraphQL) Tj
0 -14 Td
(Developer Tools & Cloud: Git, GitHub, Docker, AWS, Postman, Linux, CI/CD) Tj

/F1 12 Tf
0 -26 Td
(WORK EXPERIENCE) Tj
/F1 10 Tf
0 -16 Td
(Software Engineering Intern | FinTech Labs India (Jan 2024 - July 2024)) Tj
0 -14 Td
(  - Built RESTful API microservices using Node.js, Express, and PostgreSQL for payments.) Tj
0 -14 Td
(  - Created interactive dashboard components in React and Tailwind CSS for 45,000 monthly active users.) Tj
0 -14 Td
(  - Integrated Redis caching layer, reducing API endpoint latency from 320ms to 45ms.) Tj
0 -14 Td
(  - Automated unit test suites using Jest with 82% coverage across core transaction modules.) Tj

/F1 12 Tf
0 -26 Td
(PROJECTS) Tj
/F1 10 Tf
0 -16 Td
(DevConnect - Peer Developer Code Review Platform (Next.js, TypeScript, PostgreSQL)) Tj
0 -14 Td
(  - Developed full-stack web application enabling developers to request and conduct inline code reviews.) Tj
0 -14 Td
(  - Optimized database queries using PostgreSQL composite indexes, cutting execution time by 40%.) Tj
0 -16 Td
(Algoverse - Data Structures & Algorithms Visualizer (React, TypeScript)) Tj
0 -14 Td
(  - Created interactive visualizer for 12 sorting and graph algorithms for over 8,000 student users.) Tj
ET
`;

  const streamLength = Buffer.byteLength(content, 'utf-8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream${content}endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000242 00000 n 
0000000315 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

const targetDir = path.join(process.cwd(), 'public', 'samples');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const pdfPath = path.join(targetDir, 'sample_sde_resume.pdf');
fs.writeFileSync(pdfPath, createPdfBuffer());
console.log(`Generated sample PDF at ${pdfPath} (${fs.statSync(pdfPath).size} bytes)`);
