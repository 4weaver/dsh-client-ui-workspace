# dsh-client-ui-workspace — fork

Vendor fork of the official **`@deepseek-ai/dsh-client-ui-workspace`** package
(npm, `0.1.2-rc.1`), adding a **fork-tree view** to the grouped sidebar browser.

## Why a fork

Upstream rc.1 deliberately flattens every session — fork children included — to
a top-level row ("no parent/child adjacency"); `deriveFlat`/`deriveGroups` say so
explicitly. There is no per-row slot in the sidebar browser to hook, so the only
way to get a tree is to replace the `sidebar.workspaces` occupant itself.

## What changed

`patches/0001-fork-tree-view.patch` — 4 files, `+309/−48`, all inside
`packages/client/ui-workspace`:

- `src/client/tree.ts` (+86) — `deriveGroupForest()` nests a visible human
  session under its human parent. **Additive**: `deriveFlat`, `deriveGroups` and
  `search` are untouched, and subagent-origin sessions stay hidden (their
  activity still surfaces as a count on the nearest ancestor).
- `src/client/rows/Rows.tsx` (+73) — `SessionTreeNodeItem` recurses rows under a
  caret + guide line, reusing the official pure row component `SessionNodeItem`.
- `src/client/rows/WorkspaceBrowser.tsx` (±150) — `forests` memo; expanded groups
  render forest roots (drag on roots only), collapsed groups keep the official
  flat preview + overflow button. Flat ("In one list") and search views untouched.
- `src/client/rows/Rows.module.css` (+48) — indent / caret / guide-line styling
  using `dsw` design tokens.

## Upstream provenance

- Repo: https://github.com/deepseek-ai/deepseek-harness
- Base tag: `dsh-v0.1.2-rc.1`
- Base commit: `a66e470204` (release(dsh): 0.1.2-rc.1)
- Development branch: `forktree/dev` @ `2c9f575399`
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
