import { price, formatPrice } from "./pricing.mjs"

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

/* ───── Carousel ───── */
const carouselTrack = document.querySelector(".carousel-track")
const carouselDots = document.getElementById("carouselDots")
const testimonialCards = document.querySelectorAll(".testimonial-card")
let currentSlide = 0
let carouselInterval = null

if (carouselTrack && testimonialCards.length) {
  testimonialCards.forEach((_, i) => {
    const dot = document.createElement("button")
    dot.className = "carousel-dot" + (i === 0 ? " active" : "")
    dot.setAttribute("aria-label", `Témoignage ${i + 1}`)
    dot.addEventListener("click", () => goToSlide(i))
    carouselDots.appendChild(dot)
  })

  function goToSlide(index) {
    currentSlide = index
    const offset = -index * 100
    carouselTrack.style.transform = `translateX(${offset}%)`
    carouselTrack.style.opacity = "0.6"
    requestAnimationFrame(() => { carouselTrack.style.opacity = "1" })
    document.querySelectorAll(".carousel-dot").forEach((d, i) => {
      d.classList.toggle("active", i === index)
    })
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % testimonialCards.length)
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

  const carouselContainer = document.getElementById("carousel")
  carouselContainer.addEventListener("mouseenter", stopCarousel)
  carouselContainer.addEventListener("mouseleave", startCarousel)

  startCarousel()
}

/* ───── FAQ accordéon ───── */
document.querySelectorAll(".faq-question").forEach(question => {
  question.addEventListener("click", () => {
    const item = question.closest(".faq-item")
    const isOpen = item.classList.contains("open")

    document.querySelectorAll(".faq-item.open").forEach(openItem => {
      openItem.classList.remove("open")
    })

    if (!isOpen) {
      item.classList.add("open")
    }
  })
})

/* ───── Parallaxe doux sur sections avec data-bg ───── */
const bgSections = document.querySelectorAll(".section-with-bg[data-bg]")

bgSections.forEach(section => {
  const bgName = section.dataset.bg
  section.style.backgroundImage = `url(assets/${bgName})`
})

let parallaxTicking = false

window.addEventListener("scroll", () => {
  if (!parallaxTicking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY
      bgSections.forEach(section => {
        const rect = section.getBoundingClientRect()
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const offset = scrollY * 0.15
          section.style.backgroundPosition = `center ${offset}px`
        }
      })
      parallaxTicking = false
    })
    parallaxTicking = true
  }
})
