# dsh-client-ui-forkspace — fork

Vendor fork of the official **`@deepseek-ai/dsh-client-ui-workspace`** package
(npm, `0.1.2-rc.1`), published under its own name **`dsh-client-ui-forkspace`**,
adding a **fork-tree view** to the grouped sidebar browser.

## Why a fork

Upstream rc.1 deliberately flattens every session — fork children included — to
a top-level row ("no parent/child adjacency"); `deriveFlat`/`deriveGroups` say so
explicitly. There is no per-row slot in the sidebar browser to hook, so the only
way to get a tree is to replace the `sidebar.workspaces` occupant itself.

## What changed

`patches/0001-fork-tree-view.patch` — 6 files (`+672/−25`), all inside
`packages/client/ui-workspace`:

- `src/client/tree.ts` (+119) — `deriveGroupForest()` + `SessionTreeNode` nest a
  visible human session under its nearest visible human ancestor. **Additive**:
  `deriveFlat`, `deriveGroups` and `deriveSearchResults` are untouched, and
  subagent-origin sessions stay hidden (their activity still surfaces as a count
  on the nearest ancestor). `forest` is gated on the group's `expanded` flag, so
  a folded group still shows no sessions (the upstream contract).
- `src/client/rows/Rows.tsx` — the whole row is the tree's click target: it
  opens the session and toggles that row's branch, **except** on the row that
  IS the current session (`node.id === currentId`), where a click only opens
  it — navigating back to the session you are already in must not fold the
  branch under it. Every other row keeps open + toggle. The disclosure
  triangle is the explicit fold/unfold hit area: its `<span>` has a
  `stopPropagation` `onClick` that calls `onToggleTree`, so it folds without
  opening. It stays a `<span>` — **not** a nested `<button>` (no `tabIndex`,
  a plain `<span class="slot chevron">` around `IconTriangleRightFill14` with
  `.arrow` / `.arrowOpen` — and it **is** the row's status indicator: ONE
  leading slot, so the title offset stays at the official 22px and the arrow
  replaces `SessionStatusDots` (amber pending, blue + breathe running, green
  finished-but-unviewed, red error, caption grey otherwise) rather than sharing
  its cell. A width-only `.forkIndent` block on the row itself carries nesting,
  keeping the row a full-width flex child. `SessionNodeItem` gained optional
  `children` / `depth` / `treeCollapsed` / `onToggleTree`;
  `SessionTreeNodeItem` renders the subtree,
  `.forkIndent` block on the row itself carries nesting, keeping the row a
  full-width flex child. `SessionNodeItem` gained optional `children` / `depth` /
  `treeCollapsed` / `onToggleTree`; `SessionTreeNodeItem` renders the subtree,
  taking one `foldedIds` set (budget-clipped ∪ user-folded rows).
- `src/client/rows/WorkspaceBrowser.tsx` (+140) — `forests` memo (rendering
  only; `groups[].sessions` stays authoritative for drag and overflow),
  `collapsedForestRows` / `countForestRows` preview budget counted over TOTAL
  rows (root + descendants, depth-first, limit 5), per-row fold state, and one
  effect that unfolds every ancestor of the selected session. That effect
  clears the user's manual fold ONLY: budget-clipped rows never enter
  `collapsedTreeRows`, so a handful of pixels never force-expands a truncated
  subtree.
- `src/client/rows/Rows.module.css` — `.forkIndent` (width-only indent, no
  rail), plus the `.forkTwist*` state colours and the `fork-twist-breathe`
  opacity keyframes that make the triangle a status indicator (rotation stays
  reserved for `expanded`; `prefers-reduced-motion: reduce` disables the
  breathe). Pure indentation, no border-left.
- `tests/workspace-browser.client.spec.tsx` — nesting, whole-row click,
  selection auto-expand, total-row preview budget.

## Upstream provenance

- Repo: https://github.com/deepseek-ai/deepseek-harness
- Base tag: `dsh-v0.1.2-rc.1`
- Base commit: `a66e470204` (release(dsh): 0.1.2-rc.1)
- Development branch: `forktree/dev` @ `a1b78faec8` (on top of `a66e470204`)
- License: MIT (upstream `LICENSE` retained)

## How `lib/` is produced

`lib/` is the client-face **tsdown** bundle and is **committed on purpose**, so
consumers (Nix) need no JS toolchain. It must be built with the monorepo
toolchain, because the client bundle inlines `ui-primitives` icons and emits the
closure factory:

```
window.__ModuleLoader__.load({ id: "dsh-client-ui-forkspace", factory: ... })
```

The module id is this fork's **own** package name. The host Loader resolves the
entry by that name and the browser boot matches the loaded bundle's registration
id against the row, so the id and the mounted package name must agree. The fork no
longer shadows the official package by wearing its name: dsh-flake **disables the
official `id: ui-workspace` Loader row** and mounts this package (via `devMounts`
in the dev variant) instead. What keeps the downstream consumers working is the
preserved **slot names** (`sidebar.workspaces`, `conversation.hero.workspace` and
their `*.directoryFlow` children) and the preserved **cordis service name**
`uiWorkspace` — nothing about the package name reaches either contract.

Build (from a monorepo checkout on this commit's src):

```bash
bash node_modules/.bin/tsdown        # in the monorepo package dir
cp lib/client.js lib/index.js <fork>/lib/
```

The monorepo's `packages/client/tsdown.client.ts` aliases this fork's build name
onto the `ui-workspace` workspace manifest (no workspace package is named
`dsh-client-ui-forkspace`), so tsdown stamps the fork id while still reading that
manifest's production sections.

## Rebasing on an rc bump

```bash
git checkout -b rebase/<new-tag> <new-tag>
git apply patches/0001-fork-tree-view.patch   # expect conflicts if upstream touched the browser
# rebuild lib/ with the new tag's toolchain, commit
```

## Credits

Fork-tree design and the surrounding plugin work in the parent project.
Upstream `ui-workspace` © DeepSeek, MIT.
