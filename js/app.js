const header = document.getElementById('site-header');
const footer = document.getElementById('site-footer');
const currentPath = window.location.pathname;
const isInsidePagesFolder = currentPath.includes('/pages/');
const homeHref = isInsidePagesFolder ? '../index.html' : 'index.html';

function getPageHref(page) {
  return isInsidePagesFolder ? page : `pages/${page}`;
}

function ensureDemoUsers() {
  const existingUsers = JSON.parse(localStorage.getItem('fitmanager-users') || '[]');
  const hasAdmin = existingUsers.some((user) => user.email === 'admin@fitmanager.com');
  const hasStudent = existingUsers.some((user) => user.email === 'aluno@fitmanager.com');

  if (!hasAdmin) {
    existingUsers.push({
      name: 'Administrador FitManager',
      email: 'admin@fitmanager.com',
      password: 'admin123',
      plan: 'Premium',
      role: 'admin'
    });
  }

  if (!hasStudent) {
    existingUsers.push({
      name: 'Carlos Mendes',
      email: 'aluno@fitmanager.com',
      password: 'aluno123',
      plan: 'Fit',
      role: 'student'
    });
  }

  localStorage.setItem('fitmanager-users', JSON.stringify(existingUsers));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('fitmanager-current-user') || 'null');
  } catch {
    return null;
  }
}

function logoutUser() {
  localStorage.removeItem('fitmanager-current-user');
  window.location.href = getPageHref('login.html');
}

function renderHeader() {
  const user = getCurrentUser();

  if (header) {
    header.innerHTML = `
      <header>
        <nav class="navbar">
          <a class="brand" href="${homeHref}">FitManager</a>
          <div class="nav-links">
            <a href="${homeHref}">Home</a>
            <a href="${getPageHref('sobre.html')}">Sobre</a>
            <a href="${getPageHref('planos.html')}">Planos</a>
            <a href="${getPageHref('professores.html')}">Professores</a>
            <a href="${getPageHref('contato.html')}">Contato</a>
            ${user ? `<a href="${getPageHref('painel-aluno.html')}">Meu painel</a>` : `<a href="${getPageHref('login.html')}">Login</a>`}
            ${user ? '<button type="button" class="btn btn--secondary btn--small logout-btn">Sair</button>' : ''}
          </div>
        </nav>
      </header>
    `;

    const logoutButton = header.querySelector('.logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', logoutUser);
    }
  }
}

if (footer) {
  footer.innerHTML = `
    <footer>
      <p>FitManager © 2026 - Sistema de gestão para academias</p>
    </footer>
  `;
}

ensureDemoUsers();
renderHeader();

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const users = JSON.parse(localStorage.getItem('fitmanager-users') || '[]');
    const user = users.find((item) => item.email === email && item.password === password);

    if (user) {
      localStorage.setItem('fitmanager-current-user', JSON.stringify(user));
      if (user.role === 'admin') {
        window.location.href = getPageHref('painel-admin.html');
      } else {
        window.location.href = getPageHref('painel-aluno.html');
      }
    } else {
      alert('Credenciais inválidas. Use os exemplos abaixo: admin@fitmanager.com / admin123 ou aluno@fitmanager.com / aluno123.');
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const users = JSON.parse(localStorage.getItem('fitmanager-users') || '[]');
    const newUser = {
      name: document.getElementById('register-name').value.trim(),
      email: document.getElementById('register-email').value.trim(),
      password: document.getElementById('register-password').value.trim(),
      plan: document.getElementById('register-plan').value,
      role: 'student'
    };

    const alreadyExists = users.some((user) => user.email === newUser.email);
    if (alreadyExists) {
      alert('Esse e-mail já foi cadastrado.');
      return;
    }

    users.push(newUser);
    localStorage.setItem('fitmanager-users', JSON.stringify(users));
    alert('Cadastro realizado com sucesso! Você pode entrar na plataforma.');
    window.location.href = getPageHref('login.html');
  });
}

const protectedPanel = document.getElementById('protected-panel');
if (protectedPanel) {
  const user = getCurrentUser();
  const requiredRole = protectedPanel.dataset.requiredRole;
  const notice = document.getElementById('auth-notice');

  if (!user) {
    if (notice) {
      notice.innerHTML = `
        <div class="card empty-state">
          <h3>Você está desconectado</h3>
          <p>Entre com uma conta para acessar este painel.</p>
          <a class="btn btn--primary" href="login.html">Ir para login</a>
        </div>
      `;
    }
    protectedPanel.style.display = 'none';
  } else if (requiredRole && user.role !== requiredRole) {
    if (notice) {
      notice.innerHTML = `
        <div class="card empty-state">
          <h3>Acesso negado</h3>
          <p>Este painel é exclusivo para ${requiredRole === 'admin' ? 'administradores' : 'alunos'}.</p>
          <a class="btn btn--primary" href="login.html">Trocar conta</a>
        </div>
      `;
    }
    protectedPanel.style.display = 'none';
  }
}
