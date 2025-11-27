// Modelos/loja.js
class Loja {
  constructor({
    id = null,
    nome,
    morada,
    gerente_id = null,
    gerente_nome = null,
    servicos = [] // nomes dos serviços ativos
  }) {
    this.id = id;
    this.nome = nome;
    this.morada = morada;
    this.gerente_id = gerente_id;
    this.gerente_nome = gerente_nome;
    this.servicos = servicos;
  }
}

export default Loja;
