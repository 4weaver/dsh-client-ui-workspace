# dsh-client-ui-workspace — fork

Vendor fork of the official **`@deepseek-ai/dsh-client-ui-workspace`** package
(npm, `0.1.2-rc.1`), adding a **fork-tree view** to the grouped sidebar browser.

## Why a fork

Upstream rc.1 deliberately flattens every session — fork children included — to
a top-level row ("no parent/child adjacency"); `deriveFlat`/`deriveGroups` say so
explicitly. There is no per-row slot in the sidebar browser to hook, so the only
way to get a tree is to replace the `sidebar.workspaces` occupant itself.

## What changed

`patches/0001-fork-tree-view.patch` — 6 files (`+376/−16`), all inside
`packages/client/ui-workspace`:

- `src/client/tree.ts` (+119) — `deriveGroupForest()` + `SessionTreeNode` nest a
  visible human session under its nearest visible human ancestor. **Additive**:
  `deriveFlat`, `deriveGroups` and `deriveSearchResults` are untouched, and
  subagent-origin sessions stay hidden (their activity still surfaces as a count
  on the nearest ancestor). `forest` is gated on the group's `expanded` flag, so
  a folded group still shows no sessions (the upstream contract).
- `src/client/rows/Rows.tsx` (+103) — the chevron is the row's **first child
  inside the existing `.sessionRow`** (reusing the official 16px `.slot` and
  `.arrow`), mirroring how `ProjectRowItem` does it. `SessionNodeItem` gained
  optional `children` / `depth` / `treeCollapsed` / `onToggleTree` props and a
  thin recursive `SessionTreeNodeItem`. No wrapper element around the row.
- `src/client/rows/WorkspaceBrowser.tsx` (+108) — `forests` memo (rendering
  only; `groups[].sessions` stays authoritative for drag and overflow),
  `collapsedForestRows` / `countForestRows` preview budget counted over TOTAL
  rows (root + descendants, depth-first, limit 5), and per-row fold state.
- `src/client/rows/Rows.module.css` (+5) — `.forkSlot` (chevron colour/cursor)
  and `.forkChild { display: block; padding-left: var(--fork-indent, 16px) }`.
  Block level is load-bearing (an inline wrapper does not inset the row's
  content box). Pure indentation, no rail / border-left.
- `src/client/locales.ts` (+4) — `sessions.twist.expand` / `.collapse` (zh + en).
- `tests/workspace-browser.client.spec.tsx` — nesting + total-row preview budget.

## Upstream provenance

- Repo: https://github.com/deepseek-ai/deepseek-harness
- Base tag: `dsh-v0.1.2-rc.1`
- Base commit: `a66e470204` (release(dsh): 0.1.2-rc.1)
- Development branch: `forktree/dev` @ `de001cb4ba` (on top of `a66e470204`)
- License: MIT (upstream `LICENSE` retained)

## How `lib/` is produced

`lib/` is the client-face **tsdown** bundle and is **committed on purpose**, so
consumers (Nix) need no JS toolchain. It must be built with the monorepo
toolchain, because the client bundle inlines `ui-primitives` icons and emits the
closure factory:

```
window.__ModuleLoader__.load({ id: "@deepseek-ai/dsh-client-ui-workspace", factory: ... })
```

The module id must stay the official scoped name — it is the boot-graph key that
replaces the official package.

Build (from a monorepo checkout on this commit's src):

```bash
bash node_modules/.bin/tsdown        # in the monorepo package dir
cp lib/client.js lib/index.js <fork>/lib/
```

## Rebasing on an rc bump

```bash
git checkout -b rebase/<new-tag> <new-tag>
git apply patches/0001-fork-tree-view.patch   # expect conflicts if upstream touched the browser
# rebuild lib/ with the new tag's toolchain, commit
```

## Credits

Fork-tree design and the surrounding plugin work in the parent project.
Upstream `ui-workspace` © DeepSeek, MIT.
