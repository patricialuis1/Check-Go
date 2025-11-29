// modelos/colaborador.js
class Colaborador {
  constructor({
    id = null,
    nome,
    email,
    role = "Colaborador",
    loja_id = null,
    loja_nome = null,
    ativo = true
  }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.role = role;
    this.loja_id = loja_id;
    this.loja_nome = loja_nome;
    this.ativo = ativo;
  }
}

export default Colaborador;
