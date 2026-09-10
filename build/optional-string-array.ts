/**
 * FORK-LOCAL COPY of `optionalStringArray` from the upstream monorepo.
 *
 * Source:   packages/client/modules/src/client/manifest.ts (:130-:146 — the
 *           doc comment block plus the 7-line function body)
 * Upstream: https://github.com/deepseek-ai/deepseek-harness
 * Base tag: dsh-v0.1.2-rc.1   (base commit a66e470204)
 *
 * WHY THIS IS COPIED RATHER THAN IMPORTED
 * The published `@deepseek-ai/dsh-client-modules@0.1.2-rc.1` DOES define this
 * function — but in its NODE half, `lib/index.js:47`, which is not the face a
 * browser preset consumes; and its only export statement
 * (`lib/index.js:861`) is:
 *     export { ClientModuleRegistry, ClientModuleRegistry as default,
 *              bootInjections, orderByModuleGraph, stripClientSuffix }
 * `optionalStringArray` is absent from that list, so no import path reaches it.
 * The sibling import `./modules/src/client/manifest.ts` resolves only inside the
 * monorepo's source tree, which does not exist here. Hence: copy.
 *
 * The function is pure and zero-dependency (no imports at all upstream).
 *
 * REBASE OBLIGATION: re-diff against upstream on every rc bump. No deliberate
 * divergence — the body below is a verbatim copy.
 */
/**
 * Validate an optional string-array field read from a `dsh.client` declaration
 * or from the boot wire.
 * @param subject - diagnostic prefix naming the package or the wire row.
 * @param field - field name as it appears in the diagnostic.
 * @param value - the raw field value.
 * @returns the validated array, or undefined when the field is absent.
 * @throws {Error} when the value is present but is not an array of strings.
 */
export function optionalStringArray(subject: string, field: string, value: unknown): string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new Error(`client-modules: ${subject} ${field} must be a string array`)
  }
  return value as string[]
}

