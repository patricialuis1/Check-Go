export default class Colaborador {
  constructor(id, nome, email, password, role="Colaborador", loja_id=null, ativo=true) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.password = password;
    this.role = role;
    this.loja_id = loja_id;
    this.ativo = ativo;
  }

  getId(){ return this.id; }
  getNome(){ return this.nome; }
  getEmail(){ return this.email; }
  getPassword(){ return this.password; }
  getRole(){ return this.role; }
  getLojaId(){ return this.loja_id; }
  getAtivo(){ return this.ativo; }
}
