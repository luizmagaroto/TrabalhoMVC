const request = require("supertest");
const app = require("../index.js");

describe("Testes de autenticação", () => {
  it("Deve cadastrar usuário", async () => {
    const random = parseInt(Math.random()*1000);
    const res = await request(app)
      .post("/auth/cadastro")
      .send({ nome: "Teste", email: "teste"+random+"@email.com", senha: "123456" });
    expect(res.body.erro).toBe(false);
    expect(res.body).toHaveProperty("token")
  });

  it("Deve retornar erro ao logar com senha errada", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "teste@email.com", senha: "errada" });
    expect(res.body.erro).toBe(true);
  });
});
