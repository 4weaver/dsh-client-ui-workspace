// FORK PLAN A: the local preset, not the monorepo's.
// Upstream was `import { clientBundle } from '../tsdown.client.ts'` — a path
// that only resolves inside the monorepo tree, which is exactly the coupling
// this preset removes.
import { clientBundle, localManifest } from './build/client-bundle.ts'

// `localManifest` reads this repository's own package.json (single-package
// layout) instead of globbing `packages/*/*/package.json`. `lib/types/index.js`
// is the Node-half entry; the client half is built from `src/client/index.ts`
// because this repo commits only `lib/types/**/*.d.ts`, never emitted JS.
export default clientBundle('dsh-client-ui-forkspace', ['lib/types/index.js'], {
  locateManifest: localManifest,
})
