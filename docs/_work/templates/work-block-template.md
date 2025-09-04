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

### Completion Process
1. User explicitly approves closure
2. All changes committed to git
3. User confirms commit is satisfactory
4. Move entire block to COMPLETED_WORK_BLOCKS.md
5. Add completion metadata:
   ```
   **Completed**: YYYY-MM-DD HH:MM
   **Duration**: X hours/sessions
   **Outcome**: Success/Partial/Failed
   **Final Notes**: Key learnings or follow-up needed
   ```