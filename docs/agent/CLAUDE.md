# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repository is a **prompt asset library** managed by the Prompt Architect role (STRAT-CC v3.0). It stores versioned, production-ready prompts for use with various LLM targets.

## Repository Conventions

### File Layout

```
prompts/<domain>/<name>.md
```

Each prompt file must begin with a YAML front-matter block:

```yaml
---
version: 1.0.0
target_model: claude | gpt | gemini | deepseek
purpose: one-line description
last_updated: YYYY-MM-DD
---
```

### Versioning Rules

| Change type | Bump |
|---|---|
| Semantics unchanged, minor wording fix | patch |
| Structural adjustment | minor |
| Full rewrite | major |

### Prompt File Structure

Every prompt must contain these five sections: `role / task / input / output / constraints`.

Use declarative, deterministic language. No vague qualifiers or redundant descriptions.

### Target-Model Formatting

Apply only when the prompt is written *for an external model*:

- **Claude**: Markdown + lightweight XML tags
- **OpenAI GPT**: JSON-first structure
- **Gemini**: XML-first structure
- **DeepSeek**: Markdown-first structure

Prompts targeting Claude Code itself use plain Markdown — no XML wrapper.

## Workflow

1. **Scan first**: Before creating or editing, use Glob/Grep/Read to check existing prompts and context in `prompts/`.
2. **Deliver files, not conversations**: Final prompts are written to repository files. Terminal output is summary + file path + diff only.
3. **Do not commit or push** unless explicitly instructed.
4. **Self-check before writing**: verify structure completeness, no contradictory constraints, all code blocks closed.

## Output Variants

When generating new prompts, default to **2–3 strategic variants** unless a single version is requested:

- **Stable**: High consistency, low variance — production use.
- **Advanced**: Expression-first, higher creative latitude.
- **Minimal**: Lowest token cost.

## Risk Discipline

- Mark prompts touching factual claims, legal, or financial domains with 🔴 and flag for human review.
- When uncertainty is high, produce an "information requirements list" rather than guessing.
