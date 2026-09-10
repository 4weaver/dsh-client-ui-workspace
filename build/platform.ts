/**
 * FORK-LOCAL COPY of the upstream monorepo's shared platform module list.
 *
 * Source:   packages/client/web/src/platform.ts  (20 lines, copied WHOLESALE —
 *           including the `PlatformModule` type — so this stays diffable
 *           against upstream)
 * Upstream: https://github.com/deepseek-ai/deepseek-harness
 * Base tag: dsh-v0.1.2-rc.1   (base commit a66e470204)
 *
 * WHY THIS IS COPIED RATHER THAN TAKEN FROM THE PUBLISHED PACKAGE
 * `@deepseek-ai/dsh-client-web@0.1.2-rc.1` DOES export both constants from its
 * node face (`lib/index.js:283`). But that module is NOT LOADABLE by a config
 * loader, so the export is unreachable in practice:
 *
 *   - it carries module-level CSS imports (`./boot-page.module.css` at :4 and
 *     `./base.css` at :12). Bare Node, and therefore tsdown's config loader,
 *     dies with `Unknown file extension ".css"` before any export is bound.
 *     The fork's own lightningcss virtual-module plugin runs at BUNDLE time,
 *     far too late to help load the config.
 *   - it eagerly imports its whole peer graph: @deepseek-ai/cordis,
 *     @deepseek-ai/cordis-plugin-loader, react, react/jsx-runtime, react-dom,
 *     react-dom/client, and three more @deepseek-ai packages.
 *   - decisively, npm publishes `@deepseek-ai/dsh-client-store` as
 *     0.1.2-alpha.2 and `@deepseek-ai/dsh-client-ui-slots` /
 *     `-ui-primitives` as 0.0.1-rc.1, while this fork is 0.1.2-rc.1. Pulling
 *     the published import would therefore drag in WRONG VERSIONS of packages
 *     whose runtime identity must match the host's single instances — exactly
 *     the duplicate-runtime-instance hazard the bundle purity gate exists to
 *     prevent.
 *
 * This file has ZERO imports, so copying it costs nothing and removes the last
 * npm runtime dependency from the build.
 *
 * REBASE OBLIGATION: re-diff against upstream on every rc bump. The module list
 * is a module-table contract, not a preference — a silent divergence here would
 * change which specifiers the bundle treats as external. No deliberate
 * divergence; the body below is a verbatim copy.
 */
/**
 * Shared browser platform modules. Seeding, bundling externals, and Vite
 * aliases consume this list so their module identities cannot drift.
 * @module @deepseek-ai/dsh-client-web/src/platform
 */

/** The module specifiers the shell shares into the frozen module table. */
export const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
] as const

/** Client-bundle specifiers whose factories the parser preloads before the shell starts. */
export const PRELOADED_CLIENT_EXTERNALS = [
] as const

/** One platform module specifier (a seed-table key). */
export type PlatformModule = (typeof PLATFORM_MODULES)[number]
