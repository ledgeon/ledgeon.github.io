# termdo — budget

A clean, dark, monospace budgeting and planning tool. Single-file static site, no build step, no backend. Your data lives in the browser's localStorage on whatever device you use it on.

## Features

- **Track income** — sources with weekly / biweekly / monthly / yearly / one-time frequency
- **Track bills** — amounts, due dates, recurrence; auto-creates next instance when you mark one paid
- **Preset monthly bills** — one click adds common bills (rent, electric, gas, water, internet, phone, health insurance, car payment, car insurance, streaming) as blank entries; click "set amount" on each to fill in your real number
- **Edit anything** — click the `edit` button on any row to modify it
- **Tasks and schedule** — keep todos and events alongside the money
- **Overview tab** — does the budget math:
  - Monthly recurring income vs. monthly recurring bills → **net** (discretionary if positive, over budget if negative)
  - **Income breakdown** bar chart by source
  - **Bills breakdown** bar chart by category (only counts bills with an amount)
  - **Upcoming bills** in the next 14 days, with mark-paid buttons
- **Sortable** sheet view — click any column header to sort
- **Auto-save** to your browser. Export/Import JSON for backup.

## Math

Monthly equivalents:
- weekly × 4.33
- biweekly × 2.17 (≈ 26 paychecks/year ÷ 12)
- monthly × 1
- yearly ÷ 12
- one-time → 0 (visible in the table but doesn't recur)

Only **recurring** entries with an **amount > 0** count toward the monthly totals.

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `termdo`). Public is fine for free Pages hosting.
2. Upload all four files to the **root** of `main`:
   - `index.html`
   - `README.md`
   - `LICENSE`
   - `.nojekyll` *(empty file — disables Jekyll processing)*
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. Wait ~30 seconds. Visit `https://<your-username>.github.io/<repo-name>/`.

That's it. No build, no Node, no install. Edit `index.html` directly and push to update.

> Tip: If you don't see `.nojekyll` after dragging files in, GitHub may have hidden it. The drag-and-drop uploader sometimes drops dotfiles. If that happens, click **Add file → Create new file**, name it exactly `.nojekyll`, leave it empty, and commit.

## How saving works

This is a static site — there's no server, no account, no cloud sync. Your data is saved automatically to your browser's localStorage every time you make a change.

That means:
- ✅ Your data persists across refreshes and browser restarts.
- ✅ Nothing leaves your device. There's no privacy concern.
- ⚠️ Different browsers and devices each have their own copy. Use **Export JSON** in the `···` menu to back it up; **Import JSON** to restore or sync to another device.
- ⚠️ Clearing your browser data (or "Clear site data" for this domain) deletes everything.

For a real backup, periodically Export to JSON and stash the file somewhere safe.

## Customizing

It's one HTML file, ~1700 lines, with everything inline (CSS at the top, JS at the bottom). Open it in any editor:

- **Colors** are CSS variables at the top of the `<style>` block.
- **Preset bill list** is the `PRESET_BILLS` array near the top of the script — add or remove items there.
- **Monthly conversion** lives in `monthlyEquivalent()`.
- **Each tab** is a render function (`renderOverview`, `renderIncomeSheet`, `renderBillsSheet`, etc.).
- **Data shape** is documented next to `addIncome` / `addBill` / etc.

## Roadmap (where this can go)

- **Budget categories / envelopes** — group bills into Housing / Food / Subs / Insurance, set monthly targets, see variance
- **Savings goals** — set targets, track contributions, progress bars
- **Income/bill history** — track what was actually paid/received each month
- **Forecast view** — given today's balance and pattern, project N months out
- **Trends** — month-over-month charts
- **CSV import** for batch-loading bills

## License

MIT. See `LICENSE` for details.
