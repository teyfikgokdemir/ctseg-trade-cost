# Repository agent instructions

## Project-specific Codex guidance (2026-10-17)

### Scope and architecture
Multi-tenant landed-cost engine. Protect unit conversions and totals, source order LIVE > OFFICIAL > QUOTE > MARKET_AVG > MANUAL > ESTIMATE, timestamps, provenance, confidence and estimate ranges.
Read the repository README, package scripts, CI workflows, existing project instructions and relevant source files before choosing commands or changes. Treat README claims as context, not as proof of current live behavior.

### Change safety
- For audit or review requests, inspect and report only; do not modify code, configuration, tracking, infrastructure or production.
- For requested changes, keep patches minimal and reversible. Preserve existing design, mobile behavior, accessibility, localization and business-critical workflows.
- Never push directly to the default branch or deploy without an explicit task requiring it. Prefer a focused branch and pull request; do not merge your own PR by default.
- Never expose secrets or customer data in logs, source files or reports. Do not invent customer testimonials, vendor claims, pricing, certifications or legal/commercial facts.

### Review priorities
- Identify security, data-integrity and regression risks before style-only issues. Report findings with paths/lines, severity and reproducible evidence; clearly label unverified concerns.
- For web-facing changes inspect applicable metadata, canonical URLs, robots/sitemap, structured data, internal links, Open Graph, mobile accessibility and performance. Do not assume SEO checks guarantee rankings.
- Check translation parity, language tags, hreflang and RTL only where the project actually supports them; do not impose locales on single-language projects.
- For forms, APIs and integrations inspect validation, authorization, error handling and privacy; do not silently alter analytics/consent.

### Verification and reporting
- Run only scripts confirmed in package.json or documented project tooling. Perform focused checks followed by build/tests when feasible; do not claim commands succeeded unless outputs confirm it.
- Separately report: files changed, tests (pass/fail/not run), commit, push, PR, CI, deployment and live checks. State blockers, open decisions and next action.
