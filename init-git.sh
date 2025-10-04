#!/bin/bash

echo "🔧 Configurando Git para el proyecto..."

# Inicializar Git si no existe
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositorio Git..."
    git init
    echo "✅ Repositorio Git inicializado"
else
    echo "✅ Repositorio Git ya existe"
fi

# Configurar usuario básico si no está configurado
USER_NAME=$(git config --global user.name 2>/dev/null)
USER_EMAIL=$(git config --global user.email 2>/dev/null)

if [ -z "$USER_NAME" ] || [ -z "$USER_EMAIL" ]; then
    echo "⚠️  Usuario Git no configurado configurado"
    echo "Ejecuta estos comandos para configurar Git:"
    echo "git config --global user.name 'Tu Nombre'"
    echo "git config --global user.email 'tu@email.com'"
    echo ""
fi

# Crear .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    echo "📝 Creando .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/

# Environment variables
.env*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Backup files
.backup/
EOF
    echo "✅ .gitignore creado"
else
    echo "✅ .gitignore ya existe"
fi

echo ""
echo "🚀 Setup completado! Ahora puedes:"
echo "1. npm run dev          # Probar localmente"
echo "2. git add .            # Agregar archivos"  
echo "3. git commit -m 'Initial commit'"
echo "4. Crear repo en GitHub y conectar"
echo "5. Deploy en Vercel!"
echo ""
echo "📖 Ver SETUP.md para instrucciones detalladas"
