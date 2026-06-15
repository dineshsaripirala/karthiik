// ─── AUTH SYSTEM ───
const STORAGE_KEY = 'stackly_accounts';
const SESSION_KEY = 'stackly_session';

function getAccounts() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const seed = [
    { email: 'patient@stackly.health', password: 'patient123', name: 'Rahul Gupta', role: 'patient' },
    { email: 'doctor@stackly.health', password: 'doctor123', name: 'Dr. Aryan Kapoor', role: 'doctor' }
  ];
  seed.forEach(s => { if (!stored.find(a => a.email === s.email)) stored.push(s); });
  return stored;
}
function getSession() { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
function setSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }
function signOut() { clearSession(); window.location.href = 'signin.html'; }

// ─── MOBILE MENU ───
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ─── DASHBOARD MOBILE SIDEBAR ───
function toggleDashSidebar() {
  document.querySelector('.sidebar')?.classList.toggle('open');
  document.querySelector('.sidebar-overlay')?.classList.toggle('open');
}

// ─── SCROLL NAV SHADOW ───
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ─── AOS SCROLL ANIMATIONS ───
function initAOS() {
  const items = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('aos-animate'); });
  }, { threshold: 0.15 });
  items.forEach(i => { if (!i.classList.contains('aos-animate')) observer.observe(i); });
}

// ─── COUNTERS ───
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target, target = +el.dataset.target;
        const step = Math.ceil(target / 80);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current >= 1000 ? (current / 1000).toFixed(current >= 10000 ? 0 : 1) + 'K+' : current + '+';
          if (current >= target) clearInterval(timer);
        }, 20);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ─── FAQ ───
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// ─── ROLE SELECTION (SIGN IN) ───
let selectedRole = 'patient';
function selectRole(r) {
  selectedRole = r;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('role-' + r);
  if (btn) btn.classList.add('active');
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

function showAuthError(elId, msg) {
  const el = document.getElementById(elId);
  if (!el) { alert(msg); return; }
  el.textContent = msg;
  el.style.display = 'block';
}
function clearAuthError(elId) {
  const el = document.getElementById(elId);
  if (el) el.style.display = 'none';
}

// ─── SIGN IN ───
function doSignIn() {
  clearAuthError('si-error');
  const em = document.getElementById('si-email').value.trim();
  const pw = document.getElementById('si-pw').value;
  if (!em || !pw) { showAuthError('si-error', 'Please enter your email and password.'); return; }
  if (pw.length < 6) { showAuthError('si-error', 'Password must be at least 6 characters.'); return; }
  const accounts = getAccounts();
  const user = accounts.find(a => a.email === em && a.password === pw);
  if (!user) { showAuthError('si-error', 'Invalid email or password. Please check and try again.'); return; }
  setSession(user);
  if (user.role === 'doctor' || user.role === 'admin') {
    window.location.href = 'provider-dash.html';
  } else {
    window.location.href = 'patient-dash.html';
  }
}

// ─── REGISTER ROLE SELECTION ───
let selectedRegRole = 'patient';
function selectRegRole(r) {
  selectedRegRole = r;
  document.querySelectorAll('.reg-role-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('reg-role-' + r);
  if (btn) btn.classList.add('active');
  checkRegForm();
}

function checkPwStrength(pw) {
  const bar = document.getElementById('pw-strength-bar');
  const txt = document.getElementById('pw-strength-txt');
  const reqList = document.getElementById('pw-req-list');

  if (reqList) reqList.style.display = pw.length > 0 ? 'block' : 'none';

  const hasLength = pw.length >= 6;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);

  function setReq(id, met, required) {
    const el = document.getElementById(id);
    if (!el) return;
    const icon = el.querySelector('.req-icon');
    if (icon) icon.textContent = met ? '✅' : (required ? '❌' : '○');
    el.style.color = met ? '#16A34A' : (required ? '#DC2626' : 'var(--text-light)');
  }
  setReq('req-length', hasLength, true);
  setReq('req-upper', hasUpper, false);
  setReq('req-number', hasNumber, false);

  if (!bar || !txt) return;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  bar.style.width = (score * 25) + '%';
  bar.style.background = colors[score - 1] || '#EF4444';
  txt.textContent = score > 0 ? labels[score - 1] : '';
  txt.style.color = colors[score - 1] || 'var(--text-light)';
}

function checkRegForm() {
  const fn = (document.getElementById('reg-fn') || {}).value?.trim() || '';
  const ln = (document.getElementById('reg-ln') || {}).value?.trim() || '';
  const em = (document.getElementById('reg-email') || {}).value?.trim() || '';
  const pw = (document.getElementById('reg-pw') || {}).value || '';
  const cp = (document.getElementById('reg-cpw') || {}).value || '';
  const pwMatch = pw === cp && cp.length > 0;
  const matchErr = document.getElementById('pw-match-err');
  if (matchErr) matchErr.style.display = (cp.length > 0 && !pwMatch) ? 'block' : 'none';
  const valid = fn && ln && /\S+@\S+\.\S+/.test(em) && pw.length >= 6 && pwMatch && selectedRegRole;
  const btn = document.getElementById('regBtn');
  if (btn) btn.disabled = !valid;
}

function doRegister() {
  clearAuthError('reg-error');
  const fn = document.getElementById('reg-fn').value.trim();
  const ln = document.getElementById('reg-ln').value.trim();
  const em = document.getElementById('reg-email').value.trim();
  const pw = document.getElementById('reg-pw').value;
  const cp = document.getElementById('reg-cpw').value;
  if (!fn || !ln || !em || !pw) { showAuthError('reg-error', 'Please fill in all required fields.'); return; }
  if (pw.length < 6) { showAuthError('reg-error', 'Password must be at least 6 characters.'); return; }
  if (pw !== cp) { showAuthError('reg-error', 'Passwords do not match.'); return; }
  if (!selectedRegRole) { showAuthError('reg-error', 'Please select your role.'); return; }
  const accounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (accounts.find(a => a.email === em)) {
    showAuthError('reg-error', 'An account with this email already exists. Please sign in.'); return;
  }
  const newUser = { email: em, password: pw, name: fn + ' ' + ln, firstName: fn, lastName: ln, role: selectedRegRole, createdAt: new Date().toISOString() };
  accounts.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  const card = document.querySelector('.auth-card');
  if (card) {
    card.innerHTML = `<div style="text-align:center;padding:32px 0;"><div style="font-size:4rem;margin-bottom:16px;">✅</div><h2 style="color:var(--dark);margin-bottom:8px;">Account Created!</h2><p style="color:var(--text-light);margin-bottom:8px;">Welcome to Stackly, <strong>${fn}</strong>!</p><p style="color:var(--text-light);font-size:0.875rem;margin-bottom:4px;">Your account has been created successfully.</p><p style="color:var(--primary);font-size:0.875rem;font-weight:600;">Please sign in to access your dashboard.</p><p style="color:var(--text-light);font-size:0.8rem;margin-top:12px;">Redirecting to Sign In...</p><div class="loader" style="margin:24px auto 0;"></div></div>`;
  }
  setTimeout(() => {
    window.location.href = 'signin.html';
  }, 2200);
}

// ─── CONTACT FORM ───
function validateName(inp) {
  inp.value = inp.value.replace(/[^a-zA-Z\s]/g, '');
  checkContactForm();
}
function checkContactForm() {
  const fn = (document.getElementById('c-fname') || {}).value?.trim() || '';
  const ln = (document.getElementById('c-lname') || {}).value?.trim() || '';
  const ph = (document.getElementById('c-phone') || {}).value?.trim() || '';
  const em = (document.getElementById('c-email') || {}).value?.trim() || '';
  const msg = (document.getElementById('c-msg') || {}).value?.trim() || '';
  const validEmail = /\S+@\S+\.\S+/.test(em);
  const phoneDigits = ph.replace(/[\s\-\+\(\)]/g, '');
  const validPhone = phoneDigits.length >= 10;
  const phoneErr = document.getElementById('c-phone-error');
  if (phoneErr) phoneErr.style.display = (ph.length > 0 && !validPhone) ? 'block' : 'none';
  const valid = fn && ln && validPhone && validEmail && msg;
  const btn = document.getElementById('contactSendBtn');
  if (btn) btn.disabled = !valid;
}
function submitContact() {
  const formCard = document.querySelector('.contact-form-card');
  if (formCard) {
    formCard.innerHTML = `<div style="text-align:center;padding:48px 24px;"><div style="font-size:3.5rem;margin-bottom:16px;">✅</div><h3 style="color:var(--dark);margin-bottom:8px;">Message Sent!</h3><p style="color:var(--text-light);line-height:1.6;">Thank you for reaching out. Our team will respond within 24 hours at your email address.</p></div>`;
  }
}

// ─── DASHBOARD ───
function dashSection(type, section, el) {
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('open');
  if (type === 'patient') renderPatientDash(section);
  else renderProviderDash(section);
  window.scrollTo(0, 0);
  return false;
}

function getUserDisplay() {
  const session = getSession();
  if (!session) return { name: 'User', email: '', role: 'patient' };
  return { name: session.name || session.email, email: session.email, role: session.role };
}

// ─── PATIENT DASHBOARD ───
function renderPatientDash(section) {
  const el = document.getElementById('patient-dash-content');
  if (!el) return;
  const user = getUserDisplay();
  const renders = {
    'overview': () => { el.innerHTML = getPatientOverview(user); setTimeout(() => drawPatientCharts(), 100); },
    'appointments': () => { el.innerHTML = getPatientAppointments(user); },
    'medications': () => { el.innerHTML = getPatientMedications(user); },
    'test-results': () => { el.innerHTML = getPatientTests(user); },
    'records': () => { el.innerHTML = getPatientRecords(user); },
    'prescriptions': () => { el.innerHTML = getPatientPrescriptions(user); },
    'billing': () => { el.innerHTML = getPatientBilling(user); },
    'settings': () => { el.innerHTML = renderSettings('patient', user); }
  };
  const fn = renders[section] || renders['overview'];
  fn();
}

function getPatientOverview(user) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return `
  <div class="dash-topbar">
    <div><h2>Patient Dashboard</h2><p>${dateStr} — ${user.email}</p></div>
    <!-- <div class="topbar-bell">🔔<span class="bell-dot"></span></div> -->
  </div>
  <div class="welcome-hero">
    <div class="wh-left">
      <div class="wh-greet">Good day ☀️</div>
      <h1 class="wh-title">Welcome back,<br><span>${user.name}</span></h1>
      <div class="wh-score-row">
        <div class="score-ring" style="--p:82;"><div class="score-inner"><b>82</b><small>/ 100</small></div></div>
        <div class="wh-score-text"><h3>Health Score: Good 🟢</h3><p>Your overall health indicators are looking great. Keep up your current routine.</p></div>
      </div>
      <!-- <div class="wh-actions">
        <button class="wh-btn primary" onclick="window.location.href='services.html'">📹 Start Telehealth</button>
        <<button class="wh-btn dark" onclick="dashSection('patient','appointments',null)">📅 My Appointments</button>
        <button class="wh-btn dark" onclick="dashSection('patient','medications',null)">💊 Medications</button>
      </div> -->
    </div>
    <div class="wh-vitals">
      <div class="vital-chip"><div class="vc-label">Blood Pressure</div><div class="vc-val">118 <span>/ 76</span></div><div class="vc-tag">↑ Normal Range</div></div>
      <div class="vital-chip"><div class="vc-label">Heart Rate</div><div class="vc-val">72 <span>bpm</span></div><div class="vc-tag">↑ Optimal</div></div>
      <div class="vital-chip"><div class="vc-label">Blood Glucose</div><div class="vc-val">94 <span>mg/dL</span></div><div class="vc-tag">↑ Normal</div></div>
      <div class="vital-chip"><div class="vc-label">BMI</div><div class="vc-val">23.4</div><div class="vc-tag">↑ Healthy</div></div>
    </div>
  </div>
  <div class="stat-row">
    <div class="stat-card"><div class="sc-icon blue">📅</div><div><div class="sc-num">3</div><div class="sc-label">Upcoming Appointments</div></div></div>
    <div class="stat-card"><div class="sc-icon teal">💊</div><div><div class="sc-num">4</div><div class="sc-label">Active Medications</div></div></div>
    <div class="stat-card"><div class="sc-icon amber">🧪</div><div><div class="sc-num">2</div><div class="sc-label">Pending Test Results</div></div></div>
    <div class="stat-card"><div class="sc-icon pink">💬</div><div><div class="sc-num">5</div><div class="sc-label">Unread Messages</div></div></div>
  </div>
  <div class="dash-grid">
    <div class="dash-card">
      <div class="card-head"><h3>Upcoming Appointments</h3><a href="javascript:void(0)" onclick="dashSection('patient','appointments',null)" class="card-link">View All →</a></div>
      <div class="appt-row"><div class="appt-date"><b>12</b><small>JUN</small></div><div class="appt-info"><h4>Dr. Priya Menon</h4><span>Cardiologist · Heart Center</span><span class="appt-meta">🕐 10:30 AM · In-Person</span></div><div class="appt-status ok">Confirmed</div></div>
      <div class="appt-row"><div class="appt-date"><b>15</b><small>JUN</small></div><div class="appt-info"><h4>Dr. Aryan Kapoor</h4><span>Neurology · Telehealth</span><span class="appt-meta">🕐 02:00 PM · Telehealth</span></div><div class="appt-status pend">Pending</div></div>
      <div class="appt-row"><div class="appt-date"><b>22</b><small>JUN</small></div><div class="appt-info"><h4>Dr. Anjali Nair</h4><span>General · Check-up</span><span class="appt-meta">🕐 09:15 AM · In-Person</span></div><div class="appt-status ok">Confirmed</div></div>
    </div>
    <div class="dash-card">
      <div class="card-head"><h3>My Vitals</h3><a href="#" class="card-link">Log New →</a></div>
      <div class="mini-vitals">
        <div class="mv-box"><div class="mv-label">Blood Pressure</div><div class="mv-val">118 <span>/ 76 mmHg</span></div></div>
        <div class="mv-box"><div class="mv-label">Heart Rate</div><div class="mv-val">72 <span>bpm</span></div></div>
        <div class="mv-box"><div class="mv-label">Blood Glucose</div><div class="mv-val">94 <span>mg/dL</span></div></div>
        <div class="mv-box"><div class="mv-label">Weight</div><div class="mv-val">68 <span>kg</span></div></div>
      </div>
      <div class="vitals-chart"><canvas id="patientLineChart"></canvas></div>
    </div>
  </div>`;
}

function getPatientAppointments(user) {
  return `
  <div class="dash-topbar"><div><h2>My Appointments</h2><p>Manage your upcoming and past appointments</p></div></div>
  <div class="dash-card" style="margin-bottom:24px;">
    <div class="card-head"><h3>Upcoming</h3></div>
    <div class="appt-row"><div class="appt-date"><b>12</b><small>JUN</small></div><div class="appt-info"><h4>Dr. Priya Menon</h4><span>Cardiologist · Heart Center, Floor 3</span><span class="appt-meta">🕐 10:30 AM · In-Person · Token #A24</span></div><div class="appt-status ok">Confirmed</div></div>
    <div class="appt-row"><div class="appt-date"><b>15</b><small>JUN</small></div><div class="appt-info"><h4>Dr. Aryan Kapoor</h4><span>Neurologist · Telemedicine</span><span class="appt-meta">🕐 02:00 PM · Telehealth</span></div><div class="appt-status pend">Pending</div></div>
    <div class="appt-row"><div class="appt-date"><b>22</b><small>JUN</small></div><div class="appt-info"><h4>Dr. Anjali Nair</h4><span>General Physician · OPD Block B</span><span class="appt-meta">🕐 09:15 AM · In-Person · Token #B07</span></div><div class="appt-status ok">Confirmed</div></div>
  </div>
  <div class="dash-card">
    <div class="card-head"><h3>Past Appointments</h3></div>
    <div class="appt-row"><div class="appt-date" style="background:var(--border);color:var(--text-light);"><b>01</b><small>MAY</small></div><div class="appt-info"><h4>Dr. Ravi Menon</h4><span>Orthopedics · Knee consultation</span><span class="appt-meta">Completed</span></div><div class="appt-status ok">Done</div></div>
    <div class="appt-row"><div class="appt-date" style="background:var(--border);color:var(--text-light);"><b>14</b><small>APR</small></div><div class="appt-info"><h4>Dr. Meera Pillai</h4><span>Dermatology · Skin rash</span><span class="appt-meta">Completed</span></div><div class="appt-status ok">Done</div></div>
  </div>`;
}

function getPatientMedications(user) {
  return `
  <div class="dash-topbar"><div><h2>My Medications</h2><p>Active prescriptions and refill tracking</p></div></div>
  <div class="notif-item warn" style="border-radius:10px;margin-bottom:20px;">⚠️ Vitamin D3 refill required — contact your doctor for renewal.</div>
  <div class="dash-card">
    <div class="card-head"><h3>Active Medications</h3></div>
    <div class="table-wrap"><table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
      <thead><tr style="background:var(--primary-light);"><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);border-radius:8px 0 0 0;">Medicine</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Dose</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Frequency</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Until</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);border-radius:0 8px 0 0;">Status</th></tr></thead>
      <tbody>
        <tr style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Medicine"><strong>Metformin</strong><br><span style="color:var(--text-light);font-size:0.75rem;">Diabetes management</span></td><td style="padding:14px 16px;" data-label="Dose">500mg</td><td style="padding:14px 16px;" data-label="Frequency">Twice daily</td><td style="padding:14px 16px;" data-label="Until">Ongoing</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Active</span></td></tr>
        <tr style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Medicine"><strong>Amlodipine</strong><br><span style="color:var(--text-light);font-size:0.75rem;">Blood pressure</span></td><td style="padding:14px 16px;" data-label="Dose">5mg</td><td style="padding:14px 16px;" data-label="Frequency">Once daily</td><td style="padding:14px 16px;" data-label="Until">Ongoing</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Active</span></td></tr>
        <tr style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Medicine"><strong>Atorvastatin</strong><br><span style="color:var(--text-light);font-size:0.75rem;">Cholesterol control</span></td><td style="padding:14px 16px;" data-label="Dose">10mg</td><td style="padding:14px 16px;" data-label="Frequency">Once at night</td><td style="padding:14px 16px;" data-label="Until">Jun 30</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Active</span></td></tr>
        <tr><td style="padding:14px 16px;" data-label="Medicine"><strong>Vitamin D3</strong><br><span style="color:var(--text-light);font-size:0.75rem;">Supplement</span></td><td style="padding:14px 16px;" data-label="Dose">60K IU</td><td style="padding:14px 16px;" data-label="Frequency">Weekly</td><td style="padding:14px 16px;" data-label="Until">Jul 15</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status pend">Refill Needed</span></td></tr>
      </tbody>
    </table></div>
  </div>`;
}

function getPatientTests(user) {
  return `
  <div class="dash-topbar"><div><h2>Test Results</h2><p>Lab reports and diagnostic results</p></div></div>
  <div class="dash-card">
    <div class="card-head"><h3>Recent Results</h3></div>
    <div class="table-wrap"><table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
      <thead><tr style="background:var(--primary-light);"><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Test</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Date</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Result</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Status</th></tr></thead>
      <tbody>
        <tr style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Test"><strong>HbA1c</strong><br><span style="color:var(--text-light);font-size:0.75rem;">Diabetes screening</span></td><td style="padding:14px 16px;" data-label="Date">Jun 5, 2026</td><td style="padding:14px 16px;" data-label="Result">6.2%</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Normal</span></td></tr>
        <tr style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Test"><strong>Lipid Profile</strong><br><span style="color:var(--text-light);font-size:0.75rem;">Cholesterol panel</span></td><td style="padding:14px 16px;" data-label="Date">Jun 5, 2026</td><td style="padding:14px 16px;" data-label="Result">Total: 185 mg/dL</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Normal</span></td></tr>
        <tr style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Test"><strong>CBC</strong><br><span style="color:var(--text-light);font-size:0.75rem;">Complete blood count</span></td><td style="padding:14px 16px;" data-label="Date">May 20, 2026</td><td style="padding:14px 16px;" data-label="Result">See report</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Normal</span></td></tr>
        <tr><td style="padding:14px 16px;" data-label="Test"><strong>Chest X-Ray</strong><br><span style="color:var(--text-light);font-size:0.75rem;">Radiology</span></td><td style="padding:14px 16px;" data-label="Date">Jun 8, 2026</td><td style="padding:14px 16px;" data-label="Result">Pending review</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status pend">Pending</span></td></tr>
      </tbody>
    </table></div>
  </div>`;
}

function getPatientRecords(user) {
  return `
  <div class="dash-topbar"><div><h2>Medical Records</h2><p>Your complete health history</p></div></div>
  <div class="stat-row" style="margin-bottom:24px;">
    <div class="stat-card"><div class="sc-icon blue">📋</div><div><div class="sc-num">12</div><div class="sc-label">Total Visits</div></div></div>
    <div class="stat-card"><div class="sc-icon teal">🔬</div><div><div class="sc-num">8</div><div class="sc-label">Lab Tests</div></div></div>
    <div class="stat-card"><div class="sc-icon amber">🏥</div><div><div class="sc-num">1</div><div class="sc-label">Hospitalisations</div></div></div>
    <div class="stat-card"><div class="sc-icon pink">💉</div><div><div class="sc-num">5</div><div class="sc-label">Vaccinations</div></div></div>
  </div>
  <div class="dash-card">
    <div class="card-head"><h3>Visit History</h3></div>
    <div class="appt-row"><div class="appt-date"><b>12</b><small>JUN</small></div><div class="appt-info"><h4>Cardiology Consultation</h4><span>Dr. Priya Menon · Heart Center</span><span class="appt-meta">BP: 118/76 · ECG: Normal · Amlodipine 5mg prescribed</span></div><div class="appt-status ok">Completed</div></div>
    <div class="appt-row"><div class="appt-date"><b>01</b><small>MAY</small></div><div class="appt-info"><h4>Orthopedics Follow-up</h4><span>Dr. Ravi Menon · Ortho OPD</span><span class="appt-meta">Knee MRI reviewed · Physiotherapy recommended</span></div><div class="appt-status ok">Completed</div></div>
    <div class="appt-row"><div class="appt-date"><b>14</b><small>APR</small></div><div class="appt-info"><h4>Dermatology</h4><span>Dr. Meera Pillai · Skin OPD</span><span class="appt-meta">Allergic dermatitis · Topical cream prescribed</span></div><div class="appt-status ok">Completed</div></div>
  </div>`;
}

function getPatientPrescriptions(user) {
  return `
  <div class="dash-topbar"><div><h2>Prescriptions</h2><p>Your digital prescriptions</p></div></div>
  <div class="dash-card">
    <div class="card-head"><h3>Active Prescriptions</h3></div>
    <div class="appt-row">
      <div class="appt-date"><b>12</b><small>JUN</small></div>
      <div class="appt-info"><h4>Dr. Priya Menon – Cardiology</h4><span>Amlodipine 5mg · Once daily · 90 days</span><span class="appt-meta">Metoprolol 25mg · Twice daily · 30 days</span></div>
      <!-- <button class="btn btn-outline" style="padding:6px 14px;font-size:0.78rem;" onclick="alert('Download feature coming soon!')"></button> -->
    </div>
    <div class="appt-row">
      <div class="appt-date"><b>01</b><small>MAY</small></div>
      <div class="appt-info"><h4>Dr. Ravi Menon – Orthopedics</h4><span>Ibuprofen 400mg · Twice daily after meals · 10 days</span><span class="appt-meta">Physiotherapy 3x/week for 4 weeks</span></div>
      <!-- <button class="btn btn-outline" style="padding:6px 14px;font-size:0.78rem;" onclick="alert('Download feature coming soon!')"></button> -->
    </div>
  </div>`;
}

function getPatientBilling(user) {
  return `
  <div class="dash-topbar"><div><h2>Billing & Insurance</h2><p>Payments and insurance claims</p></div></div>
  <div class="stat-row" style="margin-bottom:24px;">
    <div class="stat-card"><div class="sc-icon blue">💳</div><div><div class="sc-num">₹4,200</div><div class="sc-label">Outstanding Balance</div></div></div>
    <div class="stat-card"><div class="sc-icon teal">✅</div><div><div class="sc-num">₹12,800</div><div class="sc-label">Paid This Year</div></div></div>
    <div class="stat-card"><div class="sc-icon amber">🛡️</div><div><div class="sc-num">₹5L</div><div class="sc-label">Insurance Coverage</div></div></div>
    <div class="stat-card"><div class="sc-icon pink">📋</div><div><div class="sc-num">2</div><div class="sc-label">Pending Claims</div></div></div>
  </div>
  <div class="dash-card">
    <div class="card-head"><h3>Recent Bills</h3></div>
    <div class="table-wrap"><table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
      <thead><tr style="background:var(--primary-light);"><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Service</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Date</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Amount</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Status</th></tr></thead>
      <tbody>
        <tr style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Service">Cardiology Consultation</td><td style="padding:14px 16px;" data-label="Date">Jun 12, 2026</td><td style="padding:14px 16px;" data-label="Amount">₹1,200</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status pend">Pending</span></td></tr>
        <tr style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Service">Lab Tests (HbA1c + Lipid)</td><td style="padding:14px 16px;" data-label="Date">Jun 5, 2026</td><td style="padding:14px 16px;" data-label="Amount">₹1,800</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Paid</span></td></tr>
        <tr><td style="padding:14px 16px;" data-label="Service">Orthopedics Follow-up</td><td style="padding:14px 16px;" data-label="Date">May 1, 2026</td><td style="padding:14px 16px;" data-label="Amount">₹1,100</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Paid</span></td></tr>
      </tbody>
    </table></div>
  </div>`;
}

// ─── PROVIDER DASHBOARD ───
function renderProviderDash(section) {
  const el = document.getElementById('provider-dash-content');
  if (!el) return;
  const user = getUserDisplay();
  const renders = {
    'overview': () => { el.innerHTML = getProviderOverview(user); setTimeout(() => drawProviderCharts(), 100); },
     'appointments': () => { el.innerHTML = getProviderAppointments(user); },
    'patients': () => { el.innerHTML = getProviderPatients(user); },
    'reports': () => { el.innerHTML = getProviderReports(user); setTimeout(() => drawProviderCharts(), 100); },
    'prescriptions': () => { el.innerHTML = getProviderPrescriptions(user); },
    'analytics': () => { el.innerHTML = getProviderAnalytics(user); setTimeout(() => drawProviderCharts(), 100); },
    'settings': () => { el.innerHTML = renderSettings('provider', user); }
  };
  const fn = renders[section] || renders['overview'];
  fn();
}

function getProviderOverview(user) {
  return `
  <div class="dash-topbar">
    <div><h2>Provider Dashboard</h2><p>${user.email}</p></div>
    <!-- <div class="topbar-bell">🔔<span class="bell-dot"></span></div> -->
  </div>
  <div class="welcome-hero" style="margin-bottom:28px;">
    <div class="wh-left">
      <div class="wh-greet">Good day ☀️</div>
      <h1 class="wh-title">Welcome,<br><span>${user.name}</span></h1>
      <div class="wh-actions" style="margin-top:16px;">
      <!-- <button class="wh-btn primary" onclick="dashSection('provider','appointments',null)">📅 View Schedule</button> -->
        <!-- <button class="wh-btn dark" onclick="dashSection('provider','patients',null)">👥 My Patients</button> -->
      </div>
    </div>
    <div class="wh-vitals">
      <div class="vital-chip"><div class="vc-label">Today's Patients</div><div class="vc-val">18</div><div class="vc-tag">↑ 3 vs yesterday</div></div>
      <div class="vital-chip"><div class="vc-label">Avg Rating</div><div class="vc-val">4.9 <span>/ 5</span></div><div class="vc-tag">↑ Top Rated</div></div>
      <div class="vital-chip"><div class="vc-label">Monthly Revenue</div><div class="vc-val">₹4.2L</div><div class="vc-tag">↑ 8% MoM</div></div>
      <div class="vital-chip"><div class="vc-label">Total Patients</div><div class="vc-val">2.4K</div><div class="vc-tag">↑ 12% this month</div></div>
    </div>
  </div>
  <div class="metrics-grid">
    <div class="metric-card"><span class="metric-icon">👥</span><div class="label">Total Patients</div><div class="value">2.4K</div><div class="change up">↑ 12% this month</div></div>
    <div class="metric-card"><span class="metric-icon">📅</span><div class="label">Today's Appointments</div><div class="value">18</div><div class="change up">↑ 3 vs yesterday</div></div>
    <div class="metric-card"><span class="metric-icon">💰</span><div class="label">Monthly Revenue</div><div class="value">₹4.2L</div><div class="change up">↑ 8% MoM</div></div>
    <div class="metric-card"><span class="metric-icon">⭐</span><div class="label">Patient Rating</div><div class="value">4.9</div><div class="change up">↑ 0.1 pts</div></div>
  </div>
  <div class="dash-grid">
    <div class="dash-card"><h3>Revenue Trend (2026)</h3><div class="chart-area"><canvas id="providerBarChart"></canvas></div></div>
    <div class="dash-card">
      <h3>Today's Schedule</h3>
      <div class="appt-item"><div class="appt-avatar" style="background:linear-gradient(135deg,#F97316,#EAB308);">RK</div><div><h4>Rajesh Kumar</h4><span>Follow-up · Cardiology</span></div><div class="appt-time">9:00 AM</div></div>
      <div class="appt-item"><div class="appt-avatar" style="background:linear-gradient(135deg,#8B5CF6,#EC4899);">SM</div><div><h4>Sunita Mehta</h4><span>New Patient · ECG</span></div><div class="appt-time">10:30 AM</div></div>
      <div class="appt-item"><div class="appt-avatar" style="background:linear-gradient(135deg,#10B981,#3B82F6);">VP</div><div><h4>Vijay Patel</h4><span>Post-op Check · BP</span></div><div class="appt-time">12:00 PM</div></div>
      <div class="appt-item"><div class="appt-avatar">KA</div><div><h4>Kavita Agarwal</h4><span>Consultation · Chest Pain</span></div><div class="appt-time">2:30 PM</div></div>
    </div>
  </div>
  <div class="dash-grid">
    <div class="dash-card"><h3>Service Distribution</h3><div class="chart-area" style="height:200px;"><canvas id="providerDoughnut"></canvas></div></div>
    <div class="dash-card">
      <h3>Notifications</h3>
      <div class="notif-item success">✅ 18 appointments confirmed for today</div>
      <div class="notif-item info">🔵 New patient referral from Dr. Sharma</div>
      <div class="notif-item warn">⚠️ Lab report pending for patient RK-1042</div>
      <div class="notif-item success">✅ Monthly performance report ready</div>
    </div>
  </div>`;
}

function getProviderAppointments(user) {
  return `
  <div class="dash-topbar"><div><h2>Appointments</h2><p>Today's schedule and upcoming</p></div>
  <button class="btn btn-teal" style="padding:10px 20px;font-size:0.85rem;" onclick="alert('Slot management coming soon!')">+ Add Slot</button></div>
  <div class="dash-card">
    <div class="card-head"><h3>Today's Schedule</h3></div>
    <div class="appt-item"><div class="appt-avatar" style="background:linear-gradient(135deg,#F97316,#EAB308);">RK</div><div style="flex:1;"><h4>Rajesh Kumar</h4><span>Follow-up · Cardiology · Token #01</span></div><div class="appt-time">9:00 AM</div></div>
    <div class="appt-item"><div class="appt-avatar" style="background:linear-gradient(135deg,#8B5CF6,#EC4899);">SM</div><div style="flex:1;"><h4>Sunita Mehta</h4><span>New Patient · ECG · Token #02</span></div><div class="appt-time">10:30 AM</div></div>
    <div class="appt-item"><div class="appt-avatar" style="background:linear-gradient(135deg,#10B981,#3B82F6);">VP</div><div style="flex:1;"><h4>Vijay Patel</h4><span>Post-op Check · Blood Pressure · Token #03</span></div><div class="appt-time">12:00 PM</div></div>
    <div class="appt-item"><div class="appt-avatar">KA</div><div style="flex:1;"><h4>Kavita Agarwal</h4><span>Consultation · Chest Pain · Token #04</span></div><div class="appt-time">2:30 PM</div></div>
    <div class="appt-item"><div class="appt-avatar" style="background:linear-gradient(135deg,#059669,#0284c7);">MS</div><div style="flex:1;"><h4>Mohit Singh</h4><span>Routine Check-up · Token #05</span></div><div class="appt-time">4:00 PM</div></div>
  </div>`;
}

function getProviderPatients(user) {
  return `
  <div class="dash-topbar"><div><h2>My Patients</h2><p>Active patient directory</p></div></div>
  <div class="dash-card">
    <div class="card-head"><h3>Patient Directory</h3>
      <input type="text" placeholder="Search patients..." style="padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:0.85rem;width:220px;outline:none;" oninput="filterPatients(this.value)"
    </div>
    <div class="table-wrap"><table style="width:100%;border-collapse:collapse;font-size:0.875rem;" id="patientTable">
      <thead><tr style="background:var(--primary-light);"><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Patient</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Age</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Condition</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Last Visit</th><th style="padding:12px 16px;text-align:left;font-size:0.78rem;color:var(--text-light);">Status</th></tr></thead>
      <tbody>
        <tr class="patient-row" style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Patient"><strong>Rajesh Kumar</strong><br><span style="color:var(--text-light);font-size:0.75rem;">RK-1042</span></td><td style="padding:14px 16px;" data-label="Age">52</td><td style="padding:14px 16px;" data-label="Condition">Hypertension, T2 Diabetes</td><td style="padding:14px 16px;" data-label="Last Visit">Jun 12</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Active</span></td></tr>
        <tr class="patient-row" style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Patient"><strong>Sunita Mehta</strong><br><span style="color:var(--text-light);font-size:0.75rem;">SM-0214</span></td><td style="padding:14px 16px;" data-label="Age">38</td><td style="padding:14px 16px;" data-label="Condition">Cardiac Evaluation</td><td style="padding:14px 16px;" data-label="Last Visit">Jun 12</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status pend">New</span></td></tr>
        <tr class="patient-row" style="border-bottom:1px solid var(--border);"><td style="padding:14px 16px;" data-label="Patient"><strong>Vijay Patel</strong><br><span style="color:var(--text-light);font-size:0.75rem;">VP-0897</span></td><td style="padding:14px 16px;" data-label="Age">61</td><td style="padding:14px 16px;" data-label="Condition">Post CABG Surgery</td><td style="padding:14px 16px;" data-label="Last Visit">Jun 10</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Active</span></td></tr>
        <tr class="patient-row"><td style="padding:14px 16px;" data-label="Patient"><strong>Kavita Agarwal</strong><br><span style="color:var(--text-light);font-size:0.75rem;">KA-0331</span></td><td style="padding:14px 16px;" data-label="Age">45</td><td style="padding:14px 16px;" data-label="Condition">Chest Pain Investigation</td><td style="padding:14px 16px;" data-label="Last Visit">Jun 8</td><td style="padding:14px 16px;" data-label="Status"><span class="appt-status ok">Active</span></td></tr>
      </tbody>
    </table></div>
  </div>`;
}

function filterPatients(query) {
  document.querySelectorAll('.patient-row').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query.toLowerCase()) ? '' : 'none';
  });
}

function getProviderReports(user) {
  return `
  <div class="dash-topbar"><div><h2>Reports</h2><p>Performance reports and analytics</p></div>
  <button class="btn btn-primary" style="padding:10px 20px;font-size:0.85rem;" onclick="alert('Export feature coming soon!')">Export PDF</button></div>
  <div class="metrics-grid" style="margin-bottom:24px;">
    <div class="metric-card"><div class="label">Patients This Month</div><div class="value">186</div><div class="change up">↑ 14%</div></div>
    <div class="metric-card"><div class="label">Avg Consultation</div><div class="value">18 min</div><div class="change up">↑ Efficient</div></div>
    <div class="metric-card"><div class="label">Satisfaction</div><div class="value">96%</div><div class="change up">↑ 2% vs last month</div></div>
    <div class="metric-card"><div class="label">Follow-up Rate</div><div class="value">78%</div><div class="change up">↑ 5%</div></div>
  </div>
  <div class="dash-grid">
    <div class="dash-card"><h3>Monthly Patient Volume</h3><div class="chart-area"><canvas id="providerBarChart"></canvas></div></div>
    <div class="dash-card"><h3>Diagnosis Distribution</h3><div class="chart-area" style="height:200px;"><canvas id="providerDoughnut"></canvas></div></div>
  </div>`;
}

function getProviderPrescriptions(user) {
  return `
  <div class="dash-topbar"><div><h2>Prescriptions</h2><p>Manage and issue digital prescriptions</p></div>
   <button class=""   onclick="alert('New prescription feature coming soon!')"></button></div> 
  <div class="dash-card">
    <div class="card-head"><h3>Recently Issued</h3></div>
    <div class="appt-row"><div class="appt-date"><b>12</b><small>JUN</small></div><div class="appt-info"><h4>Rajesh Kumar (RK-1042)</h4><span>Amlodipine 5mg OD · Metformin 500mg BD · 30 days</span><span class="appt-meta">Condition: Hypertension + T2 Diabetes</span></div><div class="appt-status ok">Issued</div></div>
    <div class="appt-row"><div class="appt-date"><b>10</b><small>JUN</small></div><div class="appt-info"><h4>Vijay Patel (VP-0897)</h4><span>Aspirin 75mg OD · Atorvastatin 40mg ON · 90 days</span><span class="appt-meta">Condition: Post CABG maintenance</span></div><div class="appt-status ok">Issued</div></div>
    <div class="appt-row"><div class="appt-date"><b>08</b><small>JUN</small></div><div class="appt-info"><h4>Kavita Agarwal (KA-0331)</h4><span>Nitrates SOS · Pantoprazole 40mg OD · 14 days</span><span class="appt-meta">Condition: Chest pain workup</span></div><div class="appt-status pend">Under Review</div></div>
  </div>`;
}

function getProviderAnalytics(user) {
  return `
  <div class="dash-topbar"><div><h2>Analytics</h2><p>Detailed performance overview</p></div></div>
  <div class="metrics-grid" style="margin-bottom:24px;">
    <div class="metric-card"><div class="label">Revenue (YTD)</div><div class="value">₹28L</div><div class="change up">↑ 22%</div></div>
    <div class="metric-card"><div class="label">New Patients</div><div class="value">342</div><div class="change up">↑ 18%</div></div>
    <div class="metric-card"><div class="label">Retention Rate</div><div class="value">71%</div><div class="change up">↑ Excellent</div></div>
    <div class="metric-card"><div class="label">Avg Revenue/Visit</div><div class="value">₹1,480</div><div class="change up">↑ 6%</div></div>
  </div>
  <div class="dash-grid">
    <div class="dash-card"><h3>Revenue Trend (2026)</h3><div class="chart-area"><canvas id="providerBarChart"></canvas></div></div>
    <div class="dash-card"><h3>Service Mix</h3><div class="chart-area" style="height:200px;"><canvas id="providerDoughnut"></canvas></div></div>
  </div>`;
}

function renderSettings(type, user) {
  const u = user || getUserDisplay();
  const isProvider = type === 'provider';
  return `<div class="dash-topbar"><div><h2>My Profile</h2><p>Account and preferences</p></div></div>
  <div class="settings-section">
    <h3>Profile Information</h3>
    <div class="form-row">
      <div class="form-group"><label>Full Name</label><input type="text" value="${u.name || ''}"></div>
      <div class="form-group"><label>Email</label><input type="email" value="${u.email || ''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Phone</label><input type="tel" placeholder="+91 98765 43210"></div>
      <div class="form-group"><label>Location</label><input type="text" placeholder="Bengaluru, Karnataka"></div>
    </div>
    ${isProvider ? '<div class="form-group"><label>Specialization</label><input type="text" placeholder="e.g. Cardiology"></div>' : ''}
    <!-- <button class="btn btn-primary" style="margin-top:8px;" onclick="alert('Profile updated!')">Save Changes</button> -->
  </div>
  <div class="settings-section">
    <h3>Notifications</h3>
    <div class="settings-row"><label>Email Notifications</label><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
    <div class="settings-row"><label>SMS Reminders</label><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
    <div class="settings-row"><label>Appointment Alerts</label><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
    <div class="settings-row"><label>Marketing Emails</label><div class="toggle" onclick="this.classList.toggle('on')"></div></div>
  </div>
  <div class="settings-section">
    <h3>Security</h3>
    <div class="form-group"><label>Current Password</label><input type="password" placeholder="••••••••"></div>
    <div class="form-row">
      <div class="form-group"><label>New Password</label><input type="password" placeholder="Min 6 characters"></div>
      <div class="form-group"><label>Confirm New Password</label><input type="password" placeholder="••••••••"></div>
    </div>
    <!-- <button class="btn btn-outline" style="margin-top:8px;" onclick="alert('Password updated!')">Update Password</button> -->
  </div>
  <!-- <div class="settings-section" style="border:1px solid #FEE2E2;background:#FFF5F5;">
    <h3 style="color:#DC2626;">Danger Zone</h3>
    <div class="settings-row">
      <label style="color:#DC2626;">Sign Out of All Devices</label>
      <button class="btn" style="color:#DC2626;border:1.5px solid #DC2626;padding:8px 16px;font-size:0.8rem;background:transparent;" onclick="signOut()">Sign Out</button>
    </div> -->
  </div>`;
}

// ─── CHARTS ───
function drawPatientCharts() {
  const lc = document.getElementById('patientLineChart');
  if (!lc) return;
  const ctx = lc.getContext('2d');
  lc.width = lc.offsetWidth || 300; lc.height = lc.offsetHeight || 120;
  drawLineChart(ctx, lc.width, lc.height, ['Jan','Feb','Mar','Apr','May','Jun'], [60,72,65,80,75,87], '#0A6EBD');
}

function drawProviderCharts() {
  const bc = document.getElementById('providerBarChart');
  if (bc) {
    const ctx = bc.getContext('2d');
    bc.width = bc.offsetWidth || 300; bc.height = bc.offsetHeight || 200;
    drawBarChart(ctx, bc.width, bc.height, ['Jan','Feb','Mar','Apr','May','Jun'], [2.8,3.1,2.9,3.6,4.0,4.2], '#00A99D');
  }
  const dc = document.getElementById('providerDoughnut');
  if (dc) {
    const ctx3 = dc.getContext('2d');
    dc.width = dc.offsetWidth || 300; dc.height = dc.offsetHeight || 180;
    drawPieChart(ctx3, dc.width, dc.height, ['Consultations','Procedures','Follow-ups','Emergency'], [40,25,25,10], ['#0A6EBD','#00A99D','#8B5CF6','#FF6B35'], true);
  }
}

function drawLineChart(ctx, W, H, labels, data, color) {
  const pad = {t:20,r:20,b:36,l:44};
  const w = W-pad.l-pad.r, h = H-pad.t-pad.b;
  const max = Math.max(...data)*1.15, min = 0;
  const sx = i => pad.l + i*(w/(data.length-1));
  const sy = v => pad.t + h - ((v-min)/(max-min))*h;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#E2E8F0'; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){const y=pad.t+i*(h/4);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+w,y);ctx.stroke();}
  ctx.beginPath(); ctx.moveTo(sx(0),sy(data[0]));
  data.forEach((v,i)=>{ if(i>0) ctx.lineTo(sx(i),sy(v)); });
  ctx.lineTo(sx(data.length-1),pad.t+h); ctx.lineTo(pad.l,pad.t+h); ctx.closePath();
  ctx.fillStyle='rgba(10,110,189,0.08)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(sx(0),sy(data[0]));
  data.forEach((v,i)=>{ if(i>0) ctx.lineTo(sx(i),sy(v)); });
  ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.stroke();
  data.forEach((v,i)=>{ctx.beginPath();ctx.arc(sx(i),sy(v),4,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();});
  ctx.fillStyle='#6B7C93'; ctx.font='11px DM Sans,sans-serif'; ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,sx(i),H-8));
  ctx.textAlign='right';
  for(let i=0;i<=4;i++){const v=Math.round(min+(max-min)*(4-i)/4);ctx.fillText(v,pad.l-6,pad.t+i*(h/4)+4);}
}

function drawBarChart(ctx, W, H, labels, data, color) {
  const pad = {t:20,r:20,b:36,l:44};
  const w = W-pad.l-pad.r, h = H-pad.t-pad.b;
  const max = Math.max(...data)*1.2;
  const bw = (w/data.length)*0.55;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#E2E8F0'; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){const y=pad.t+i*(h/4);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+w,y);ctx.stroke();}
  data.forEach((v,i)=>{
    const x=pad.l+i*(w/data.length)+(w/data.length-bw)/2;
    const bh=(v/max)*h; const y=pad.t+h-bh;
    const grad=ctx.createLinearGradient(0,y,0,y+bh);
    grad.addColorStop(0,color); grad.addColorStop(1,color+'66');
    ctx.fillStyle=grad;
    ctx.beginPath(); ctx.roundRect(x,y,bw,bh,4); ctx.fill();
    ctx.fillStyle='#2C3E50'; ctx.font='bold 10px DM Sans,sans-serif'; ctx.textAlign='center';
    ctx.fillText('₹'+v+'L',x+bw/2,y-6);
  });
  ctx.fillStyle='#6B7C93'; ctx.font='11px DM Sans,sans-serif'; ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,pad.l+i*(w/data.length)+w/data.length/2,H-8));
  ctx.textAlign='right';
  for(let i=0;i<=4;i++){const v=(max*(4-i)/4).toFixed(1);ctx.fillStyle='#6B7C93';ctx.font='11px DM Sans';ctx.fillText('₹'+v+'L',pad.l-4,pad.t+i*(h/4)+4);}
}

function drawPieChart(ctx, W, H, labels, data, colors, doughnut=false) {
  ctx.clearRect(0,0,W,H);
  const total = data.reduce((a,b)=>a+b,0);
  const cx=W*0.38, cy=H/2, r=Math.min(W*0.3,H*0.42);
  let angle=-Math.PI/2;
  data.forEach((v,i)=>{
    const slice=(v/total)*Math.PI*2;
    ctx.beginPath();
    if(doughnut){ctx.arc(cx,cy,r,angle,angle+slice);ctx.arc(cx,cy,r*0.55,angle+slice,angle,true);}
    else{ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+slice);}
    ctx.closePath();
    ctx.fillStyle=colors[i]; ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    angle+=slice;
  });
  const lx=W*0.72, ly=cy-((labels.length-1)*18)/2;
  labels.forEach((l,i)=>{
    ctx.fillStyle=colors[i]; ctx.fillRect(lx,ly+i*22-8,12,12);
    ctx.fillStyle='#2C3E50'; ctx.font='11px DM Sans,sans-serif'; ctx.textAlign='left';
    ctx.fillText(l+' ('+data[i]+'%)',lx+16,ly+i*22+2);
  });
}

// ─── PUBLIC PAGE NAV MANAGEMENT ───
// Public pages: Sign In + Register ALWAYS shown. Dashboard/Sign Out NEVER shown (req #9).
function initPublicNav() {
  const session = getSession();
  const navSignIn = document.querySelector('.nav-signin');
  const navRegister = document.querySelector('.nav-register');

  // Always keep Sign In and Register visible
  if (navSignIn) navSignIn.style.display = '';
  if (navRegister) navRegister.style.display = '';

  // Defensively remove any stale Dashboard / Sign-Out links that should never be here
  document.querySelectorAll('.nav-dashboard, .nav-signout-public').forEach(el => el.remove());

  // When logged in, "Sign In" goes straight to the user's dashboard
  // so clicking it feels instant — nav still shows "Sign In" not "Dashboard" (req #9)
  if (session && navSignIn) {
    navSignIn.href = session.role === 'doctor' || session.role === 'admin'
      ? 'provider-dash.html'
      : 'patient-dash.html';
  }
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('out');
      setTimeout(() => { loader.style.display = 'none'; }, 600);
    }, 800);
  }
  initAOS();
  initCounters();

  const isPatientDash = !!document.getElementById('patient-dash-content');
  const isProviderDash = !!document.getElementById('provider-dash-content');

  if (isPatientDash) {
    const session = getSession();
    if (!session) { window.location.replace('signin.html'); return; }
    if (session.role === 'doctor' || session.role === 'admin') {
      window.location.replace('provider-dash.html'); return;
    }
    const suName = document.querySelector('.su-name');
    const suEmail = document.querySelector('.su-email');
    if (suName) suName.textContent = session.name || session.email;
    if (suEmail) suEmail.textContent = session.email;
    renderPatientDash('overview');
    return;
  }

  if (isProviderDash) {
    const session = getSession();
    if (!session) { window.location.replace('signin.html'); return; }
    if (session.role !== 'doctor' && session.role !== 'admin') {
      window.location.replace('patient-dash.html'); return;
    }
    const suName = document.querySelector('.su-name');
    const suEmail = document.querySelector('.su-email');
    if (suName) suName.textContent = session.name || session.email;
    if (suEmail) suEmail.textContent = session.email;
    renderProviderDash('overview');
    return;
  }

  // ── PUBLIC PAGES ──
  // If on sign-in page and already logged in, skip the form and go straight to dashboard
  const page = window.location.pathname.split('/').pop();
  if (page === 'signin.html') {
    const session = getSession();
    if (session) {
      window.location.replace(
        session.role === 'doctor' || session.role === 'admin'
          ? 'provider-dash.html'
          : 'patient-dash.html'
      );
      return;
    }
  }

  // Apply correct nav state on all public pages (Sign In/Register always shown,
  // no Dashboard/Sign Out — requirement #9)
  initPublicNav();
});