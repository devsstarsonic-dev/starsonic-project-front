// Rode com: node --test src/lib/store/pixKey.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectPixType, isValidPixKey, maskPixKey } from "./pixKey.ts";

test("detecta o tipo da chave", () => {
  assert.equal(detectPixType("demetrio@starsonic.cloud"), "email");
  assert.equal(detectPixType("(11) 98765-4321"), "celular");
  assert.equal(detectPixType("529.982.247-25"), "cpf"); // 11 dígitos, 3º não é 9
  assert.equal(detectPixType("11.222.333/0001-81"), "cnpj");
  assert.equal(detectPixType("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "aleatoria");
  assert.equal(detectPixType(""), null);
  assert.equal(detectPixType("123"), null); // ainda indeciso
});

test("celular x CPF: desempata pelo 9 e pelo DDD", () => {
  assert.equal(detectPixType("11987654321"), "celular");
  assert.equal(detectPixType("52998224725"), "cpf"); // 3º dígito não é 9
  assert.equal(detectPixType("09912345678"), "cpf"); // DDD 09 não existe
});

test("máscaras formatam progressivamente", () => {
  assert.equal(maskPixKey("celular", "11987654321"), "(11) 98765-4321");
  assert.equal(maskPixKey("cpf", "52998224725"), "529.982.247-25");
  assert.equal(maskPixKey("cnpj", "11222333000181"), "11.222.333/0001-81");
  assert.equal(maskPixKey("celular", "119"), "(11) 9");
  assert.equal(maskPixKey("email", " a@b.com "), "a@b.com");
});

test("máscara nunca aceita mais dígitos que o tipo permite", () => {
  assert.equal(maskPixKey("celular", "119876543219999"), "(11) 98765-4321");
  assert.equal(maskPixKey("cnpj", "112223330001819999"), "11.222.333/0001-81");
});

test("valida por tipo", () => {
  assert.ok(isValidPixKey("celular", "(11) 98765-4321"));
  assert.ok(!isValidPixKey("celular", "(11) 9876-432"));
  assert.ok(isValidPixKey("cnpj", "11.222.333/0001-81"));
  assert.ok(!isValidPixKey("cnpj", "11.222.333/0001-8"));
  assert.ok(isValidPixKey("email", "a@b.com"));
  assert.ok(!isValidPixKey("email", "a@b"));
  assert.ok(isValidPixKey("aleatoria", "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"));
  assert.ok(!isValidPixKey("aleatoria", "a1b2c3d4-e5f6-7890-abcd-ef123456789"));
});
