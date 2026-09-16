/**
 * Frontend Application Controller for MoSJE SIH 2026 Scheme Matching Platform.
 * Features: Multilingual UI, Voice Dictation STT, Text-to-Speech TTS,
 * Deterministic Explainability Breakdown, Live EMI Calculator, Grounded RAG Chatbot,
 * Dynamic Admin Console, and WhatsApp / PDF Export.
 */

// Application State
const state = {
  currentLang: 'en',
  activePersonaKey: 'rekha',
  schemes: [],
  matchResults: null,
  activeTab: 'eligible',
  currentModalScheme: null,
  isListening: false,
  speechSynth: window.speechSynthesis,
  recognition: null
};

// Persona Presets for Hackathon Demos
const PERSONAS = {
  rekha: {
    category: 'OBC',
    gender: 'Female',
    age: 34,
    income: 150000,
    is_pwd: false,
    pwd_percent: 0,
    sector: 'Tailoring/Garments',
    state: 'All',
    idea: 'Starting a tailoring boutique to sew designer garments, ladies blouses, and school uniforms with 3 sewing machines.',
    cost: 150000,
    education: 'Class 8'
  },
  suresh: {
    category: 'SC',
    gender: 'Male',
    age: 41,
    income: 250000,
    is_pwd: false,
    pwd_percent: 0,
    sector: 'Manufacturing',
    state: 'All',
    idea: 'Expanding an automobile repair workshop and small metal fabrication unit with modern pneumatic tools and lathe machine.',
    cost: 500000,
    education: 'Class 10'
  },
  imran: {
    category: 'Minority',
    gender: 'Male',
    age: 29,
    income: 180000,
    is_pwd: false,
    pwd_percent: 0,
    sector: 'Artisans/Handicrafts',
    state: 'All',
    idea: 'Traditional brassware and engraved metal handicraft workshop purchasing modern hand tools and raw brass sheet stock.',
    cost: 150000,
    education: 'Class 8'
  },
  anita: {
    category: 'General',
    gender: 'Female',
    age: 26,
    income: 100000,
    is_pwd: true,
    pwd_percent: 50,
    sector: 'Artisans/Handicrafts',
    state: 'All',
    idea: 'Home-based decorative handicrafts, candle making, and a small retail kiosk for independent livelihood.',
    cost: 70000,
    education: 'Class 10'
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initVoiceSTT();
  bindEvents();
  // Auto-run initial match on page load for default persona (Rekha)
  submitProfile();
  loadAdminSchemes();
});

// ----------------------------------------------------
// 1. Multilingual Support (i18n)
// ----------------------------------------------------
function initI18n() {
  const langSelect = document.getElementById('langSelect');
  langSelect.addEventListener('change', (e) => {
    state.currentLang = e.target.value;
    updateI18nTexts();
  });
  updateI18nTexts();
}

function updateI18nTexts() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];

  // 1. Update text nodes with data-i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // 2. Update placeholder attributes with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) {
      el.setAttribute('placeholder', t[key]);
    }
  });

  // 3. Update title attributes with data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key] !== undefined) {
      el.setAttribute('title', t[key]);
    }
  });

  // 4. Update dropdown select options (preserving exact option.value for algorithm integrity)
  if (t.options) {
    const updateSelect = (selectId, map) => {
      const el = document.getElementById(selectId);
      if (!el || !map) return;
      Array.from(el.options).forEach((opt) => {
        if (map[opt.value]) {
          opt.textContent = map[opt.value];
        }
      });
    };
    updateSelect('inputCategory', t.options.category);
    updateSelect('inputGender', t.options.gender);
    updateSelect('inputSector', t.options.sector);
    updateSelect('inputState', t.options.state);
    updateSelect('inputEducation', t.options.education);
  }

  // 5. Update assistant suggestions chips
  if (t.chips && t.chips.length > 0) {
    const chipsContainer = document.getElementById('chatSuggestions');
    if (chipsContainer) {
      chipsContainer.innerHTML = t.chips.map(chip => `
        <button class="chip-query text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-full border border-slate-700">${chip}</button>
      `).join('');
    }
  }

  // 6. Update assistant initial greeting if present
  const welcomeMsg = document.getElementById('assistantWelcomeMessage');
  if (welcomeMsg && t.assistantGreeting) {
    welcomeMsg.textContent = t.assistantGreeting;
  }

  // 6.5. Update business description if loaded from persona
  if (state.activePersonaKey && t.personaIdeas && t.personaIdeas[state.activePersonaKey]) {
    const ideaInput = document.getElementById('inputBusinessIdea');
    if (ideaInput) {
      ideaInput.value = t.personaIdeas[state.activePersonaKey];
    }
  }

  // 7. Update Modal texts if modal is active
  if (state.currentModalScheme) {
    const scheme = state.currentModalScheme;
    const localizedName = (t.schemes && t.schemes[scheme.scheme_id] && t.schemes[scheme.scheme_id].name) || scheme.scheme_name;
    const localizedPurpose = (t.schemes && t.schemes[scheme.scheme_id] && t.schemes[scheme.scheme_id].summary) || scheme.purpose || scheme.summary;

    document.getElementById('modalSchemeName').textContent = localizedName;
    document.getElementById('modalSchemePurpose').textContent = localizedPurpose;
    const lastVerEl = document.getElementById('modalLastVerified');
    if (lastVerEl && lastVerEl.querySelector('span')) {
      lastVerEl.querySelector('span').textContent = `${t.verifiedPrefix} ${scheme.last_verified || '2026-08-25'}`;
    }

    const sliderTenure = document.getElementById('sliderTenure');
    if (sliderTenure) {
      document.getElementById('sliderTenureVal').textContent = `${sliderTenure.value} ${t.yearsSuffix}`;
    }

    const docContainer = document.getElementById('modalDocList');
    if (docContainer) {
      docContainer.innerHTML = (scheme.documents || []).map((d) => `
        <div class="flex items-start p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <i data-lucide="file-check" class="w-4 h-4 ${d.mandatory ? 'text-blue-400' : 'text-slate-400'} mr-2 shrink-0 mt-0.5"></i>
          <div>
            <div class="font-semibold text-white">
              ${d.name} 
              <span class="text-[10px] px-1.5 py-0.2 rounded font-normal ${d.mandatory ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'} ml-1">
                ${d.mandatory ? t.docMandatory : t.docOptional}
              </span>
            </div>
            <div class="text-slate-400 text-[11px] mt-0.5">${d.notes || ''}</div>
          </div>
        </div>
      `).join('');
    }

    const stepContainer = document.getElementById('modalStepsList');
    if (stepContainer) {
      stepContainer.innerHTML = (scheme.application_process || []).map((step, idx) => `
        <div class="relative pl-2 pb-2">
          <div class="font-semibold text-slate-200">${t.stepPrefix} ${idx + 1}</div>
          <div class="text-slate-400 mt-0.5">${step}</div>
        </div>
      `).join('');
    }

    recalculateFinancials();
  }

  // 8. Re-render scheme cards with localized texts
  if (state.matchResults) {
    renderSchemeCards();
  }

  // 9. Re-render admin table if populated
  if (state.schemes && state.schemes.length > 0) {
    renderAdminTable();
  }

  lucide.createIcons();
}

// ----------------------------------------------------
// 2. Web Speech API (STT & TTS)
// ----------------------------------------------------
function initVoiceSTT() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported in this browser.');
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.continuous = false;
  state.recognition.interimResults = false;

  const btnVoice = document.getElementById('btnVoiceInput');
  const indicator = document.getElementById('sttIndicator');
  const textarea = document.getElementById('inputBusinessIdea');
  const voiceText = document.getElementById('voiceStatusText');

  btnVoice.addEventListener('click', () => {
    if (state.isListening) {
      state.recognition.stop();
      return;
    }

    // Set recognition language matching UI
    if (state.currentLang === 'hi') state.recognition.lang = 'hi-IN';
    else if (state.currentLang === 'mr') state.recognition.lang = 'mr-IN';
    else if (state.currentLang === 'ta') state.recognition.lang = 'ta-IN';
    else state.recognition.lang = 'en-IN';

    state.recognition.start();
  });

  state.recognition.onstart = () => {
    state.isListening = true;
    const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
    indicator.classList.remove('hidden');
    btnVoice.classList.add('pulse-ring', 'bg-red-900/40', 'border-red-500');
    if (voiceText) voiceText.textContent = t.voiceListeningShort || 'Listening...';
  };

  state.recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    textarea.value = (textarea.value ? textarea.value + ' ' : '') + transcript;
  };

  state.recognition.onerror = (e) => {
    console.error('Speech recognition error:', e.error);
    stopListeningUI();
  };

  state.recognition.onend = () => {
    stopListeningUI();
  };

  function stopListeningUI() {
    state.isListening = false;
    const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
    indicator.classList.add('hidden');
    btnVoice.classList.remove('pulse-ring', 'bg-red-900/40', 'border-red-500');
    if (voiceText) voiceText.textContent = t.voiceInput || 'Voice Input';
  }
}

function speakText(text) {
  if (!state.speechSynth) return;
  state.speechSynth.cancel(); // stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  if (state.currentLang === 'hi') utterance.lang = 'hi-IN';
  else if (state.currentLang === 'mr') utterance.lang = 'mr-IN';
  else if (state.currentLang === 'ta') utterance.lang = 'ta-IN';
  else utterance.lang = 'en-IN';

  utterance.rate = 0.95;
  state.speechSynth.speak(utterance);
}

// ----------------------------------------------------
// 3. Event Listeners & UI Binding
// ----------------------------------------------------
function bindEvents() {
  // Preset Persona Buttons
  document.querySelectorAll('.btn-persona').forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      loadPersona(presetKey);
    });
  });

  // Disability checkbox toggle
  const chkPwd = document.getElementById('inputIsPwd');
  const pwdContainer = document.getElementById('pwdPercentContainer');
  chkPwd.addEventListener('change', () => {
    if (chkPwd.checked) {
      pwdContainer.classList.remove('hidden');
    } else {
      pwdContainer.classList.add('hidden');
    }
  });

  // Profile Form Submission
  const form = document.getElementById('profileForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitProfile();
  });

  // Filter Tabs
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-slate-800', 'text-slate-400');
      });
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-slate-800', 'text-slate-400');
      renderSchemeCards();
    });
  });

  // Modal Close
  document.getElementById('btnCloseModal').addEventListener('click', closeModal);
  document.getElementById('schemeDetailModal').addEventListener('click', (e) => {
    if (e.target.id === 'schemeDetailModal') closeModal();
  });

  // Modal TTS button
  document.getElementById('btnModalTTS').addEventListener('click', () => {
    if (state.currentModalScheme) {
      const s = state.currentModalScheme;
      const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
      const sName = (t.schemes && t.schemes[s.scheme_id] && t.schemes[s.scheme_id].name) || s.scheme_name;
      const sSummary = (t.schemes && t.schemes[s.scheme_id] && t.schemes[s.scheme_id].summary) || s.summary;
      const textToSpeak = `${sName}. ${sSummary}.`;
      speakText(textToSpeak);
    }
  });

  // Live Calculator Sliders
  const sliderCost = document.getElementById('sliderProjectCost');
  const sliderTenure = document.getElementById('sliderTenure');

  sliderCost.addEventListener('input', (e) => {
    document.getElementById('sliderCostVal').textContent = `₹${Number(e.target.value).toLocaleString('en-IN')}`;
    recalculateFinancials();
  });

  sliderTenure.addEventListener('input', (e) => {
    const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
    document.getElementById('sliderTenureVal').textContent = `${e.target.value} ${t.yearsSuffix}`;
    recalculateFinancials();
  });

  // Assistant Drawer
  document.getElementById('btnOpenAssistant').addEventListener('click', openAssistant);
  document.getElementById('btnCloseAssistant').addEventListener('click', closeAssistant);

  // Assistant Query Form
  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleChatSubmit();
  });

  // Follow-up suggestion chips
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip-query')) {
      document.getElementById('chatInput').value = e.target.textContent;
      handleChatSubmit();
    }
  });

  // Admin Console Modal
  document.getElementById('btnAdminNav').addEventListener('click', openAdminModal);
  document.getElementById('btnCloseAdmin').addEventListener('click', closeAdminModal);

  // Export Buttons
  document.getElementById('btnShareWhatsApp').addEventListener('click', shareWhatsAppShortlist);
  document.getElementById('btnPrintShortlist').addEventListener('click', printShortlistReceipt);
}

function loadPersona(key) {
  const p = PERSONAS[key];
  if (!p) return;

  state.activePersonaKey = key;
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];

  document.getElementById('inputCategory').value = p.category;
  document.getElementById('inputGender').value = p.gender;
  document.getElementById('inputAge').value = p.age;
  document.getElementById('inputIncome').value = p.income;
  document.getElementById('inputIsPwd').checked = p.is_pwd;
  
  const pwdContainer = document.getElementById('pwdPercentContainer');
  if (p.is_pwd) {
    pwdContainer.classList.remove('hidden');
    document.getElementById('inputPwdPercent').value = p.pwd_percent || 40;
  } else {
    pwdContainer.classList.add('hidden');
  }

  document.getElementById('inputSector').value = p.sector;
  document.getElementById('inputState').value = p.state;
  document.getElementById('inputBusinessIdea').value = (t.personaIdeas && t.personaIdeas[key]) || p.idea;
  document.getElementById('inputProjectCost').value = p.cost;
  document.getElementById('inputEducation').value = p.education;

  // Trigger match immediately
  submitProfile();
}

// ----------------------------------------------------
// 4. Match API Call & Card Rendering
// ----------------------------------------------------
async function submitProfile() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  const btn = document.getElementById('btnSubmitMatch');
  const resultsContainer = document.getElementById('schemeResultsList');

  const payload = {
    category: document.getElementById('inputCategory').value,
    gender: document.getElementById('inputGender').value,
    age: parseInt(document.getElementById('inputAge').value) || 30,
    annual_income: parseFloat(document.getElementById('inputIncome').value) || 200000,
    is_pwd: document.getElementById('inputIsPwd').checked,
    pwd_percent: document.getElementById('inputIsPwd').checked ? parseFloat(document.getElementById('inputPwdPercent').value) || 40 : 0,
    state: document.getElementById('inputState').value,
    business_idea: document.getElementById('inputBusinessIdea').value,
    business_sector: document.getElementById('inputSector').value,
    project_cost: parseFloat(document.getElementById('inputProjectCost').value) || 150000,
    education: document.getElementById('inputEducation').value
  };

  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>${t.btnMatching}</span>`;
  lucide.createIcons();

  resultsContainer.innerHTML = `
    <div class="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
      <i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500"></i>
      <p class="text-sm">${t.loadingEvaluatingRules}</p>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Matching API failed');
    const data = await res.json();
    state.matchResults = data;

    // Update Counters
    document.getElementById('countEligible').textContent = data.eligible_count;
    document.getElementById('countBorderline').textContent = data.borderline_count;
    document.getElementById('countIneligible').textContent = data.ineligible_count;

    document.getElementById('tabCountEligible').textContent = data.eligible_count;
    document.getElementById('tabCountBorderline').textContent = data.borderline_count;
    document.getElementById('tabCountIneligible').textContent = data.ineligible_count;

    renderSchemeCards();
  } catch (err) {
    console.error(err);
    resultsContainer.innerHTML = `
      <div class="p-6 bg-red-950/40 border border-red-800 rounded-xl text-red-300 text-center text-xs">
        <i data-lucide="alert-triangle" class="w-6 h-6 mx-auto mb-1 text-red-400"></i>
        ${t.matchError}
      </div>
    `;
    lucide.createIcons();
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="search-check" class="w-4 h-4"></i><span>${t.btnFindSchemes}</span>`;
    lucide.createIcons();
  }
}

function renderSchemeCards() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  const container = document.getElementById('schemeResultsList');
  if (!state.matchResults || !state.matchResults.matches) return;

  const targetStatus = state.activeTab.toUpperCase();
  const schemes = state.matchResults.matches.filter((s) => s.eligibility_status === targetStatus);

  if (schemes.length === 0) {
    const tabName = (targetStatus === 'ELIGIBLE' ? t.tabEligibleText : (targetStatus === 'BORDERLINE' ? t.tabBorderlineText : t.tabIneligibleText));
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        <i data-lucide="info" class="w-8 h-8 mx-auto mb-2 text-slate-500"></i>
        ${t.emptyTierPrefix} <strong>${tabName}</strong> ${t.emptyTierSuffix}
      </div>
    `;
    lucide.createIcons();
    return;
  }

  let html = '';
  schemes.forEach((s) => {
    const fin = s.financial_summary || {};
    const maxLoan = fin.max_loan_amount ? `₹${Number(fin.max_loan_amount).toLocaleString('en-IN')}` : t.asApproved;
    const rate = fin.interest_rate_percent !== undefined ? `${fin.interest_rate_percent}% ${t.perAnnum}` : t.concessional;
    const subsidy = fin.subsidy_percent ? `${fin.subsidy_percent}% ${t.capitalSubsidy}` : t.softCredit;

    // Localized Scheme Name and Summary if available in dictionary
    const localizedName = (t.schemes && t.schemes[s.scheme_id] && t.schemes[s.scheme_id].name) || s.scheme_name;
    const localizedSummary = (t.schemes && t.schemes[s.scheme_id] && t.schemes[s.scheme_id].summary) || s.summary;

    // Status Badge Styling & Localized Text
    let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    let statusText = t.statusEligible;
    if (s.eligibility_status === 'BORDERLINE') {
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      statusText = t.statusBorderline;
    } else if (s.eligibility_status === 'INELIGIBLE') {
      badgeClass = 'bg-slate-700/40 text-slate-400 border-slate-700';
      statusText = t.statusIneligible;
    }

    // Verdict clauses breakdown
    let verdictsHtml = '';
    (s.verdicts || []).forEach((v) => {
      let icon = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0"></i>';
      let rowClass = 'text-slate-300';
      let verdictStatusLabel = (t.verdicts && t.verdicts.PASS) || 'PASS';
      if (v.status === 'BORDERLINE') {
        icon = '<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0"></i>';
        rowClass = 'text-amber-200';
        verdictStatusLabel = (t.verdicts && t.verdicts.BORDERLINE) || 'BORDERLINE';
      } else if (v.status === 'FAIL') {
        icon = '<i data-lucide="x" class="w-3.5 h-3.5 text-rose-400 mr-1.5 shrink-0"></i>';
        rowClass = 'text-rose-200';
        verdictStatusLabel = (t.verdicts && t.verdicts.FAIL) || 'FAIL';
      }

      const critName = (t.criteria && t.criteria[v.criterion]) || v.criterion;

      verdictsHtml += `
        <div class="flex items-start text-[11px] py-1 border-b border-slate-800/40 last:border-0 ${rowClass}">
          ${icon}
          <div class="flex-1">
            <span class="font-semibold text-slate-200">${critName}:</span> ${v.reason}
            <span class="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 uppercase font-semibold text-slate-400">(${verdictStatusLabel})</span>
          </div>
        </div>
      `;
    });

    const auditHeader = s.eligibility_status === 'INELIGIBLE' ? t.whyIneligibleAudit : t.whyMatchedAudit;

    html += `
      <div class="bg-slate-900 border border-slate-800 hover:border-blue-900/60 rounded-2xl p-5 shadow-lg transition duration-200">
        <!-- Top Corporation & Status Badges -->
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span class="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-950/60 border border-blue-900/40 px-2 py-0.5 rounded">
            ${s.issuing_body}
          </span>
          <div class="flex items-center space-x-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}">
              ${statusText}
            </span>
            <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700" title="Semantic relevance to your business description">
              ${s.semantic_score}% ${t.relevanceSuffix}
            </span>
          </div>
        </div>

        <!-- Scheme Name & Summary -->
        <h4 class="text-base font-bold text-white leading-snug mb-1.5">${localizedName}</h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-4">${localizedSummary}</p>

        <!-- Key Financial Metrics Bar -->
        <div class="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-4 text-center">
          <div>
            <div class="text-[10px] text-slate-400">${t.maxLoan}</div>
            <div class="text-xs font-bold text-white mt-0.5">${maxLoan}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400">${t.interestRate}</div>
            <div class="text-xs font-bold text-emerald-400 mt-0.5">${rate}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400">${t.benefitType}</div>
            <div class="text-xs font-bold text-blue-400 mt-0.5">${subsidy}</div>
          </div>
        </div>

        <!-- Collapsible Explainability Audit Trail -->
        <details class="group bg-slate-950/40 rounded-xl border border-slate-800/60 mb-4 overflow-hidden">
          <summary class="flex items-center justify-between p-3 text-xs font-semibold text-slate-300 cursor-pointer hover:text-white select-none">
            <span class="flex items-center">
              <i data-lucide="file-text" class="w-3.5 h-3.5 mr-1.5 text-blue-400"></i>
              <span>${auditHeader}</span>
            </span>
            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <div class="p-3 border-t border-slate-800/60 bg-slate-950/80">
            ${verdictsHtml}
          </div>
        </details>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <button onclick="speakSchemeSummary('${encodeURIComponent(localizedName)}', '${encodeURIComponent(localizedSummary)}')" class="text-xs text-slate-400 hover:text-blue-400 flex items-center space-x-1 transition cursor-pointer">
            <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
            <span>${t.listenAudio}</span>
          </button>
          
          <button onclick="openSchemeDetailModal('${s.scheme_id}')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-blue-600/20 cursor-pointer">
            <span>${t.viewDetailsEmi}</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

// ----------------------------------------------------
// 5. Deep-Dive Modal & Live Calculator
// ----------------------------------------------------
window.speakSchemeSummary = function(nameEncoded, summaryEncoded) {
  const name = decodeURIComponent(nameEncoded);
  const summary = decodeURIComponent(summaryEncoded);
  speakText(`${name}. ${summary}`);
};

window.openSchemeDetailModal = function(schemeId) {
  if (!state.matchResults) return;
  const scheme = state.matchResults.matches.find((s) => s.scheme_id === schemeId);
  if (!scheme) return;

  state.currentModalScheme = scheme;
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];

  const localizedName = (t.schemes && t.schemes[scheme.scheme_id] && t.schemes[scheme.scheme_id].name) || scheme.scheme_name;
  const localizedPurpose = (t.schemes && t.schemes[scheme.scheme_id] && t.schemes[scheme.scheme_id].summary) || scheme.purpose || scheme.summary;

  document.getElementById('modalIssuingBody').textContent = scheme.issuing_body;
  document.getElementById('modalSchemeName').textContent = localizedName;
  document.getElementById('modalSchemePurpose').textContent = localizedPurpose;
  document.getElementById('modalLastVerified').querySelector('span').textContent = `${t.verifiedPrefix} ${scheme.last_verified || '2026-08-25'}`;
  document.getElementById('modalOfficialLink').href = scheme.official_url || '#';

  // Setup Live Calculator Sliders
  const fin = scheme.financial_summary || {};
  const maxProjectCost = (scheme.rules && scheme.rules.max_project_cost) ? scheme.rules.max_project_cost : 2500000;
  const currentCost = Math.min(parseFloat(document.getElementById('inputProjectCost').value) || 150000, maxProjectCost);

  const sliderCost = document.getElementById('sliderProjectCost');
  sliderCost.max = maxProjectCost;
  sliderCost.value = currentCost;
  document.getElementById('sliderCostVal').textContent = `₹${Number(currentCost).toLocaleString('en-IN')}`;

  const sliderTenure = document.getElementById('sliderTenure');
  sliderTenure.max = fin.max_tenure_years || 10;
  sliderTenure.value = Math.min(5, fin.max_tenure_years || 10);
  document.getElementById('sliderTenureVal').textContent = `${sliderTenure.value} ${t.yearsSuffix}`;

  // Render Documents
  const docContainer = document.getElementById('modalDocList');
  docContainer.innerHTML = (scheme.documents || []).map((d) => `
    <div class="flex items-start p-2.5 rounded-lg bg-slate-900 border border-slate-800">
      <i data-lucide="file-check" class="w-4 h-4 ${d.mandatory ? 'text-blue-400' : 'text-slate-400'} mr-2 shrink-0 mt-0.5"></i>
      <div>
        <div class="font-semibold text-white">
          ${d.name} 
          <span class="text-[10px] px-1.5 py-0.2 rounded font-normal ${d.mandatory ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'} ml-1">
            ${d.mandatory ? t.docMandatory : t.docOptional}
          </span>
        </div>
        <div class="text-slate-400 text-[11px] mt-0.5">${d.notes || ''}</div>
      </div>
    </div>
  `).join('');

  // Render Application Steps
  const stepContainer = document.getElementById('modalStepsList');
  stepContainer.innerHTML = (scheme.application_process || []).map((step, idx) => `
    <div class="relative pl-2 pb-2">
      <div class="font-semibold text-slate-200">${t.stepPrefix} ${idx + 1}</div>
      <div class="text-slate-400 mt-0.5">${step}</div>
    </div>
  `).join('');

  recalculateFinancials();

  document.getElementById('schemeDetailModal').classList.remove('hidden');
  lucide.createIcons();
};

function closeModal() {
  document.getElementById('schemeDetailModal').classList.add('hidden');
}

async function recalculateFinancials() {
  if (!state.currentModalScheme) return;
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  const scheme = state.currentModalScheme;
  const cost = parseFloat(document.getElementById('sliderProjectCost').value);
  const tenure = parseInt(document.getElementById('sliderTenure').value);

  try {
    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_cost: cost,
        scheme_id: scheme.scheme_id,
        tenure_years: tenure
      })
    });

    if (!res.ok) throw new Error('Calc failed');
    const data = await res.json();

    document.getElementById('calcMarginMoney').textContent = `₹${Math.round(data.margin_money_amount).toLocaleString('en-IN')}`;
    document.getElementById('calcSubsidy').textContent = `₹${Math.round(data.subsidy_amount).toLocaleString('en-IN')}`;
    document.getElementById('calcLoan').textContent = `₹${Math.round(data.loan_amount).toLocaleString('en-IN')}`;
    document.getElementById('calcEmi').textContent = `₹${Math.round(data.monthly_emi).toLocaleString('en-IN')} ${t.perMonth}`;

    // Update Progress Bar
    const total = data.project_cost || 1;
    const pMargin = Math.round((data.margin_money_amount / total) * 100);
    const pSub = Math.round((data.subsidy_amount / total) * 100);
    const pLoan = Math.max(0, 100 - pMargin - pSub);

    document.getElementById('barMargin').style.width = `${pMargin}%`;
    document.getElementById('barSubsidy').style.width = `${pSub}%`;
    document.getElementById('barLoan').style.width = `${pLoan}%`;

    document.getElementById('pctMargin').textContent = `${pMargin}%`;
    document.getElementById('pctSubsidy').textContent = `${pSub}%`;
    document.getElementById('pctLoan').textContent = `${pLoan}%`;
  } catch (err) {
    console.error(err);
  }
}

// ----------------------------------------------------
// 6. Grounded Conversational RAG Chatbot
// ----------------------------------------------------
function openAssistant() {
  document.getElementById('assistantDrawer').classList.remove('translate-x-full');
}

function closeAssistant() {
  document.getElementById('assistantDrawer').classList.add('translate-x-full');
}

async function handleChatSubmit() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  const input = document.getElementById('chatInput');
  const question = input.value.trim();
  if (!question) return;

  const chatContainer = document.getElementById('chatMessages');
  
  // Render user question
  chatContainer.innerHTML += `
    <div class="flex justify-end">
      <div class="bg-blue-600 text-white p-3 rounded-xl max-w-[85%] leading-relaxed">
        ${escapeHtml(question)}
      </div>
    </div>
  `;
  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Add typing indicator with localized text
  const loadingId = 'loading-' + Date.now();
  chatContainer.innerHTML += `
    <div id="${loadingId}" class="bg-slate-800 p-3 rounded-xl max-w-[85%] border border-slate-700 text-slate-400 flex items-center space-x-2">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-blue-400"></i>
      <span>${t.retrievingClauses}</span>
    </div>
  `;
  lucide.createIcons();
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question })
    });

    const data = await res.json();
    document.getElementById(loadingId).remove();

    // Render citations with localized header
    let citationsHtml = '';
    if (data.citations && data.citations.length > 0) {
      citationsHtml = `
        <div class="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
          <span class="font-bold text-emerald-400">${t.verifiedSourcesLabel}</span>
          <ul class="mt-1 space-y-1">
            ${data.citations.map((c) => {
              const cName = (t.schemes && t.schemes[c.scheme_id] && t.schemes[c.scheme_id].name) || c.scheme_name;
              return `<li>• <strong>${cName}</strong> - <em>${c.clause}</em></li>`;
            }).join('')}
          </ul>
        </div>
      `;
    }

    chatContainer.innerHTML += `
      <div class="bg-slate-800 p-3 rounded-xl border border-slate-700 text-slate-200 leading-relaxed">
        ${data.answer.replace(/\n/g, '<br>')}
        ${citationsHtml}
      </div>
    `;

    // Update suggestions if provided by backend, else fallback to current localized chips
    if (data.suggested_followups && data.suggested_followups.length > 0) {
      const sugContainer = document.getElementById('chatSuggestions');
      sugContainer.innerHTML = data.suggested_followups.map((s) => `
        <button class="chip-query text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-full border border-slate-700">${s}</button>
      `).join('');
    }

    lucide.createIcons();
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (err) {
    console.error(err);
    document.getElementById(loadingId).remove();
    chatContainer.innerHTML += `
      <div class="bg-red-950/60 p-3 rounded-xl border border-red-800 text-red-300">
        ${t.assistantError}
      </div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// ----------------------------------------------------
// 7. Admin & Verification Console
// ----------------------------------------------------
function openAdminModal() {
  loadAdminSchemes();
  loadAnalytics();
  document.getElementById('adminModal').classList.remove('hidden');
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.add('hidden');
}

async function loadAdminSchemes() {
  try {
    const res = await fetch('/api/admin/schemes');
    const schemes = await res.json();
    state.schemes = schemes;
    renderAdminTable();
  } catch (err) {
    console.error('Failed to load admin schemes:', err);
  }
}

function renderAdminTable() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  const tbody = document.getElementById('adminSchemeTableBody');
  if (!tbody || !state.schemes) return;

  tbody.innerHTML = state.schemes.map((s) => {
    const localizedName = (t.schemes && t.schemes[s.id] && t.schemes[s.id].name) || s.name;
    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="py-2.5 px-3 font-semibold text-white">${localizedName}</td>
        <td class="py-2.5 px-3 text-slate-400">${s.issuing_body.split(',')[0]}</td>
        <td class="py-2.5 px-3 text-slate-300">₹${(s.rules.income_ceiling || 0).toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 text-slate-300">₹${(s.rules.max_project_cost || 0).toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 text-emerald-400 font-bold">${s.financials.interest_rate_percent || 0}%</td>
        <td class="py-2.5 px-3 text-slate-400">${s.last_verified || '2026-08-15'}</td>
        <td class="py-2.5 px-3 text-right">
          <button onclick="promptEditScheme('${s.id}')" class="text-xs bg-slate-800 hover:bg-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded transition border border-slate-700">
            ${t.btnEdit}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadAnalytics() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  try {
    const res = await fetch('/api/admin/analytics');
    const data = await res.json();
    
    const container = document.getElementById('analyticsContent');
    container.innerHTML = `
      <div class="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div class="text-slate-400 font-medium mb-1">${t.analyticsTotalProfiles}</div>
        <div class="text-2xl font-black text-white">${data.total_matches_run || 0}</div>
        <div class="text-[10px] text-emerald-400 mt-1">${t.analyticsSeedCount}</div>
      </div>
      <div class="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div class="text-slate-400 font-medium mb-1">${t.analyticsTopSectors}</div>
        <div class="text-xs text-slate-300 space-y-1 mt-1">
          ${Object.entries(data.popular_sectors || {}).slice(0, 3).map(([k, v]) => `<div>• ${k}: <strong>${v}</strong></div>`).join('') || 'Tailoring, Workshop, Artisans'}
        </div>
      </div>
      <div class="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div class="text-slate-400 font-medium mb-1">${t.analyticsDemographics}</div>
        <div class="text-xs text-slate-300 space-y-1 mt-1">
          ${Object.entries(data.demographic_distribution || {}).map(([k, v]) => `<div>• ${k}: <strong>${v}</strong></div>`).join('') || 'SC, OBC, Minority, PwD'}
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load analytics:', err);
  }
}

window.promptEditScheme = async function(schemeId) {
  const scheme = state.schemes.find((s) => s.id === schemeId);
  if (!scheme) return;

  const newCeiling = prompt(`Update Annual Income Ceiling for ${scheme.name}:`, scheme.rules.income_ceiling);
  if (newCeiling === null) return;

  const newRate = prompt(`Update Interest Rate (% p.a.) for ${scheme.name}:`, scheme.financials.interest_rate_percent);
  if (newRate === null) return;

  try {
    const res = await fetch(`/api/admin/schemes/${schemeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        income_ceiling: parseFloat(newCeiling),
        interest_rate_percent: parseFloat(newRate),
        verified_by: 'Admin Lead Auditor'
      })
    });

    if (!res.ok) throw new Error('Update failed');
    alert('Scheme rules updated successfully without code redeployment!');
    loadAdminSchemes();
    // Re-run matching on active profile
    submitProfile();
  } catch (err) {
    alert('Failed to update scheme: ' + err.message);
  }
};

// ----------------------------------------------------
// 8. Sharing & Export (FR15)
// ----------------------------------------------------
function shareWhatsAppShortlist() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  if (!state.matchResults || !state.matchResults.matches) return;
  const eligible = state.matchResults.matches.filter((s) => s.eligibility_status === 'ELIGIBLE');

  let text = `${t.whatsappHeader}\n`;
  text += `${t.whatsappCategory}: ${state.matchResults.user_summary.category} | ${t.whatsappSector}: ${state.matchResults.user_summary.business_sector}\n\n`;
  text += `${t.whatsappEligible} (${eligible.length}):\n`;

  eligible.slice(0, 5).forEach((s, i) => {
    const sName = (t.schemes && t.schemes[s.scheme_id] && t.schemes[s.scheme_id].name) || s.scheme_name;
    text += `${i + 1}. *${sName}*\n   • ${t.whatsappLoan}: ₹${Number(s.financial_summary.max_loan_amount || 0).toLocaleString('en-IN')}\n   • ${t.whatsappRate}: ${s.financial_summary.interest_rate_percent || 0}% ${t.perAnnum}\n   • ${t.whatsappPortal}: ${s.official_url}\n\n`;
  });

  text += `${t.whatsappFooter}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function printShortlistReceipt() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  if (!state.matchResults || !state.matchResults.matches) return;
  const eligible = state.matchResults.matches.filter((s) => s.eligibility_status === 'ELIGIBLE');

  document.getElementById('printApplicantName').textContent = document.getElementById('inputCategory').value + ' ' + t.receiptEntrepreneur;
  document.getElementById('printDate').textContent = new Date().toLocaleDateString('en-IN');

  const printDiv = document.getElementById('printContent');
  printDiv.innerHTML = `
    <h2 style="color: #0c2340; margin: 0 0 4px 0;">${t.receiptTitle}</h2>
    <h3 style="color: #333; margin: 0 0 10px 0; font-size: 14px;">${t.receiptSubtitle}</h3>
    <p style="font-size: 12px; color: #555; margin-bottom: 12px;"><strong>${t.receiptApplicantPrefix}</strong> ${document.getElementById('inputCategory').value} ${t.receiptEntrepreneur} | <strong>${t.receiptDatePrefix}</strong> ${new Date().toLocaleDateString('en-IN')}</p>
    <h4 style="margin: 10px 0 6px 0;">${t.whatsappEligible} (${eligible.length}):</h4>
    <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 11px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th>${t.receiptTableScheme}</th>
          <th>${t.receiptTableBody}</th>
          <th>${t.receiptTableLoan}</th>
          <th>${t.receiptTableRate}</th>
          <th>${t.receiptTableSubsidy}</th>
          <th>${t.receiptTableUrl}</th>
        </tr>
      </thead>
      <tbody>
        ${eligible.map((s) => {
          const sName = (t.schemes && t.schemes[s.scheme_id] && t.schemes[s.scheme_id].name) || s.scheme_name;
          return `
            <tr>
              <td><strong>${sName}</strong></td>
              <td>${s.issuing_body}</td>
              <td>₹${Number(s.financial_summary.max_loan_amount || 0).toLocaleString('en-IN')}</td>
              <td>${s.financial_summary.interest_rate_percent || 0}%</td>
              <td>${s.financial_summary.subsidy_percent || 0}%</td>
              <td>${s.official_url}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    <p style="font-size: 10px; color: #555; margin-top: 15px;">${t.receiptNote}</p>
  `;

  window.print();
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
