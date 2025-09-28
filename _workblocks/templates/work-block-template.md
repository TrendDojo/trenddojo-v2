<!-- Template: _shared-framework/templates/work-block-template.md v1.0 -->
<!-- Usage: Copy this template for new work blocks across all projects -->

## WB-YYYY-MM-DD-NNN: Brief Description
**State**: considering | confirmed | doing | blocked | completed | cancelled
**Timeframe**: NOW | NEXT | LATER | UNSPECIFIED  
**Created**: YYYY-MM-DD HH:MM
**Dependencies**: WB-IDs or None
**Tags**: #area #type #component

### Goal
Clear description of what success looks like. Be specific and measurable.

### Pre-Work Solution Check (MANDATORY)
**Before starting any work:**
- [ ] Read `_shared-framework/news/controlla-solutions.md` - Has Controlla solved this?
- [ ] Check `_shared-framework/proven-solutions/` - Does a solution already exist?
- [ ] Document findings: [What existing solutions were found or confirmed none exist]

### Tasks
- [ ] Specific task with clear completion criteria
- [ ] Another task
- [x] Completed task (example)

### Success Criteria
- Concrete, testable outcomes
- Specific metrics or deliverables
- Clear definition of "done"

### Notes
- Decisions made during implementation
- Problems encountered and solutions
- Important context for future work
- Links to relevant documentation or resources

---

### State Definitions
- **considering**: Evaluating feasibility/approach
- **confirmed**: Approved and ready to start
- **doing**: Actively being worked on (limit: ONE per agent)
- **blocked**: Waiting on dependency or decision
- **completed**: Successfully finished (move to COMPLETED file)
- **cancelled**: Won't be done (move to COMPLETED with reason)

### Project Boundary Rules
- **ONLY MODIFY FILES WITHIN THIS PROJECT DIRECTORY**
- You may READ from other projects for reference
- NEVER edit files in other projects without explicit user permission
- If cross-project changes are needed, ask user first

### Completion Process
1. **Infrastructure Solution Sharing (if applicable)**:
   - [ ] Did I solve an infrastructure problem? (auth, email, deployment, testing, error handling)
   - [ ] If yes: Document solution in `_shared-framework/proven-solutions/`
   - [ ] If yes: Update `_shared-framework/news/trenddojo-solutions.md` to notify other projects
   - [ ] Document: [What was shared or confirmed nothing to share]

2. User explicitly approves closure
3. All changes committed to git
4. User confirms commit is satisfactory
5. Move entire block to COMPLETED_WORK_BLOCKS.md
6. Add completion metadata:
   ```
   **Completed**: YYYY-MM-DD HH:MM
   **Duration**: X hours/sessions
   **Outcome**: Success/Partial/Failed
   **Final Notes**: Key learnings or follow-up needed
   **Solutions Shared**: [None | Brief description of what was documented/shared]
   ```