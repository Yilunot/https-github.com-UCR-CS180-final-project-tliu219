# Lab 5 Worksheet (Lightweight Checkoff)
**Student Name:** Tony Liu  
**Section:** Archery Tech/AI Build  
**Project Name:** Valkyrie Archery Performance  
**Date:** 2026-05-10

## 1) Timeline Awareness
- [x] I know Lab 5 checkoff requires this worksheet submission.
- [x] I know full implementation of my own app is due by end of quarter.

## 2) Current Snapshot
**Current status (one line):**
A precision archery training suite featuring an AI-powered arrow spine calculator, computer-vision form analysis, and a technical coaching chat interface.

**Next small step (one line):**
Implement persistent session storage (Firebase/Local) to allow archers to track performance trends over time.

## 3) Design/Flow Awareness
**I can explain: interface -> engine -> storage -> status**
- **Interface**: React-based dashboard with specialized tools (Arrow Calculator, Form Analyzer, Session Log).
- **Engine**: Custom physical calculation logic in `archerUtils.ts` (Dynamic Spine) and Gemini 1.5 Flash for vision/text analysis.
- **Storage**: Currently managed via high-level React state and defined TypeScript interfaces (`ArcherProfile`, `Session`); prepared for NoSQL integration.
- **Status**: Live feedback loop in the calculator (Stable/Optimal/Critical Node) and immediate vision analysis reports.

**I identified the unique identifier used for duplicate prevention in my own app:**
Session entries use a unique `id` generated from ISO timestamps combined with user-specific profile keys to prevent duplicate logs.

## 4) Test/Guardrail Awareness
- [x] I know the 3 checks: success, exists, error
- [x] I used or prepared at least one guardrail prompt for my coding agent

**Guardrail prompt used/planned:**
"Safety Guardrail: If the user inputs an arrow length shorter than their draw length, the AI coach MUST immediately flag this as a critical safety hazard before providing any other tuning advice."
