// Global Variables
const currentUser = {
  id: 1,
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "(11) 99999-9999",
  birth_date: "1990-05-15",
  height: 175,
  goal: "muscle-gain",
}

const trainingPlans = [
  {
    id: 1,
    name: "Plano de Força",
    trainer: "Maria Santos",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    objective: "Ganho de massa muscular e força",
    status: "active",
    details: [
      "Segunda: Peito e Tríceps",
      "Terça: Costas e Bíceps",
      "Quarta: Pernas",
      "Quinta: Ombros",
      "Sexta: Cardio",
    ],
  },
  {
    id: 2,
    name: "Plano Cardio",
    trainer: "Carlos Lima",
    startDate: "2024-06-15",
    endDate: "2024-07-15",
    objective: "Perda de peso e condicionamento",
    status: "active",
    details: ["Segunda: HIIT 30min", "Quarta: Corrida 45min", "Sexta: Bike 40min", "Sábado: Natação 30min"],
  },
]

const schedules = [
  {
    id: 1,
    planName: "Treino de Força",
    trainer: "Maria Santos",
    date: "2024-06-20",
    time: "14:00",
    status: "scheduled",
    notes: "Foco em peito e tríceps",
  },
  {
    id: 2,
    planName: "Treino Cardio",
    trainer: "Carlos Lima",
    date: "2024-06-21",
    time: "16:00",
    status: "scheduled",
    notes: "HIIT intenso",
  },
  {
    id: 3,
    planName: "Treino de Força",
    trainer: "Maria Santos",
    date: "2024-06-18",
    time: "14:00",
    status: "completed",
    notes: "Treino concluído com sucesso",
  },
]

const notifications = [
  {
    id: 1,
    type: "schedule",
    title: "Treino Agendado",
    message: "Seu treino de força foi agendado para hoje às 14:00",
    time: "2 horas atrás",
    read: false,
  },
  {
    id: 2,
    type: "achievement",
    title: "Nova Conquista!",
    message: "Parabéns! Você completou 25 treinos",
    time: "1 dia atrás",
    read: false,
  },
  {
    id: 3,
    type: "plan",
    title: "Novo Plano Disponível",
    message: "Maria Santos criou um novo plano de treino para você",
    time: "3 dias atrás",
    read: true,
  },
]

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
  loadUserData()
})

function initializeDashboard() {
  setupNavigation()
  updateUserInfo()
  updateStats()
  updateNotificationCount()

  // Setup sidebar toggle
  sidebarToggle.addEventListener("click", toggleSidebar)

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
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
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
      if (window.innerWidth <= 768) {
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
    training: "Meus Treinos",
    schedule: "Agendamentos",
    progress: "Meu Progresso",
    profile: "Meu Perfil",
  }

  pageTitle.textContent = titles[sectionName] || "Dashboard"

  // Load section-specific data
  switch (sectionName) {
    case "training":
      loadTrainingPlans()
      break
    case "schedule":
      loadSchedules()
      break
    case "profile":
      loadProfileData()
      break
  }
}

function toggleSidebar() {
  sidebar.classList.toggle("active")
}

// User Data Functions
function loadUserData() {
  updateUserInfo()
  updateStats()
}

function updateUserInfo() {
  document.getElementById("user-name").textContent = currentUser.name
  document.getElementById("welcome-name").textContent = currentUser.name
  document.getElementById("profile-name").textContent = currentUser.name
  document.getElementById("profile-email").textContent = currentUser.email
}

function updateStats() {
  // Update dashboard stats
  document.getElementById("total-plans").textContent = trainingPlans.filter((p) => p.status === "active").length
  document.getElementById("total-sessions").textContent = schedules.filter((s) => s.status === "scheduled").length
  document.getElementById("total-workouts").textContent = "28" // Mock data
}

function updateNotificationCount() {
  const unreadCount = notifications.filter((n) => !n.read).length
  document.getElementById("notification-count").textContent = unreadCount
}

// Training Functions
function loadTrainingPlans() {
  const container = document.getElementById("training-plans")
  if (!container) return

  container.innerHTML = ""

  trainingPlans.forEach((plan) => {
    const planCard = createTrainingPlanCard(plan)
    container.appendChild(planCard)
  })
}

function createTrainingPlanCard(plan) {
  const card = document.createElement("div")
  card.className = "training-plan-card"

  card.innerHTML = `
        <div class="plan-header">
            <h3>${plan.name}</h3>
            <span class="plan-status ${plan.status}">${plan.status === "active" ? "Ativo" : "Inativo"}</span>
        </div>
        <div class="plan-content">
            <p><strong>Personal:</strong> ${plan.trainer}</p>
            <p><strong>Período:</strong> ${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}</p>
            <p><strong>Objetivo:</strong> ${plan.objective}</p>
            <div class="plan-details">
                <h4>Detalhes do Treino:</h4>
                <ul>
                    ${plan.details.map((detail) => `<li>${detail}</li>`).join("")}
                </ul>
            </div>
            <div class="plan-actions">
                <button class="btn btn-secondary" onclick="viewPlanDetails(${plan.id})">
                    <i class="fas fa-eye"></i>
                    Ver Detalhes
                </button>
                <button class="btn btn-primary" onclick="startWorkout(${plan.id})">
                    <i class="fas fa-play"></i>
                    Iniciar Treino
                </button>
            </div>
        </div>
    `

  return card
}

function viewPlanDetails(planId) {
  const plan = trainingPlans.find((p) => p.id === planId)
  if (plan) {
    showToast(`Visualizando detalhes do ${plan.name}`, "info")
    // Here you would typically open a detailed view modal
  }
}

function startWorkout(planId) {
  const plan = trainingPlans.find((p) => p.id === planId)
  if (plan) {
    showLoading("Iniciando treino...")

    setTimeout(() => {
      hideLoading()
      showToast(`Treino ${plan.name} iniciado com sucesso!`, "success")
      // Here you would typically navigate to workout tracking interface
    }, 1500)
  }
}

function requestNewPlan() {
  showLoading("Enviando solicitação...")

  setTimeout(() => {
    hideLoading()
    showToast("Solicitação enviada! Seu personal trainer entrará em contato em breve.", "success")
  }, 1000)
}

// Schedule Functions
function loadSchedules() {
  const container = document.getElementById("schedule-list")
  if (!container) return

  container.innerHTML = ""

  schedules.forEach((schedule) => {
    const scheduleItem = createScheduleItem(schedule)
    container.appendChild(scheduleItem)
  })
}

function createScheduleItem(schedule) {
  const item = document.createElement("div")
  item.className = "schedule-item"

  const date = new Date(schedule.date)
  const day = date.getDate()
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()

  const statusText = {
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
            <h4>${schedule.planName}</h4>
            <p><i class="fas fa-clock"></i> ${schedule.time} - ${getEndTime(schedule.time)}</p>
            <p><i class="fas fa-user"></i> ${schedule.trainer}</p>
        </div>
        <div class="schedule-actions">
            <span class="status-badge status-${schedule.status}">${statusText[schedule.status]}</span>
            ${
              schedule.status === "scheduled"
                ? `<button class="btn btn-sm btn-warning" onclick="cancelSchedule(${schedule.id})">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>`
                : schedule.status === "completed"
                  ? `<button class="btn btn-sm btn-secondary" onclick="viewWorkoutSummary(${schedule.id})">
                    <i class="fas fa-eye"></i>
                    Ver Resumo
                </button>`
                  : ""
            }
        </div>
    `

  return item
}

function getEndTime(startTime) {
  const [hours, minutes] = startTime.split(":")
  const endHour = Number.parseInt(hours) + 1
  return `${endHour.toString().padStart(2, "0")}:${minutes}`
}

function showScheduleModal() {
  const modal = document.getElementById("schedule-modal")
  modal.classList.add("show")
  document.body.style.overflow = "hidden"
}

function hideScheduleModal() {
  const modal = document.getElementById("schedule-modal")
  modal.classList.remove("show")
  document.body.style.overflow = "auto"
  document.getElementById("schedule-form").reset()
}

function cancelSchedule(scheduleId) {
  if (!confirm("Tem certeza que deseja cancelar este agendamento?")) {
    return
  }

  showLoading("Cancelando agendamento...")

  setTimeout(() => {
    const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId)
    if (scheduleIndex !== -1) {
      schedules[scheduleIndex].status = "cancelled"
    }

    hideLoading()
    showToast("Agendamento cancelado com sucesso!", "success")
    loadSchedules()
    updateStats()
  }, 1000)
}

function viewWorkoutSummary(scheduleId) {
  const schedule = schedules.find((s) => s.id === scheduleId)
  if (schedule) {
    showToast(`Visualizando resumo do treino de ${schedule.date}`, "info")
    // Here you would typically show workout summary modal
  }
}

function filterSchedules() {
  // Implementation for filtering schedules
  showToast("Filtros aplicados", "info")
}

// Progress Functions
function addMeasurement() {
  showToast("Funcionalidade de adicionar medição em desenvolvimento", "info")
}

function viewFullProgress() {
  showToast("Visualizando progresso completo", "info")
}

// Profile Functions
function loadProfileData() {
  document.getElementById("profile-name-input").value = currentUser.name
  document.getElementById("profile-email-input").value = currentUser.email
  document.getElementById("profile-phone").value = currentUser.phone
  document.getElementById("profile-birth").value = currentUser.birth_date
  document.getElementById("profile-height").value = currentUser.height
  document.getElementById("profile-goal").value = currentUser.goal
}

function changeAvatar() {
  showToast("Funcionalidade de alterar avatar em desenvolvimento", "info")
}

function resetForm() {
  loadProfileData()
  showToast("Formulário resetado", "info")
}

// Notification Functions
function showNotifications() {
  const modal = document.getElementById("notifications-modal")
  modal.classList.add("show")
  document.body.style.overflow = "hidden"
}

function hideNotificationsModal() {
  const modal = document.getElementById("notifications-modal")
  modal.classList.remove("show")
  document.body.style.overflow = "auto"
}

function markAllAsRead() {
  notifications.forEach((notification) => {
    notification.read = true
  })

  updateNotificationCount()
  showToast("Todas as notificações foram marcadas como lidas", "success")
}

// Form Setup and Handlers
function setupForms() {
  // Schedule Form
  const scheduleForm = document.getElementById("schedule-form")
  if (scheduleForm) {
    scheduleForm.addEventListener("submit", handleScheduleSubmit)
  }

  // Profile Form
  const profileForm = document.getElementById("profile-form")
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileSubmit)
  }

  // Password Form
  const passwordForm = document.getElementById("password-form")
  if (passwordForm) {
    passwordForm.addEventListener("submit", handlePasswordSubmit)
  }
}

async function handleScheduleSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const scheduleData = {
    planId: formData.get("training_plan_id"),
    trainerId: formData.get("trainer_id"),
    date: formData.get("date"),
    time: formData.get("time"),
    notes: formData.get("notes"),
  }

  try {
    showLoading("Agendando treino...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const plan = trainingPlans.find((p) => p.id == scheduleData.planId)
    const trainerName = scheduleData.trainerId === "maria" ? "Maria Santos" : "Carlos Lima"

    const newSchedule = {
      id: schedules.length + 1,
      planName: plan ? plan.name : "Treino Personalizado",
      trainer: trainerName,
      date: scheduleData.date,
      time: scheduleData.time,
      status: "scheduled",
      notes: scheduleData.notes,
    }

    schedules.push(newSchedule)

    hideScheduleModal()
    showToast("Treino agendado com sucesso!", "success")
    loadSchedules()
    updateStats()
  } catch (error) {
    showToast("Erro ao agendar treino", "error")
  } finally {
    hideLoading()
  }
}

async function handleProfileSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)

  try {
    showLoading("Salvando alterações...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update current user data
    currentUser.name = formData.get("name")
    currentUser.phone = formData.get("phone")
    currentUser.birth_date = formData.get("birth_date")
    currentUser.height = formData.get("height")
    currentUser.goal = formData.get("goal")

    updateUserInfo()
    showToast("Perfil atualizado com sucesso!", "success")
  } catch (error) {
    showToast("Erro ao salvar alterações", "error")
  } finally {
    hideLoading()
  }
}

async function handlePasswordSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const currentPassword = formData.get("current_password")
  const newPassword = formData.get("new_password")
  const confirmPassword = formData.get("confirm_password")

  if (newPassword !== confirmPassword) {
    showToast("As senhas não coincidem", "error")
    return
  }

  if (newPassword.length < 6) {
    showToast("A nova senha deve ter pelo menos 6 caracteres", "error")
    return
  }

  try {
    showLoading("Alterando senha...")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    showToast("Senha alterada com sucesso!", "success")
    e.target.reset()
  } catch (error) {
    showToast("Erro ao alterar senha", "error")
  } finally {
    hideLoading()
  }
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

function hideAllModals() {
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => modal.classList.remove("show"))
  document.body.style.overflow = "auto"
}

// Loading Functions
function showLoading(text = "Carregando...") {
  loadingText.textContent = text
  loadingOverlay.classList.add("show")
}

function hideLoading() {
  loadingOverlay.classList.remove("show")
}

// Toast Notification Functions
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toast-container")

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
window.showScheduleModal = showScheduleModal
window.hideScheduleModal = hideScheduleModal
window.showNotifications = showNotifications
window.hideNotificationsModal = hideNotificationsModal
window.markAllAsRead = markAllAsRead
window.viewPlanDetails = viewPlanDetails
window.startWorkout = startWorkout
window.requestNewPlan = requestNewPlan
window.cancelSchedule = cancelSchedule
window.viewWorkoutSummary = viewWorkoutSummary
window.filterSchedules = filterSchedules
window.addMeasurement = addMeasurement
window.viewFullProgress = viewFullProgress
window.changeAvatar = changeAvatar
window.resetForm = resetForm
window.logout = logout