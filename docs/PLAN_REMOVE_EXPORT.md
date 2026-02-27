# Plan: Remove On-Site Submission Export

## Goal
Remove the "Download Submissions (XLSX)" button and related frontend storage logic. Submissions will now be managed exclusively through the Web3Forms dashboard as requested by the user.

## Proposed Changes

### [Component: index.html]
- **File:** `index.html`
  - Remove the "Download Submissions (.xlsx)" button from the footer/bottom area.
  - Remove the external SheetJS (`xlsx.full.min.js`) script tag.

### [Component: js/form.js]
- **File:** `js/form.js`
  - Remove `saveSubmission()` function and its call in `handleSubmit()`.
  - Remove `exportSubmissionsToExcel()` function.
  - Remove `SUBMISSIONS_KEY` and related storage logic to prevent cluttering user's `localStorage`.

### [Component: Documentation]
- **File:** `README.md`
  - Remove instructions regarding the on-site Excel download feature.
  - Add/Refine instructions on how to export submissions from the Web3Forms dashboard.

## Orchestration Strategy

### Phase 1: Planning (Current)
- [x] Initial plan created.
- [ ] User approval for the removal strategy.

### Phase 2: Implementation
1. **Core:** `frontend-specialist` will remove the HTML and JS components.
2. **Docs:** `documentation-writer` will update the README.
3. **Verification:** `test-engineer` will confirm the button is gone and the site still functions correctly.

## Verification Plan
### Manual Verification
- Visual inspection of the footer to confirm the button is removed.
- Form submission test to ensure it still redirects correctly without the local storage overhead.
- Verify README contains Web3Forms dashboard export instructions.
