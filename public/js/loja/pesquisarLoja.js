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

    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.padding = "0";
    ul.style.marginTop = "8px";

    lista.forEach(l => {
      const li = document.createElement("li");
      li.style.padding = "10px 12px";
      li.style.border = "1px solid #eee";
      li.style.borderRadius = "10px";
      li.style.marginBottom = "6px";
      li.style.cursor = "pointer";
      li.style.background = "#fff";

      li.innerHTML = `
        <strong>${l.nome}</strong><br/>
        <small>${l.morada}</small>
      `;

      li.addEventListener("click", () => {
        window.location.href =
          `/views/utilizador/escolherServico.html?loja_id=${l.id}`;
      });

      ul.appendChild(li);
    });

    container.appendChild(ul);
  }

  function filtrarLojas(txt) {
    const t = txt.trim().toLowerCase();
    if (!t) {
      container.innerHTML = "";
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
