/* global localStorage, alert, confirm, Chart, lucide */
const API_URL = 'https://fintrack-api-a3by.onrender.com'

const COLORS = [
  '#0ea5e9',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#64748b',
  '#14b8a6',
]

let donutChart = null
let token = localStorage.getItem('token')

const categoryIcons = {
  Alimentação: '🍔',
  Transporte: '🚗',
  Moradia: '🏠',
  Lazer: '🎮',
  Saúde: '💊',
  Educação: '📚',
  Serviços: '🛠️',
  Outros: '📦',
  Receita: '💰',
  Salário: '💼',
  manual: '✏️',
  pendente: '⏳',
}

const loginSection = document.getElementById('login-section')
const dashboardSection = document.getElementById('dashboard-section')
const loginError = document.getElementById('login-error')
const btnLogout = document.getElementById('btnLogout')
const btnAtualizar = document.getElementById('btnAtualizar')
const loadingEl = document.getElementById('loading')
const errorEl = document.getElementById('error')
const monthSelect = document.getElementById('month-select')
const yearSelect = document.getElementById('year-select')
const tabLogin = document.getElementById('tab-login')
const tabRegister = document.getElementById('tab-register')
const formLogin = document.getElementById('form-login')
const formRegister = document.getElementById('form-register')
const emailInput = document.getElementById('email-input')
const passwordInput = document.getElementById('password-input')
const loginBtn = document.getElementById('login-btn')
const regName = document.getElementById('reg-name')
const regEmail = document.getElementById('reg-email')
const regPassword = document.getElementById('reg-password')
const registerBtn = document.getElementById('register-btn')

let currentTransactions = []
let currentFilter = 'all'

function init() {
  if (token) {
    showDashboard()
    loadData()
  } else {
    showLogin()
  }

  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  monthSelect.innerHTML = months
    .map((m, i) => `<option value="${i + 1}">${m}</option>`)
    .join('')

  yearSelect.innerHTML = ''
  const currentYear = new Date().getFullYear()
  for (let y = currentYear; y >= currentYear - 5; y--) {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`
  }

  const now = new Date()
  monthSelect.value = now.getMonth() + 1
  yearSelect.value = now.getFullYear()

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => {
        b.classList.remove('active', 'bg-slate-900', 'text-white')
      })
      btn.classList.add('active', 'bg-slate-900', 'text-white')
      currentFilter = btn.dataset.filter
      renderTransactions()
    })
  })
}

function showLogin() {
  loginSection.classList.remove('hidden')
  dashboardSection.classList.add('hidden')
  tabLogin.click()
}

function showDashboard() {
  loginSection.classList.add('hidden')
  dashboardSection.classList.remove('hidden')
  lucide.createIcons()
}

function fmt(n) {
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

// ----- ABAS LOGIN / REGISTRO -----
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('bg-slate-900', 'text-white')
  tabLogin.classList.remove('border', 'border-slate-200', 'text-slate-500')
  tabRegister.classList.remove('bg-slate-900', 'text-white')
  tabRegister.classList.add(
    'border',
    'border-slate-200',
    'text-slate-500',
    'hover:bg-slate-50',
  )
  formLogin.classList.remove('hidden')
  formRegister.classList.add('hidden')
  loginError.textContent = ''
})

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('bg-slate-900', 'text-white')
  tabRegister.classList.remove('border', 'border-slate-200', 'text-slate-500')
  tabLogin.classList.remove('bg-slate-900', 'text-white')
  tabLogin.classList.add(
    'border',
    'border-slate-200',
    'text-slate-500',
    'hover:bg-slate-50',
  )
  formRegister.classList.remove('hidden')
  formLogin.classList.add('hidden')
  loginError.textContent = ''
})

// ----- REGISTRO -----
registerBtn.addEventListener('click', async () => {
  const name = regName.value.trim()
  const email = regEmail.value.trim()
  const password = regPassword.value.trim()

  if (!name || !email || password.length < 6) {
    loginError.textContent = 'Preencha todos os campos (senha mín. 6).'
    return
  }

  registerBtn.textContent = 'Cadastrando...'
  registerBtn.disabled = true
  loginError.textContent = ''

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Erro ao cadastrar')
    }

    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!loginRes.ok)
      throw new Error('Conta criada, mas falha no login automático.')

    const data = await loginRes.json()
    token = data.accessToken
    localStorage.setItem('token', token)
    showDashboard()
    loadData()
  } catch (err) {
    loginError.textContent = err.message
  } finally {
    registerBtn.textContent = 'Cadastrar'
    registerBtn.disabled = false
  }
})

// ----- LOGIN -----
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click()
})
emailInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') passwordInput.focus()
})

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  if (!email || !password) {
    loginError.textContent = 'Preencha e-mail e senha.'
    return
  }

  loginBtn.textContent = 'Autenticando...'
  loginBtn.disabled = true
  loginError.textContent = ''

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Credenciais inválidas')
    const data = await res.json()
    token = data.accessToken
    localStorage.setItem('token', token)
    showDashboard()
    loadData()
  } catch (err) {
    loginError.textContent = err.message
  } finally {
    loginBtn.textContent = 'Autenticar'
    loginBtn.disabled = false
  }
})

// ----- LOGOUT -----
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('token')
  token = null
  showLogin()
})

// ----- LANÇAMENTO MANUAL -----
document.getElementById('add-manual').addEventListener('click', async () => {
  const title = document.getElementById('manual-title').value.trim()
  const amount = parseFloat(document.getElementById('manual-amount').value)
  const type = document.getElementById('manual-type').value

  if (!title || isNaN(amount) || amount <= 0) {
    alert('Preencha os campos corretamente.')
    return
  }

  const btn = document.getElementById('add-manual')
  btn.textContent = 'Salvando...'
  btn.disabled = true

  try {
    const res = await fetch(`${API_URL}/transactions/manual`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, amount, type }),
    })

    if (res.status === 401) {
      localStorage.removeItem('token')
      token = null
      showLogin()
      return
    }

    if (!res.ok) throw new Error('Erro ao registrar transação.')

    document.getElementById('manual-title').value = ''
    document.getElementById('manual-amount').value = ''
    loadData()
  } catch (err) {
    alert(err.message)
  } finally {
    btn.textContent = 'Registrar'
    btn.disabled = false
  }
})

// ----- DELETAR -----
async function deleteTransaction(id) {
  if (!confirm('Excluir esta transação?')) return
  await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  loadData()
}

// ----- CARREGAR DADOS -----
btnAtualizar.addEventListener('click', loadData)
monthSelect.addEventListener('change', loadData)
yearSelect.addEventListener('change', loadData)

async function loadData() {
  loadingEl.classList.remove('hidden')
  errorEl.classList.add('hidden')

  const month = monthSelect.value
  const year = yearSelect.value

  try {
    const [metricsRes, txRes] = await Promise.all([
      fetch(
        `${API_URL}/transactions/metrics/summary?month=${month}&year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ),
      fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])

    // Token expirado
    if (metricsRes.status === 401 || txRes.status === 401) {
      localStorage.removeItem('token')
      token = null
      showLogin()
      return
    }

    if (!metricsRes.ok || !txRes.ok)
      throw new Error('Erro ao carregar os dados.')

    const metrics = await metricsRes.json()
    const { transactions } = await txRes.json()

    // Filtra pelo mês/ano selecionado
    currentTransactions = transactions.filter((tx) => {
      const d = new Date(tx.created_at)
      return (
        d.getMonth() + 1 === parseInt(month) &&
        d.getFullYear() === parseInt(year)
      )
    })

    renderKPIs(metrics)
    renderDonut(metrics.categories)
    renderTransactions()
    renderBudget(metrics.categories)
  } catch (err) {
    errorEl.textContent = err.message
    errorEl.classList.remove('hidden')
  } finally {
    loadingEl.classList.add('hidden')
  }
}

// ----- KPIs -----
function renderKPIs(data) {
  document.getElementById('kpi-balance').textContent = `R$ ${fmt(data.balance)}`
  document.getElementById('kpi-income').textContent =
    `R$ ${fmt(data.totalIncome)}`
  document.getElementById('kpi-expenses').textContent =
    `R$ ${fmt(data.totalExpenses)}`
}

// ----- DONUT -----
function renderDonut(categories) {
  if (!categories?.length) {
    document.getElementById('legend').innerHTML =
      '<li class="text-center text-slate-400 text-xs py-4">Sem dados ainda.</li>'
    return
  }

  if (donutChart) donutChart.destroy()
  const canvas = document.getElementById('donutChart')

  Chart.defaults.color = '#64748b'
  Chart.defaults.font.family = 'Inter'

  donutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: categories.map((c) => c.category),
      datasets: [
        {
          data: categories.map((c) => c.total),
          backgroundColor: COLORS,
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      cutout: '70%',
      plugins: { legend: { display: false } },
    },
  })

  document.getElementById('legend').innerHTML = categories
    .map(
      (c, i) => `
      <li class="flex justify-between items-center text-xs font-medium">
        <div class="flex items-center gap-2 text-slate-600">
          <span class="w-3 h-3 rounded-full" style="background:${COLORS[i % COLORS.length]}"></span>
          ${c.category}
        </div>
        <span class="text-slate-900 font-bold">R$ ${fmt(c.total)}</span>
      </li>
    `,
    )
    .join('')
}

// ----- TRANSAÇÕES -----
function renderTransactions() {
  const list = document.getElementById('txList')

  let filtered =
    currentFilter === 'all'
      ? currentTransactions
      : currentTransactions.filter((tx) =>
          currentFilter === 'credit' ? tx.amount > 0 : tx.amount < 0,
        )

  filtered = [...filtered].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )

  if (!filtered.length) {
    list.innerHTML =
      '<li class="text-center text-slate-400 text-xs py-4">Nenhuma transação encontrada.</li>'
    return
  }

  list.innerHTML = filtered
    .map((tx) => {
      const icon = categoryIcons[tx.category] || (tx.amount > 0 ? '💰' : '📌')
      const isPos = tx.amount > 0
      const colorVal = isPos ? 'text-emerald-500' : 'text-slate-900'
      const bgIcon = isPos
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-slate-100 text-slate-600'

      return `
      <li class="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
        <div class="flex gap-4 items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${bgIcon}">${icon}</div>
          <div>
            <p class="text-sm font-bold text-slate-900">${tx.title}</p>
            <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">${tx.category} • ${new Date(tx.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm font-black ${colorVal}">${isPos ? '+' : '-'} R$ ${fmt(Math.abs(tx.amount))}</span>
          <button class="delete-btn opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all cursor-pointer" data-id="${tx.id}">🗑️</button>
        </div>
      </li>`
    })
    .join('')

  document
    .querySelectorAll('.delete-btn')
    .forEach((b) =>
      b.addEventListener('click', () => deleteTransaction(b.dataset.id)),
    )

  lucide.createIcons()
}

// ----- ORÇAMENTO -----
function renderBudget(categories) {
  const limits = {
    Alimentação: 1000,
    Transporte: 600,
    Lazer: 400,
    Saúde: 300,
    Moradia: 2000,
  }

  const budgetDiv = document.getElementById('budgetList')

  if (!categories?.length) {
    budgetDiv.innerHTML =
      '<p class="text-center text-slate-400 text-xs py-4">Sem dados ainda.</p>'
    return
  }

  budgetDiv.innerHTML = categories
    .slice(0, 4)
    .map((cat) => {
      const spent = cat.total
      const limit = limits[cat.category] || 500
      const percent = Math.min((spent / limit) * 100, 100)

      let colorClass = 'bg-slate-800'
      if (percent > 90) colorClass = 'bg-rose-500'
      else if (percent > 70) colorClass = 'bg-amber-500'

      return `
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-xs font-bold text-slate-600">
          <span>${cat.category}</span>
          <span class="text-slate-900">R$ ${fmt(spent)} <span class="text-slate-400 font-medium">/ R$ ${fmt(limit)}</span></span>
        </div>
        <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full ${colorClass} transition-all duration-1000" style="width:${percent}%"></div>
        </div>
      </div>`
    })
    .join('')
}

init()
