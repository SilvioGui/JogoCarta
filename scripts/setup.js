#!/usr/bin/env node
// Script de setup executado no postinstall.
// Cria server/.env a partir de server/.env.example se ainda não existir.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envExample = path.join(__dirname, '..', 'server', '.env.example');
const envFile    = path.join(__dirname, '..', 'server', '.env');

if (!fs.existsSync(envFile)) {
  let content = fs.readFileSync(envExample, 'utf8');

  // Gera segredos JWT automaticamente
  const secret1 = crypto.randomBytes(32).toString('hex');
  const secret2 = crypto.randomBytes(32).toString('hex');
  content = content
    .replace('GERAR_COM_openssl_rand_hex_32_DIFERENTE', secret2)
    .replace('GERAR_COM_openssl_rand_hex_32', secret1);

  // Garante que a pasta data/ existe
  const dataDir = path.join(__dirname, '..', 'server', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(envFile, content, 'utf8');
  console.log('\x1b[32m✓ server/.env criado com segredos JWT gerados automaticamente.\x1b[0m');
} else {
  console.log('\x1b[90m• server/.env já existe, mantendo configurações.\x1b[0m');
}
