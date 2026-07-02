import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import { JSDOM } from "jsdom"

function setupDOM() {
  const dom = new JSDOM(`<!DOCTYPE html><body><div id="carousel">
<div class="carousel-track">
  <div class="testimonial-card">Card 1</div>
  <div class="testimonial-card">Card 2</div>
  <div class="testimonial-card">Card 3</div>
</div>
<div class="carousel-dots" id="carouselDots"></div>
</div></body>`, { pretendToBeVisual: true })
  global.document = dom.window.document
  global.window = dom.window
  global.requestAnimationFrame = (cb) => setTimeout(cb, 16)
  return dom
}

function teardownDOM(dom) {
  delete global.document
  delete global.window
  delete global.requestAnimationFrame
  dom.window.close()
}

function bootstrapCarousel() {
  const track = document.querySelector(".carousel-track")
  const cards = document.querySelectorAll(".testimonial-card")
  const container = document.getElementById("carousel")
  let currentSlide = 0
  let carouselInterval = null

  cards.forEach((_, i) => {
    const dot = document.createElement("button")
    dot.className = "carousel-dot" + (i === 0 ? " active" : "")
    dot.setAttribute("aria-label", `Témoignage ${i + 1}`)
    dot.addEventListener("click", () => goToSlide(i))
    document.getElementById("carouselDots").appendChild(dot)
  })

  function goToSlide(index) {
    currentSlide = index
    const offset = -index * 100
    track.style.transform = `translateX(${offset}%)`
    document.querySelectorAll(".carousel-dot").forEach((d, i) => {
      d.classList.toggle("active", i === index)
    })
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % cards.length)
  }

  function startCarousel() {
    if (carouselInterval) clearInterval(carouselInterval)
    carouselInterval = setInterval(nextSlide, 5000)
  }

  function stopCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval)
      carouselInterval = null
    }
  }

  container.addEventListener("mouseenter", stopCarousel)
  container.addEventListener("mouseleave", startCarousel)
  startCarousel()

  return { goToSlide, nextSlide, startCarousel, stopCarousel, getCurrentSlide: () => currentSlide, getInterval: () => carouselInterval }
}

describe("Carousel DOM structure", () => {
  let dom
  before(() => { dom = setupDOM() })
  after(() => teardownDOM(dom))

  it("should have 3 .testimonial-card elements", () => {
    assert.equal(document.querySelectorAll(".testimonial-card").length, 3)
  })
})

describe("Carousel dots", () => {
  let dom, carousel
  before(() => { dom = setupDOM(); carousel = bootstrapCarousel() })
  after(() => teardownDOM(dom))

  it("should create 3 dots in #carouselDots", () => {
    assert.equal(document.querySelectorAll(".carousel-dot").length, 3)
  })

  it("should mark the first dot as active initially", () => {
    const dots = document.querySelectorAll(".carousel-dot")
    assert.ok(dots[0].classList.contains("active"))
    assert.ok(!dots[1].classList.contains("active"))
    assert.ok(!dots[2].classList.contains("active"))
  })
})

describe("goToSlide()", () => {
  let dom, carousel
  before(() => { dom = setupDOM(); carousel = bootstrapCarousel() })
  after(() => teardownDOM(dom))

  it("should set transform translateX(0%) for index 0", () => {
    carousel.goToSlide(0)
    assert.equal(document.querySelector(".carousel-track").style.transform, "translateX(0%)")
  })

  it("should set transform translateX(-100%) for index 1", () => {
    carousel.goToSlide(1)
    assert.equal(document.querySelector(".carousel-track").style.transform, "translateX(-100%)")
  })

  it("should set transform translateX(-200%) for index 2", () => {
    carousel.goToSlide(2)
    assert.equal(document.querySelector(".carousel-track").style.transform, "translateX(-200%)")
  })

  it("should update active dot when sliding", () => {
    carousel.goToSlide(2)
    const dots = document.querySelectorAll(".carousel-dot")
    assert.ok(!dots[0].classList.contains("active"))
    assert.ok(!dots[1].classList.contains("active"))
    assert.ok(dots[2].classList.contains("active"))
  })
})

describe("nextSlide()", () => {
  let dom, carousel
  before(() => { dom = setupDOM(); carousel = bootstrapCarousel() })
  after(() => teardownDOM(dom))

  it("should advance from 0 to 1", () => {
    carousel.goToSlide(0)
    carousel.nextSlide()
    assert.equal(document.querySelector(".carousel-track").style.transform, "translateX(-100%)")
  })

  it("should wrap around modulo 3 (2 -> 0)", () => {
    carousel.goToSlide(2)
    carousel.nextSlide()
    assert.equal(document.querySelector(".carousel-track").style.transform, "translateX(0%)")
  })
})

describe("Carousel autoplay", () => {
  let dom, carousel
  const intervals = []

  before(() => {
    const orig = global.setInterval
    global.setInterval = (fn, ms) => {
      const id = orig(fn, ms)
      intervals.push({ fn, ms, id })
      return id
    }
    dom = setupDOM()
    carousel = bootstrapCarousel()
  })
  after(() => { teardownDOM(dom) })

  it("should initialize autoplay with setInterval at 5000ms", () => {
    const match = intervals.find(i => i.ms === 5000)
    assert.ok(match, "setInterval was called with 5000ms")
    assert.ok(carousel.getInterval() !== null, "carouselInterval should be set")
  })
})

describe("Carousel mouseenter / mouseleave", () => {
  let dom, carousel
  const intervals = []
  const clears = []

  before(() => {
    const origSet = global.setInterval
    const origClear = global.clearInterval
    global.setInterval = (fn, ms) => {
      const id = origSet(fn, ms)
      intervals.push(id)
      return id
    }
    global.clearInterval = (id) => { origClear(id); clears.push(id) }
    dom = setupDOM()
    carousel = bootstrapCarousel()
  })
  after(() => { teardownDOM(dom) })

  it("should stop carousel on mouseenter", () => {
    const before = clears.length
    document.getElementById("carousel").dispatchEvent(new dom.window.MouseEvent("mouseenter"))
    assert.ok(clears.length > before, "clearInterval called on mouseenter")
    assert.equal(carousel.getInterval(), null, "carouselInterval null after mouseenter")
  })

  it("should restart carousel on mouseleave", () => {
    document.getElementById("carousel").dispatchEvent(new dom.window.MouseEvent("mouseleave"))
    assert.ok(carousel.getInterval() !== null, "carouselInterval set after mouseleave")
  })
})
