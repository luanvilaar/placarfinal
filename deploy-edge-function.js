#!/usr/bin/env node

/**
 * Script para fazer deploy da Edge Function direto via API Supabase
 * Uso: node deploy-edge-function.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'klhksakeokvdkdnbacbb';
const FUNCTION_NAME = 'ai-team-assistant';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

console.log('📦 Deploy de Edge Function - Supabase\n');

// Validar variáveis
if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ ERRO: SUPABASE_ACCESS_TOKEN não está definido');
  console.log('\n📋 Para gerar o token:');
  console.log('1. Abra: https://app.supabase.com/account/tokens');
  console.log('2. Crie um novo Personal Access Token');
  console.log('3. Execute novamente com:');
  console.log('   SUPABASE_ACCESS_TOKEN=seu_token_aqui node deploy-edge-function.js\n');
  process.exit(1);
}

// Ler o arquivo da função
const functionPath = path.join(__dirname, 'supabase', 'functions', FUNCTION_NAME, 'index.ts');
if (!fs.existsSync(functionPath)) {
  console.error(`❌ ERRO: Arquivo não encontrado: ${functionPath}`);
  process.exit(1);
}

const functionCode = fs.readFileSync(functionPath, 'utf8');
console.log(`✅ Função carregada: ${functionPath}`);
console.log(`📝 Tamanho: ${functionCode.length} bytes\n`);

// Função auxiliar para fazer requisição
async function makeRequest(method, url, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  return { status: response.status, data };
}

// Função para fazer deploy
async function deployFunction() {
  try {
    console.log('🚀 Iniciando deploy...\n');

    // Step 1: Criar/atualizar a função
    const deployUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/${FUNCTION_NAME}`;

    console.log(`📤 Fazendo upload para: ${deployUrl}`);

    const deployBody = {
      slug: FUNCTION_NAME,
      body: functionCode,
      verify_jwt: false, // Desabilitar JWT verification para maior flexibilidade
    };

    const deployResult = await makeRequest('PUT', deployUrl, deployBody);

    if (deployResult.status !== 200 && deployResult.status !== 201) {
      console.error(`❌ Erro no deploy: ${deployResult.status}`);
      console.error(JSON.stringify(deployResult.data, null, 2));
      process.exit(1);
    }

    console.log('✅ Função deployada com sucesso!\n');

    // Step 2: Configurar o secret da chave Gemini
    console.log('🔐 Configurando secret GEMINI_API_KEY...\n');

    const secretsUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/secrets`;

    const secretBody = {
      name: 'GEMINI_API_KEY',
      value: GEMINI_API_KEY,
    };

    const secretResult = await makeRequest('POST', secretsUrl, secretBody);

    if (secretResult.status === 201 || secretResult.status === 200) {
      console.log('✅ Secret configurado com sucesso!\n');
    } else if (secretResult.data?.message?.includes('already exists')) {
      console.log('ℹ️ Secret já existe, pulando...\n');
    } else {
      console.warn(`⚠️ Aviso ao configurar secret: ${secretResult.status}`);
      console.warn(JSON.stringify(secretResult.data, null, 2));
    }

    // Step 3: Informar endpoint
    const endpoint = `https://${PROJECT_REF}.functions.supabase.co/${FUNCTION_NAME}`;
    console.log('✅ ✅ DEPLOY CONCLUÍDO COM SUCESSO!\n');
    console.log('📍 Endpoint da função:');
    console.log(`   ${endpoint}\n`);

    console.log('🧪 Próximos passos:');
    console.log('1. Atualize a página do navegador (F5)');
    console.log('2. Vá para /admin na aba Equipes');
    console.log('3. Tente: "equipe Alphas masculino"\n');

    return true;
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

// Executar
deployFunction();
