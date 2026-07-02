import { price, formatPrice } from "./pricing.mjs"
import { nextIndex, autoplayDelay } from "./carousel.mjs"

/* ───── Canvas particles ───── */
const canvas = document.getElementById("particles")
const ctx = canvas.getContext("2d")
let particles = []
let mouse = { x: -1000, y: -1000 }

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

class Particle {
  constructor() { this.reset() }
  reset() {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.vx = (Math.random() - 0.5) * 0.6
    this.vy = (Math.random() - 0.5) * 0.6
    this.size = Math.random() * 2 + 1
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 120) {
      const force = (120 - dist) / 120
      this.x -= dx * force * 0.05
      this.y -= dy * force * 0.05
    }
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1
  }
  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = "#7c5cff"
    ctx.fill()
  }
}

function initParticles(count = 80) {
  particles = Array.from({ length: count }, () => new Particle())
}

function drawLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150) {
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(124, 92, 255, ${1 - dist / 150})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.7
  )
  gradient.addColorStop(0, "rgba(124, 92, 255, 0.03)")
  gradient.addColorStop(0.5, "rgba(0, 212, 255, 0.02)")
  gradient.addColorStop(1, "rgba(10, 10, 20, 0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  particles.forEach(p => { p.update(); p.draw() })
  drawLines()
  requestAnimationFrame(animate)
}

window.addEventListener("resize", () => { resize() })
window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY })
window.addEventListener("mouseleave", () => { mouse.x = -1000; mouse.y = -1000 })

resize()
initParticles()
animate()

/* ───── IntersectionObserver ───── */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.2 }
)

document.querySelectorAll(".fade-in-up").forEach(el => observer.observe(el))

/* ───── Counters ───── */
const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el = entry.target
      const target = parseFloat(el.dataset.target)
      const duration = 2000
      const start = performance.now()

      function tick(now) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = eased * target
        if (Number.isInteger(target)) {
          el.textContent = Math.round(current)
        } else {
          el.textContent = current.toFixed(1)
        }
        if (progress < 1) requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
      counterObserver.unobserve(el)
    })
  },
  { threshold: 0.5 }
)

document.querySelectorAll("[data-target]").forEach(el => counterObserver.observe(el))

/* ───── Pricing toggle ───── */
const togglePill = document.querySelector(".toggle-pill")
const toggleLabels = document.querySelectorAll(".toggle-label")
const priceValues = document.querySelectorAll(".price-value")
let currentCycle = "monthly"

function updatePrices(cycle) {
  document.querySelectorAll(".pricing-card").forEach(card => {
    const plan = card.dataset.plan
    const p = price(plan, cycle)
    priceValues.forEach(pv => {
      if (pv.closest(".pricing-card") === card) {
        pv.textContent = formatPrice(p).replace(" €", "")
      }
    })
    card.querySelector(".price-cycle").textContent = "/mois"
  })
  toggleLabels.forEach(l => l.classList.toggle("active", l.dataset.cycle === cycle))
  togglePill.classList.toggle("annual", cycle === "annual")
}

toggleLabels.forEach(label => {
  label.addEventListener("click", () => {
    currentCycle = label.dataset.cycle
    updatePrices(currentCycle)
  })
})

togglePill.addEventListener("click", () => {
  currentCycle = currentCycle === "monthly" ? "annual" : "monthly"
  updatePrices(currentCycle)
})

/* ───── Nav scroll effect ───── */
const nav = document.getElementById("nav")
let ticking = false

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      nav.classList.toggle("scrolled", window.scrollY > 50)
      ticking = false
    })
    ticking = true
  }
})

/* ───── Hamburger ───── */
const hamburger = document.getElementById("hamburger")
const navLinks = document.querySelector(".nav-links")

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open")
})

/* ───── Hero mockup parallax ───── */
const heroMockup = document.getElementById("heroMockup")
if (heroMockup) {
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY
    const maxScroll = window.innerHeight
    const offset = Math.min(scrollY / maxScroll, 1) * 30
    heroMockup.style.transform = `translateY(${offset}px)`
  })
}

/* ───── Carousel ───── */
const carouselTrack = document.getElementById("carouselTrack")
const carouselDots = document.getElementById("carouselDots")
const slides = carouselTrack ? carouselTrack.querySelectorAll(".testimonial-card") : []
const totalSlides = slides.length
let currentSlide = 0
let autoplayTimer = null
let isPaused = false

if (totalSlides > 0) {
  // Create dots
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("button")
    dot.className = "carousel-dot" + (i === 0 ? " active" : "")
    dot.dataset.index = i
    dot.addEventListener("click", () => goToSlide(i))
    carouselDots.appendChild(dot)
  }

  function goToSlide(index) {
    currentSlide = index
    const offset = -currentSlide * 100
    carouselTrack.style.transform = `translateX(${offset}%)`
    document.querySelectorAll(".carousel-dot").forEach((d, i) => {
      d.classList.toggle("active", i === currentSlide)
    })
  }

  function advanceSlide() {
    if (!isPaused) {
      currentSlide = nextIndex(currentSlide, totalSlides, 1)
      goToSlide(currentSlide)
    }
  }

  function startAutoplay() {
    stopAutoplay()
    const delay = autoplayDelay(isPaused)
    if (delay !== null) {
      autoplayTimer = setInterval(advanceSlide, delay)
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer)
      autoplayTimer = null
    }
  }

  // Pause on hover
  const container = document.getElementById("carousel")
  container.addEventListener("mouseenter", () => { isPaused = true; stopAutoplay() })
  container.addEventListener("mouseleave", () => { isPaused = false; startAutoplay() })

  startAutoplay()
}

/* ───── FAQ accordeon ───── */
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item")
    const isOpen = item.classList.contains("open")
    // Close all
    document.querySelectorAll(".faq-item.open").forEach(el => {
      el.classList.remove("open")
      el.querySelector(".faq-answer").style.maxHeight = "0"
    })
    // Toggle current
    if (!isOpen) {
      item.classList.add("open")
      const answer = item.querySelector(".faq-answer")
      answer.style.maxHeight = answer.scrollHeight + "px"
    }
  })
})
