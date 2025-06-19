// Admin Dashboard JavaScript
const API_URL = "http://localhost:3000/api"
const authToken = localStorage.getItem("authToken")
const currentUser = JSON.parse(localStorage.getItem("currentUser"))

// Verificar se o usuário está logado e é admin
document.addEventListener("DOMContentLoaded", () => {
  if (!authToken || !currentUser || currentUser.role !== "admin") {
    window.location.href = "index.html"
    return
  }

  initializeAdminDashboard()
})

function initializeAdminDashboard() {
  // Configurar nome do usuário
  document.getElementById("admin-name").textContent = currentUser.name

  // Configurar navegação
  setupNavigation()

  // Carregar dados iniciais
  loadDashboardStats()
  loadUsers()
  loadEmployees()

  // Configurar formulários
  setupForms()
}

function setupNavigation() {
  // Toggle sidebar
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebar = document.querySelector(".sidebar")

  sidebarToggle?.addEventListener("click", () => {
    sidebar.classList.toggle("active")
  })

  // Navigation items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      const section = item.dataset.section
      showSection(section)

      // Update active nav item
      document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"))
      item.classList.add("active")
    })
  })
}

function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active")
  })

  // Show target section
  const targetSection = document.getElementById(`${sectionName}-section`)
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Update page title
  const titles = {
    dashboard: "Dashboard",
    users: "Gerenciar Usuários",
    employees: "Gerenciar Funcionários",
    reports: "Relatórios",
    settings: "Configurações",
    schedules: "Agendamentos",
  }

  document.getElementById("page-title").textContent = titles[sectionName] || "Dashboard"

  // Load section-specific data
  switch (sectionName) {
    case "users":
      loadUsers()
      break
    case "employees":
      loadEmployees()
      break
    case "schedules":
      loadSchedules()
      loadTrainersForFilter()
      break
  }
}

async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const stats = await response.json()

      document.getElementById("total-users").textContent = stats.totalUsers
      document.getElementById("total-personal").textContent = stats.totalPersonal
      document.getElementById("total-plans").textContent = stats.totalPlans
      document.getElementById("total-sessions").textContent = stats.totalSchedules || stats.totalSessions
    }
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error)
  }
}

async function loadUsers() {
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const users = await response.json()
      displayUsers(users)
    }
  } catch (error) {
    console.error("Erro ao carregar usuários:", error)
    showError("Erro ao carregar usuários")
  }
}

function displayUsers(users) {
  const tbody = document.getElementById("users-table-body")
  tbody.innerHTML = ""

  users.forEach((user) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role}">${getRoleDisplayName(user.role)}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-edit" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `
    tbody.appendChild(row)
  })
}

async function loadEmployees() {
  try {
    const response = await fetch(`${API_URL}/admin/employees`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const employees = await response.json()
      displayEmployees(employees)
    }
  } catch (error) {
    console.error("Erro ao carregar funcionários:", error)
    showError("Erro ao carregar funcionários")
  }
}

function displayEmployees(employees) {
  const tbody = document.getElementById("employees-table-body")
  tbody.innerHTML = ""

  employees.forEach((employee) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>${employee.function}</td>
            <td><span class="role-badge role-${employee.role}">${getRoleDisplayName(employee.role)}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-edit" onclick="editEmployee(${employee.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteEmployee(${employee.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `
    tbody.appendChild(row)
  })
}

function setupForms() {
  // Add User Form
  const addUserForm = document.getElementById("add-user-form")
  addUserForm?.addEventListener("submit", handleAddUser)

  // Add Employee Form
  const addEmployeeForm = document.getElementById("add-employee-form")
  addEmployeeForm?.addEventListener("submit", handleAddEmployee)

  // Schedule Training Form
  const scheduleTrainingForm = document.getElementById("schedule-training-form")
  scheduleTrainingForm?.addEventListener("submit", handleScheduleTraining)
}

async function handleAddUser(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const userData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  }

  try {
    showLoading("Criando usuário...")

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()

    if (response.ok) {
      showSuccess("Usuário criado com sucesso!")
      hideAddUserModal()
      loadUsers()
      loadDashboardStats()
      e.target.reset()
    } else {
      showError(result.error || "Erro ao criar usuário")
    }
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    showError("Erro de conexão. Tente novamente.")
  } finally {
    hideLoading()
  }
}

async function handleAddEmployee(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const employeeData = {
    user_id: formData.get("user_id"),
    function: formData.get("function"),
  }

  try {
    showLoading("Criando funcionário...")

    const response = await fetch(`${API_URL}/admin/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(employeeData),
    })

    const result = await response.json()

    if (response.ok) {
      showSuccess("Funcionário criado com sucesso!")
      hideAddEmployeeModal()
      loadEmployees()
      loadDashboardStats()
      e.target.reset()
    } else {
      showError(result.error || "Erro ao criar funcionário")
    }
  } catch (error) {
    console.error("Erro ao criar funcionário:", error)
    showError("Erro de conexão. Tente novamente.")
  } finally {
    hideLoading()
  }
}

// Modal Functions
function showAddUserModal() {
  const modal = document.getElementById("add-user-modal")
  modal.classList.add("show")
  document.body.style.overflow = "hidden"
}

function hideAddUserModal() {
  const modal = document.getElementById("add-user-modal")
  modal.classList.remove("show")
  document.body.style.overflow = "auto"
}

async function showAddEmployeeModal() {
  // Load users for the dropdown
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const users = await response.json()
      const select = document.getElementById("employee-user")
      select.innerHTML = '<option value="">Selecione um usuário</option>'

      users.forEach((user) => {
        const option = document.createElement("option")
        option.value = user.id
        option.textContent = `${user.name} (${user.email})`
        select.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Erro ao carregar usuários:", error)
  }

  const modal = document.getElementById("add-employee-modal")
  modal.classList.add("show")
  document.body.style.overflow = "hidden"
}

function hideAddEmployeeModal() {
  const modal = document.getElementById("add-employee-modal")
  modal.classList.remove("show")
  document.body.style.overflow = "auto"
}

// CRUD Functions
async function deleteUser(userId) {
  if (!confirm("Tem certeza que deseja deletar este usuário?")) {
    return
  }

  try {
    showLoading("Deletando usuário...")

    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    const result = await response.json()

    if (response.ok) {
      showSuccess("Usuário deletado com sucesso!")
      loadUsers()
      loadDashboardStats()
    } else {
      showError(result.error || "Erro ao deletar usuário")
    }
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    showError("Erro de conexão. Tente novamente.")
  } finally {
    hideLoading()
  }
}

function editUser(userId) {
  // Implementar edição de usuário
  showInfo("Funcionalidade de edição em desenvolvimento")
}

function editEmployee(employeeId) {
  // Implementar edição de funcionário
  showInfo("Funcionalidade de edição em desenvolvimento")
}

function deleteEmployee(employeeId) {
  // Implementar exclusão de funcionário
  showInfo("Funcionalidade de exclusão em desenvolvimento")
}

// Utility Functions
function getRoleDisplayName(role) {
  const roleNames = {
    admin: "Administrador",
    personal: "Personal Trainer",
    user: "Usuário",
  }
  return roleNames[role] || role
}

// Add role badge styles
const roleStyles = document.createElement("style")
roleStyles.textContent = `
    .role-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    .role-admin {
        background: rgba(239, 68, 68, 0.2);
        color: #7d0202;
    }
    .role-personal {
        background: rgba(220, 38, 38, 0.2);
        color: #7d0202;
    }
    .role-user {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }
`
document.head.appendChild(roleStyles)

// Schedule Management Functions
async function loadSchedules() {
  try {
    const response = await fetch(`${API_URL}/admin/schedules`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const schedules = await response.json()
      displaySchedules(schedules)
    }
  } catch (error) {
    console.error("Erro ao carregar agendamentos:", error)
    showError("Erro ao carregar agendamentos")
  }
}

function displaySchedules(schedules) {
  const tbody = document.getElementById("schedules-table-body")
  tbody.innerHTML = ""

  schedules.forEach((schedule) => {
    const row = document.createElement("tr")
    const statusClass = getStatusClass(schedule.status)

    row.innerHTML = `
            <td>${schedule.id}</td>
            <td>${schedule.client_name}</td>
            <td>${schedule.trainer_name}</td>
            <td>${formatDate(schedule.date)}</td>
            <td>${schedule.time}</td>
            <td><span class="status-badge ${statusClass}">${getStatusDisplayName(schedule.status)}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-edit" onclick="editSchedule(${schedule.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="completeSchedule(${schedule.id})" title="Marcar como concluído">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="cancelSchedule(${schedule.id})" title="Cancelar">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteSchedule(${schedule.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `
    tbody.appendChild(row)
  })
}

async function loadTrainersForFilter() {
  try {
    const response = await fetch(`${API_URL}/admin/trainers`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const trainers = await response.json()
      const select = document.getElementById("trainer-filter")

      trainers.forEach((trainer) => {
        const option = document.createElement("option")
        option.value = trainer.id
        option.textContent = trainer.name
        select.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Erro ao carregar personal trainers:", error)
  }
}

async function showScheduleTrainingModal() {
  try {
    // Load clients
    const clientsResponse = await fetch(`${API_URL}/admin/clients`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (clientsResponse.ok) {
      const clients = await clientsResponse.json()
      const clientSelect = document.getElementById("schedule-client")
      clientSelect.innerHTML = '<option value="">Selecione um cliente</option>'

      clients.forEach((client) => {
        const option = document.createElement("option")
        option.value = client.id
        option.textContent = `${client.name} (${client.email})`
        clientSelect.appendChild(option)
      })
    }

    // Load trainers
    const trainersResponse = await fetch(`${API_URL}/admin/trainers`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (trainersResponse.ok) {
      const trainers = await trainersResponse.json()
      const trainerSelect = document.getElementById("schedule-trainer")
      trainerSelect.innerHTML = '<option value="">Selecione um personal trainer</option>'

      trainers.forEach((trainer) => {
        const option = document.createElement("option")
        option.value = trainer.id
        option.textContent = trainer.name
        trainerSelect.appendChild(option)
      })
    }

    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("schedule-date").min = today
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
  }

  const modal = document.getElementById("schedule-training-modal")
  modal.classList.add("show")
  document.body.style.overflow = "hidden"
}

function hideScheduleTrainingModal() {
  const modal = document.getElementById("schedule-training-modal")
  modal.classList.remove("show")
  document.body.style.overflow = "auto"
}

async function handleScheduleTraining(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const scheduleData = {
    client_id: formData.get("client_id"),
    trainer_id: formData.get("trainer_id"),
    date: formData.get("date"),
    time: formData.get("time"),
    duration: formData.get("duration"),
    notes: formData.get("notes"),
    status: "agendado",
  }

  try {
    showLoading("Agendando treino...")

    const response = await fetch(`${API_URL}/admin/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(scheduleData),
    })

    const result = await response.json()

    if (response.ok) {
      showSuccess("Treino agendado com sucesso!")
      hideScheduleTrainingModal()
      loadSchedules()
      loadDashboardStats()
      e.target.reset()
    } else {
      showError(result.error || "Erro ao agendar treino")
    }
  } catch (error) {
    console.error("Erro ao agendar treino:", error)
    showError("Erro de conexão. Tente novamente.")
  } finally {
    hideLoading()
  }
}

async function completeSchedule(scheduleId) {
  try {
    showLoading("Atualizando status...")

    const response = await fetch(`${API_URL}/admin/schedules/${scheduleId}/complete`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      showSuccess("Treino marcado como concluído!")
      loadSchedules()
    } else {
      showError("Erro ao atualizar status")
    }
  } catch (error) {
    console.error("Erro ao completar agendamento:", error)
    showError("Erro de conexão. Tente novamente.")
  } finally {
    hideLoading()
  }
}

async function cancelSchedule(scheduleId) {
  if (!confirm("Tem certeza que deseja cancelar este agendamento?")) {
    return
  }

  try {
    showLoading("Cancelando agendamento...")

    const response = await fetch(`${API_URL}/admin/schedules/${scheduleId}/cancel`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      showSuccess("Agendamento cancelado!")
      loadSchedules()
    } else {
      showError("Erro ao cancelar agendamento")
    }
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error)
    showError("Erro de conexão. Tente novamente.")
  } finally {
    hideLoading()
  }
}

async function deleteSchedule(scheduleId) {
  if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
    return
  }

  try {
    showLoading("Excluindo agendamento...")

    const response = await fetch(`${API_URL}/admin/schedules/${scheduleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      showSuccess("Agendamento excluído!")
      loadSchedules()
      loadDashboardStats()
    } else {
      showError("Erro ao excluir agendamento")
    }
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error)
    showError("Erro de conexão. Tente novamente.")
  } finally {
    hideLoading()
  }
}

function filterSchedules() {
  const dateFilter = document.getElementById("date-filter").value
  const trainerFilter = document.getElementById("trainer-filter").value
  const statusFilter = document.getElementById("status-filter").value

  // Implementar lógica de filtro
  loadSchedules() // Por enquanto, recarrega todos
}

function editSchedule(scheduleId) {
  showInfo("Funcionalidade de edição em desenvolvimento")
}

// Utility functions for schedules
function getStatusClass(status) {
  const statusClasses = {
    agendado: "status-scheduled",
    concluido: "status-completed",
    cancelado: "status-cancelled",
  }
  return statusClasses[status] || "status-scheduled"
}

function getStatusDisplayName(status) {
  const statusNames = {
    agendado: "Agendado",
    concluido: "Concluído",
    cancelado: "Cancelado",
  }
  return statusNames[status] || status
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

// Global functions for window access
window.showSection = showSection
window.showAddUserModal = showAddUserModal
window.hideAddUserModal = hideAddUserModal
window.showAddEmployeeModal = showAddEmployeeModal
window.hideAddEmployeeModal = hideAddEmployeeModal
window.editUser = editUser
window.deleteUser = deleteUser
window.editEmployee = editEmployee
window.deleteEmployee = deleteEmployee
window.showScheduleTrainingModal = showScheduleTrainingModal
window.hideScheduleTrainingModal = hideScheduleTrainingModal
window.completeSchedule = completeSchedule
window.cancelSchedule = cancelSchedule
window.deleteSchedule = deleteSchedule
window.editSchedule = editSchedule
window.filterSchedules = filterSchedules