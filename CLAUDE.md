## Working conventions

- IMPLEMENTATION_PLAN.md is the source of truth for stack, architecture, naming, API conventions, and code style. Don't duplicate its content here — read it before starting any phase, and follow it exactly rather than introducing alternative patterns.
- If something needed isn't covered by IMPLEMENTATION_PLAN.md, stop and ask rather than deciding silently.
- Never run `git commit` (or merge) until the user has reviewed the changes and explicitly asks for the commit. Stage/prepare changes and stop for review instead.
- Implement one build-order phase at a time (see IMPLEMENTATION_PLAN.md), then pause for review before starting the next phase.
- Each phase gets its own feature branch, per the "Checklist" convention in IMPLEMENTATION_PLAN.md.
- Don't add dependencies beyond what's needed for the current phase without asking first.
- Don't build ahead — e.g. don't add PostGIS code during earlier phases, even if it seems convenient; follow the phase order.
- Match the assignment's explicit non-goals: no auth, no mobile responsiveness, no deployment config, no accessibility audit, minimal observability. Don't add these even if they seem like "good practice" — they're out of scope by design.
- Run the linter and type-checker (`tsc --noEmit`) with no errors before marking a phase complete.
- Run relevant tests before marking a phase complete.
- New code follows the strict TypeScript settings already configured — no `any`, no suppressing type errors without discussing why first.
- Flag any place where you're making a judgment call not explicitly covered by IMPLEMENTATION_PLAN.md, and explain the reasoning.
- Never commit `.env` or real credentials — only `.env.example` with placeholders.
- Modify IMPLEMENTATION_PLAN.md after finishing the task and taking approval for it.
- Do not check off items from the checklist in IMPLEMENTATION_PLAN.md
