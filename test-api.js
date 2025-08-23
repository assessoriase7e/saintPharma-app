// Script para testar a API do SaintPharma
// Execute com: node test-api.js

const API_BASE_URL = 'http://localhost:3000/api';
const API_TOKEN = '12345678';

async function testGetCourses() {
  try {
    console.log('🔍 Testando endpoint /courses...');
    
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da API:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.courses && Array.isArray(data.courses)) {
      console.log(`📚 Total de cursos encontrados: ${data.courses.length}`);
      
      if (data.courses.length > 0) {
        console.log('📖 Primeiro curso:');
        console.log(`   - ID: ${data.courses[0]._id}`);
        console.log(`   - Título: ${data.courses[0].title}`);
        console.log(`   - Descrição: ${data.courses[0].description}`);
        console.log(`   - Carga horária: ${data.courses[0].workload}h`);
        console.log(`   - Pontos: ${data.courses[0].points}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Verifique se o servidor está rodando em localhost:3000');
    }
  }
}

async function testApiHealth() {
  try {
    console.log('🏥 Testando saúde da API...');
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API está saudável:', data);
    } else {
      console.log('⚠️  Endpoint /health não disponível');
    }
    
  } catch (error) {
    console.log('⚠️  Endpoint /health não disponível ou servidor offline');
  }
}

async function main() {
  console.log('🚀 Iniciando testes da API SaintPharma');
  console.log(`🔗 URL Base: ${API_BASE_URL}`);
  console.log(`🔑 Token: ${API_TOKEN}`);
  console.log('=' .repeat(50));
  
  await testApiHealth();
  console.log('\n' + '-'.repeat(50) + '\n');
  await testGetCourses();
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Testes concluídos!');
}

// Executar os testes
main().catch(console.error);