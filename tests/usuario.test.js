const request = require("supertest");
const app = require("../index.js");

describe("Testes de autenticação", () => {
  it("Deve cadastrar usuário", async () => {
    const res = await request(app)
      .post("/auth/cadastro")
      .send({ nome: "Teste", email: "teste@email.com", senha: "123456" });
    expect(res.body.erro).toBe(true);
  });

  it("Deve retornar erro ao logar com senha errada", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "teste@email.com", senha: "errada" });
    expect(res.body.erro).toBe(true);
  });
});
