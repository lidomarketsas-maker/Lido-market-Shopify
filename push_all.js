#!/usr/bin/env node
/**
 * push_all.js — Shopify Theme Asset Pusher
 * Lido Market Plus | Theme ID: 185887064444
 *
 * Usage:
 *   node push_all.js --token=shpat_XXXX
 *
 * Pusha in sequenza: CSS → index.json → page.contact.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────
const SHOP   = 'qvznxd-p0.myshopify.com';
const THEME  = '185887064444';
const API    = '2024-01';
const DIR    = __dirname;  // stesso folder di push_all.js

// Leggi token da argomento CLI
const tokenArg = process.argv.find(a => a.startsWith('--token='));
const TOKEN = tokenArg ? tokenArg.split('=')[1] : process.env.SHOPIFY_TOKEN;

if (!TOKEN) {
  console.error('❌  Token mancante. Usa: node push_all.js --token=shpat_XXX');
  process.exit(1);
}

// ── File da pushare ──────────────────────────────────────────────────
const FILES = [
  { key: 'assets/custom-lido.css',        file: 'custom-lido.css' },
  { key: 'templates/index.json',           file: 'index.json' },
  { key: 'templates/page.contact.json',    file: 'page.contact.json' },
];

// ── Helper: PUT asset ────────────────────────────────────────────────
function putAsset(key, value) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ asset: { key, value } });
    const options = {
      hostname: SHOP,
      path: `/admin/api/${API}/themes/${THEME}/assets.json`,
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Helper: delay ────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  Lido Market Plus — Theme Push`);
  console.log(`    Shop:  ${SHOP}`);
  console.log(`    Theme: ${THEME}`);
  console.log(`    Files: ${FILES.length}\n`);

  for (const { key, file } of FILES) {
    const filePath = path.join(DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File non trovato, skip: ${file}`);
      continue;
    }
    const value = fs.readFileSync(filePath, 'utf-8');
    process.stdout.write(`  ⬆  ${key} ... `);
    try {
      await putAsset(key, value);
      console.log('✅  OK');
    } catch (e) {
      console.log(`❌  ERRORE: ${e.message}`);
    }
    await sleep(1200); // rispetta rate limit Shopify (2 req/sec)
  }

  console.log('\n✨  Push completato!');
  console.log(`    Preview: https://${SHOP}\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
