// Global Variables
const currentUser = {
  id: 1,
  name: "Maria Santos",
  email: "maria.santos@adrenalinegym.com",
  role: "personal",
}

const clients = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99999-1111",
    birth_date: "1990-05-15",
    height: 175,
    weight: 78.5,
    goal: "muscle-gain",
    notes: "Sem restrições médicas",
  },
  {
    id: 2,
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(11) 99999-2222",
    birth_date: "1985-08-22",
    height: 165,
    weight: 65.0,
    goal: "weight-loss",
    notes: "Problema no joelho direito",
  },
  {
    id: 3,
    name: "Carlos Lima",
    email: "carlos.lima@email.com",
    phone: "(11) 99999-3333",
    birth_date: "1992-12-10",
    height: 180,
    weight: 85.0,
    goal: "conditioning",
    notes: "Atleta amador",
  },
]

let trainingPlans = [
  {
    id: 1,
    client_id: 1,
    client_name: "João Silva",
    name: "Treino de Força - Iniciante",
    type: "strength",
    start_date: "2024-01-15",
    end_date: "2024-03-15",
    objective: "Ganho de massa muscular e força",
    details: "Segunda: Peito e Tríceps\nTerça: Costas e Bíceps\nQuarta: Pernas\nQuinta: Ombros\nSexta: Cardio",
  },
  {
    id: 2,
    client_id: 2,
    client_name: "Ana Costa",
    name: "Treino Cardio - Emagrecimento",
    type: "cardio",
    start_date: "2024-01-20",
    end_date: "2024-04-20",
    objective: "Perda de peso e condicionamento",
    details: "Segunda: HIIT 30min\nQuarta: Corrida 45min\nSexta: Bike 40min\nSábado: Natação 30min",
  },
]

let schedules = [
  {
    id: 1,
    client_id: 1,
    client_name: "João Silva",
    plan_id: 1,
    plan_name: "Treino de Força",
    date: "2024-01-20",
    time: "14:00",
    duration: 60,
    status: "scheduled",
    notes: "Foco em peito e tríceps",
  },
  {
    id: 2,
    client_id: 2,
    client_name: "Ana Costa",
    plan_id: 2,
    plan_name: "Treino Cardio",
    date: "2024-01-20",
    time: "16:00",
    duration: 60,
    status: "scheduled",
    notes: "HIIT intenso",
  },
]

const progressRecords = []

// DOM Elements
const sidebar = document.getElementById("sidebar")
const sidebarToggle = document.getElementById("sidebar-toggle")
const pageTitle = document.getElementById("page-title")
const loadingOverlay = document.getElementById("loading-overlay")
const loadingText = document.getElementById("loading-text")

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard()
  setupEventListeners()
  loadInitialData()
})

function initializeDashboard() {
  setupNavigation()
  updateUserInfo()
  updateStats()

  // Setup sidebar toggle
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar)
  }

  // Setup forms
  setupForms()

  // Set minimum date for scheduling
  const today = new Date().toISOString().split("T")[0]
  const scheduleDateInput = document.getElementById("schedule-date")
  if (scheduleDateInput) {
    scheduleDateInput.min = today
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove("active")
    }
  })
}

function setupEventListeners() {
  // Modal close events
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      hideAllModals()
    }
  })

  // Escape key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideAllModals()
    }
  })
}

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item")

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      const section = this.dataset.section
      showSection(section)

      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"))
      this.classList.add("active")

      // Close sidebar on mobile
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove("active")
      }
    })
  })
}

function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll(".content-section")
  sections.forEach((section) => section.classList.remove("active"))

  // Show target section
  const targetSection = document.getElementById(`${sectionName}-section`)
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Update page title
  const titles = {
    dashboard: "Dashboard",
    clients: "Meus Clientes",
    plans: "Planos de Treino",
    progress: "Registrar Progresso",
    schedule: "Agenda",
  }

  if (pageTitle) {
    pageTitle.textContent = titles[sectionName] || "Dashboard"
  }

  // Load section-specific data
  switch (sectionName) {
    case "clients":
      loadClients()
      break
    case "plans":
      loadPlans()
      break
    case "progress":
      loadProgressForm()
      break
    case "schedule":
      loadSchedule()
      break
  }
}

function toggleSidebar() {
  if (sidebar) {
    sidebar.classList.toggle("active")
  }
}

// Data Loading Functions
function loadInitialData() {
  updateStats()
  loadClients()
  loadPlans()
  loadProgressForm()
  loadSchedule()
  populateSelects()
}

function updateUserInfo() {
  const personalNameEl = document.getElementById("personal-name")
  const welcomeNameEl = document.getElementById("welcome-name")

  if (personalNameEl) personalNameEl.textContent = currentUser.name
  if (welcomeNameEl) welcomeNameEl.textContent = currentUser.name
}

function updateStats() {
  const totalClientsEl = document.getElementById("total-clients")
  const totalPlansEl = document.getElementById("total-plans")
  const totalSessionsEl = document.getElementById("total-sessions")
  const totalAchievementsEl = document.getElementById("total-achievements")

  if (totalClientsEl) totalClientsEl.textContent = clients.length
  if (totalPlansEl) totalPlansEl.textContent = trainingPlans.length
  if (totalSessionsEl) {
    const todaySchedules = schedules.filter((s) => {
      const today = new Date().toISOString().split("T")[0]
      return s.date === today && s.status === "scheduled"
    })
    totalSessionsEl.textContent = todaySchedules.length
  }
  if (totalAchievementsEl) totalAchievementsEl.textContent = "42" // Mock data
}

function loadClients() {
  const clientsGrid = document.getElementById("clients-grid")
  if (!clientsGrid) return

  clientsGrid.innerHTML = ""

  clients.forEach((client) => {
    const clientCard = createClientCard(client)
    clientsGrid.appendChild(clientCard)
  })
}

function createClientCard(client) {
  const card = document.createElement("div")
  card.className = "client-card"

  const goalLabels = {
    "weight-loss": "Perda de Peso",
    "muscle-gain": "Ganho de Massa",
    conditioning: "Condicionamento",
    strength: "Ganho de Força",
    rehabilitation: "Reabilitação",
  }

  const clientPlans = trainingPlans.filter((p) => p.client_id === client.id)

  card.innerHTML = `
        <div class="client-header">
            <div class="client-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="client-info">
                <h3>${client.name}</h3>
                <p>${client.email}</p>
                <span class="goal-badge goal-${client.goal}">${goalLabels[client.goal]}</span>
            </div>
        </div>
        <div class="client-stats">
            <div class="client-stat">
                <span class="number">${clientPlans.length}</span>
                <span class="label">Planos</span>
            </div>
            <div class="client-stat">
                <span class="number">${client.weight}kg</span>
                <span class="label">Peso</span>
            </div>
        </div>
        <div class="client-actions">
            <button class="btn btn-sm btn-primary" onclick="viewClientDetails(${client.id})">
                <i class="fas fa-eye"></i>
                Ver Detalhes
            </button>
            <button class="btn btn-sm btn-secondary" onclick="editClient(${client.id})">
                <i class="fas fa-edit"></i>
                Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteClient(${client.id})">
                <i class="fas fa-trash"></i>
                Excluir
            </button>
        </div>
    `

  return card
}

function loadPlans() {
  const plansGrid = document.getElementById("plans-grid")
  if (!plansGrid) return

  plansGrid.innerHTML = ""

  trainingPlans.forEach((plan) => {
    const planCard = createPlanCard(plan)
    plansGrid.appendChild(planCard)
  })
}

function createPlanCard(plan) {
  const card = document.createElement("div")
  card.className = "plan-card"

  const typeLabels = {
    strength: "Força",
    cardio: "Cardio",
    functional: "Funcional",
    hiit: "HIIT",
    mixed: "Misto",
  }

  card.innerHTML = `
        <div class="plan-header">
            <h3>${plan.name}</h3>
            <span class="plan-type">${typeLabels[plan.type]}</span>
        </div>
        <div class="plan-content">
            <div class="plan-client">${plan.client_name}</div>
            <div class="plan-dates">
                ${formatDate(plan.start_date)} - ${formatDate(plan.end_date)}
            </div>
            <div class="plan-objective">${plan.objective}</div>
            <div class="plan-actions">
                <button class="btn btn-sm btn-primary" onclick="viewPlanDetails(${plan.id})">
                    <i class="fas fa-eye"></i>
                    Ver Detalhes
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editPlan(${plan.id})">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePlan(${plan.id})">
                    <i class="fas fa-trash"></i>
                    Excluir
                </button>
            </div>
        </div>
    `

  return card
}

function loadSchedule() {
  const scheduleList = document.getElementById("schedule-list")
  if (!scheduleList) return

  scheduleList.innerHTML = ""

  schedules.forEach((schedule) => {
    const scheduleItem = createScheduleItem(schedule)
    scheduleList.appendChild(scheduleItem)
  })
}

function createScheduleItem(schedule) {
  const item = document.createElement("div")
  item.className = "schedule-item"

  const date = new Date(schedule.date)
  const day = date.getDate()
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()

  const statusLabels = {
    scheduled: "Agendado",
    completed: "Concluído",
    cancelled: "Cancelado",
  }

  item.innerHTML = `
        <div class="schedule-date">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
        </div>
        <div class="schedule-details">
            <h4>${schedule.client_name}</h4>
            <p><i class="fas fa-clock"></i> ${schedule.time} - ${getEndTime(schedule.time, schedule.duration)}</p>
            <p><i class="fas fa-dumbbell"></i> ${schedule.plan_name}</p>
        </div>
        <div class="schedule-actions">
            <span class="status-badge status-${schedule.status}">${statusLabels[schedule.status]}</span>
            ${
              schedule.status === "scheduled"
                ? `
                <button class="btn btn-sm btn-success" onclick="startSession(${schedule.id})">
                    <i class="fas fa-play"></i>
                    Iniciar
                </button>
                <button class="btn btn-sm btn-warning" onclick="cancelSchedule(${schedule.id})">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
            `
                : ""
            }
            <button class="btn btn-sm btn-secondary" onclick="editSchedule(${schedule.id})">
                <i class="fas fa-edit"></i>
                Editar
            </button>
        </div>
    `

  return item
}

function loadProgressForm() {
  populateSelects()
}

function populateSelects() {
  // Populate client selects
  const clientSelects = ["progress-client", "plan-client", "schedule-client", "schedule-client-filter"]

  clientSelects.forEach((selectId) => {
    const select = document.getElementById(selectId)
    if (select) {
      // Clear existing options except first
      const firstOption = select.querySelector("option")
      select.innerHTML = ""
      if (firstOption) {
        select.appendChild(firstOption)
      }

      clients.forEach((client) => {
        const option = document.createElement("option")
        option.value = client.id
        option.textContent = client.name
        select.appendChild(option)
      })
    }
  })

  // Populate plan selects
  const planSelects = ["progress-plan", "schedule-plan-select"]

  planSelects.forEach((selectId) => {
    const select = document.getElementById(selectId)
    if (select) {
      const firstOption = select.querySelector("option")
      select.innerHTML = ""
      if (firstOption) {
        select.appendChild(firstOption)
      }

      trainingPlans.forEach((plan) => {
        const option = document.createElement("option")
        option.value = plan.id
        option.textContent = `${plan.client_name} - ${plan.name}`
        select.appendChild(option)
      })
    }
  })
}

// Modal Functions
function showAddClientModal() {
  const modal = document.getElementById("add-client-modal")
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"
  }
}

function hideAddClientModal() {
  const modal = document.getElementById("add-client-modal")
  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
    document.getElementById("add-client-form").reset()
  }
}

function showCreatePlanModal() {
  const modal = document.getElementById("create-plan-modal")
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"
    populateSelects()
  }
}

function hideCreatePlanModal() {
  const modal = document.getElementById("create-plan-modal")
  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
    document.getElementById("create-plan-form").reset()
  }
}

function showScheduleModal() {
  const modal = document.getElementById("schedule-modal")
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"
    populateSelects()

    // Set today as default date
    const today = new Date().toISOString().split("T")[0]
    const dateInput = document.getElementById("schedule-date")
    if (dateInput) {
      dateInput.value = today
    }
  }
}

function hideScheduleModal() {
  const modal = document.getElementById("schedule-modal")
  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
    document.getElementById("schedule-form").reset()
  }
}

function showNotifications() {
  const modal = document.getElementById("notifications-modal")
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"
  }
}

function hideNotificationsModal() {
  const modal = document.getElementById("notifications-modal")
  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
  }
}

function hideAllModals() {
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => modal.classList.remove("show"))
  document.body.style.overflow = "auto"
}

// Form Setup and Handlers
function setupForms() {
  // Add Client Form
  const addClientForm = document.getElementById("add-client-form")
  if (addClientForm) {
    addClientForm.addEventListener("submit", handleAddClient)
  }

  // Create Plan Form
  const createPlanForm = document.getElementById("create-plan-form")
  if (createPlanForm) {
    createPlanForm.addEventListener("submit", handleCreatePlan)
  }

  // Progress Form
  const progressForm = document.getElementById("progress-form")
  if (progressForm) {
    progressForm.addEventListener("submit", handleProgressSubmit)
  }

  // Schedule Form
  const scheduleForm = document.getElementById("schedule-form")
  if (scheduleForm) {
    scheduleForm.addEventListener("submit", handleScheduleSubmit)
  }
}

async function handleAddClient(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const clientData = {
    id: clients.length + 1,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birth_date: formData.get("birth_date"),
    height: Number.parseInt(formData.get("height")),
    weight: Number.parseFloat(formData.get("weight")),
    goal: formData.get("goal"),
    notes: formData.get("notes"),
  }

  try {
    showLoading("Adicionando cliente...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    clients.push(clientData)

    hideAddClientModal()
    showToast("Cliente adicionado com sucesso!", "success")
    loadClients()
    updateStats()
    populateSelects()
  } catch (error) {
    showToast("Erro ao adicionar cliente", "error")
  } finally {
    hideLoading()
  }
}

async function handleCreatePlan(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const client = clients.find((c) => c.id == formData.get("client_id"))

  const planData = {
    id: trainingPlans.length + 1,
    client_id: Number.parseInt(formData.get("client_id")),
    client_name: client ? client.name : "",
    name: formData.get("name"),
    type: formData.get("type"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    objective: formData.get("objective"),
    details: formData.get("details"),
  }

  try {
    showLoading("Criando plano...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    trainingPlans.push(planData)

    hideCreatePlanModal()
    showToast("Plano criado com sucesso!", "success")
    loadPlans()
    updateStats()
    populateSelects()
  } catch (error) {
    showToast("Erro ao criar plano", "error")
  } finally {
    hideLoading()
  }
}

async function handleProgressSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const progressData = {
    id: progressRecords.length + 1,
    client_id: Number.parseInt(formData.get("client_id")),
    plan_id: Number.parseInt(formData.get("plan_id")),
    weight: Number.parseFloat(formData.get("weight")),
    body_fat: Number.parseFloat(formData.get("body_fat")),
    progress_details: formData.get("progress_details"),
    date: new Date().toISOString().split("T")[0],
  }

  try {
    showLoading("Registrando progresso...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    progressRecords.push(progressData)

    showToast("Progresso registrado com sucesso!", "success")
    e.target.reset()
  } catch (error) {
    showToast("Erro ao registrar progresso", "error")
  } finally {
    hideLoading()
  }
}

async function handleScheduleSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const client = clients.find((c) => c.id == formData.get("client_id"))
  const plan = trainingPlans.find((p) => p.id == formData.get("plan_id"))

  const scheduleData = {
    id: schedules.length + 1,
    client_id: Number.parseInt(formData.get("client_id")),
    client_name: client ? client.name : "",
    plan_id: Number.parseInt(formData.get("plan_id")),
    plan_name: plan ? plan.name : "",
    date: formData.get("date"),
    time: formData.get("time"),
    duration: Number.parseInt(formData.get("duration")),
    status: "scheduled",
    notes: formData.get("notes"),
  }

  try {
    showLoading("Agendando sessão...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    schedules.push(scheduleData)

    hideScheduleModal()
    showToast("Sessão agendada com sucesso!", "success")
    loadSchedule()
    updateStats()
  } catch (error) {
    showToast("Erro ao agendar sessão", "error")
  } finally {
    hideLoading()
  }
}

// Action Functions
function viewClientDetails(clientId) {
  const client = clients.find((c) => c.id === clientId)
  if (client) {
    showToast(`Visualizando detalhes de ${client.name}`, "info")
    // Here you would typically open a detailed view modal
  }
}

function editClient(clientId) {
  const client = clients.find((c) => c.id === clientId)
  if (client) {
    showToast(`Editando cliente ${client.name}`, "info")
    // Here you would populate edit form with client data
  }
}

async function deleteClient(clientId) {
  const client = clients.find((c) => c.id === clientId)
  if (!client) return

  if (!confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
    return
  }

  try {
    showLoading("Excluindo cliente...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Remove client and related data
    clients.splice(
      clients.findIndex((c) => c.id === clientId),
      1,
    )
    trainingPlans = trainingPlans.filter((p) => p.client_id !== clientId)
    schedules = schedules.filter((s) => s.client_id !== clientId)

    showToast("Cliente excluído com sucesso!", "success")
    loadClients()
    loadPlans()
    loadSchedule()
    updateStats()
    populateSelects()
  } catch (error) {
    showToast("Erro ao excluir cliente", "error")
  } finally {
    hideLoading()
  }
}

function viewPlanDetails(planId) {
  const plan = trainingPlans.find((p) => p.id === planId)
  if (plan) {
    showToast(`Visualizando detalhes do plano: ${plan.name}`, "info")
    // Here you would typically open a detailed view modal
  }
}

function editPlan(planId) {
  const plan = trainingPlans.find((p) => p.id === planId)
  if (plan) {
    showToast(`Editando plano: ${plan.name}`, "info")
    // Here you would populate edit form with plan data
  }
}

async function deletePlan(planId) {
  const plan = trainingPlans.find((p) => p.id === planId)
  if (!plan) return

  if (!confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`)) {
    return
  }

  try {
    showLoading("Excluindo plano...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    trainingPlans.splice(
      trainingPlans.findIndex((p) => p.id === planId),
      1,
    )
    schedules = schedules.filter((s) => s.plan_id !== planId)

    showToast("Plano excluído com sucesso!", "success")
    loadPlans()
    loadSchedule()
    updateStats()
    populateSelects()
  } catch (error) {
    showToast("Erro ao excluir plano", "error")
  } finally {
    hideLoading()
  }
}

async function startSession(scheduleId) {
  const schedule = schedules.find((s) => s.id === scheduleId)
  if (!schedule) return

  try {
    showLoading("Iniciando sessão...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    showToast(`Sessão com ${schedule.client_name} iniciada!`, "success")
    // Here you would typically navigate to workout tracking interface
  } catch (error) {
    showToast("Erro ao iniciar sessão", "error")
  } finally {
    hideLoading()
  }
}

async function cancelSchedule(scheduleId) {
  const schedule = schedules.find((s) => s.id === scheduleId)
  if (!schedule) return

  if (!confirm(`Tem certeza que deseja cancelar a sessão com ${schedule.client_name}?`)) {
    return
  }

  try {
    showLoading("Cancelando sessão...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId)
    if (scheduleIndex !== -1) {
      schedules[scheduleIndex].status = "cancelled"
    }

    showToast("Sessão cancelada com sucesso!", "success")
    loadSchedule()
    updateStats()
  } catch (error) {
    showToast("Erro ao cancelar sessão", "error")
  } finally {
    hideLoading()
  }
}

function editSchedule(scheduleId) {
  const schedule = schedules.find((s) => s.id === scheduleId)
  if (schedule) {
    showToast(`Editando agendamento com ${schedule.client_name}`, "info")
    // Here you would populate edit form with schedule data
  }
}

function filterSchedule() {
  showToast("Filtros aplicados", "info")
  // Here you would implement filtering logic
}

function markAllAsRead() {
  showToast("Todas as notificações foram marcadas como lidas", "success")
  const notificationCount = document.getElementById("notification-count")
  if (notificationCount) {
    notificationCount.textContent = "0"
  }
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

function getEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(":")
  const startDate = new Date()
  startDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))

  const endDate = new Date(startDate.getTime() + duration * 60000)
  return endDate.toTimeString().slice(0, 5)
}

// Loading Functions
function showLoading(text = "Carregando...") {
  if (loadingText) loadingText.textContent = text
  if (loadingOverlay) loadingOverlay.classList.add("show")
}

function hideLoading() {
  if (loadingOverlay) loadingOverlay.classList.remove("show")
}

// Toast Notification Functions
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toast-container")
  if (!toastContainer) return

  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  toastContainer.appendChild(toast)

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

// Logout Function
function logout() {
  if (confirm("Tem certeza que deseja sair?")) {
    showLoading("Fazendo logout...")

    setTimeout(() => {
      hideLoading()
      showToast("Logout realizado com sucesso!", "success")
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "login.html"
      }, 1000)
    }, 1000)
  }
}

// Global function assignments for window access
window.showSection = showSection
window.showAddClientModal = showAddClientModal
window.hideAddClientModal = hideAddClientModal
window.showCreatePlanModal = showCreatePlanModal
window.hideCreatePlanModal = hideCreatePlanModal
window.showScheduleModal = showScheduleModal
window.hideScheduleModal = hideScheduleModal
window.showNotifications = showNotifications
window.hideNotificationsModal = hideNotificationsModal
window.markAllAsRead = markAllAsRead
window.viewClientDetails = viewClientDetails
window.editClient = editClient
window.deleteClient = deleteClient
window.viewPlanDetails = viewPlanDetails
window.editPlan = editPlan
window.deletePlan = deletePlan
window.startSession = startSession
window.cancelSchedule = cancelSchedule
window.editSchedule = editSchedule
window.filterSchedule = filterSchedule
window.logout = logout