# Documentation Maintenance Guide

## Purpose
This guide ensures consistent documentation organization and prevents future clutter in the repository root.

## Critical Rules

### 📁 File Organization
- **ONLY** `README.md` stays in repository root
- **ALL** other `.md` files belong in `/docs/` subdirectories
- **NEVER** create new `.md` files in repository root

### 🗂️ Directory Structure

```
docs/
├── overview/          # High-level app docs (APP_OVERVIEW.md)
├── setup/            # Setup/run/deploy instructions (SETUP.md)
├── architecture/     # Routing, data flow, i18n architecture (future)
├── features/         # Feature implementation notes
│   ├── branding/     # Band branding & poster skins
│   ├── sharing/      # Share panel & QR codes
│   ├── templates/    # Gig pack templates
│   ├── rehearsal/    # Stage view & rehearsal mode
│   └── setlists/     # Setlist management & PDFs
├── design/           # Design system, UI decisions, design summaries
├── i18n/             # Translation/RTL notes
├── ops/              # Checklists, preflight, release process
│   └── DOCUMENTATION-MAINTENANCE.md (this file)
├── debug/            # Debug notes, investigations
└── changelog/        # Version history & release notes
```

## How to Add New Documentation

### 1. Determine the Category
- **Feature Implementation**: `/docs/features/[feature-name]/`
- **Design Decisions**: `/docs/design/`
- **Setup/Deployment**: `/docs/setup/` or `/docs/ops/`
- **Debugging**: `/docs/debug/`
- **Internationalization**: `/docs/i18n/`
- **Architecture**: `/docs/architecture/` (if created)

### 2. Create the File
```bash
# Example: New feature documentation
touch docs/features/new-feature/NEW-FEATURE-IMPLEMENTATION.md
```

### 3. Update Links
- Add links to the new documentation in `README.md`
- Update any related documentation files
- Ensure cross-references use relative paths

### 4. Follow Naming Conventions
- Use `UPPER_CASE_WITH_DASHES.md` format
- Include "IMPLEMENTATION.md" for feature docs
- Include "SUMMARY.md" for design/architecture docs

## Maintenance Checklist

### Automated Verification
Run the documentation organization check script:
```bash
./scripts/check-docs-organization.sh
```
This will automatically verify that all `.md` files are properly organized.

### Monthly Review
- [ ] Run `./scripts/check-docs-organization.sh` to verify organization
- [ ] Check for any `.md` files in repository root (should only be `README.md`)
- [ ] Verify all docs are properly categorized in `/docs/`
- [ ] Update `README.md` links if structure changes
- [ ] Ensure cross-references still work

### When Adding Features
- [ ] Create appropriate subdirectory in `/docs/features/`
- [ ] Add implementation documentation
- [ ] Update feature list in `README.md`
- [ ] Add links to related design/architecture docs

### When Refactoring
- [ ] Move existing docs if categories change
- [ ] Update all internal links
- [ ] Update `README.md` navigation
- [ ] Test that all links still work

## Enforcement

### For AI Agents
- Rules are defined in `.cursor/rules/agentrules.mdc`
- Always check existing structure before creating new docs
- Follow the established naming and organization patterns

### For Human Developers
- This guide serves as the single source of truth
- Reference this when creating new documentation
- Update this guide if the structure needs to evolve

## History

- **2025-12-12**: Initial organization completed
- **2025-12-12**: Documentation maintenance guide created
- **Future**: Update as structure evolves

---

## Emergency Recovery

If documentation gets disorganized again:

1. **Identify misplaced files**: `find . -name "*.md" -not -path "./docs/*" -not -path "./README.md"`
2. **Move to appropriate locations**: Follow the directory structure above
3. **Update links**: Fix any broken references
4. **Update README.md**: Ensure navigation reflects new structure

---

**Last Updated**: December 12, 2025
**Maintained by**: Documentation Maintenance Guide
