// Behavioural check for the `over === null` reachable state.
// Extracted verbatim from the emitted bundle's two fixed sites
// (lib/client.js:1817-1818 and 1858-1859) plus their OLD upstream form.
const assert = require('node:assert')

// OLD (upstream buggy). Note: it does NOT throw at runtime — `undefined === id`
// is false, so the `&&` short-circuits before the deref. The defect is a TYPE
// error (TS18047), not a runtime crash.
const oldListStart = (workspaceDrag, g0) =>
  (g0 !== undefined && workspaceDrag?.over?.id === g0 && workspaceDrag.over.half === 'before')
const oldMarker = (workspaceDrag, wsId) =>
  (wsId !== undefined && workspaceDrag?.over?.id === wsId ? workspaceDrag.over.half : null)

// NEW (fixed) — hoist + explicit nullish guard.
const newListStart = (workspaceDrag, g0) => {
  const dragOver = workspaceDrag?.over
  return g0 !== undefined && dragOver !== undefined && dragOver !== null
    && dragOver.id === g0 && dragOver.half === 'before'
}
const newMarker = (workspaceDrag, wsId) => {
  const dragOver = workspaceDrag?.over
  return wsId !== undefined && dragOver !== undefined && dragOver !== null
    && dragOver.id === wsId ? dragOver.half : null
}

const WS = 'ws-1'
const started = { workspaceId: WS, over: null }          // drag started, nothing hovered
const hovered  = { workspaceId: WS, over: { id: WS, half: 'before' } }
const other    = { workspaceId: WS, over: { id: 'ws-2', half: 'after' } }

// THE reachable state: over === null must stay falsy / null
assert.strictEqual(newListStart(started, WS), false, 'over===null => falsy (no top indicator)')
assert.strictEqual(newListStart(started, undefined), false)
assert.strictEqual(newMarker(started, WS), null, 'over===null => null (no drop marker)')
assert.strictEqual(newMarker(started, undefined), null)

// Exact behavioural parity old vs new across every reachable state
const drags = [['started(over=null)', started], ['hovered', hovered],
               ['hovered-elsewhere', other], ['idle(null drag)', null]]
for (const [name, d] of drags) {
  for (const g0 of [WS, 'other', undefined]) {
    assert.strictEqual(newListStart(d, g0), oldListStart(d, g0), `listStart parity ${name}/${g0}`)
  }
  for (const id of [WS, 'other', undefined]) {
    assert.strictEqual(newMarker(d, id), oldMarker(d, id), `marker parity ${name}/${id}`)
  }
}

// and the positive cases actually do fire
assert.strictEqual(newListStart(hovered, WS), true)
assert.strictEqual(newListStart(hovered, 'other'), false)
assert.strictEqual(newMarker(hovered, WS), 'before')
assert.strictEqual(newMarker(hovered, 'other'), null)
// an `after`-half hover must NOT light the list-start indicator (half is checked)
assert.strictEqual(newListStart({ workspaceId: WS, over: { id: WS, half: 'after' } }, WS), false)

console.log('ok — over===null stays falsy/null; exact old/new parity across all states')
