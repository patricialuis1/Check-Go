const servidor = "";

// apanha a search box de qualquer página que a tenha
const input = document.querySelector(".search-box");
const container = document.getElementById("resultados-lojas");

if (input && container) {
  let lojasCache = [];

  async function carregarLojas() {
    const res = await fetch(servidor + "/lojas/publicas");
    if (!res.ok) {
      console.error("Erro a buscar lojas", await res.text());
      return [];
    }
    return await res.json();
  }

  function renderResultados(lista) {
    container.innerHTML = "";

    if (!lista.length) return;

    // Cria a lista (UL)
    const ul = document.createElement("ul");
    // Não precisamos de definir estilos aqui, o CSS trata disso

    lista.forEach(l => {
      const li = document.createElement("li");
      
      // Adiciona a classe CSS bonita que criámos
      li.className = "loja-card"; 

      // O conteúdo HTML
      li.innerHTML = `
        <strong>${l.nome}</strong>
        <small>${l.morada}</small>
      `;

      // Evento de clique
      li.addEventListener("click", () => {
        window.location.href = `/views/utilizador/escolherServico.html?loja_id=${l.id}`;
      });

      ul.appendChild(li);
    });

    container.appendChild(ul);
  }

  function filtrarLojas(txt) {
    const t = txt.trim().toLowerCase();
    if (!t) {
      renderResultados(lojasCache);
      return;
    }

    const filtradas = lojasCache.filter(l =>
      l.nome.toLowerCase().includes(t) ||
      l.morada.toLowerCase().includes(t)
    );

    renderResultados(filtradas);
  }

  (async () => {
    lojasCache = await carregarLojas();

    renderResultados(lojasCache);
  })();

  input.addEventListener("input", (e) => filtrarLojas(e.target.value));

  // enter -> se tiver só 1 resultado vai direto
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const t = input.value.trim().toLowerCase();
      const filtradas = lojasCache.filter(l =>
        l.nome.toLowerCase().includes(t) ||
        l.morada.toLowerCase().includes(t)
      );
      if (filtradas.length === 1) {
        window.location.href =
          `/views/escolherServico.html?loja_id=${filtradas[0].id}`;
      }
    }
  });
}
