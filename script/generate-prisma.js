const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🔧 Generando cliente Prisma...');
  
  // Cambiar al directorio del proyecto
  process.chdir(path.join(__dirname, '..'));
  
  // Ejecutar prisma generate usando el binario directo
  const prismaPath = path.join(process.cwd(), 'node_modules', '.bin', 'prisma');
  
  execSync(`"${prismaPath}" generate`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });
  
  console.log('✅ Cliente Prisma generado exitosamente');
} catch (error) {
  console.error('❌ Error generando cliente Prisma:', error.message);
  process.exit(1);
}