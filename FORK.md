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

`patches/0001-fork-tree-view.patch` — 6 files (`+747/−29`), all inside
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
consumers (Nix) need no JS toolchain. It is built by this repository's own
fork-local preset (`build/client-bundle.ts`, see the Plan A section below) — no
monorepo checkout is needed. The bundle inlines `ui-primitives` icons and emits
the closure factory:

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

### Fork-local build preset (Plan A)

`tsdown.config.ts` no longer imports the monorepo's `../tsdown.client.ts`. The
fork carries its own preset so a build sources **only** this repository:

| file | origin | why a copy |
| --- | --- | --- |
| `build/client-bundle.ts` | `packages/client/tsdown.client.ts` | the preset itself; `REPOSITORY_ROOT` / `browserSourcePath` / `workspaceManifest` re-derived for a flat repo |
| `build/client-build-environment.ts` | `scripts/client-build-environment.ts` (copied **wholesale**, 393 lines) | `scripts/` has no `package.json` and is published as no package; the consumed `clientBuildEnvironmentDefines` threads into module-private `clientBuildEnvironment`, so a partial copy would not be self-contained |
| `build/optional-string-array.ts` | `packages/client/modules/src/client/manifest.ts` lines 130-146 | `optionalStringArray` is defined in the published node half but absent from its export list, so no import path reaches it |

Only `PLATFORM_MODULES` / `PRELOADED_CLIENT_EXTERNALS` come from a real
dependency: the published `@deepseek-ai/dsh-client-web`, whose `lib/index.js:283`
exports both.

**These three files are FORK COPIES, not dependencies.** On every upstream rc
bump they must be re-diffed against their sources; each carries a header naming
its origin, the base tag, and its rebase obligation. Search for `FORK PLAN A`
to list every deliberate divergence in `build/client-bundle.ts` (40 code lines).

Build with this repo alone:

```bash
npm install --legacy-peer-deps   # MANDATORY on npm 10.9.8 (plain install crashes
                                 # the arborist on tsdown's optional peer)
npm run build:types              # tsc, HARD GATE: --noEmitOnError
npx tsdown --config-loader unrun # emits lib/client.js, id dsh-client-ui-forkspace
```

`build:types` passes `--noEmitOnError` **on purpose**. `tsc` defaults to
`noEmitOnError: false`, so without the flag a type error still exits 2 while
emitting the JS — tsdown then bundles the broken output and the error is
swallowed. The flag makes the type step fail without emitting, and `bundle`
(`build:types && tsdown`) stops if it fails.


## Rebasing on an rc bump

```bash
git checkout -b rebase/<new-tag> <new-tag>
git apply patches/0001-fork-tree-view.patch   # expect conflicts if upstream touched the browser
# rebuild lib/ with the new tag's toolchain, commit
```

`patches/0001-fork-tree-view.patch` carries a small **deliberate divergence
from upstream** in `src/client/rows/WorkspaceBrowser.tsx`: the two `workspaceDrag`
drop-marker sites hoist `const dragOver = workspaceDrag?.over` and guard it with an
explicit `dragOver !== undefined && dragOver !== null` before reading `.id` /
`.half`.

Why: `over` is `{ id, half } | null`, and the original upstream expression
`workspaceDrag?.over?.id === X && workspaceDrag.over.half === Y` does **not**
narrow — the left operand of `&&` is `boolean | undefined`, not a type predicate,
so `TS18047: 'workspaceDrag.over' is possibly 'null'` fires under `strict`.
Upstream's monorepo masks this because it type-checks the package through
`paths`-based **source** resolution; this fork resolves the same dependencies as
real npm packages, which exposes it. Upstream CI is green and this fork's
standalone `tsc` was not. `over === null` is a real reachable state (set on drag
start, before any target is hovered) and must stay falsy — the guard preserves
that exactly.

**On a rebase, keep this fix** (the patch reapplies it). Drop it only if upstream
has fixed the narrowing itself.
A runnable check guards the behaviour: `node tests/workspace-drop-marker-over-null.cjs`
asserts `over === null` stays falsy/null and that the fixed expressions are
`===` the old ones across every reachable drag state (idle, started-but-nothing-
hovered, hovered-here, hovered-elsewhere).


## Credits

Fork-tree design and the surrounding plugin work in the parent project.
Upstream `ui-workspace` © DeepSeek, MIT.
