// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Estado da aplicação
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Elementos DOM
const loadingScreen = document.getElementById('loading-screen');
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeLoginModal = document.getElementById('close-login-modal');
const closeRegisterModal = document.getElementById('close-register-modal');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const contactForm = document.getElementById('contact-form');
const startTrainingBtn = document.getElementById('start-training');
const learnMoreBtn = document.getElementById('learn-more');

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Simular carregamento
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2000);

    // Configurar event listeners
    setupEventListeners();
    
    // Verificar se usuário está logado
    if (authToken) {
        validateToken();
    }
    
    // Configurar navegação suave
    setupSmoothScrolling();
    
    // Configurar navbar scroll effect
    setupNavbarScrollEffect();
}

function setupEventListeners() {
    // Toggle do menu mobile
    navToggle?.addEventListener('click', toggleMobileMenu);
    
    // Botões de login/registro
    loginBtn?.addEventListener('click', showLoginModal);
    showRegister?.addEventListener('click', showRegisterModal);
    showLogin?.addEventListener('click', showLoginModal);
    
    // Fechar modais
    closeLoginModal?.addEventListener('click', hideLoginModal);
    closeRegisterModal?.addEventListener('click', hideRegisterModal);
    
    // Fechar modal clicando fora
    loginModal?.addEventListener('click', (e) => {
        if (e.target === loginModal) hideLoginModal();
    });
    registerModal?.addEventListener('click', (e) => {
        if (e.target === registerModal) hideRegisterModal();
    });
    
    // Formulários
    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);
    contactForm?.addEventListener('submit', handleContactForm);
    
    // Botões da hero section
    startTrainingBtn?.addEventListener('click', handleStartTraining);
    learnMoreBtn?.addEventListener('click', () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Links de navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    
    // Animar hamburger
    const bars = navToggle.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        if (navMenu.classList.contains('active')) {
            if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) bar.style.opacity = '0';
            if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        }
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupNavbarScrollEffect() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Atualizar link ativo baseado na seção visível
        updateActiveNavLink();
        
        lastScrollTop = scrollTop;
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

function handleNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // Fechar menu mobile se estiver aberto
        if (navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    }
}

// Funções de Modal
function showLoginModal() {
    hideRegisterModal();
    loginModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideLoginModal() {
    loginModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function showRegisterModal() {
    hideLoginModal();
    registerModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideRegisterModal() {
    registerModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Funções de Autenticação
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        showLoading('Fazendo login...');
        
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Login bem-sucedido
            authToken = result.token;
            currentUser = result.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            hideLoginModal();
            showSuccess('Login realizado com sucesso!');
            updateUIForLoggedInUser();
            
            // Redirecionar baseado no tipo de usuário
            redirectBasedOnRole(currentUser.role);
            
        } else {
            showError(result.error || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showError('Erro de conexão. Tente novamente.');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    // Validação básica
    if (registerData.password.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    try {
        showLoading('Criando conta...');
        
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            hideRegisterModal();
            showSuccess('Conta criada com sucesso! Faça login para continuar.');
            showLoginModal();
            registerForm.reset();
        } else {
            showError(result.error || 'Erro ao criar conta');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        showError('Erro de conexão. Tente novamente.');
    } finally {
        hideLoading();
    }
}

async function validateToken() {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
        } else {
            // Token inválido
            logout();
        }
    } catch (error) {
        console.error('Erro ao validar token:', error);
        logout();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateUIForLoggedOutUser();
}

function updateUIForLoggedInUser() {
    if (loginBtn) {
        loginBtn.textContent = `Olá, ${currentUser.name}`;
        loginBtn.onclick = showUserMenu;
    }
}

function updateUIForLoggedOutUser() {
    if (loginBtn) {
        loginBtn.textContent = 'Entrar';
        loginBtn.onclick = showLoginModal;
    }
}

function showUserMenu() {
    // Implementar menu do usuário
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <div class="user-menu-content">
            <p>Logado como: <strong>${currentUser.name}</strong></p>
            <p>Tipo: <strong>${getRoleDisplayName(currentUser.role)}</strong></p>
            <button class="btn btn-primary" onclick="redirectBasedOnRole('${currentUser.role}')">
                Ir para Dashboard
            </button>
            <button class="btn btn-secondary" onclick="logout()">
                Sair
            </button>
        </div>
    `;
    
    document.body.appendChild(userMenu);
    
    // Remover menu após 5 segundos ou clique fora
    setTimeout(() => {
        if (userMenu.parentNode) {
            userMenu.parentNode.removeChild(userMenu);
        }
    }, 5000);
}

function getRoleDisplayName(role) {
    const roleNames = {
        'admin': 'Administrador',
        'personal': 'Personal Trainer',
        'user': 'Usuário'
    };
    return roleNames[role] || role;
}

function redirectBasedOnRole(role) {
    const redirectUrls = {
        'admin': 'admin-dashboard.html',
        'personal': 'personal-dashboard.html',
        'user': 'user-dashboard.html'
    };
    
    const url = redirectUrls[role];
    if (url) {
        window.location.href = url;
    } else {
        showError('Tipo de usuário não reconhecido');
    }
}

function handleStartTraining() {
    if (currentUser) {
        redirectBasedOnRole(currentUser.role);
    } else {
        showLoginModal();
    }
}

// Função para lidar com o formulário de contato
async function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
    };
    
    try {
        showLoading('Enviando mensagem...');
        
        // Simular envio (em uma implementação real, enviaria para o backend)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showSuccess('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        contactForm.reset();
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        showError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// Funções de Notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Adicionar estilos se não existirem
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                max-width: 400px;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideInRight 0.3s ease;
            }
            .notification-info { background: #1f2937; border-left: 4px solid #3b82f6; }
            .notification-success { background: #1f2937; border-left: 4px solid #10b981; }
            .notification-error { background: #1f2937; border-left: 4px solid #ef4444; }
            .notification-warning { background: #1f2937; border-left: 4px solid #f59e0b; }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: 1rem;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showWarning(message) {
    showNotification(message, 'warning');
}

// Funções de Loading
function showLoading(message = 'Carregando...') {
    let loadingOverlay = document.getElementById('loading-overlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        
        // Adicionar estilos se não existirem
        if (!document.querySelector('#loading-styles')) {
            const styles = document.createElement('style');
            styles.id = 'loading-styles';
            styles.textContent = `
                #loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 4000;
                }
                #loading-overlay .loading-content {
                    text-align: center;
                    color: white;
                }
                #loading-overlay .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #404040;
                    border-top: 3px solid #CC0000;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                #loading-overlay .loading-message {
                    font-size: 1.1rem;
                    margin: 0;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(loadingOverlay);
    } else {
        loadingOverlay.querySelector('.loading-message').textContent = message;
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Funções utilitárias
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

function formatTime(time) {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Animações e efeitos visuais
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos que devem ser animados
    document.querySelectorAll('.feature-card, .service-card, .contact-item').forEach(el => {
        observer.observe(el);
    });
}

// Inicializar animações quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addScrollAnimations, 100);
});

// Adicionar estilos de animação
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .feature-card, .service-card, .contact-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .feature-card.animate-in, .service-card.animate-in, .contact-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(animationStyles);

// Exportar funções para uso global
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.logout = logout;
window.redirectBasedOnRole = redirectBasedOnRole;


// Contagem
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.stat-number');
  const duration = 2000;

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const increment = target / (duration / 20);
    let count = 0;

    const updateCount = () => {
      count = Math.min(count + increment, target);

      if (count < target) {
        counter.innerText = Math.ceil(count);
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = `${target}${target < 100 ? '' : '+'}`;
      }
    };

    updateCount();
  });
});

// Carrosel
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carrossel-track");
  const slides = track.querySelectorAll("img");
  const total = slides.length;

  let index = 0;

  function deslizarCarrossel() {
    index = (index + 1) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  setInterval(deslizarCarrossel, 5000); // troca a cada 5 segundos
});

// NavBar Links
// Seleciona todos os links da navbar
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Verifica se o link é para a mesma página ou outra
        const target = this.getAttribute('href');
        
        if(target.startsWith('#')) {
            // Rolagem suave para seção na mesma página
            const section = document.querySelector(target);
            if(section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        } else if(target.includes('#')) {
            // Link para seção em outra página
            const [page, sectionId] = target.split('#');
            window.location.href = page;
            // Você pode usar sessionStorage para rolar após o carregamento
            sessionStorage.setItem('scrollTo', sectionId);
        } else {
            // Link normal para outra página
            window.location.href = target;
        }
    });
});

// Após carregar a página, verificar se precisa rolar para alguma seção
window.addEventListener('DOMContentLoaded', () => {
    const sectionId = sessionStorage.getItem('scrollTo');
    if(sectionId) {
        const section = document.querySelector(`#${sectionId}`);
        if(section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
        sessionStorage.removeItem('scrollTo');
    }
});