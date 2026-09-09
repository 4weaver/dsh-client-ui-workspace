/**
 * Bundle contract check — the smallest thing that fails if the fork's built
 * artifact stops being a drop-in replacement for the official package.
 *
 * It asserts the three properties the dsh client boot graph depends on:
 *   1. the bundle is a window.__ModuleLoader__ closure-factory registration
 *   2. its module id is EXACTLY the official scoped name (the boot-graph key
 *      that lets this package shadow the official one)
 *   3. the fork-tree code is actually inside it (not a stale pre-fork build)
 *
 * Run: node tests/test-bundle-contract.cjs
 */
const assert = require('node:assert')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const SRC = readFileSync(join(__dirname, '..', 'lib', 'client.js'), 'utf8')

let registered = null
global.window = {
  __ModuleLoader__: { load: (options) => { registered = options } },
}
new Function(SRC)()

assert.ok(registered, 'lib/client.js must call window.__ModuleLoader__.load')
assert.strictEqual(
  registered.id, '@deepseek-ai/dsh-client-ui-workspace',
  'module id must stay the official scoped name (boot-graph replacement key)',
)
assert.strictEqual(typeof registered.factory, 'function', 'factory must be a function')

// the fork must actually be present, not a stale upstream build
assert.match(SRC, /deriveGroupForest/, 'fork-tree tree derivation missing from bundle')
assert.match(SRC, /SessionTreeNodeItem/, 'fork-tree row component missing from bundle')
// arrow parity with the official project row: plain 16px slot span + .chevron
// tint + rotating .arrow, no button chrome and no extra width-consuming class
assert.match(SRC, /forkIndent\{width:var\(--fork-indent/, 'row-level indent rule missing from bundle')
assert.match(SRC, /forkTwist>svg\{margin-right:-6px\}/, 'shared status-slot chevron rule missing from bundle')
assert.match(SRC, /_chevron[^"']*forkTwist/, 'chevron must keep the official .chevron colour class')
assert.ok(!/forkSlot/.test(SRC), 'the old width-adding forkSlot must be gone')

// upstream behaviour that must never be lost
assert.match(SRC, /deriveFlat/, 'upstream deriveFlat must survive')
assert.match(SRC, /deriveGroups/, 'upstream deriveGroups must survive')

console.log('ok — bundle contract holds (official id, fork tree present, upstream intact)')
