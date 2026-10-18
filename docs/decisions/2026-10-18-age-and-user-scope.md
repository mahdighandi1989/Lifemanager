# Age, date of birth and per-user scope (owner request 2026-10-18) — findings + decided plan

## Findings (read-only investigation, file:line in the session report)
- Registration (`app/schemas/auth.py` UserCreate, `Register.jsx`) has no birth date; `users` has no birth column.
- A birth date exists in the owner-identity store («من که هستم», `owner_identity_fields`, `/api/identity-profile`, editable, age derived).
  The learning page never reads it.
- The learning page asks for the birth date only in the mind card «📐 سنجشِ استاندارد» (a34_psy.js) and the assistant action `birth`; it is
  stored in `settings.profile.birth` of the page's app records.
- **Scope defect:** every approved Google-OAuth account resolves to the shared scope `user_id 0` (`app/dependencies/auth.py` `_resolve_data_scope_user_id`).
  A second Google user would share the owner's settings, birth date, mind card and answers. Local password accounts get their own id.
- Assistant and coach do not adapt to age (register follows the user's pronoun; the teacher frame follows mention of a child).
- Norms: MaRs-IB adult bands 18–74 only (69 people aged 50+). No band under 18. When age is missing, the fallback is N(0,1) with a wrong label
  (the source does have age bands). No inflating wording or rounding up found.
- Scenarios: all 38 state an age in the persona text; 8 are under 18 and 4 are 58+.

## Decided plan (after the round-21 merge, as its own package; reversible, behaviour-preserving)
1. Scope first (no new user may ever see the owner's data). The owner's existing scope stays exactly where it is (shared scope 0 = his data).
   Every OTHER approved OAuth account gets its own `users.id` scope (dual path behind the existing resolver, a flag, tests). Cross-area
   ("app", urgent/general): recorded with handoff.py.
2. One birth date per user: optional date-of-birth field at registration and in the profile, with a plain sentence on what it is used for.
   Stored in the owner-identity store (`date_of_birth`, per user_id). The learning page reads it from there, and writes the page's own
   `settings.profile.birth` back to the same store. Existing values are kept (fill-empty migration both ways).
3. The learning page asks for the exact birth date before the mind card comparison and before age-dependent coaching if it is missing. Age is
   always computed from the date, never stored as a number.
4. Age-appropriate conversation from child to elderly. The Pólya logic and the tunnels are unchanged. Only language, examples, step size, tone,
   safety (minors) and register change, derived from the computed age. Adults keep the pronoun rule.
5. Mind card: compare only with the person's own age band, with the source named. Where no valid norm exists (under 18; thin 50+ cells), say
   so plainly and show only her own trend. No invented numbers, no encouragement. Fix the missing-age fallback: it should ask for the birth
   date, not show N(0,1) with a wrong label. Look for published child/adolescent norms (e.g. the MaRs-IB adolescent data, Chierchia 2019,
   11–33). Use them only if their method matches.
6. Tours: add age scenarios across topics and ages (child ~9 math, adolescent study decision, elderly health plan, …). Judge tone, engagement
   and real arrival at the result, plus the age-band mind card. Then re-run the existing scenarios for regressions.
