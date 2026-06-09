---
title: Security Policy
doc_type: workflow
module: project-root
topic: security-policy
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---

# Security Policy

## Scope

This repository is a mixed project for ecommerce analytics, Data Agent prototyping, Skills, reference knowledge, and workflow documentation.

Security policy applies to:

- Project source code and scripts under `main_project_lute/`
- Skills and skill indexes under `skills/`, `.agents/skills/`, `.claude/skills/`, and `.cursor/skills/`
- Configuration templates such as `.env.example`
- Project documentation that describes operational, data, or security behavior

Security policy does not treat the following as actively maintained runtime assets:

- `archive/` historical materials
- `tmp/` disposable outputs
- Local virtual environments such as `.venv/`
- Third-party tool source under `tools/`, except for project-specific integration notes

## Supported Versions

This project does not currently publish versioned releases.

Only the current working project state is maintained. Historical snapshots, archived documents, and generated experiment outputs are retained for reference, not for security support.

## Sensitive Data Rules

Do not commit:

- API keys, tokens, passwords, cookies, or private certificates
- Filled `.env` files
- Customer personally identifiable information
- Raw production data that is not explicitly approved for this repository
- Private audio, screenshots, exports, or debug logs containing credentials or customer data

Use `.env.example` for configuration examples. Keep real secrets in the local environment or a dedicated secret manager.

## Reporting a Vulnerability

Report suspected vulnerabilities through the current private project collaboration channel or directly to the project owner.

Include:

- Affected path or component
- Reproduction steps
- Impact assessment
- Relevant logs or screenshots with secrets removed
- Suggested mitigation if known

Do not publish exploit details publicly before the issue is triaged.

## Triage Priorities

| Severity | Examples | Expected handling |
|---|---|---|
| Critical | Exposed credentials, arbitrary code execution, production data leak | Stop affected workflow, rotate credentials if needed, patch before further use |
| High | Unsafe file writes, path traversal, privilege escalation, secret leakage through logs | Patch promptly and add a regression check where practical |
| Medium | Incorrect access assumptions, unsafe defaults, missing validation on local tools | Fix in the next maintenance pass |
| Low | Documentation ambiguity, non-sensitive metadata leakage, hardening suggestions | Track and address during documentation or structure cleanup |

## Dependency and Tooling Notes

- Rebuild local Python environments from documented instructions instead of committing `.venv/`.
- Keep generated outputs in `tmp/` unless they are intentionally promoted to formal project assets.
- For third-party tools under `tools/`, report upstream vulnerabilities to the upstream project unless the issue is caused by this repository's integration.

## Security Review Checklist

Before committing or publishing project changes, check:

- No real secrets are present in tracked files.
- No generated `tmp/`, `.venv/`, cache, or debug output is promoted accidentally.
- New scripts do not silently swallow failures.
- New documentation does not expose private URLs, tokens, customer data, or internal-only credentials.
- Any security-sensitive change has a clear rollback path.
