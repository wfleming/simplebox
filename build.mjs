#!/usr/bin/env node

import fs from "node:fs/promises"
import {fileURLToPath} from "node:url"
import path from "node:path"
import * as esbuild from "esbuild"

// build demo bundles, run a server to load demo html pages
async function devMode() {
  const ctx = await esbuild.context({
    entryPoints: ['demo/*.js', 'demo/*.css'],
    outdir: 'demo/build/',
    bundle: true,
    loader: {".svg": "dataurl", ".png": "dataurl", ".jpg": "dataurl", ".gif": "dataurl"},
  })

  const {hosts, port} = await ctx.serve({servedir: 'demo'})
  console.log(`Listening on http://${hosts[0]}:${port}`)
}

// build files in dist/ for npm packaging
async function buildDist() {
  await esbuild.build({
    entryPoints: ['lib/*.mjs', 'lib/*.css'],
    outdir: 'dist/',
    bundle: true,
    format: 'esm',
    loader: {".svg": "dataurl"},
  })
}


// script entrypoint

const args = process.argv.slice(2)

switch (args[0]) {
  case "dev": {
    console.log("Starting dev server")
    await devMode()
    break
  }
  case "dist": {
    await buildDist()
    break
  }
  default:
    console.error("Invalid build command.")
}
