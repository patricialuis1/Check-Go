export default class Loja {
  constructor(id, nome, morada, gerente_id = null) {
    this.id = id;
    this.nome = nome;
    this.morada = morada;
    this.gerente_id = gerente_id;
  }

  getId() { return this.id; }
  getNome() { return this.nome; }
  getMorada() { return this.morada; }
  getGerenteId() { return this.gerente_id; }
}
