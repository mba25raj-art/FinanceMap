# Lesson authoring

Each `Dxx.lesson` file has one record for each original topic in that domain, in the master atlas's stable ordinal order. The compiler requires the exact count before writing any browser content.

Eight-field records use:

`meaning | mechanism | example | misconception | question | right answer | distractor | distractor`

Six-field records use:

`meaning and mechanics | example | question | right answer | distractor | distractor`

The shorter format uses the explicitly labelled domain guide for wider analytical context and cautions. It does not invent a topic-specific explanation from the title. Each meaning, case, question, and distractor is authored in the record.

`quiz-prompts.json` supplies self-contained assessment prompts where the quiz needs additional case inputs. `quiz-feedback.json` supplies explicit calculations when assessment inputs differ from the study example. Correct-answer positions rotate across records. The 20 atomic anchors retain their expanded core explanations.

Run `npm run prepare:content` after changes. Review the compiled lesson, example, question, assumptions, and answer together. `npm run test:content` checks all 698 records, independent numerical answers, and rendered unanswered/correct/retry states. These checks do not replace financial editorial review or browser interaction testing.

The original atlas remains the topology source. `lesson-coverage.json` records current website coverage; the atlas's historical authoring-status fields are not used as the site's current lesson status.
