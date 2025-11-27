// Modelos/loja.js
class Loja {
  constructor(nome, morada, gerente_id, id) {
    this.nome = nome;
    this.morada = morada;
    this.gerente_id = gerente_id; // pode ser null
    this.id = id;
  }
}

export default Loja;
