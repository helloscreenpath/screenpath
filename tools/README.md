# ScreenPath build tools

These files are not part of the website. They generate the shared pages so every page keeps the same navigation bar, layout, and footer.

## What it builds

`build.py` writes these pages in the main folder:

1. index.html (homepage)
2. escape-rooms.html, arcade.html, skill-drills.html (category pages)
3. the-school.html, doctors-visit.html, grocery-store.html (escape room pages)
4. form-lab.html
5. teachers.html (For Teachers, including the FAQ)
6. about.html
7. feedback.html
8. progress.html (My Progress, using the files in `src`)

Activity pages, such as the missions, games, and forms, are edited directly and are not touched by this script.

## How to run it

From the main folder of the repository:

```
python3 tools/build.py
```

It prints `built` when it finishes. Review the changed pages before publishing.

## Where to change things

1. **Homepage card text:** the `CATS` list near the top of `build.py`.
2. **Adding a form to Form Lab:** the `FL_YOUNGER` and `FL_HIGH` lists. New forms are accessible only; only the rental and MoyCheese forms have a Not Accessible version.
3. **Teacher FAQ:** the `FAQ` list. Each entry is a question and its answer paragraphs.
4. **My Progress script and styles:** `src/progress-final.js` and `src/progress-final.css`.

## House rules

1. No em dashes anywhere.
2. No landmarks or regions beyond the navigation bar and main content.
3. True heading order on every page.
4. Links come first in list items.
5. Decorative images use empty alt text.
6. Descriptions on the homepage and For Teachers page stay general, so adding an activity never requires editing them.
7. Every label and its value go on one line as their own paragraph, for example "Department: Administration", so screen reader users can arrow through details one at a time.
8. Focus never jumps on its own. It stays on Start after the clock starts and on Submit after an answer. Focus moves only into a pop-up, or when the student chooses to move on.
9. No computer voice speaks on its own. The student's screen reader does the speaking. A narration button the student presses, such as Play Scene, is fine.
10. Hints use screen reader terms and never name keys, so they work with any screen reader. Offer them after two misses, and save how many were used.
11. Results appear once, at the end of an escape room, with Email Results, Copy Results, and Skip.
12. When the clock runs out, offer both choices: continue in Practice mode, or try again in Challenge mode.
13. Anything a student must remember to finish, such as a code or a clue, opens in a pop-up and can be opened again.
