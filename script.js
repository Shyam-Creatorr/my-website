// ── DATA ──────────────────────────────────────────────────────────────────
const JOBS = [
  { id:1, title:'Senior Frontend Engineer', company:'Stripe', logo:'S', location:'Remote', type:'Full-time', salary:'$140k–$180k', tags:['React','TypeScript','GraphQL'], badge:'hot', match:94, posted:'2d ago', desc:'Build beautiful payment UIs used by millions worldwide.' },
  { id:2, title:'ML Engineer Intern', company:'OpenAI', logo:'O', location:'San Francisco', type:'Internship', salary:'$8k/mo', tags:['Python','PyTorch','LLMs'], badge:'internship', match:88, posted:'1d ago', desc:'Work on cutting-edge language model research and deployment.' },
  { id:3, title:'Product Designer', company:'Figma', logo:'F', location:'Remote', type:'Full-time', salary:'$120k–$160k', tags:['Figma','UX','Prototyping'], badge:'new', match:76, posted:'3h ago', desc:'Design the future of collaborative design tools.' },
  { id:4, title:'Backend Engineer', company:'Vercel', logo:'V', location:'Remote', type:'Full-time', salary:'$130k–$170k', tags:['Node.js','Rust','Edge'], badge:'remote', match:82, posted:'5d ago', desc:'Scale infrastructure serving billions of requests per day.' },
  { id:5, title:'AI Hackathon – Build with Claude', company:'Anthropic', logo:'A', location:'Online', type:'Hackathon', salary:'$50k prizes', tags:['AI','Claude API','Innovation'], badge:'hackathon', match:91, posted:'1w ago', desc:'48-hour hackathon building AI-powered applications.' },
  { id:6, title:'Data Scientist', company:'Airbnb', logo:'B', location:'New York', type:'Full-time', salary:'$150k–$190k', tags:['Python','SQL','ML'], badge:'new', match:79, posted:'2d ago', desc:'Turn data into insights that shape travel experiences.' },
  { id:7, title:'DevOps Engineer', company:'GitHub', logo:'G', location:'Remote', type:'Full-time', salary:'$135k–$165k', tags:['Kubernetes','CI/CD','AWS'], badge:'remote', match:85, posted:'4d ago', desc:'Build the infrastructure that powers developer workflows.' },
  { id:8, title:'iOS Developer Intern', company:'Apple', logo:'🍎', location:'Cupertino', type:'Internship', salary:'$7.5k/mo', tags:['Swift','SwiftUI','Xcode'], badge:'internship', match:72, posted:'1w ago', desc:'Create apps for the world\'s most loved devices.' },
];

const APPLICATIONS = [
  { id:1, job:'Senior Frontend Engineer', company:'Stripe', status:'interview', date:'2025-01-15', next:'Technical Interview – Jan 20' },
  { id:2, job:'ML Engineer Intern', company:'OpenAI', status:'screening', date:'2025-01-12', next:'AI Resume Screening in progress' },
  { id:3, job:'Product Designer', company:'Figma', status:'applied', date:'2025-01-10', next:'Awaiting review' },
  { id:4, job:'Data Scientist', company:'Airbnb', status:'offer', date:'2025-01-05', next:'Offer expires Jan 25' },
];

const INTERVIEWS = [
  { time:'10:00', date:'Jan 20', title:'Technical Interview', company:'Stripe', type:'Video Call', duration:'60 min' },
  { time:'14:00', date:'Jan 22', title:'Culture Fit Interview', company:'Figma', type:'Phone', duration:'30 min' },
  { time:'11:00', date:'Jan 25', title:'System Design Round', company:'Vercel', type:'Video Call', duration:'90 min' },
];

// ── STATE ─────────────────────────────────────────────────────────────────
let currentTab = 'jobs';
let searchQuery = '';
let activeFilter = 'all';
let selectedJob = null;
let resumeFile = null;

// ── AUTH STATE ────────────────────────────────────────────────────────────
let currentUser = JSON.parse(localStorage.getItem('tb_user') || 'null');
const USERS_KEY = 'tb_users';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTab(currentTab);
  setupNav();
  updateNavAuth();
});

function setupNav() {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tab = a.dataset.tab;
      if (tab) switchTab(tab);
    });
  });
}

function updateNavAuth() {
  const nav = document.getElementById('nav-actions');
  if (!nav) return;
  if (currentUser) {
    nav.innerHTML = `
      <div class="user-menu">
        <div class="user-avatar" onclick="toggleUserMenu()">${currentUser.name.charAt(0).toUpperCase()}</div>
        <div class="user-dropdown" id="user-dropdown">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${currentUser.name}</div>
            <div class="user-dropdown-email">${currentUser.email}</div>
          </div>
          <button onclick="switchTab('applications');toggleUserMenu()">📄 My Applications</button>
          <button onclick="switchTab('schedule');toggleUserMenu()">📅 Schedule</button>
          <button onclick="switchTab('dashboard');toggleUserMenu()">📊 Dashboard</button>
          <hr style="border-color:var(--border);margin:.5rem 0">
          <button onclick="signOut()" style="color:var(--danger)">🚪 Sign Out</button>
        </div>
      </div>
    `;
  } else {
    nav.innerHTML = `
      <button class="btn btn-outline btn-sm" onclick="openAuth('signin')">Sign In</button>
      <button class="btn btn-primary btn-sm" onclick="openAuth('signup')">Get Started</button>
    `;
  }
}

function toggleUserMenu() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.user-menu')) {
    const dd = document.getElementById('user-dropdown');
    if (dd) dd.classList.remove('open');
  }
});

// ── AUTH MODAL ────────────────────────────────────────────────────────────
function openAuth(mode) {
  closeModal('auth-modal');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'auth-modal';
  overlay.innerHTML = buildAuthModal(mode);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal('auth-modal'); });
}

function buildAuthModal(mode) {
  const isSignIn = mode === 'signin';
  return `
    <div class="modal auth-modal-box">
      <div class="modal-header">
        <div>
          <div class="nav-logo" style="font-size:1.2rem;margin-bottom:.25rem">TalentBridge</div>
          <h2>${isSignIn ? 'Welcome back' : 'Create your account'}</h2>
        </div>
        <button class="close-btn" onclick="closeModal('auth-modal')">×</button>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab ${isSignIn?'active':''}" onclick="openAuth('signin')">Sign In</button>
        <button class="auth-tab ${!isSignIn?'active':''}" onclick="openAuth('signup')">Sign Up</button>
      </div>

      ${isSignIn ? buildSignInForm() : buildSignUpForm()}
    </div>
  `;
}

function buildSignInForm() {
  return `
    <div id="auth-error" class="auth-error" style="display:none"></div>
    <div class="form-group">
      <label>Email address</label>
      <input type="email" id="si-email" placeholder="you@example.com" autocomplete="email">
    </div>
    <div class="form-group">
      <label>Password</label>
      <div class="pw-wrap">
        <input type="password" id="si-password" placeholder="Enter your password" autocomplete="current-password">
        <button type="button" class="pw-toggle" onclick="togglePw('si-password',this)">👁</button>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:1rem">
      <button class="link-btn" onclick="showForgot()">Forgot password?</button>
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="doSignIn()">Sign In</button>
    <div class="auth-divider"><span>or</span></div>
    <button class="btn btn-outline" style="width:100%" onclick="demoLogin()">🚀 Try Demo Account</button>
    <p class="auth-footer">Don't have an account? <button class="link-btn" onclick="openAuth('signup')">Sign up free</button></p>
  `;
}

function buildSignUpForm() {
  return `
    <div id="auth-error" class="auth-error" style="display:none"></div>
    <div class="form-row">
      <div class="form-group">
        <label>First name</label>
        <input type="text" id="su-fname" placeholder="John">
      </div>
      <div class="form-group">
        <label>Last name</label>
        <input type="text" id="su-lname" placeholder="Doe">
      </div>
    </div>
    <div class="form-group">
      <label>Email address</label>
      <input type="email" id="su-email" placeholder="you@example.com" autocomplete="email">
    </div>
    <div class="form-group">
      <label>Password</label>
      <div class="pw-wrap">
        <input type="password" id="su-password" placeholder="Min 6 characters" autocomplete="new-password" oninput="checkPwStrength(this.value)">
        <button type="button" class="pw-toggle" onclick="togglePw('su-password',this)">👁</button>
      </div>
      <div class="pw-strength" id="pw-strength"></div>
    </div>
    <div class="form-group">
      <label>I am a</label>
      <select id="su-role">
        <option value="jobseeker">Job Seeker</option>
        <option value="recruiter">Recruiter / Employer</option>
        <option value="student">Student / Intern</option>
      </select>
    </div>
    <div class="form-group" style="display:flex;align-items:flex-start;gap:.75rem">
      <input type="checkbox" id="su-terms" style="margin-top:3px;width:auto">
      <label for="su-terms" style="font-size:.82rem;color:var(--text-muted);cursor:pointer">I agree to the <span style="color:var(--primary)">Terms of Service</span> and <span style="color:var(--primary)">Privacy Policy</span></label>
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="doSignUp()">Create Account</button>
    <p class="auth-footer">Already have an account? <button class="link-btn" onclick="openAuth('signin')">Sign in</button></p>
  `;
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function checkPwStrength(val) {
  const el = document.getElementById('pw-strength');
  if (!el) return;
  if (!val) { el.innerHTML = ''; return; }
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const labels = ['','Weak','Fair','Good','Strong','Very Strong'];
  const colors = ['','#ef4444','#f59e0b','#06b6d4','#10b981','#6366f1'];
  el.innerHTML = `<div style="display:flex;align-items:center;gap:.5rem;margin-top:.4rem">
    <div style="flex:1;height:4px;background:var(--border);border-radius:2px">
      <div style="width:${score*20}%;height:100%;background:${colors[score]};border-radius:2px;transition:width .3s"></div>
    </div>
    <span style="font-size:.75rem;color:${colors[score]}">${labels[score]}</span>
  </div>`;
}

function doSignIn() {
  const email = document.getElementById('si-email')?.value.trim();
  const password = document.getElementById('si-password')?.value;
  if (!email || !password) { showAuthError('Please fill in all fields.'); return; }
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) { showAuthError('Invalid email or password.'); return; }
  loginUser(user);
}

function doSignUp() {
  const fname = document.getElementById('su-fname')?.value.trim();
  const lname = document.getElementById('su-lname')?.value.trim();
  const email = document.getElementById('su-email')?.value.trim();
  const password = document.getElementById('su-password')?.value;
  const role = document.getElementById('su-role')?.value;
  const terms = document.getElementById('su-terms')?.checked;
  if (!fname || !lname || !email || !password) { showAuthError('Please fill in all fields.'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
  if (!terms) { showAuthError('Please accept the Terms of Service.'); return; }
  const users = getUsers();
  if (users.find(u => u.email === email)) { showAuthError('An account with this email already exists.'); return; }
  const newUser = { id: Date.now(), name: `${fname} ${lname}`, email, password, role, joined: new Date().toLocaleDateString() };
  users.push(newUser);
  saveUsers(users);
  loginUser(newUser);
}

function demoLogin() {
  const demo = { id: 0, name: 'Demo User', email: 'demo@talentbridge.io', role: 'jobseeker', joined: 'Jan 2025' };
  loginUser(demo);
}

function loginUser(user) {
  currentUser = user;
  localStorage.setItem('tb_user', JSON.stringify(user));
  closeModal('auth-modal');
  updateNavAuth();
  showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
}

function signOut() {
  currentUser = null;
  localStorage.removeItem('tb_user');
  updateNavAuth();
  showToast('Signed out successfully.', 'info');
}

function showForgot() {
  closeModal('auth-modal');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'auth-modal';
  overlay.innerHTML = `
    <div class="modal auth-modal-box">
      <div class="modal-header">
        <h2>Reset Password</h2>
        <button class="close-btn" onclick="closeModal('auth-modal')">×</button>
      </div>
      <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1.25rem">Enter your email and we'll send a reset link.</p>
      <div class="form-group">
        <label>Email address</label>
        <input type="email" id="forgot-email" placeholder="you@example.com">
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="doForgot()">Send Reset Link</button>
      <p class="auth-footer"><button class="link-btn" onclick="openAuth('signin')">← Back to Sign In</button></p>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal('auth-modal'); });
}

function doForgot() {
  const email = document.getElementById('forgot-email')?.value.trim();
  if (!email) return;
  closeModal('auth-modal');
  showToast(`Reset link sent to ${email}`, 'success');
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.tab === tab);
  });
  renderTab(tab);
}

function renderTab(tab) {
  const main = document.getElementById('main-content');
  switch (tab) {
    case 'jobs':        main.innerHTML = renderJobsTab(); break;
    case 'applications':main.innerHTML = renderApplicationsTab(); break;
    case 'schedule':    main.innerHTML = renderScheduleTab(); break;
    case 'post':        main.innerHTML = renderPostTab(); break;
    case 'dashboard':   main.innerHTML = renderDashboardTab(); break;
  }
  attachTabEvents(tab);
}

// ── JOBS TAB ──────────────────────────────────────────────────────────────
function renderJobsTab() {
  return `
    <div class="search-bar">
      <div class="search-input-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="job-search" placeholder="Search jobs, companies, skills..." value="${searchQuery}">
      </div>
      <select id="job-type-filter">
        <option value="all">All Types</option>
        <option value="Full-time">Full-time</option>
        <option value="Internship">Internship</option>
        <option value="Hackathon">Hackathon</option>
      </select>
      <select id="location-filter">
        <option value="all">All Locations</option>
        <option value="Remote">Remote</option>
        <option value="San Francisco">San Francisco</option>
        <option value="New York">New York</option>
      </select>
    </div>
    <div class="filters">
      ${['all','hot','new','remote','internship','hackathon'].map(f =>
        `<button class="filter-chip ${activeFilter===f?'active':''}" onclick="setFilter('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</button>`
      ).join('')}
    </div>
    <div class="cards-grid" id="jobs-grid">
      ${getFilteredJobs().map(renderJobCard).join('')}
    </div>
  `;
}

function getFilteredJobs() {
  return JOBS.filter(j => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.tags.some(t => t.toLowerCase().includes(q));
    const matchFilter = activeFilter === 'all' || j.badge === activeFilter;
    return matchSearch && matchFilter;
  });
}

function renderJobCard(job) {
  return `
    <div class="job-card" onclick="openJobModal(${job.id})">
      <span class="job-badge badge-${job.badge}">${job.badge}</span>
      <div class="job-card-header">
        <div class="company-logo">${job.logo}</div>
        <div class="job-info">
          <h3>${job.title}</h3>
          <div class="company">${job.company}</div>
        </div>
      </div>
      <div class="job-meta">
        <span>📍 ${job.location}</span>
        <span>💼 ${job.type}</span>
        <span>🕐 ${job.posted}</span>
      </div>
      <div class="job-tags">
        ${job.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="job-footer">
        <span class="salary">${job.salary}</span>
        <span class="ai-match">🤖 ${job.match}% match</span>
      </div>
    </div>
  `;
}

function setFilter(f) {
  activeFilter = f;
  renderTab('jobs');
}

function attachTabEvents(tab) {
  if (tab === 'jobs') {
    const search = document.getElementById('job-search');
    if (search) {
      search.addEventListener('input', e => {
        searchQuery = e.target.value;
        document.getElementById('jobs-grid').innerHTML = getFilteredJobs().map(renderJobCard).join('');
      });
    }
  }
  if (tab === 'post') {
    setupPostForm();
  }
}

// ── JOB MODAL ─────────────────────────────────────────────────────────────
function openJobModal(id) {
  selectedJob = JOBS.find(j => j.id === id);
  if (!selectedJob) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'job-modal';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:1rem">
          <div class="company-logo">${selectedJob.logo}</div>
          <div>
            <h2>${selectedJob.title}</h2>
            <div style="color:var(--text-muted);font-size:.85rem">${selectedJob.company} · ${selectedJob.location}</div>
          </div>
        </div>
        <button class="close-btn" onclick="closeModal('job-modal')">×</button>
      </div>

      <div class="ai-screening">
        <h4>🤖 AI Match Score</h4>
        <div class="ai-score">
          <div class="score-bar"><div class="score-fill" style="width:${selectedJob.match}%"></div></div>
          <span class="score-value">${selectedJob.match}%</span>
        </div>
        <p style="font-size:.8rem;color:var(--text-muted);margin-top:.5rem">Based on your profile and resume analysis</p>
      </div>

      <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1.5rem">${selectedJob.desc}</p>

      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <div><div style="font-size:.75rem;color:var(--text-muted)">Salary</div><div style="font-weight:600;color:var(--success)">${selectedJob.salary}</div></div>
        <div><div style="font-size:.75rem;color:var(--text-muted)">Type</div><div style="font-weight:600">${selectedJob.type}</div></div>
        <div><div style="font-size:.75rem;color:var(--text-muted)">Posted</div><div style="font-weight:600">${selectedJob.posted}</div></div>
      </div>

      <div class="job-tags" style="margin-bottom:1.5rem">
        ${selectedJob.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>

      <div class="form-group">
        <label>Upload Resume (AI Screening)</label>
        <div class="upload-zone" id="resume-drop" onclick="document.getElementById('resume-input').click()">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p id="resume-label">Drag & drop or <span>browse</span> your resume</p>
          <input type="file" id="resume-input" accept=".pdf,.doc,.docx" style="display:none" onchange="handleResumeUpload(event)">
        </div>
      </div>

      <div class="form-group">
        <label>Cover Letter (optional)</label>
        <textarea placeholder="Tell us why you're a great fit..."></textarea>
      </div>

      <div style="display:flex;gap:.75rem;justify-content:flex-end">
        <button class="btn btn-outline" onclick="closeModal('job-modal')">Cancel</button>
        <button class="btn btn-primary" onclick="applyJob()">🚀 Apply Now</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal('job-modal'); });
}

function handleResumeUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  resumeFile = file;
  document.getElementById('resume-label').textContent = `✅ ${file.name}`;
  showToast(`Resume uploaded: ${file.name}`, 'success');
}

function applyJob() {
  closeModal('job-modal');
  showToast(`Application submitted to ${selectedJob.company}! 🎉`, 'success');
}

// ── APPLICATIONS TAB ──────────────────────────────────────────────────────
function renderApplicationsTab() {
  return `
    <h2 style="margin-bottom:1.5rem;font-size:1.3rem">My Applications</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Company</th>
            <th>Status</th>
            <th>Applied</th>
            <th>Next Step</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${APPLICATIONS.map(a => `
            <tr>
              <td><strong>${a.job}</strong></td>
              <td>${a.company}</td>
              <td><span class="status status-${a.status}">${a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
              <td style="color:var(--text-muted)">${a.date}</td>
              <td style="font-size:.8rem;color:var(--text-muted)">${a.next}</td>
              <td><button class="btn btn-sm btn-outline" onclick="showToast('Tracking updated','info')">Track</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <h3 style="margin:2rem 0 1rem;font-size:1.1rem">Application Timeline</h3>
    <div class="timeline">
      <div class="timeline-item completed">
        <div class="timeline-date">Jan 15, 2025</div>
        <div class="timeline-title">Applied to Stripe – Senior Frontend Engineer</div>
      </div>
      <div class="timeline-item completed">
        <div class="timeline-date">Jan 16, 2025</div>
        <div class="timeline-title">AI Resume Screening passed (94% match)</div>
      </div>
      <div class="timeline-item pending">
        <div class="timeline-date">Jan 20, 2025</div>
        <div class="timeline-title">Technical Interview scheduled</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">TBD</div>
        <div class="timeline-title">Final round interview</div>
      </div>
    </div>
  `;
}

// ── SCHEDULE TAB ──────────────────────────────────────────────────────────
function renderScheduleTab() {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
      <h2 style="font-size:1.3rem">Interview Schedule</h2>
      <button class="btn btn-primary btn-sm" onclick="showToast('Interview scheduled via AI!','success')">+ Schedule Interview</button>
    </div>

    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;margin-bottom:1.5rem">
      <h4 style="font-size:.85rem;color:var(--primary);margin-bottom:.75rem">🤖 AI Auto-Scheduling</h4>
      <p style="font-size:.85rem;color:var(--text-muted)">AI has analyzed your calendar and suggested optimal interview slots based on your availability and the recruiter's preferences.</p>
    </div>

    <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-muted)">Upcoming Interviews</h3>
    ${INTERVIEWS.map(i => `
      <div class="schedule-card">
        <div class="schedule-time">
          <div class="time">${i.time}</div>
          <div class="date">${i.date}</div>
        </div>
        <div class="schedule-info">
          <h4>${i.title}</h4>
          <p>${i.company} · ${i.type} · ${i.duration}</p>
        </div>
        <div style="display:flex;gap:.5rem">
          <button class="btn btn-sm btn-outline" onclick="showToast('Joining meeting...','info')">Join</button>
          <button class="btn btn-sm btn-outline" onclick="showToast('Rescheduled!','success')">Reschedule</button>
        </div>
      </div>
    `).join('')}
  `;
}

// ── POST JOB TAB ──────────────────────────────────────────────────────────
function renderPostTab() {
  return `
    <div style="max-width:700px">
      <h2 style="margin-bottom:.5rem;font-size:1.3rem">Post a Job</h2>
      <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:1.5rem">AI will automatically screen resumes and rank candidates for you.</p>

      <div class="form-group">
        <label>Job Title *</label>
        <input type="text" id="post-title" placeholder="e.g. Senior Software Engineer">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Company *</label>
          <input type="text" id="post-company" placeholder="Your company name">
        </div>
        <div class="form-group">
          <label>Location *</label>
          <input type="text" id="post-location" placeholder="e.g. Remote, New York">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Job Type</label>
          <select id="post-type">
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Internship</option>
            <option>Contract</option>
            <option>Hackathon</option>
          </select>
        </div>
        <div class="form-group">
          <label>Salary Range</label>
          <input type="text" id="post-salary" placeholder="e.g. $100k–$140k">
        </div>
      </div>
      <div class="form-group">
        <label>Job Description *</label>
        <textarea id="post-desc" placeholder="Describe the role, responsibilities, and requirements..."></textarea>
      </div>
      <div class="form-group">
        <label>Required Skills (comma-separated)</label>
        <input type="text" id="post-skills" placeholder="e.g. React, TypeScript, Node.js">
      </div>

      <div class="ai-screening" style="margin-bottom:1.5rem">
        <h4>🤖 AI Screening Settings</h4>
        <div style="display:flex;flex-direction:column;gap:.75rem;margin-top:.75rem">
          <label style="display:flex;align-items:center;gap:.75rem;cursor:pointer">
            <input type="checkbox" checked> <span style="font-size:.85rem">Auto-screen resumes with AI</span>
          </label>
          <label style="display:flex;align-items:center;gap:.75rem;cursor:pointer">
            <input type="checkbox" checked> <span style="font-size:.85rem">Auto-schedule interviews for top candidates</span>
          </label>
          <label style="display:flex;align-items:center;gap:.75rem;cursor:pointer">
            <input type="checkbox"> <span style="font-size:.85rem">Send automated rejection emails</span>
          </label>
        </div>
      </div>

      <div style="display:flex;gap:.75rem">
        <button class="btn btn-outline" onclick="showToast('Saved as draft','info')">Save Draft</button>
        <button class="btn btn-primary" id="post-submit-btn" onclick="submitJob()">🚀 Post Job</button>
      </div>
    </div>
  `;
}

function setupPostForm() {
  // form is ready via inline handlers
}

function submitJob() {
  const title = document.getElementById('post-title')?.value;
  const company = document.getElementById('post-company')?.value;
  if (!title || !company) {
    showToast('Please fill in required fields', 'error');
    return;
  }
  showToast(`Job "${title}" posted successfully! AI screening activated.`, 'success');
}

// ── DASHBOARD TAB ─────────────────────────────────────────────────────────
function renderDashboardTab() {
  return `
    <h2 style="margin-bottom:1.5rem;font-size:1.3rem">Recruiter Dashboard</h2>
    <div class="dashboard-grid">
      ${[
        { label:'Total Applications', value:'247', change:'+12%', dir:'up' },
        { label:'AI Screened', value:'198', change:'80%', dir:'up' },
        { label:'Interviews Scheduled', value:'34', change:'+5', dir:'up' },
        { label:'Offers Extended', value:'8', change:'+2', dir:'up' },
        { label:'Active Jobs', value:'12', change:'', dir:'' },
        { label:'Avg. Time to Hire', value:'18d', change:'-3d', dir:'up' },
      ].map(m => `
        <div class="metric-card">
          <div class="metric-label">${m.label}</div>
          <div class="metric-value">${m.value}</div>
          ${m.change ? `<div class="metric-change ${m.dir}">${m.dir==='up'?'↑':'↓'} ${m.change}</div>` : ''}
        </div>
      `).join('')}
    </div>

    <h3 style="margin-bottom:1rem;font-size:1rem">Recent Candidates</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Candidate</th><th>Position</th><th>AI Score</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${[
            { name:'Alex Chen', pos:'Senior Frontend Engineer', score:94, status:'interview' },
            { name:'Sarah Kim', pos:'ML Engineer Intern', score:88, status:'screening' },
            { name:'Marcus Lee', pos:'Product Designer', score:76, status:'applied' },
            { name:'Priya Patel', pos:'Data Scientist', score:91, status:'offer' },
          ].map(c => `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>${c.pos}</td>
              <td>
                <div style="display:flex;align-items:center;gap:.5rem">
                  <div class="score-bar" style="width:80px"><div class="score-fill" style="width:${c.score}%"></div></div>
                  <span style="font-size:.8rem;color:var(--success)">${c.score}%</span>
                </div>
              </td>
              <td><span class="status status-${c.status}">${c.status}</span></td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="showToast('Profile opened','info')">View</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── UTILITIES ─────────────────────────────────────────────────────────────
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function showToast(msg, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
