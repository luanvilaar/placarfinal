#!/bin/bash

# Deploy Vercel automatizado com variáveis de ambiente

echo "🚀 Iniciando deploy Vercel..."
echo ""

# Verificar se está logado no Vercel
echo "🔐 Verificando autenticação Vercel..."
vercel whoami > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "⚠️ Você não está logado no Vercel"
  echo "🔑 Faça login:"
  vercel login
fi

echo ""
echo "📦 Configurando variáveis de ambiente..."

# Adicionar variáveis para Production
vercel env add NEXT_PUBLIC_SUPABASE_URL << EOF
https://klhksakeokvdkdnbacbb.supabase.co
EOF

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY << EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaGtzYWtlb2t2ZGtkbmJhY2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Nzg2OTYsImV4cCI6MjA5MDI1NDY5Nn0.MxfR--PyPk4I1gDZICJPeB52fqP20Oe7dGAYEQL5eFI
EOF

vercel env add SUPABASE_SERVICE_ROLE_KEY << EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaGtzYWtlb2t2ZGtkbmJhY2JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3ODY5NiwiZXhwIjoyMDkwMjU0Njk2fQ.9n5JgGEiJJKI7jUGodkEAWHBzNH9__SQYVoZXWn-q4A
EOF

vercel env add GEMINI_API_KEY << EOF
AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw
EOF

vercel env add NODE_ENV << EOF
production
EOF

echo ""
echo "🔄 Fazendo deploy..."
vercel deploy --prod

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Acesse seu projeto em:"
vercel inspect --prod
