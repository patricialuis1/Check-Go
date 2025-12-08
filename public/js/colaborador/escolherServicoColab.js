import { getAuthUser, logout } from "../autenticacao/auth.js"; 

const servidor = "";

const params = new URLSearchParams(window.location.search);
let loja_id_param = Number(params.get("loja_id"));

const titulo = document.querySelector(".page-title");
const lista = document.querySelector(".servico-list");

// Obter perfil do utilizador logado e IDs globalmente
const user = getAuthUser();
const colaborador_loja_id = user?.loja_id;
const loja_id = loja_id_param || colaborador_loja_id;


// Funções de API e Renderização (Definidas antes da execução)
async function fetchServicosDaLoja() {
  const res = await fetch(`${servidor}/lojas/${loja_id}/servicos`); 
  
  if (!res.ok) {
    // Código de diagnóstico (Mantido para mostrar erros da rota pública)
    console.error(`Falha ao carregar serviços: Status ${res.status} para Loja ID ${loja_id}`);
    
    let errorMessage = `Erro ${res.status}: Falha na comunicação com o servidor.`;
    
    try {
        const body = await res.json();
        errorMessage = `Erro ${res.status}: ${body.message || body.error || "Erro desconhecido no servidor."}`;
    } catch {
        // ...
    }
    
    throw new Error(errorMessage);
  }
  return await res.json(); 
}

function renderServicos(servicos) {
  lista.innerHTML = "";

  if (!servicos.length) {
    lista.innerHTML = `<p>Esta loja não tem serviços ativos.</p>`;
    return;
  }

  servicos.forEach(s => {
    const a = document.createElement("a");
    a.className = "servico-btn";
    a.href = `menuTrabalhador.html?loja_servico_id=${s.loja_servico_id}`;
    a.textContent = s.nome;
    lista.appendChild(a);
  });
}

// 🎯 EXECUÇÃO PRINCIPAL (Onde o código é executado)
(async () => {
    // 1. Check de Validade do ID e Token
    if (!loja_id) {
        alert("Não foi possível identificar a loja do colaborador. Sessão inválida.");
        logout(); 
        return; // Legal agora, pois está dentro da função assíncrona.
    }
    
    // Se o token existir, mas a rota chamada for protegida, ele falhará no fetch.
    if (!user || !user.sessionToken) {
        logout();
        return;
    }

    try {
        // Tenta obter o título da loja (rota protegida, requer token)
        const lojaRes = await fetch(`${servidor}/lojas/${loja_id}`, {
            headers: {
                'Authorization': `Bearer ${user.sessionToken}`
            }
        });
        
        // Tratar 401/403: Acesso negado, sessão inválida
        if (lojaRes.status === 401 || lojaRes.status === 403) {
             alert("Sessão inválida. Por favor, faça login novamente.");
             logout();
             return;
        }

        if (lojaRes.ok) {
            const loja = await lojaRes.json();
            if (loja?.nome) titulo.textContent = loja.nome;
        }

        // Tenta obter serviços (rota pública, mas depende do ID ser válido)
        const servicos = await fetchServicosDaLoja();
        renderServicos(servicos);

    } catch (err) {
        console.error(err);
        // Exibe o erro de comunicação na interface
        lista.innerHTML = `<p>${err.message}</p>`; 
    }
})();