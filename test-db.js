require('dotenv').config();

// test-supabase.js
const { createClient } = require('@supabase/supabase-js');

// Configuração da conexão (usa variáveis de ambiente em produção!)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: SUPABASE_URL ou SUPABASE_KEY não definidas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função de teste: Insere e lê um dado simples
async function testConnection() {
  try {
    // Teste 1: Insere um registro de teste em uma tabela (ex: 'test_table')
    // (Cria a tabela 'test_table' no Supabase se não existir: colunas id, message)
    const { data: insertData, error: insertError } = await supabase
      .from('test_table')  // ← Muda para uma tabela que tenhas
      .insert([{ message: 'Teste de conexão do GitHub repo! 😎' }]);

    if (insertError) throw insertError;

    console.log('✅ INSERÇÃO OK:', insertData);

    // Teste 2: Lê os dados de volta
    const { data: selectData, error: selectError } = await supabase
      .from('test_table')
      .select('*');

    if (selectError) throw selectError;

    console.log('✅ LEITURA OK:', selectData);

    console.log('🎉 CONEXÃO COM SUCESSO! A DB online está a comunicar!');
  } catch (error) {
    console.error('❌ ERRO NA CONEXÃO:', error.message);
  }
}

// Roda o teste
testConnection();