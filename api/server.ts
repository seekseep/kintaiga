// Vercel Functions entry point.
// TanStack Start v1.169+ outputs a Web-standard request handler at
// `dist/server/server.js`. Vercel's Node runtime bundles this file automatically
// when referenced from `api/`.
//
// If the import below fails on Vercel because `dist/` is treated as a build
// artifact and not bundled, switch to copying the file before deploy:
//
//   "buildCommand": "pnpm build && cp dist/server/server.js api/_server.js"
//
// and import from './_server.js' instead.
// @ts-ignore - dist is generated at build time
export { default } from '../dist/server/server.js'
