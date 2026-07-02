import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { price, formatPrice } from "../src/pricing.mjs"

describe("price()", () => {
  it("Starter monthly = 9", () => assert.equal(price("starter", "monthly"), 9))
  it("Starter annual = 7.2", () => assert.equal(price("starter", "annual"), 7.2))
  it("Pro monthly = 29", () => assert.equal(price("pro", "monthly"), 29))
  it("Pro annual = 23.2", () => assert.equal(price("pro", "annual"), 23.2))
  it("Enterprise monthly = 99", () => assert.equal(price("enterprise", "monthly"), 99))
  it("Enterprise annual = 79.2", () => assert.equal(price("enterprise", "annual"), 79.2))
  it("Unknown plan throws Error", () => assert.throws(() => price("unknown", "monthly"), { message: /^Unknown plan: unknown$/ }))
})

describe("formatPrice()", () => {
  it("formatPrice(9) -> \"9,00 €\"", () => assert.equal(formatPrice(9), "9,00 €"))
  it("formatPrice(23.2) -> \"23,20 €\"", () => assert.equal(formatPrice(23.2), "23,20 €"))
  it("formatPrice(0) -> \"0,00 €\"", () => assert.equal(formatPrice(0), "0,00 €"))
  it("formatPrice(1234.5) -> \"1 234,50 €\"", () => assert.equal(formatPrice(1234.5), "1 234,50 €"))
})
