# Security and responsible disclosure

DHRUVA is an independent agricultural information application under development. It is not an official advisory service or a substitute for qualified local agricultural advice.

## Report an issue privately

Use the repository's private vulnerability reporting feature if enabled, or contact the maintainers privately. Include the affected version or commit, a minimal reproduction using synthetic data, and the potential impact. Do not post active credentials, real location histories, personal data, or exploit details in a public issue.

## Development safeguards

- Keep server-side credentials in local ignored environment files or a trusted secret store, never in browser-exposed VITE_ variables. An ignore rule does not remove previously tracked files or history; revoke any exposed credential.
- Review Supabase access rules, database policies and MCP tool authorization before enabling integrations. A client-side key must not grant privileged access.
- Do not collect or retain precise location unnecessarily. Test using synthetic locations and respect permission denial.
- Validate third-party response formats, timestamps and units; distinguish missing or stale data from current readings.
- For fertilizer, disease and pesticide guidance, validate recommendations with qualified local advice, current product labels and official guidance. Do not present generated outputs as assured diagnoses or prescriptions.

## Release checks (proposed)

Before relying on a public release, verify dependency integrity, lint and build, authentication and authorization where applicable, permission handling, data freshness, and safe failure states. This checklist describes required review work, not completed certification.
