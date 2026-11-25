import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import json
import os

def create_portfolio_excel():
    wb = openpyxl.Workbook()
    
    # -------------------------------------------------------------
    # 1. MAIN SHEET: All Projects
    # -------------------------------------------------------------
    ws = wb.active
    ws.title = "All GitHub Projects"
    ws.views.sheetView[0].showGridLines = True

    # Palette
    header_fill = PatternFill(start_color="1E1B4B", end_color="1E1B4B", fill_type="solid") # Dark Indigo
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    
    stripe_even = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    stripe_odd = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    
    public_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid") # Light Emerald
    public_font = Font(name="Calibri", size=10, bold=True, color="166534")
    
    private_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # Light Amber
    private_font = Font(name="Calibri", size=10, bold=True, color="92400E")

    border_thin = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )
    
    title_font = Font(name="Calibri", size=16, bold=True, color="1E1B4B")
    subtitle_font = Font(name="Calibri", size=10, italic=True, color="64748B")

    # Title Banner
    ws.merge_cells("A1:I1")
    ws["A1"] = "GitHub Projects Portfolio Overview — Harshit Soni"
    ws["A1"].font = title_font
    ws["A1"].alignment = Alignment(vertical="center", indent=1)
    ws.row_dimensions[1].height = 36

    ws.merge_cells("A2:I2")
    ws["A2"] = "Complete architectural inventory of repositories: descriptions, system components, and detailed tech stacks."
    ws["A2"].font = subtitle_font
    ws["A2"].alignment = Alignment(vertical="center", indent=1)
    ws.row_dimensions[2].height = 20

    # Headers
    headers = [
        ("#", 6),
        ("Project Name", 26),
        ("Domain / Category", 24),
        ("Primary Language", 18),
        ("Project Description", 55),
        ("Key Components & Architecture", 55),
        ("Tech Stack", 45),
        ("Repository URL", 40),
        ("Visibility", 14)
    ]

    header_row = 4
    ws.row_dimensions[header_row].height = 28

    for col_idx, (header_text, col_width) in enumerate(headers, 1):
        cell = ws.cell(row=header_row, column=col_idx, value=header_text)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center" if col_idx in [1, 9] else "left", vertical="center", wrap_text=True)
        cell.border = border_thin
        col_letter = get_column_letter(col_idx)
        ws.column_dimensions[col_letter].width = col_width

    # Projects Data
    projects = [
        {
            "name": "invoice-financing-platform",
            "domain": "Fintech / Microservices",
            "lang": "Java",
            "desc": "An event-driven microservices platform where suppliers/sellers upload commercial invoices to receive early liquidity and multiple institutional financiers place competitive funding bids in a reverse-factoring auction model.",
            "components": "• Invoice Service: Manages invoice lifecycles (Uploaded, Verified, Financed, Settled)\n• Auction / Bidding Engine: Multi-financier bidding, discount rate calculation, automated matching\n• Messaging Bus: Shared DTOs, domain event schemas, RabbitMQ/Kafka sagas\n• Angular Web Portal: Supplier invoice dashboard & financier bidding cockpit\n• CI/CD Pipeline: GitHub Actions automated test, build, Docker packaging, Trivy CVE scanning",
            "stack": "Java 21, Spring Boot 3, Spring Cloud, Angular, TypeScript, PostgreSQL, MySQL, RabbitMQ / Kafka, Docker, Docker Compose, GitHub Actions, Trivy",
            "url": "https://github.com/harshit-soni-2004/invoice-financing-platform",
            "vis": "Public"
        },
        {
            "name": "resumegap",
            "domain": "AI / EdTech / Copilot",
            "lang": "TypeScript",
            "desc": "A 0-to-1 AI Resume & ATS Gap Copilot for graduating engineers applying off-campus. Analyzes uploaded resumes against target Job Descriptions (JDs), computes a transparent 0-100 score across 5 audit factors, surfaces missing high-priority keywords, and rewrites bullets via the Google XYZ formula.",
            "components": "• Stage 1 Deterministic Audit Engine: PDF parsing, heuristic keyword extractors, structural penalty formulas\n• Stage 2 Gemini Copilot Engine: Structured `@google/genai` LLM prompting, schema validation, fallback handler\n• Modern Next.js Frontend: Dropzone, interactive score gauge, bullet diff cards, 1-click feedback widget, PM telemetry\n• Visual & Graphics Engine: GPU-composited dynamic CSS fluid gradient mesh & bespoke kinetic vector brandmark",
            "stack": "Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Google Gemini API (@google/genai), Three.js, Lucide Icons, Puppeteer, Supabase",
            "url": "https://github.com/harshit-soni-2004/resumegap",
            "vis": "Public"
        },
        {
            "name": "ledger",
            "domain": "Fintech / Core Banking",
            "lang": "Java",
            "desc": "High-integrity double-entry financial accounting ledger and bank reconciliation engine. Guarantees mathematical balance invariance (Total Debits == Total Credits), transaction idempotency, audit trails, and automated bank statement CSV reconciliation.",
            "components": "• Double-Entry Posting Engine: Immutable journal transactions enforcing zero-sum debit/credit balance equality\n• Account Hierarchy & Balance Manager: Real-time balance calculations with optimistic concurrency control\n• Bank Reconciliation Processor: Rule-based automated matching of external bank CSV entries against ledger journal\n• Audit & Verification Suite: Automated integrity checks and cryptographic consistency logs",
            "stack": "Java 21, Spring Boot 3, Spring Data JPA, Hibernate, MySQL 8.4, Flyway, JUnit 5, AssertJ, Maven",
            "url": "https://github.com/harshit-soni-2004/ledger",
            "vis": "Public"
        },
        {
            "name": "transporter-assignment-api",
            "domain": "Logistics / Operations Research",
            "lang": "Java",
            "desc": "A high-performance Spring Boot REST API solving the combinatorial 'Transporter Assignment on Lanes' optimization problem: given freight lanes and carrier price quotes, it computes the global minimum-cost assignment subject to strict transporter count caps.",
            "components": "• Combinatorial Optimization Solver: Integer Linear Programming / Branch-and-Bound assignment algorithms\n• Lane & Rate Card Ingestion REST API: Validates carrier quote boundaries and multi-lane parameters\n• Feasibility & Constraint Engine: Enforces maximum carrier limits and coverage guarantees\n• Containerized Deployment: Docker multi-stage build with automated smoke testing scripts",
            "stack": "Java 17/21, Spring Boot 3, Spring Web, Maven, Docker, JUnit 5, Mockito, Shell scripting",
            "url": "https://github.com/harshit-soni-2004/transporter-assignment-api",
            "vis": "Public"
        },
        {
            "name": "security-scanner",
            "domain": "Cloud Security / CSPM",
            "lang": "Python",
            "desc": "AWS EC2 security group exposure audit tool that scans active instances and ingress security rules across AWS regions. Detects dangerous 0.0.0.0/0 exposure on sensitive ports (SSH 22, RDP 3389, DBs 5432/3306), computes risk scores, and dispatches automated alerts.",
            "components": "• Rule Ingestion Engine: Boto3 client fetching VPC, EC2, and Security Group configurations\n• Exposure Risk Matrix: Evaluates CIDR masks, port boundaries, protocols, and public IP associations\n• Multi-Format Reporting Pipeline: Generates executive HTML dashboards, detailed Excel workbooks, and CSV logs\n• SES Notification System: Automated Amazon SES alert dispatcher notifying SecOps on critical findings",
            "stack": "Python 3.10+, Boto3 (AWS SDK), OpenPyXL, Jinja2, Amazon SES, Amazon EC2 / VPC, Pytest",
            "url": "https://github.com/harshit-soni-2004/security-scanner",
            "vis": "Public"
        },
        {
            "name": "automated-patcher",
            "domain": "DevSecOps / Vulnerability Mgmt",
            "lang": "Python",
            "desc": "An automated CLI tool ('ami-patcher') orchestrating unattended weekly patch cycles and vulnerability validation for hardened golden AMIs in AWS without requiring open inbound SSH ports.",
            "components": "• Lifecycle Automation: Provisions ephemeral EC2 build instances from base AMIs and cleans up resources\n• AWS SSM Command Agent: Remote orchestration and patch installation via AWS Systems Manager\n• Trivy CVE Validation Engine: Scans OS packages/binaries and cross-references against exceptions.yaml\n• Golden AMI Factory: Bakes, tags, and registers newly certified AMIs upon zero-CVE attestation",
            "stack": "Python 3.10+, Boto3, Trivy Security Scanner, AWS SSM, AWS EC2, AWS S3, PyYAML, Pytest",
            "url": "https://github.com/harshit-soni-2004/automated-patcher",
            "vis": "Public"
        },
        {
            "name": "terraform-modules",
            "domain": "Infrastructure as Code (IaC)",
            "lang": "HCL / Terraform",
            "desc": "Production-ready, reusable AWS Terraform modules built for an Internal Developer Platform (IDP). Enables engineering teams to provision compliant cloud primitives (S3, EC2, RDS) with enterprise security guardrails baked in.",
            "components": "• Private S3 Module: SSE-KMS encryption, versioning, lifecycle expiration, and public access blocks\n• Hardened EC2 Module: Instance provisioning, IAM profile binding, and encrypted EBS root/data volumes\n• Multi-AZ RDS Module: Subnet groups, automated backups, encryption at rest, and DB parameter groups\n• Example Blueprints: Multi-environment composition blueprints for internal business units",
            "stack": "HashiCorp Terraform (HCL), AWS (EC2, S3, RDS, IAM, VPC, KMS, CloudWatch), Terratest, TFLint",
            "url": "https://github.com/harshit-soni-2004/terraform-modules",
            "vis": "Public"
        },
        {
            "name": "ami-hardening",
            "domain": "Security Baseline / Linux",
            "lang": "Shell / Bash",
            "desc": "Security hardening automation and baseline remediation scripts for AlmaLinux 9 and enterprise Linux AMIs across ARM64 / x86_64, aligning OS images with CIS Benchmark Level 1 & 2 standards.",
            "components": "• apply-delta.sh: CIS benchmark enforcement script (kernel sysctl parameters, PAM, firewalls, auditd)\n• add-team-keys.sh: Idempotent automated provisioning and rotation of team SSH public keys and sudo rules\n• Verification Engine: Pre-registration compliance verification scripts evaluating security deltas",
            "stack": "Bash / POSIX Shell, Linux (AlmaLinux 9 / RHEL / CentOS), CIS Benchmarks, OpenSSH, Auditd, Firewalld",
            "url": "https://github.com/harshit-soni-2004/ami-hardening",
            "vis": "Public"
        },
        {
            "name": "job-search-monitor",
            "domain": "Automation / Web Scraping",
            "lang": "Python",
            "desc": "A daily automated job tracking bot that scans official corporate portals and ATS feeds (Greenhouse, Lever, etc.) for early-career India roles, syncing openings into an Excel workbook while strictly preserving user notes, statuses, and custom columns.",
            "components": "• ATS Ingestion Scrapers: Connectors querying Greenhouse, Lever, and corporate portal endpoints\n• Non-Destructive Excel Sync Engine: Differential row merging via OpenPyXL preserving manual user notes\n• Job Matching Filter: Keyword extraction, experience threshold filters (0-2 YOE), and location rules\n• Multi-OS Automation: Windows Batch (.bat) and Linux/WSL shell automation scripts",
            "stack": "Python 3.10+, Requests, Beautiful Soup 4, OpenPyXL, PyYAML, Batch / Bash Scripting",
            "url": "https://github.com/harshit-soni-2004/job-search-monitor",
            "vis": "Public"
        },
        {
            "name": "fieldbase-go-live",
            "domain": "B2B SaaS / Agentic Workflows",
            "lang": "Python",
            "desc": "A B2B enterprise implementation agent demonstrating contract-enforced workspace provisioning. Enforces contractual limits (data residency, licensed modules, admin seats, SSO config) with human-in-the-loop sign-off before final go-live activation.",
            "components": "• Agentic Orchestrator: State-machine translating contract terms into provisioning task execution plans\n• Contract Enforcement Guard: Validates tenant setup against contracted module entitlements\n• Human-in-the-Loop Review UI: Web dashboard for implementation teams to review diffs and authorize go-live\n• Immutable Audit Log: Detailed audit logging tracking administrative provisioning actions",
            "stack": "Python 3, FastAPI, Docker, Docker Compose, Pytest, Pydantic, Jinja2 / Web UI",
            "url": "https://github.com/harshit-soni-2004/fieldbase-go-live",
            "vis": "Public"
        },
        {
            "name": "-Mintmate",
            "domain": "Personal Finance / AI",
            "lang": "Java",
            "desc": "AI-powered personal finance management and intelligence platform (live at mintmate-lyart.vercel.app). Ingests transactions, visualizes spending trends, tracks savings, and provides an interactive natural-language AI assistant for financial insights.",
            "components": "• Angular Client App: Responsive financial dashboard with spending charts, budget widgets, and AI chat\n• Spring Boot REST Backend: Microservice handling transaction CRUD, categorization, and account sync\n• AI / ML Assistant: Conversational financial intelligence and auto-categorization engine\n• Docker Containerization: Local MySQL and backend service composition for streamlined setup",
            "stack": "Angular (v16+), TypeScript, Java 17/21, Spring Boot, MySQL, Docker Compose, Vercel, RESTful APIs",
            "url": "https://github.com/harshit-soni-2004/-Mintmate",
            "vis": "Public"
        },
        {
            "name": "harshit-soni-2004.github.io",
            "domain": "Frontend / 3D Graphics",
            "lang": "TypeScript",
            "desc": "An interactive 'Terminal Cyberpunk' developer portfolio featuring a live UNIX-style command-line terminal, real-time 3D wireframe terrain with React Three Fiber, scanlines, boot animations, and typed data-driven project matrices.",
            "components": "• Interactive Virtual Terminal: Full CLI parser supporting commands (help, projects --tag, open, cat, clear)\n• 3D WebGL Canvas: Procedural cyberpunk terrain mesh and custom shaders via React Three Fiber\n• Filterable Project Grid: Dynamic project showcases filterable by tags (DevOps, Fullstack, AI, Systems)\n• Audio & Visual Effects: Retro scanlines, CRT flicker, typing sound synthesis, and boot sequences",
            "stack": "React 18, Vite, TypeScript, React Three Fiber (@react-three/fiber), Three.js, Tailwind CSS, Lucide Icons",
            "url": "https://github.com/harshit-soni-2004/harshit-soni-2004.github.io",
            "vis": "Public"
        },
        {
            "name": "EC2-Deploy",
            "domain": "Cloud Deployment / Lab",
            "lang": "Java",
            "desc": "Full-stack calculator application deployment blueprint on an AWS EC2 instance (AlmaLinux 9 / Amazon Corretto). Demonstrates running a Spring Boot REST API and Angular UI with reverse proxying and Linux service management.",
            "components": "• Backend API Service: Java 21 Spring Boot REST service running on port 8080\n• Frontend Web UI: Angular application running on port 4200 with API dev-server reverse proxy\n• Deployment Runbook: Step-by-step automation commands for AlmaLinux 9 package and service configuration",
            "stack": "Java 21 (Amazon Corretto), Spring Boot, Angular, Node.js, AWS EC2, Linux (AlmaLinux 9)",
            "url": "https://github.com/harshit-soni-2004/EC2-Deploy",
            "vis": "Private"
        },
        {
            "name": "TextUtils-React",
            "domain": "Frontend Web Utility",
            "lang": "JavaScript",
            "desc": "A responsive single-page text utility web application built with React. Enables users to analyze and manipulate text in real-time with case conversion, character/word counters, reading time estimation, and clipboard utilities.",
            "components": "• Text Processing Logic: Real-time string transformation routines (uppercase, lowercase, extra-space removal)\n• UI & Theming Engine: Dark mode and light mode toggle with responsive UI cards and alert banners",
            "stack": "React.js, JavaScript, HTML5, CSS3, Bootstrap",
            "url": "https://github.com/harshit-soni-2004/TextUtils-React",
            "vis": "Private"
        }
    ]

    current_row = 5
    for idx, p in enumerate(projects, 1):
        ws.row_dimensions[current_row].height = 110 # Enough space for multi-line wrapped text
        fill = stripe_even if idx % 2 == 0 else stripe_odd

        # 1. Index
        c1 = ws.cell(row=current_row, column=1, value=idx)
        c1.alignment = Alignment(horizontal="center", vertical="top")
        
        # 2. Name
        c2 = ws.cell(row=current_row, column=2, value=p["name"])
        c2.font = Font(name="Calibri", size=11, bold=True, color="0F172A")
        c2.alignment = Alignment(vertical="top")

        # 3. Domain
        c3 = ws.cell(row=current_row, column=3, value=p["domain"])
        c3.font = Font(name="Calibri", size=10, bold=True, color="475569")
        c3.alignment = Alignment(vertical="top")

        # 4. Lang
        c4 = ws.cell(row=current_row, column=4, value=p["lang"])
        c4.font = Font(name="Calibri", size=10, color="0F172A")
        c4.alignment = Alignment(vertical="top")

        # 5. Desc
        c5 = ws.cell(row=current_row, column=5, value=p["desc"])
        c5.font = Font(name="Calibri", size=10, color="1E293B")
        c5.alignment = Alignment(vertical="top", wrap_text=True)

        # 6. Components
        c6 = ws.cell(row=current_row, column=6, value=p["components"])
        c6.font = Font(name="Calibri", size=9.5, color="334155")
        c6.alignment = Alignment(vertical="top", wrap_text=True)

        # 7. Stack
        c7 = ws.cell(row=current_row, column=7, value=p["stack"])
        c7.font = Font(name="Calibri", size=9.5, bold=True, color="1E293B")
        c7.alignment = Alignment(vertical="top", wrap_text=True)

        # 8. URL
        c8 = ws.cell(row=current_row, column=8, value=p["url"])
        c8.hyperlink = p["url"]
        c8.font = Font(name="Calibri", size=9.5, color="2563EB", underline="single")
        c8.alignment = Alignment(vertical="top")

        # 9. Vis
        c9 = ws.cell(row=current_row, column=9, value=p["vis"])
        if p["vis"] == "Public":
            c9.fill = public_fill
            c9.font = public_font
        else:
            c9.fill = private_fill
            c9.font = private_font
        c9.alignment = Alignment(horizontal="center", vertical="top")

        for col_idx in range(1, 10):
            cell = ws.cell(row=current_row, column=col_idx)
            if col_idx != 9:
                cell.fill = fill
            cell.border = border_thin

        current_row += 1

    # -------------------------------------------------------------
    # 2. SUMMARY SHEET: Executive Overview & Tech Analytics
    # -------------------------------------------------------------
    ws_summary = wb.create_sheet(title="Portfolio Summary & Analytics")
    ws_summary.views.sheetView[0].showGridLines = True

    # Title
    ws_summary.merge_cells("A1:F1")
    ws_summary["A1"] = "Harshit Soni — Technical Portfolio Domain Breakdown"
    ws_summary["A1"].font = title_font
    ws_summary["A1"].alignment = Alignment(vertical="center", indent=1)
    ws_summary.row_dimensions[1].height = 36

    # Domain summary table
    domain_headers = [("Category / Domain Area", 30), ("Project Count", 15), ("Primary Tech Stack Highlights", 55)]
    ws_summary.row_dimensions[3].height = 24
    for c_idx, (h_text, w) in enumerate(domain_headers, 1):
        cell = ws_summary.cell(row=3, column=c_idx, value=h_text)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center" if c_idx == 2 else "left", vertical="center")
        cell.border = border_thin
        ws_summary.column_dimensions[get_column_letter(c_idx)].width = w

    domains_data = [
        ("Fintech & Core Banking Systems", 3, "Spring Boot 3, Java 21, Event-Driven Architecture, PostgreSQL, MySQL 8.4, Double-Entry Invariance, Reconciliation"),
        ("Cloud Infrastructure, DevSecOps & Security", 4, "AWS (EC2, S3, RDS, SSM, VPC, SES), Terraform (IaC), CIS Hardening, Trivy Security Scanner, Boto3 Python, AlmaLinux 9"),
        ("AI, EdTech & Agentic Copilots", 2, "Google Gemini API (@google/genai), FastAPI, Next.js 15, B2B Provisioning State Machines, Schema Validation"),
        ("Operations Research & Logistics", 1, "Spring Boot 3, Java 17/21, Mixed-Integer Linear Optimization Algorithms, Docker"),
        ("Automation, Scrapers & Tools", 1, "Python, ATS Feed Ingestion, Non-Destructive Excel Sync (OpenPyXL), Beautiful Soup"),
        ("Frontend, 3D WebGL & Portfolios", 3, "React 18/19, Angular, TypeScript, Three.js, React Three Fiber, Vite, Tailwind CSS")
    ]

    for d_idx, (d_name, count, highlights) in enumerate(domains_data, 4):
        ws_summary.row_dimensions[d_idx].height = 26
        fill = stripe_even if d_idx % 2 == 0 else stripe_odd

        c1 = ws_summary.cell(row=d_idx, column=1, value=d_name)
        c1.font = Font(name="Calibri", size=10.5, bold=True, color="0F172A")
        c1.alignment = Alignment(vertical="center")

        c2 = ws_summary.cell(row=d_idx, column=2, value=count)
        c2.font = Font(name="Calibri", size=11, bold=True, color="1E1B4B")
        c2.alignment = Alignment(horizontal="center", vertical="center")

        c3 = ws_summary.cell(row=d_idx, column=3, value=highlights)
        c3.font = Font(name="Calibri", size=10, color="334155")
        c3.alignment = Alignment(vertical="center")

        for col_idx in range(1, 4):
            cell = ws_summary.cell(row=d_idx, column=col_idx)
            cell.fill = fill
            cell.border = border_thin

    # Total Row
    tot_row = len(domains_data) + 4
    ws_summary.row_dimensions[tot_row].height = 26
    c_tot_label = ws_summary.cell(row=tot_row, column=1, value="Total Repositories Cataloged")
    c_tot_label.font = Font(name="Calibri", size=11, bold=True, color="1E1B4B")
    c_tot_val = ws_summary.cell(row=tot_row, column=2, value=14)
    c_tot_val.font = Font(name="Calibri", size=11, bold=True, color="1E1B4B")
    c_tot_val.alignment = Alignment(horizontal="center", vertical="center")
    c_tot_vis = ws_summary.cell(row=tot_row, column=3, value="12 Public Open-Source, 2 Private Infrastructure/Learning Repos")
    c_tot_vis.font = Font(name="Calibri", size=10, italic=True, color="64748B")

    tot_fill = PatternFill(start_color="EEF2FF", end_color="EEF2FF", fill_type="solid")
    for col_idx in range(1, 4):
        cell = ws_summary.cell(row=tot_row, column=col_idx)
        cell.fill = tot_fill
        cell.border = border_thin

    output_path = os.path.abspath("GitHub_Projects_Portfolio.xlsx")
    wb.save(output_path)
    print(f"Successfully generated Excel workbook at: {output_path}")

if __name__ == "__main__":
    create_portfolio_excel()
