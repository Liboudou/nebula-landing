import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { nextIndex, autoplayDelay } from "../src/carousel.mjs"

describe("nextIndex", () => {
  it("step 1: 0→1 with total=3", () => assert.equal(nextIndex(0, 3, 1), 1))
  it("step 1: 2→0 with total=3 (wrap)", () => assert.equal(nextIndex(2, 3, 1), 0))
  it("step -1: 0→2 with total=3", () => assert.equal(nextIndex(0, 3, -1), 2))
})

describe("autoplayDelay", () => {
  it("paused=true returns null", () => assert.equal(autoplayDelay(true), null))
  it("paused=false returns 5000", () => assert.equal(autoplayDelay(false), 5000))
})
