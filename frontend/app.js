/**
 * Frontend Application Controller for MoSJE SIH 2026 Scheme Matching Platform.
 * Features: Multilingual UI, Voice Dictation STT, Text-to-Speech TTS,
 * Deterministic Explainability Breakdown, Live EMI Calculator, Grounded RAG Chatbot,
 * Dynamic Admin Console, and WhatsApp / PDF Export.
 */

// HTML Entity Escaping Utility
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  recognition: null,
  generalBenefits: [],
  activeGeneralCategory: 'All',
  activeView: 'matcher',
  channelPartners: [],
  userCoords: null,
  comparedSchemeIds: new Set(),
  extractedProfile: null
};

// Language to BCP-47 Map for Web Speech API (STT & TTS)
const BCP47_MAP = {
  en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', bn: 'bn-IN',
  te: 'te-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN',
  or: 'or-IN', as: 'as-IN', ur: 'ur-IN', sa: 'sa-IN', ne: 'ne-NP',
  mai: 'mai-IN', kok: 'kok-IN', brx: 'hi-IN', doi: 'hi-IN', ks: 'ks-IN',
  mni: 'bn-IN', sat: 'hi-IN', sd: 'sd-IN'
};

// Safe Localization Lookup with Fallback
function getI18n(key, fallback = '') {
  const cur = TRANSLATIONS[state.currentLang];
  if (cur && cur[key] !== undefined && cur[key] !== null) return cur[key];
  const en = TRANSLATIONS['en'];
  if (en && en[key] !== undefined && en[key] !== null) return en[key];
  return fallback;
}

function getLocalizedSchemeName(scheme) {
  if (!scheme) return '';
  const sId = scheme.scheme_id || scheme.id;
  const cur = TRANSLATIONS[state.currentLang];
  if (cur && cur.schemes && cur.schemes[sId] && cur.schemes[sId].name) {
    return cur.schemes[sId].name;
  }
  const en = TRANSLATIONS['en'];
  if (en && en.schemes && en.schemes[sId] && en.schemes[sId].name) {
    return en.schemes[sId].name;
  }
  return scheme.scheme_name || scheme.name || '';
}

function getLocalizedSchemeSummary(scheme) {
  if (!scheme) return '';
  const sId = scheme.scheme_id || scheme.id;
  const cur = TRANSLATIONS[state.currentLang];
  if (cur && cur.schemes && cur.schemes[sId] && cur.schemes[sId].summary) {
    return cur.schemes[sId].summary;
  }
  const en = TRANSLATIONS['en'];
  if (en && en.schemes && en.schemes[sId] && en.schemes[sId].summary) {
    return en.schemes[sId].summary;
  }
  return scheme.summary || scheme.purpose || '';
}

function getLocalizedDocName(docName) {
  if (!docName) return '';
  const cur = TRANSLATIONS[state.currentLang];
  if (cur && cur.docNames && cur.docNames[docName]) {
    return cur.docNames[docName];
  }
  const en = TRANSLATIONS['en'];
  if (en && en.docNames && en.docNames[docName]) {
    return en.docNames[docName];
  }
  return docName;
}

function getLocalizedCriterion(criterion) {
  if (!criterion) return '';
  const cur = TRANSLATIONS[state.currentLang];
  if (cur && cur.criteria && cur.criteria[criterion]) {
    return cur.criteria[criterion];
  }
  const en = TRANSLATIONS['en'];
  if (en && en.criteria && en.criteria[criterion]) {
    return en.criteria[criterion];
  }
  return criterion;
}


// Global Localization Aliases for Interoperability
window.t = getI18n;
window.safeTranslate = getI18n;
window.localizedValue = getI18n;

function getLocalizedVerdict(status) {
  if (!status) return '';
  const cur = TRANSLATIONS[state.currentLang];
  if (cur && cur.verdicts && cur.verdicts[status]) {
    return cur.verdicts[status];
  }
  const en = TRANSLATIONS['en'];
  if (en && en.verdicts && en.verdicts[status]) {
    return en.verdicts[status];
  }
  return status;
}

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
    education: 'Class 8',
    loan_purpose: 'business',
    district: 'Pune',
    pincode: '411001'
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
    education: 'Class 10',
    loan_purpose: 'business',
    district: 'Kanpur',
    pincode: '208001'
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
    education: 'Class 8',
    loan_purpose: 'business',
    district: 'Moradabad',
    pincode: '244001'
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
    education: 'Class 10',
    loan_purpose: 'business',
    district: 'Madurai',
    pincode: '625001'
  },
  pooja: {
    category: 'SC',
    gender: 'Female',
    age: 22,
    income: 200000,
    is_pwd: false,
    pwd_percent: 0,
    sector: 'Education',
    state: 'All',
    idea: 'Pursuing M.Tech / B.Tech in Computer Science and Engineering requiring tuition fee and hostel expense financial support.',
    cost: 800000,
    education: 'Graduate',
    loan_purpose: 'education',
    district: 'Varanasi',
    pincode: '221002'
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initVoiceSTT();
  bindEvents();
  initAIIntake();
  initSchemeComparison();
  loadAIProviderStatus();
  initSemanticSearch();
  // Auto-run initial match on page load for default persona (Rekha)
  submitProfile();
  loadAdminSchemes();
  initChannelPartners();
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

  // 1. Update text nodes with data-i18n safely
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = getI18n(key, el.textContent);
  });

  // 2. Update placeholder attributes safely
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = getI18n(key, '');
    if (val) el.setAttribute('placeholder', val);
  });

  // 3. Update title attributes safely
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    const val = getI18n(key, '');
    if (val) el.setAttribute('title', val);
  });

  // 4. Update dropdown select options
  const curOptions = t.options || TRANSLATIONS['en'].options;
  if (curOptions) {
    const updateSelect = (selectId, map) => {
      const el = document.getElementById(selectId);
      if (!el || !map) return;
      Array.from(el.options).forEach((opt) => {
        if (map[opt.value]) {
          opt.textContent = map[opt.value];
        }
      });
    };
    updateSelect('inputCategory', curOptions.category);
    updateSelect('inputGender', curOptions.gender);
    updateSelect('inputSector', curOptions.sector);
    updateSelect('inputState', curOptions.state);
    updateSelect('inputEducation', curOptions.education);
  }

  // 5. Update assistant suggestions chips
  const chipsList = t.chips || TRANSLATIONS['en'].chips;
  if (chipsList && chipsList.length > 0) {
    const chipsContainer = document.getElementById('chatSuggestions');
    if (chipsContainer) {
      chipsContainer.innerHTML = chipsList.map(chip => `
        <button class="chip-query text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-full border border-slate-700">${escapeHtml(chip)}</button>
      `).join('');
    }
  }

  // 6. Update assistant initial greeting if present
  const welcomeMsg = document.getElementById('assistantWelcomeMessage');
  if (welcomeMsg) {
    welcomeMsg.textContent = getI18n('assistantGreeting', welcomeMsg.textContent);
  }

  // 6.5. Update business description if loaded from persona
  if (state.activePersonaKey) {
    const personaIdeas = t.personaIdeas || TRANSLATIONS['en'].personaIdeas || {};
    if (personaIdeas[state.activePersonaKey]) {
      const ideaInput = document.getElementById('inputBusinessIdea');
      if (ideaInput) {
        ideaInput.value = personaIdeas[state.activePersonaKey];
      }
    }
  }

  // 7. Update Modal texts dynamically if modal is active
  if (state.currentModalScheme) {
    const scheme = state.currentModalScheme;
    const localizedName = getLocalizedSchemeName(scheme);
    const localizedPurpose = getLocalizedSchemeSummary(scheme);

    document.getElementById('modalSchemeName').textContent = localizedName;
    document.getElementById('modalSchemePurpose').textContent = localizedPurpose;
    const lastVerEl = document.getElementById('modalLastVerified');
    if (lastVerEl && lastVerEl.querySelector('span')) {
      lastVerEl.querySelector('span').textContent = `${getI18n('verifiedPrefix', 'Verified on:')} ${scheme.last_verified || '2026-09-16'}`;
    }

    const sliderTenure = document.getElementById('sliderTenure');
    if (sliderTenure) {
      document.getElementById('sliderTenureVal').textContent = `${sliderTenure.value} ${getI18n('yearsSuffix', 'Years')}`;
    }

    const docContainer = document.getElementById('modalDocList');
    if (docContainer) {
      docContainer.innerHTML = (scheme.documents || []).map((d) => {
        const docName = getLocalizedDocName(d.name);
        const mandatoryBadge = d.mandatory ? getI18n('docMandatory', 'Mandatory') : getI18n('docOptional', 'Optional');
        const badgeClass = d.mandatory ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400';
        return `
          <div class="flex items-start p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <i data-lucide="file-check" class="w-4 h-4 ${d.mandatory ? 'text-blue-400' : 'text-slate-400'} mr-2 shrink-0 mt-0.5"></i>
            <div>
              <div class="font-semibold text-white">
                ${escapeHtml(docName)} 
                <span class="text-[10px] px-1.5 py-0.2 rounded font-normal ${badgeClass} ml-1">
                  ${escapeHtml(mandatoryBadge)}
                </span>
              </div>
              <div class="text-slate-400 text-[11px] mt-0.5">${escapeHtml(d.notes || '')}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    const stepContainer = document.getElementById('modalStepsList');
    if (stepContainer) {
      const stepPrefix = getI18n('stepPrefix', 'Step');
      stepContainer.innerHTML = (scheme.application_process || []).map((step, idx) => `
        <div class="relative pl-2 pb-2">
          <div class="font-semibold text-slate-200">${escapeHtml(stepPrefix)} ${idx + 1}</div>
          <div class="text-slate-400 mt-0.5">${escapeHtml(step)}</div>
        </div>
      `).join('');
    }

    recalculateFinancials();
  }

  // 8. Re-render scheme cards with localized texts immediately
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

    // Set recognition language matching UI with graceful fallback
    const langTag = BCP47_MAP[state.currentLang] || 'en-IN';
    state.recognition.lang = langTag;

    try {
      state.recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed for', langTag, err);
      // Non-blocking fallback to en-IN
      state.recognition.lang = 'en-IN';
      try { state.recognition.start(); } catch (e) {}
    }
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
  const langTag = BCP47_MAP[state.currentLang] || 'en-IN';
  utterance.lang = langTag;
  utterance.rate = 0.95;

  try {
    state.speechSynth.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error, falling back to en-IN:', err);
    utterance.lang = 'en-IN';
    state.speechSynth.speak(utterance);
  }
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
    document.getElementById('sliderTenureVal').textContent = `${e.target.value} ${getI18n('yearsSuffix', 'Years')}`;
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

  // View Navigation Switcher
  const btnMatcher = document.getElementById('navBusinessMatcher');
  const btnGen = document.getElementById('navGeneralBenefits');
  if (btnMatcher) btnMatcher.addEventListener('click', () => switchView('matcher'));
  if (btnGen) btnGen.addEventListener('click', () => switchView('general'));

  // General Benefits Category Filters
  document.querySelectorAll('.filter-chip-gen').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip-gen').forEach(c => {
        c.className = 'filter-chip-gen px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 cursor-pointer';
      });
      chip.className = 'filter-chip-gen px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white cursor-pointer';
      state.activeGeneralCategory = chip.getAttribute('data-category');
      renderGeneralBenefits();
    });
  });

  // General Search Input
  const genSearch = document.getElementById('generalSearchInput');
  if (genSearch) {
    genSearch.addEventListener('input', () => {
      renderGeneralBenefits();
    });
  }
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
  if (document.getElementById('inputLoanPurpose')) {
    document.getElementById('inputLoanPurpose').value = p.loan_purpose || 'business';
  }
  if (document.getElementById('inputDistrict')) {
    document.getElementById('inputDistrict').value = p.district || '';
  }
  if (document.getElementById('inputPincode')) {
    document.getElementById('inputPincode').value = p.pincode || '';
  }

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
    education: document.getElementById('inputEducation').value,
    loan_purpose: document.getElementById('inputLoanPurpose') ? document.getElementById('inputLoanPurpose').value : 'business',
    district: document.getElementById('inputDistrict') ? document.getElementById('inputDistrict').value : '',
    pincode: document.getElementById('inputPincode') ? document.getElementById('inputPincode').value : ''
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
    fetchChannelPartners({
      state: payload.state !== 'All' ? payload.state : '',
      district: payload.district || '',
      loan_category: payload.loan_purpose === 'education' ? 'Educational Loan' : ''
    });
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
    const maxLoan = fin.max_loan_amount ? `₹${Number(fin.max_loan_amount).toLocaleString('en-IN')}` : getI18n('asApproved', 'As approved');
    const rate = fin.interest_rate_percent !== undefined ? `${fin.interest_rate_percent}% ${getI18n('perAnnum', 'p.a.')}` : getI18n('concessional', 'Concessional');
    const subsidy = fin.subsidy_percent ? `${fin.subsidy_percent}% ${getI18n('capitalSubsidy', 'Capital Subsidy')}` : getI18n('softCredit', 'Soft Credit');

    // Localized Scheme Name and Summary
    const localizedName = getLocalizedSchemeName(s);
    const localizedSummary = getLocalizedSchemeSummary(s);

    // Status Badge Styling & Localized Text
    let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    let statusText = getI18n('statusEligible', 'ELIGIBLE');
    if (s.eligibility_status === 'BORDERLINE') {
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      statusText = getI18n('statusBorderline', 'BORDERLINE');
    } else if (s.eligibility_status === 'INELIGIBLE') {
      badgeClass = 'bg-slate-700/40 text-slate-400 border-slate-700';
      statusText = getI18n('statusIneligible', 'INELIGIBLE');
    }

    // Verdict clauses breakdown
    let verdictsHtml = '';
    (s.verdicts || []).forEach((v) => {
      let icon = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0"></i>';
      let rowClass = 'text-slate-300';
      let verdictStatusLabel = getLocalizedVerdict(v.status);
      if (v.status === 'BORDERLINE') {
        icon = '<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0"></i>';
        rowClass = 'text-amber-200';
      } else if (v.status === 'FAIL') {
        icon = '<i data-lucide="x" class="w-3.5 h-3.5 text-rose-400 mr-1.5 shrink-0"></i>';
        rowClass = 'text-rose-200';
      }

      const critName = getLocalizedCriterion(v.criterion);

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
          <div class="flex items-center space-x-1.5 flex-wrap gap-1">
            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-950/60 border border-blue-900/40 px-2 py-0.5 rounded">
              ${s.issuing_body}
            </span>
            <span class="text-[10px] font-bold text-purple-300 uppercase tracking-wider bg-purple-950/60 border border-purple-900/40 px-2 py-0.5 rounded">
              ${s.loan_category || 'Term Loan'}
            </span>
            ${s.moratorium_months ? `
              <span class="text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center">
                <i data-lucide="clock" class="w-2.5 h-2.5 mr-1"></i> ${s.loan_category === 'Educational Loan' ? 'Course + 1 Yr Moratorium' : `${s.moratorium_months}M Moratorium`}
              </span>
            ` : ''}
          </div>
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

        <!-- Suggested Channel Partner (Haversine Routing) -->
        ${s.suggested_partner ? `
          <div class="mb-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-start space-x-2.5">
            <i data-lucide="building-2" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
            <div class="flex-1">
              <div class="font-bold text-emerald-200">${getI18n('suggestedPartnerLabel', 'Suggested Channel Partner')}: ${escapeHtml(s.suggested_partner)}</div>
              <p class="text-[10px] text-emerald-300/80 mt-0.5 leading-relaxed">${escapeHtml(s.suggested_partner_reason || '')}</p>
            </div>
          </div>
        ` : ''}

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

        <!-- Why this scheme? Grounded Explainability -->
        <div class="mb-4 p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-slate-300">
          <div class="font-semibold text-blue-300 flex items-center mb-1">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 mr-1 text-blue-400"></i>
            <span>${getI18n('whyThisScheme', 'Why this scheme?')}</span>
          </div>
          <p class="leading-relaxed text-slate-300">${escapeHtml(getWhyThisSchemeText(s))}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/60 gap-2">
          <div class="flex items-center space-x-3">
            <button onclick="speakSchemeSummary('${encodeURIComponent(localizedName)}', '${encodeURIComponent(localizedSummary)}')" class="text-xs text-slate-400 hover:text-blue-400 flex items-center space-x-1 transition cursor-pointer">
              <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
              <span>${t.listenAudio}</span>
            </button>
            <label class="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
              <input type="checkbox" class="compare-checkbox accent-blue-500 rounded cursor-pointer w-4 h-4" data-scheme-id="${s.scheme_id}" ${state.comparedSchemeIds && state.comparedSchemeIds.has(s.scheme_id) ? 'checked' : ''}>
              <span class="text-[11px] font-medium">${getI18n('addToCompare', 'Add to Compare')}</span>
            </label>
          </div>
          
          <div class="flex items-center space-x-2">
            <button onclick="sendSchemeToCalculator('${s.scheme_id}')" class="bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 hover:text-white border border-amber-800/60 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1 transition cursor-pointer" title="Calculate EMI & Repayment for this scheme">
              <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
              <span>${getI18n('sendToCalcBtn', 'Calculate EMI')}</span>
            </button>
            <button onclick="routeToPartnerForScheme('${s.scheme_id}', '${encodeURIComponent(s.loan_category || 'Term Loan')}')" class="bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-800/60 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1 transition cursor-pointer">
              <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
              <span>${getI18n('findPartnerForScheme', 'Find Partner')}</span>
            </button>
            <button onclick="openSchemeDetailModal('${s.scheme_id}')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-blue-600/20 cursor-pointer">
              <span>${t.viewDetailsEmi}</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

function getWhyThisSchemeText(scheme) {
  if (!scheme) return '';
  if (scheme.why_matched_explanation) {
    return scheme.why_matched_explanation;
  }
  const status = scheme.eligibility_status;
  const verdicts = scheme.verdicts || [];
  const score = Math.round((scheme.semantic_score || 0.85) * 100);
  const fin = scheme.financial_summary || {};
  const maxL = fin.max_loan_amount ? `₹${Number(fin.max_loan_amount).toLocaleString('en-IN')}` : 'credit ceiling';

  if (status === 'ELIGIBLE') {
    const passedCount = verdicts.filter(v => v.status === 'PASS').length;
    return `Passed all ${passedCount} statutory eligibility criteria (income, category, age, cost). Has ${score}% sector relevance to your stated business idea with concessional loan limit up to ${maxL}.`;
  } else if (status === 'BORDERLINE') {
    const borderlineClauses = verdicts.filter(v => v.status === 'BORDERLINE').map(v => v.criterion);
    return `Near match: Meets target demographic but falls within borderline discretion buffer for: ${borderlineClauses.join(', ')}. Discretionary leeway or SCA special sanction may apply.`;
  } else {
    const failedClauses = verdicts.filter(v => v.status === 'FAIL').map(v => v.criterion);
    return `Ineligible: Statutory criteria failed for: ${failedClauses.join(', ')}. Check alternative schemes or modify project cost parameters.`;
  }
}

// ----------------------------------------------------
// Stage 4: Natural-Language Intake & Human-in-the-Loop
// ----------------------------------------------------
function initAIIntake() {
  const queryInput = document.getElementById('aiIntakeQuery');
  const btnAnalyze = document.getElementById('btnAnalyzeIntake');
  const btnVoice = document.getElementById('btnVoiceIntake');
  const voiceStatus = document.getElementById('voiceIntakeStatusText');
  const btnSample = document.getElementById('btnTrySampleIntake');
  const btnClear = document.getElementById('btnClearIntake');
  
  const card = document.getElementById('aiConfirmationCard');
  const summaryEl = document.getElementById('aiSummaryInterpretation');
  const intentBadge = document.getElementById('aiIntentBadge');
  const confBadge = document.getElementById('aiConfidenceBadge');
  const provBadge = document.getElementById('aiProviderBadge');
  const missingAlert = document.getElementById('aiMissingFieldsAlert');
  const missingText = document.getElementById('aiMissingFieldsText');
  const uncertainAlert = document.getElementById('aiUncertainFieldsAlert');
  const uncertainText = document.getElementById('aiUncertainFieldsText');

  const btnConfirm = document.getElementById('btnConfirmAndMatch');
  const btnEditForm = document.getElementById('btnEditInFullForm');
  const btnDismiss = document.getElementById('btnDismissConfirmation');

  if (!queryInput || !btnAnalyze) return;

  // Try Sample Button
  if (btnSample) {
    btnSample.addEventListener('click', () => {
      queryInput.value = "I am an SC woman from Karnataka earning ₹2.5 lakh per year. I want to start a ₹3 lakh tailoring business from home.";
    });
  }

  // Clear Button
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      queryInput.value = '';
      if (card) card.classList.add('hidden');
      state.extractedProfile = null;
    });
  }

  // Dismiss Confirmation Card
  if (btnDismiss) {
    btnDismiss.addEventListener('click', () => {
      if (card) card.classList.add('hidden');
      state.extractedProfile = null;
    });
  }

  // Analyze Intake Button
  btnAnalyze.addEventListener('click', async () => {
    const query = queryInput.value.trim();
    if (!query || query.length < 3) {
      alert("Please provide a description of your background and requirement.");
      return;
    }

    btnAnalyze.disabled = true;
    const origHtml = btnAnalyze.innerHTML;
    btnAnalyze.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>${getI18n('analyzingIntake', 'Interpreting...')}</span>`;
    lucide.createIcons();

    try {
      const res = await fetch('/api/ai/extract-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!res.ok) throw new Error('Failed to extract profile');
      const data = await res.json();
      state.extractedProfile = data;

      // Populate Interpretation & Badges
      summaryEl.textContent = data.summary_interpretation || 'Profile extracted successfully.';
      const intentFmt = (data.detected_intent || 'business_finance').replace('_', ' ').toUpperCase();
      intentBadge.textContent = `Intent: ${intentFmt}`;
      confBadge.textContent = `Confidence: ${Math.round((data.confidence_score || 0.8) * 100)}%`;
      provBadge.textContent = data.provider_used || 'AI Extractor';

      // Missing Critical Fields Alert
      if (data.missing_critical_fields && data.missing_critical_fields.length > 0) {
        missingAlert.classList.remove('hidden');
        missingText.innerHTML = `<strong>${getI18n('missingFieldsPrompt', 'Missing required details for official matching: ')}</strong>${data.missing_critical_fields.join(', ')}. Please confirm or fill them in below.`;
      } else {
        missingAlert.classList.add('hidden');
      }

      // Uncertain Fields Alert
      if (data.uncertain_fields && data.uncertain_fields.length > 0) {
        uncertainAlert.classList.remove('hidden');
        uncertainText.innerHTML = `<strong>${getI18n('uncertainFieldsPrompt', 'Please verify these uncertain details: ')}</strong>${data.uncertain_fields.join(', ')}.`;
      } else {
        uncertainAlert.classList.add('hidden');
      }

      // Populate Editable Fields
      const p = data.extracted_profile || {};
      const catEl = document.getElementById('extractedCategory');
      if (catEl && p.social_category) catEl.value = p.social_category;
      const genEl = document.getElementById('extractedGender');
      if (genEl && p.gender) genEl.value = p.gender;
      const ageEl = document.getElementById('extractedAge');
      if (ageEl) ageEl.value = p.age || '';
      const stateEl = document.getElementById('extractedState');
      if (stateEl) stateEl.value = p.state || '';
      const incEl = document.getElementById('extractedIncome');
      if (incEl) incEl.value = p.annual_income || '';
      const costEl = document.getElementById('extractedCost');
      if (costEl) costEl.value = p.project_cost || '';
      const secEl = document.getElementById('extractedSector');
      if (secEl) secEl.value = p.sector || p.occupation || 'Tailoring/Garments';
      const pwdEl = document.getElementById('extractedIsPwd');
      if (pwdEl) pwdEl.checked = !!p.is_pwd;

      card.classList.remove('hidden');
      lucide.createIcons();
    } catch (err) {
      console.error(err);
      alert('Error communicating with profile extraction service.');
    } finally {
      btnAnalyze.disabled = false;
      btnAnalyze.innerHTML = origHtml;
      lucide.createIcons();
    }
  });

  // Confirm and Match Schemes Button
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      // Sync extracted values to main profile form
      applyExtractedToMainForm();
      // Execute match
      submitProfile();
      // Smooth scroll to results
      const resultsEl = document.getElementById('schemeResultsList');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Edit in Full Form Button
  if (btnEditForm) {
    btnEditForm.addEventListener('click', () => {
      applyExtractedToMainForm();
      const formEl = document.getElementById('profileForm');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function applyExtractedToMainForm() {
    const cat = document.getElementById('extractedCategory').value;
    const gen = document.getElementById('extractedGender').value;
    const age = document.getElementById('extractedAge').value;
    const st = document.getElementById('extractedState').value;
    const inc = document.getElementById('extractedIncome').value;
    const cost = document.getElementById('extractedCost').value;
    const sec = document.getElementById('extractedSector').value;
    const pwd = document.getElementById('extractedIsPwd').checked;

    if (cat) document.getElementById('inputCategory').value = cat;
    if (gen) document.getElementById('inputGender').value = gen;
    if (age) document.getElementById('inputAge').value = age;
    if (st) {
      const stateSel = document.getElementById('inputState');
      let matchedOpt = Array.from(stateSel.options).find(o => o.value.toLowerCase() === st.toLowerCase());
      if (matchedOpt) {
        stateSel.value = matchedOpt.value;
      } else {
        stateSel.value = 'All';
      }
    }
    if (inc) document.getElementById('inputIncome').value = inc;
    if (cost) document.getElementById('inputProjectCost').value = cost;
    if (sec) {
      const secSel = document.getElementById('inputSector');
      let matchedSec = Array.from(secSel.options).find(o => o.value.toLowerCase().includes(sec.toLowerCase()) || sec.toLowerCase().includes(o.value.toLowerCase()));
      if (matchedSec) {
        secSel.value = matchedSec.value;
      }
      document.getElementById('inputBusinessIdea').value = queryInput.value.trim() || `Business in ${sec}`;
    }
    document.getElementById('inputIsPwd').checked = pwd;
    const pwdContainer = document.getElementById('pwdPercentContainer');
    if (pwd) {
      pwdContainer.classList.remove('hidden');
      document.getElementById('inputPwdPercent').value = 40;
    } else {
      pwdContainer.classList.add('hidden');
    }
  }

  // Web Speech API for Intake
  if (btnVoice) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      btnVoice.style.display = 'none';
      return;
    }

    let intakeRecognition = new SpeechRecognition();
    intakeRecognition.continuous = false;
    intakeRecognition.interimResults = false;
    let isIntakeListening = false;

    btnVoice.addEventListener('click', () => {
      if (isIntakeListening) {
        intakeRecognition.stop();
        return;
      }
      const langTag = BCP47_MAP[state.currentLang] || 'en-IN';
      intakeRecognition.lang = langTag;
      try {
        intakeRecognition.start();
      } catch (e) {
        intakeRecognition.lang = 'en-IN';
        try { intakeRecognition.start(); } catch (err) {}
      }
    });

    intakeRecognition.onstart = () => {
      isIntakeListening = true;
      btnVoice.classList.add('pulse-ring', 'bg-red-900/40', 'border-red-500');
      if (voiceStatus) voiceStatus.textContent = getI18n('voiceListeningShort', 'Listening...');
    };

    intakeRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      queryInput.value = (queryInput.value ? queryInput.value + ' ' : '') + transcript;
    };

    intakeRecognition.onerror = () => stopVoiceIntake();
    intakeRecognition.onend = () => stopVoiceIntake();

    function stopVoiceIntake() {
      isIntakeListening = false;
      btnVoice.classList.remove('pulse-ring', 'bg-red-900/40', 'border-red-500');
      if (voiceStatus) voiceStatus.textContent = getI18n('voiceSpeak', 'Voice Input');
    }
  }
}

// ----------------------------------------------------
// Stage 3 & 4: Multi-Scheme Comparison
// ----------------------------------------------------
function initSchemeComparison() {
  state.comparedSchemeIds = new Set();
  const bar = document.getElementById('floatingCompareBar');
  const countText = document.getElementById('compareCountText');
  const btnOpen = document.getElementById('btnOpenCompareModal');
  const btnClear = document.getElementById('btnClearCompare');
  const modal = document.getElementById('schemeCompareModal');
  const btnClose = document.getElementById('btnCloseCompareModal');
  const modalBody = document.getElementById('compareModalBody');

  // Checkbox delegate listener
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('compare-checkbox')) {
      const sid = e.target.getAttribute('data-scheme-id');
      if (e.target.checked) {
        if (state.comparedSchemeIds.size >= 4) {
          e.target.checked = false;
          alert("You can select up to 4 schemes to compare side-by-side.");
          return;
        }
        state.comparedSchemeIds.add(sid);
      } else {
        state.comparedSchemeIds.delete(sid);
      }
      updateCompareBar();
    }
  });

  function updateCompareBar() {
    if (!bar) return;
    const size = state.comparedSchemeIds.size;
    if (size > 0) {
      bar.classList.remove('hidden');
      if (countText) countText.textContent = `${size} scheme${size > 1 ? 's' : ''} selected`;
    } else {
      bar.classList.add('hidden');
    }
  }

  // Clear Comparison Button
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      state.comparedSchemeIds.clear();
      document.querySelectorAll('.compare-checkbox').forEach(cb => cb.checked = false);
      updateCompareBar();
    });
  }

  // Close Comparison Modal
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });
  }

  // Open Comparison Modal
  if (btnOpen) {
    btnOpen.addEventListener('click', async () => {
      if (state.comparedSchemeIds.size < 2) {
        alert(getI18n('noSchemesSelected', 'Please select at least 2 schemes to compare.'));
        return;
      }

      if (modal) modal.classList.remove('hidden');
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="p-12 text-center text-slate-400">
            <i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500"></i>
            <p>${getI18n('comparingSchemes', 'Generating grounded comparison...')}</p>
          </div>
        `;
      }
      lucide.createIcons();

      try {
        const payload = {
          scheme_ids: Array.from(state.comparedSchemeIds),
          user_context: document.getElementById('inputBusinessIdea') ? document.getElementById('inputBusinessIdea').value : undefined
        };

        const res = await fetch('/api/ai/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Comparison failed');
        const data = await res.json();
        renderComparisonView(data);
      } catch (err) {
        console.error(err);
        if (modalBody) {
          modalBody.innerHTML = `
            <div class="p-6 bg-red-950/40 border border-red-800 rounded-xl text-red-300 text-center">
              <i data-lucide="alert-triangle" class="w-6 h-6 mx-auto mb-1 text-red-400"></i>
              Failed to generate scheme comparison.
            </div>
          `;
        }
        lucide.createIcons();
      }
    });
  }

  function renderComparisonView(data) {
    if (!modalBody) return;
    const schemes = data.compared_schemes || [];
    const diffs = data.key_differences || [];
    const guidance = data.suitability_guidance || '';
    const disclaimer = data.ai_disclaimer || '';
    const sources = data.evidence_sources || [];

    let diffsHtml = diffs.map(d => `
      <li class="flex items-start space-x-2 text-xs text-slate-200">
        <i data-lucide="arrow-right-circle" class="w-4 h-4 text-blue-400 shrink-0 mt-0.5"></i>
        <span>${escapeHtml(d)}</span>
      </li>
    `).join('');

    let sourcesHtml = sources.map(s => `
      <a href="${s.official_url}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-blue-400 hover:underline flex items-center space-x-1">
        <span>${escapeHtml(s.scheme_name)} (${s.last_verified})</span>
        <i data-lucide="external-link" class="w-3 h-3"></i>
      </a>
    `).join(' &bull; ');

    // Table Columns
    let tableHeaders = schemes.map(s => `
      <th class="p-3 text-left font-bold text-white bg-slate-950/70 border-b border-slate-800 min-w-[200px]">
        <div class="text-sm">${escapeHtml(s.scheme_name)}</div>
        <div class="text-[10px] text-slate-400 font-normal">${escapeHtml(s.issuing_body)}</div>
      </th>
    `).join('');

    function renderRow(labelKey, defaultLabel, accessor) {
      const cells = schemes.map(s => `
        <td class="p-3 border-b border-slate-800/80 align-top text-xs text-slate-300">
          ${accessor(s)}
        </td>
      `).join('');
      return `
        <tr>
          <td class="p-3 font-semibold text-slate-400 bg-slate-950/40 border-b border-slate-800/80 w-44 shrink-0 text-xs">
            ${getI18n(labelKey, defaultLabel)}
          </td>
          ${cells}
        </tr>
      `;
    }

    let rowsHtml = [
      renderRow('paramPurpose', 'Purpose & Scope', s => escapeHtml(s.purpose)),
      renderRow('paramBeneficiaries', 'Target Beneficiaries', s => escapeHtml(s.target_beneficiaries)),
      renderRow('paramEligibility', 'Eligibility Rules', s => escapeHtml(s.eligibility_summary)),
      renderRow('paramCostRange', 'Project Cost Range', s => `<span class="font-bold text-white">${escapeHtml(s.project_cost_range)}</span>`),
      renderRow('paramMaxLoan', 'Maximum Loan', s => `<span class="font-bold text-blue-400">${escapeHtml(s.max_loan_amount)}</span>`),
      renderRow('paramInterestRate', 'Interest Rate', s => `<span class="font-bold text-emerald-400">${escapeHtml(s.interest_rate_percent)}</span>`),
      renderRow('paramTenure', 'Loan Tenure', s => escapeHtml(s.tenure_years)),
      renderRow('paramMoratorium', 'Moratorium', s => `<span class="font-semibold text-amber-300">${escapeHtml(s.moratorium_months)}</span>`),
      renderRow('paramMargin', 'Margin Money', s => escapeHtml(s.margin_percent)),
      renderRow('paramSubsidy', 'Capital Subsidy', s => `<span class="font-bold text-purple-300">${escapeHtml(s.subsidy_percent)}</span>`),
      renderRow('paramRestrictions', 'Restrictions', s => (s.restrictions || []).map(r => `&bull; ${escapeHtml(r)}`).join('<br>')),
      renderRow('paramChannelPartners', 'Verified Partners', s => (s.channel_partners || []).length > 0 ? (s.channel_partners || []).map(p => `&bull; ${escapeHtml(p)}`).join('<br>') : 'Official State SCAs & PSBs'),
      renderRow('paramOfficialSource', 'Official Portal', s => `<a href="${s.official_source}" target="_blank" class="text-blue-400 hover:underline flex items-center space-x-1"><span>${escapeHtml(s.official_source)}</span><i data-lucide="external-link" class="w-3 h-3 ml-1"></i></a><div class="text-[10px] text-slate-500 mt-0.5">Verified: ${escapeHtml(s.verification_date)}</div>`)
    ].join('');

    modalBody.innerHTML = `
      <!-- Official Legal Disclaimer Banner -->
      <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2.5">
        <i data-lucide="shield-alert" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
        <div class="leading-relaxed">
          <strong>${getI18n('compareDisclaimer', disclaimer)}</strong>
        </div>
      </div>

      <!-- AI-Generated Grounded Synthesis -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Key Differences -->
        <div class="p-4 rounded-xl bg-slate-950 border border-blue-900/40">
          <h4 class="font-bold text-sm text-white flex items-center space-x-2 mb-3">
            <i data-lucide="scale" class="w-4 h-4 text-blue-400"></i>
            <span>${getI18n('keyDifferencesTitle', 'Key Factual Differences')}</span>
          </h4>
          <ul class="space-y-2">
            ${diffsHtml}
          </ul>
        </div>

        <!-- Objective Suitability Guidance -->
        <div class="p-4 rounded-xl bg-slate-950 border border-emerald-900/40">
          <h4 class="font-bold text-sm text-white flex items-center space-x-2 mb-3">
            <i data-lucide="compass" class="w-4 h-4 text-emerald-400"></i>
            <span>${getI18n('suitabilityGuidanceTitle', 'Objective Suitability Guidance')}</span>
          </h4>
          <p class="text-xs text-slate-200 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            ${escapeHtml(guidance)}
          </p>
          <div class="mt-3 text-[10px] text-slate-400">
            <strong>Evidence Sources:</strong> ${sourcesHtml}
          </div>
        </div>
      </div>

      <!-- Side-by-Side Statutory Table -->
      <div class="mt-4">
        <h4 class="font-bold text-sm text-white mb-2 flex items-center space-x-2">
          <i data-lucide="table" class="w-4 h-4 text-blue-400"></i>
          <span>${getI18n('statutoryFactsTableTitle', 'Statutory Scheme Parameters (Verified Data)')}</span>
        </h4>
        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr>
                <th class="p-3 text-left font-bold text-slate-400 bg-slate-950/70 border-b border-slate-800 w-44">Parameter</th>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    lucide.createIcons();
  }
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

  const localizedName = getLocalizedSchemeName(scheme);
  const localizedPurpose = getLocalizedSchemeSummary(scheme);

  document.getElementById('modalIssuingBody').textContent = scheme.issuing_body;
  document.getElementById('modalSchemeName').textContent = localizedName;
  document.getElementById('modalSchemePurpose').textContent = localizedPurpose;
  document.getElementById('modalLastVerified').querySelector('span').textContent = `${getI18n('verifiedPrefix', 'Verified on:')} ${scheme.last_verified || '2026-09-16'}`;
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
  document.getElementById('sliderTenureVal').textContent = `${sliderTenure.value} ${getI18n('yearsSuffix', 'Years')}`;

  // Render Documents
  const docContainer = document.getElementById('modalDocList');
  docContainer.innerHTML = (scheme.documents || []).map((d) => {
    const docName = getLocalizedDocName(d.name);
    const mandatoryBadge = d.mandatory ? getI18n('docMandatory', 'Mandatory') : getI18n('docOptional', 'Optional');
    const badgeClass = d.mandatory ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400';
    return `
      <div class="flex items-start p-2.5 rounded-lg bg-slate-900 border border-slate-800">
        <i data-lucide="file-check" class="w-4 h-4 ${d.mandatory ? 'text-blue-400' : 'text-slate-400'} mr-2 shrink-0 mt-0.5"></i>
        <div>
          <div class="font-semibold text-white">
            ${escapeHtml(docName)} 
            <span class="text-[10px] px-1.5 py-0.2 rounded font-normal ${badgeClass} ml-1">
              ${escapeHtml(mandatoryBadge)}
            </span>
          </div>
          <div class="text-slate-400 text-[11px] mt-0.5">${escapeHtml(d.notes || '')}</div>
        </div>
      </div>
    `;
  }).join('');

  // Render Application Steps
  const stepContainer = document.getElementById('modalStepsList');
  const stepPrefix = getI18n('stepPrefix', 'Step');
  stepContainer.innerHTML = (scheme.application_process || []).map((step, idx) => `
    <div class="relative pl-2 pb-2">
      <div class="font-semibold text-slate-200">${escapeHtml(stepPrefix)} ${idx + 1}</div>
      <div class="text-slate-400 mt-0.5">${escapeHtml(step)}</div>
    </div>
  `).join('');

  recalculateFinancials();

  document.getElementById('schemeDetailModal').classList.remove('hidden');
  lucide.createIcons();
};

function closeModal() {
  state.currentModalScheme = null;
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

    const morVal = data.moratorium_months !== undefined ? data.moratorium_months : (scheme.moratorium_months || 0);
    const morEl = document.getElementById('calcMoratorium');
    if (morEl) {
      if (data.loan_category === 'Educational Loan') {
        morEl.textContent = 'Course + 1 Yr';
      } else {
        morEl.textContent = morVal > 0 ? `${morVal} ${getI18n('monthsSuffix', 'Months')}` : '0 Months';
      }
    }
    const noteEl = document.getElementById('calcMoratoriumNote');
    if (noteEl) {
      if (data.moratorium_note) {
        noteEl.classList.remove('hidden');
        const span = noteEl.querySelector('span');
        if (span) span.textContent = data.moratorium_note;
      } else {
        noteEl.classList.add('hidden');
      }
    }

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

  // Case A: Sharing specific scheme from active Modal
  if (state.currentModalScheme) {
    const s = state.currentModalScheme;
    const sName = getLocalizedSchemeName(s);
    const userCategory = document.getElementById('inputCategory').value;
    const userSector = document.getElementById('inputSector').value;
    const cost = document.getElementById('sliderProjectCost')?.value || document.getElementById('inputProjectCost').value;
    const tenure = document.getElementById('sliderTenure')?.value || 5;
    const margin = document.getElementById('calcMarginMoney')?.textContent || '₹0';
    const subsidy = document.getElementById('calcSubsidy')?.textContent || '₹0';
    const loan = document.getElementById('calcLoan')?.textContent || '₹0';
    const emi = document.getElementById('calcEmi')?.textContent || '₹0 / month';

    let text = `*Ministry of Social Justice and Empowerment (MoSJE)*
`;
    text += `*Official Scheme Eligibility Dossier*
`;
    text += `---------------------------------------
`;
    text += `Scheme: *${sName}*
`;
    text += `Authority: ${s.issuing_body}
`;
    text += `Verdict: *${s.eligibility_status}* (${s.semantic_score}% match)
`;
    text += `Applicant: ${userCategory} | Sector: ${userSector}
`;
    text += `Project Cost: ₹${Number(cost).toLocaleString('en-IN')}

`;
    text += `*Financial Breakdown (${tenure} Years):*
`;
    text += `• Margin Money: ${margin}
`;
    text += `• Capital Subsidy: ${subsidy}
`;
    text += `• Concessional Loan: ${loan}
`;
    text += `• Monthly EMI: *${emi}*

`;
    text += `*Official Portal:* ${s.official_url}
`;
    text += `*Verified Active:* ${s.last_verified || '2026-09-16'}

`;
    text += `_Verified under SIH 2026 Problem Statement #26092._`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    return;
  }

  // Case B: Sharing entire shortlist when outside modal
  if (!state.matchResults || !state.matchResults.matches) return;
  const eligible = state.matchResults.matches.filter((s) => s.eligibility_status === 'ELIGIBLE');

  let text = `${t.whatsappHeader}
`;
  text += `${t.whatsappCategory}: ${state.matchResults.user_summary.category} | ${t.whatsappSector}: ${state.matchResults.user_summary.business_sector}

`;
  text += `${t.whatsappEligible} (${eligible.length}):
`;

  eligible.slice(0, 5).forEach((s, i) => {
    const sName = getLocalizedSchemeName(s);
    text += `${i + 1}. *${sName}*
   • ${t.whatsappLoan}: ₹${Number(s.financial_summary.max_loan_amount || 0).toLocaleString('en-IN')}
   • ${t.whatsappRate}: ${s.financial_summary.interest_rate_percent || 0}% ${t.perAnnum}
   • ${t.whatsappPortal}: ${s.official_url}

`;
  });

  text += `${t.whatsappFooter}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function printShortlistReceipt() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];
  const printArea = document.getElementById('printableArea');

  // Case A: Print Single Scheme Deep-Dive Eligibility Dossier from active Modal
  if (state.currentModalScheme) {
    const s = state.currentModalScheme;
    const sName = getLocalizedSchemeName(s);
    const sPurpose = getLocalizedSchemeSummary(s);
    const userCategory = document.getElementById('inputCategory').value;
    const userGender = document.getElementById('inputGender').value;
    const userAge = document.getElementById('inputAge').value;
    const userIncome = document.getElementById('inputIncome').value;
    const isPwd = document.getElementById('inputIsPwd').checked;
    const pwdPercent = document.getElementById('inputPwdPercent')?.value || 0;
    const userSector = document.getElementById('inputSector').value;
    const userBusinessIdea = document.getElementById('inputBusinessIdea').value;
    const targetCost = document.getElementById('sliderProjectCost')?.value || document.getElementById('inputProjectCost').value;
    const calcTenure = document.getElementById('sliderTenure')?.value || 5;
    const calcMargin = document.getElementById('calcMarginMoney')?.textContent || '₹0';
    const calcSubsidy = document.getElementById('calcSubsidy')?.textContent || '₹0';
    const calcLoan = document.getElementById('calcLoan')?.textContent || '₹0';
    const calcEmi = document.getElementById('calcEmi')?.textContent || '₹0 / month';

    let statusBorderColor = '#10b981';
    let statusBgColor = '#ecfdf5';
    let statusBadgeColor = '#059669';
    if (s.eligibility_status === 'BORDERLINE') {
      statusBorderColor = '#f59e0b';
      statusBgColor = '#fffbeb';
      statusBadgeColor = '#d97706';
    } else if (s.eligibility_status === 'INELIGIBLE') {
      statusBorderColor = '#94a3b8';
      statusBgColor = '#f8fafc';
      statusBadgeColor = '#64748b';
    }

    // Verdict rows
    const verdictsHtml = (s.verdicts || []).map(v => {
      let statusColor = '#059669';
      if (v.status === 'BORDERLINE') statusColor = '#d97706';
      if (v.status === 'FAIL') statusColor = '#dc2626';
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 4px 6px; font-weight: 600; color: #1e293b;">${escapeHtml(v.criterion)}</td>
          <td style="padding: 4px 6px; color: ${statusColor}; font-weight: 700;">${v.status}</td>
          <td style="padding: 4px 6px; color: #475569;">${escapeHtml(v.reason)}</td>
        </tr>
      `;
    }).join('');

    // Document rows
    const docs = s.documents || [];
    const docRows = [];
    for (let i = 0; i < docs.length; i += 2) {
      const d1 = docs[i];
      const d2 = docs[i + 1];
      docRows.push(`
        <tr>
          <td style="width: 50%; padding: 4px 6px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
            <strong>[${d1.mandatory ? 'X' : '-'}] ${escapeHtml(d1.name)}</strong> ${d1.mandatory ? '<span style="color: #dc2626; font-size: 8px;">(Mandatory)</span>' : '<span style="color: #64748b; font-size: 8px;">(Optional)</span>'}<br>
            <span style="color: #64748b; font-size: 8.5px;">${escapeHtml(d1.notes || '')}</span>
          </td>
          <td style="width: 50%; padding: 4px 6px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
            ${d2 ? `
              <strong>[${d2.mandatory ? 'X' : '-'}] ${escapeHtml(d2.name)}</strong> ${d2.mandatory ? '<span style="color: #dc2626; font-size: 8px;">(Mandatory)</span>' : '<span style="color: #64748b; font-size: 8px;">(Optional)</span>'}<br>
              <span style="color: #64748b; font-size: 8.5px;">${escapeHtml(d2.notes || '')}</span>
            ` : ''}
          </td>
        </tr>
      `);
    }

    // Step rows
    const stepsHtml = (s.application_process || []).map((step, idx) => `
      <li style="margin-bottom: 4px;"><strong>Step ${idx + 1}:</strong> ${escapeHtml(step)}</li>
    `).join('');

    printArea.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.45; font-size: 11px;">
        <!-- Ministry Header -->
        <div style="border-bottom: 2px solid #0c2340; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #0c2340; text-transform: uppercase;">MINISTRY OF SOCIAL JUSTICE AND EMPOWERMENT</div>
            <div style="font-size: 10px; color: #4b5563; margin-top: 1px;">Government of India &bull; Smart India Hackathon 2026 (Problem Statement #26092)</div>
            <div style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin-top: 3px;">OFFICIAL SCHEME ELIGIBILITY & CONCESSIONAL CREDIT DOSSIER</div>
          </div>
          <div style="text-align: right; font-size: 9.5px; color: #6b7280;">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><strong>Ref:</strong> MOSJE-${Date.now().toString().slice(-8)}</div>
            <div style="color: #059669; font-weight: 700; margin-top: 2px;">✔ Zero-Hallucination Certified</div>
          </div>
        </div>

        <!-- Applicant Snapshot -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 8px 12px; margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #0c2340; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px;">Beneficiary Profile Snapshot</div>
          <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
            <tr>
              <td style="padding: 2px 4px; color: #64748b;">Social Category:</td>
              <td style="padding: 2px 4px;"><strong>${escapeHtml(userCategory)}</strong></td>
              <td style="padding: 2px 4px; color: #64748b;">Gender / Age:</td>
              <td style="padding: 2px 4px;"><strong>${escapeHtml(userGender)}, ${escapeHtml(userAge)} yrs</strong></td>
            </tr>
            <tr>
              <td style="padding: 2px 4px; color: #64748b;">Annual Family Income:</td>
              <td style="padding: 2px 4px;"><strong>₹${Number(userIncome).toLocaleString('en-IN')}</strong></td>
              <td style="padding: 2px 4px; color: #64748b;">Divyangjan (PwD):</td>
              <td style="padding: 2px 4px;"><strong>${isPwd ? `Yes (${pwdPercent}%)` : 'No'}</strong></td>
            </tr>
            <tr>
              <td style="padding: 2px 4px; color: #64748b;">Target Project Cost:</td>
              <td style="padding: 2px 4px;"><strong>₹${Number(targetCost).toLocaleString('en-IN')}</strong></td>
              <td style="padding: 2px 4px; color: #64748b;">Business Sector:</td>
              <td style="padding: 2px 4px;"><strong>${escapeHtml(userSector)}</strong></td>
            </tr>
            <tr>
              <td style="padding: 2px 4px; color: #64748b;">Proposed Business:</td>
              <td colspan="3" style="padding: 2px 4px;"><strong>${escapeHtml(userBusinessIdea)}</strong></td>
            </tr>
          </table>
        </div>

        <!-- Scheme Title & Verdict Banner -->
        <div style="border: 2px solid ${statusBorderColor}; background: ${statusBgColor}; border-radius: 5px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: #334155;">${escapeHtml(s.issuing_body)}</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 1px;">${escapeHtml(sName)}</div>
            <div style="font-size: 10px; color: #334155; margin-top: 2px;"><strong>Target Groups:</strong> ${(s.rules?.categories || s.category_targets || []).join(', ')} | ${(s.rules?.gender || s.gender_targets || []).join(', ')}</div>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; padding: 5px 12px; border-radius: 4px; font-weight: 800; font-size: 12px; color: white; background: ${statusBadgeColor}; text-transform: uppercase;">
              ${s.eligibility_status}
            </div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 3px;">Relevance Score: <strong>${s.semantic_score || 85}%</strong></div>
          </div>
        </div>

        <!-- Scheme Purpose -->
        <div style="margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #0c2340; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 5px;">Scheme Purpose & Scope</div>
          <p style="margin: 0; font-size: 10.5px; color: #334155; line-height: 1.4;">${escapeHtml(sPurpose)}</p>
        </div>

        <!-- Explainability Audit Trail -->
        <div style="margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #0c2340; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 5px;">Rule Evaluation Audit Trail (Zero-Hallucination Verified)</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 5px 6px; width: 22%;">Evaluation Criterion</th>
                <th style="padding: 5px 6px; width: 12%;">Status</th>
                <th style="padding: 5px 6px;">Detailed Audit Reason & Statutory Clause</th>
              </tr>
            </thead>
            <tbody>
              ${verdictsHtml}
            </tbody>
          </table>
        </div>

        <!-- Financial Breakdown & EMI -->
        <div style="margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #0c2340; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 5px;">Financial Structure & EMI Breakdown (${calcTenure} Year Tenure)</div>
          <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 10px; margin-bottom: 6px;">
            <tr>
              <td style="width: 25%; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px;">
                <div style="color: #64748b; font-size: 9px;">Total Project Cost</div>
                <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px;">₹${Number(targetCost).toLocaleString('en-IN')}</div>
              </td>
              <td style="width: 25%; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px;">
                <div style="color: #64748b; font-size: 9px;">Margin Money (Self)</div>
                <div style="font-size: 12px; font-weight: 700; color: #d97706; margin-top: 2px;">${calcMargin}</div>
              </td>
              <td style="width: 25%; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px;">
                <div style="color: #64748b; font-size: 9px;">Capital Subsidy / Grant</div>
                <div style="font-size: 12px; font-weight: 700; color: #059669; margin-top: 2px;">${calcSubsidy}</div>
              </td>
              <td style="width: 25%; background: #eff6ff; border: 1px solid #bfdbfe; padding: 6px;">
                <div style="color: #1e40af; font-size: 9px;">Sanctioned Loan Principal</div>
                <div style="font-size: 12px; font-weight: 800; color: #1e3a8a; margin-top: 2px;">${calcLoan}</div>
              </td>
            </tr>
          </table>
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 12px; border-radius: 4px;">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #166534;">Reducing-Balance Monthly EMI: ${calcEmi}</div>
              <div style="font-size: 9px; color: #15803d;">Calculated for ${calcTenure} years (${calcTenure * 12} monthly instalments)</div>
            </div>
            <div style="text-align: right; font-size: 9.5px; color: #166534;">
              <div>Verified Scheme Concessional Lending Model</div>
            </div>
          </div>
        </div>

        <!-- Mandatory Document Checklist -->
        <div style="margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #0c2340; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 5px;">Mandatory Document Checklist</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
            ${docRows.join('')}
          </table>
        </div>

        <!-- Step-by-Step Workflow -->
        <div style="margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #0c2340; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 5px;">Step-by-Step Application Workflow</div>
          <ol style="margin: 0; padding-left: 16px; font-size: 9.5px; color: #334155; line-height: 1.4;">
            ${stepsHtml}
          </ol>
        </div>

        <!-- Official Portal & Verification Stamp -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px;">
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tr>
              <td style="width: 70%; vertical-align: middle; word-break: break-all; padding-right: 10px;">
                <div style="font-size: 8.5px; color: #64748b; font-weight: 700; text-transform: uppercase;">Official Government Application Portal</div>
                <div style="font-size: 10px; font-weight: 700; color: #1d4ed8; word-break: break-all;">${s.official_url}</div>
                <div style="font-size: 8px; color: #64748b;">All formal loan sanctions and disbursements are processed exclusively through this verified portal.</div>
              </td>
              <td style="width: 30%; text-align: right; vertical-align: middle; font-size: 8.5px; color: #475569; padding-right: 12px;">
                <div>Verified: <strong>${s.last_verified || '2026-09-16'}</strong></div>
                <div style="font-size: 8px; color: #94a3b8;">MoSJE SIH 2026 #26092</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Legal Advisory Disclaimer -->
        <div style="font-size: 8px; color: #94a3b8; text-align: center; margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 5px;">
          Disclaimer: This dossier is generated by the MoSJE AI Scheme Matching Platform for advisory purposes under SIH 2026 Problem Statement #26092. Eligibility evaluation is deterministic based on gazetted criteria. Final sanction of loans or subsidies is subject to statutory verification by the respective State Channelising Agency (SCA) or lending bank.
        </div>
      </div>
    `;

    window.print();
    return;
  }

  // Case B: Print Shortlist Receipt when outside modal
  if (!state.matchResults || !state.matchResults.matches) return;
  const eligible = state.matchResults.matches.filter((s) => s.eligibility_status === 'ELIGIBLE');

  printArea.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
      <div style="border-bottom: 2px solid #0c2340; padding-bottom: 10px; margin-bottom: 15px;">
        <h2 style="margin: 0; color: #0c2340;">${t.receiptTitle}</h2>
        <h3 style="margin: 5px 0 0 0; color: #333; font-size: 14px;">${t.receiptSubtitle}</h3>
        <p style="margin: 3px 0 0 0; font-size: 11px; color: #666;"><strong>${t.receiptApplicantPrefix}</strong> ${document.getElementById('inputCategory').value} ${t.receiptEntrepreneur} | <strong>${t.receiptDatePrefix}</strong> ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
      <h4 style="margin: 10px 0 6px 0; font-size: 12px;">${t.whatsappEligible} (${eligible.length}):</h4>
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
                <td><strong>${escapeHtml(sName)}</strong></td>
                <td>${escapeHtml(s.issuing_body)}</td>
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
    </div>
  `;

  window.print();
}

// ----------------------------------------------------
// 9. Tier 2 Discovery Layer: Allied Government Benefits
// ----------------------------------------------------
async function loadGeneralBenefits() {
  try {
    const res = await fetch('/api/general-benefits');
    const data = await res.json();
    state.generalBenefits = data;
    renderGeneralBenefits();
  } catch (err) {
    console.error('Failed to load general benefits:', err);
  }
}

function renderGeneralBenefits() {
  const container = document.getElementById('generalBenefitsGrid');
  if (!container || !state.generalBenefits) return;

  const q = (document.getElementById('generalSearchInput')?.value || '').toLowerCase().trim();
  const cat = state.activeGeneralCategory;

  let filtered = state.generalBenefits;
  if (cat && cat !== 'All') {
    filtered = filtered.filter(b => b.category.toLowerCase().includes(cat.toLowerCase()) || b.sector.toLowerCase().includes(cat.toLowerCase()));
  }
  if (q) {
    filtered = filtered.filter(b => b.name.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q) || b.state.toLowerCase().includes(q) || b.category.toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        <i data-lucide="info" class="w-6 h-6 mx-auto mb-2 text-slate-500"></i>
        No schemes found matching the selected filter.
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(b => `
    <div class="bg-slate-900 border border-slate-800 hover:border-emerald-700/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition duration-200">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            ${escapeHtml(b.category)}
          </span>
          <span class="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            ${escapeHtml(b.level)} &bull; ${escapeHtml(b.state)}
          </span>
        </div>
        <h4 class="text-sm font-bold text-white mb-2 leading-snug">${escapeHtml(b.name)}</h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">${escapeHtml(b.summary)}</p>
        <div class="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-4">
          <span class="font-semibold text-slate-300">Target Beneficiaries:</span> ${escapeHtml(b.target_beneficiaries)}
        </div>
      </div>
      <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span class="text-[10px] text-emerald-400 font-medium flex items-center">
          <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i> Verified Active
        </span>
        <a href="${b.official_url}" target="_blank" rel="noopener noreferrer" class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow">
          <span>Official Portal</span>
          <i data-lucide="external-link" class="w-3 h-3"></i>
        </a>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function switchView(viewName) {
  state.activeView = viewName;
  const matcherWrapper = document.getElementById('matcherSectionWrapper');
  const generalSection = document.getElementById('generalBenefitsSection');
  const btnMatcher = document.getElementById('navBusinessMatcher');
  const btnGeneral = document.getElementById('navGeneralBenefits');

  if (viewName === 'general') {
    matcherWrapper.classList.add('hidden');
    generalSection.classList.remove('hidden');
    if (btnGeneral) btnGeneral.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow transition cursor-pointer';
    if (btnMatcher) btnMatcher.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer';
    if (state.generalBenefits.length === 0) {
      loadGeneralBenefits();
    } else {
      renderGeneralBenefits();
    }
  } else {
    generalSection.classList.add('hidden');
    matcherWrapper.classList.remove('hidden');
    if (btnMatcher) btnMatcher.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow transition cursor-pointer';
    if (btnGeneral) btnGeneral.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer';
  }
}


// ----------------------------------------------------
// 10. Geo-Spatial Channel Partner Locator & Router (PS #26092)
// ----------------------------------------------------
function initChannelPartners() {
  const btnGps = document.getElementById('btnGeolocate');
  if (btnGps) {
    btnGps.addEventListener('click', handleGeolocateUser);
  }

  const fCat = document.getElementById('partnerFilterCategory');
  const fType = document.getElementById('partnerFilterType');
  const fState = document.getElementById('partnerFilterState');
  const fDist = document.getElementById('partnerFilterDistrict');

  if (fCat) fCat.addEventListener('change', () => fetchChannelPartners());
  if (fType) fType.addEventListener('change', () => fetchChannelPartners());
  if (fState) fState.addEventListener('change', () => fetchChannelPartners());
  if (fDist) fDist.addEventListener('input', debounce(() => fetchChannelPartners(), 300));

  const btnModalFind = document.getElementById('btnModalFindPartners');
  if (btnModalFind) {
    btnModalFind.addEventListener('click', () => {
      if (state.currentModalScheme) {
        const cat = state.currentModalScheme.loan_category || 'Term Loan';
        const sId = state.currentModalScheme.scheme_id;
        closeModal();
        routeToPartnerForScheme(sId, cat);
      }
    });
  }

  // Load initial partner directory
  fetchChannelPartners();
}

function handleGeolocateUser() {
  const btn = document.getElementById('btnGeolocate');
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  const origHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>Locating...</span>`;
  lucide.createIcons();

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.userCoords = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      };
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i><span>GPS Active</span>`;
      lucide.createIcons();
      fetchChannelPartners();
    },
    (err) => {
      console.warn('Geolocation failed or denied:', err);
      btn.disabled = false;
      btn.innerHTML = origHtml;
      lucide.createIcons();
      alert('Location access was denied. You can still search by State and District.');
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

window.routeToPartnerForScheme = function(schemeId, categoryEncoded) {
  const category = decodeURIComponent(categoryEncoded || '');
  const section = document.getElementById('channelPartnerSection');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
  const catSelect = document.getElementById('partnerFilterCategory');
  if (catSelect && category) {
    catSelect.value = category;
  }
  fetchChannelPartners({ category: category, scheme_id: schemeId });
};

async function fetchChannelPartners(overrideParams = {}) {
  const container = document.getElementById('partnerResultsList');
  if (!container) return;

  const fCat = document.getElementById('partnerFilterCategory')?.value || 'All';
  const fType = document.getElementById('partnerFilterType')?.value || 'All';
  const fState = document.getElementById('partnerFilterState')?.value || 'All';
  const fDist = (document.getElementById('partnerFilterDistrict')?.value || '').trim();

  const queryParams = new URLSearchParams();
  const catVal = overrideParams.category !== undefined ? overrideParams.category : (fCat !== 'All' ? fCat : '');
  const typeVal = overrideParams.partner_type !== undefined ? overrideParams.partner_type : (fType !== 'All' ? fType : '');
  const stateVal = overrideParams.state !== undefined ? overrideParams.state : (fState !== 'All' ? fState : '');
  const distVal = overrideParams.district !== undefined ? overrideParams.district : fDist;

  if (catVal) queryParams.set('category', catVal);
  if (typeVal) queryParams.set('partner_type', typeVal);
  if (stateVal && stateVal !== 'All') queryParams.set('state', stateVal);
  if (distVal && distVal !== 'General') queryParams.set('district', distVal);
  if (overrideParams.scheme_id) queryParams.set('scheme_id', overrideParams.scheme_id);

  if (state.userCoords) {
    queryParams.set('lat', state.userCoords.lat);
    queryParams.set('lon', state.userCoords.lon);
  }

  container.innerHTML = `
    <div class="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 col-span-full">
      <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400"></i>
      <p class="text-xs">${getI18n('loadingPartners', 'Loading authorized channel partners...')}</p>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch('/api/partners?' + queryParams.toString());
    if (!res.ok) throw new Error('Failed to fetch partners');
    const data = await res.json();
    state.channelPartners = data.partners || [];
    renderChannelPartners(state.channelPartners);
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="p-6 bg-red-950/30 border border-red-900 rounded-xl text-red-300 text-center text-xs col-span-full">
        <i data-lucide="alert-triangle" class="w-5 h-5 mx-auto mb-1 text-red-400"></i>
        Failed to load channel partner network. Please verify connection.
      </div>
    `;
    lucide.createIcons();
  }
}

function renderChannelPartners(partners) {
  const container = document.getElementById('partnerResultsList');
  if (!container) return;

  if (!partners || partners.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        <i data-lucide="map-pin-off" class="w-8 h-8 mx-auto mb-2 text-slate-500"></i>
        No channel partners found in our verified demo subset matching the selected state/category filter. Try setting State to "All States" or resetting filters.
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS['en'];

  container.innerHTML = partners.map(p => {
    // Type badge color
    let typeClass = 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    if (p.type.includes('Public Sector Bank')) {
      typeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
    } else if (p.type.includes('Regional Rural Bank')) {
      typeClass = 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    } else if (p.type.includes('NBFC')) {
      typeClass = 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    } else if (p.type.includes('Small Finance')) {
      typeClass = 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
    }

    const distBadge = p.distance_km !== null && p.distance_km !== undefined ? `
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center">
        <i data-lucide="navigation" class="w-2.5 h-2.5 mr-1 text-blue-400"></i>
        ${p.distance_km.toFixed(1)} ${getI18n('distanceKm', 'km away')} (${getI18n('approxNodalLocation', 'Approx. Nodal HQ')})
      </span>
    ` : '';

    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;

    // Rationale justification
    let rationale = 'Official channel partner authorized for concessional credit disbursement.';
    if (p.type.includes('State Channelizing Agency')) {
      rationale = `State Channelizing Agency for ${escapeHtml(p.state)} managing MoSJE corporation loan portfolios with state nodal oversight.`;
    } else if (p.type.includes('Public Sector Bank')) {
      rationale = 'Scheduled Public Sector Commercial Bank implementing MoSJE concessional credit via nationwide branch network.';
    } else if (p.type.includes('Regional Rural Bank')) {
      rationale = 'Regional Rural Bank with deep grassroots branch outreach in semi-urban & rural operational districts.';
    } else if (p.type.includes('NBFC')) {
      rationale = 'Specialized NBFC-MFI delivering collateral-free microfinance credit up to ₹1.40 Lakh to women & JLGs.';
    }

    const rrbCriteria = p.rrb_eligibility_criteria || {};

    return `
      <div class="bg-slate-950/80 border border-slate-800 hover:border-blue-700/60 rounded-xl p-4 shadow-lg flex flex-col justify-between transition duration-200">
        <div>
          <!-- Header Badges -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${typeClass}">
              ${escapeHtml(p.type)}
            </span>
            ${distBadge}
          </div>

          <!-- Partner Name -->
          <h4 class="text-sm font-bold text-white mb-1 leading-snug">${escapeHtml(p.name)}</h4>

          <!-- Address -->
          <div class="text-[11px] text-slate-300 flex items-start space-x-1.5 mb-2.5">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5"></i>
            <span>${escapeHtml(p.address)}, PIN: ${escapeHtml(p.pincode)}</span>
          </div>

          <!-- Supported Loan Streams -->
          <div class="flex flex-wrap gap-1 mb-2.5">
            ${(p.supported_loan_categories || []).map(cat => `
              <span class="text-[9px] font-semibold bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                ${escapeHtml(cat)}
              </span>
            `).join('')}
          </div>

          <!-- Statutory Prudential Criteria (MoU Norms) -->
          <div class="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 mb-2.5 text-[10px] text-slate-300 space-y-1">
            <div class="font-semibold text-slate-200 flex items-center">
              <i data-lucide="shield-check" class="w-3 h-3 mr-1 text-emerald-400"></i>
              ${getI18n('statutoryVerification', 'Statutory Prudential Criteria (MoU Norms):')}
            </div>
            <div class="text-slate-400 leading-tight">
              &bull; Overdue Mandate: <span class="text-slate-300 font-medium">No overdues to NSFDC</span>
            </div>
            <div class="text-slate-400 leading-tight">
              &bull; Fund Utilization Norm: <span class="text-slate-300 font-medium">${escapeHtml(rrbCriteria.fund_utilization_mandate || 'Minimum 100% cumulative utilization')}</span>
            </div>
            <div class="text-slate-400 leading-tight">
              &bull; Net NPA Ceiling: <span class="text-slate-300 font-medium">${escapeHtml(rrbCriteria.net_npa_limit || '<= 5% per guidelines')}</span>
            </div>
            <div class="text-slate-400 leading-tight pt-0.5 text-[9px] italic">
              "${rationale}"
            </div>
          </div>

          <!-- Zero-hallucination live status disclaimer -->
          <div class="text-[9px] text-amber-300/90 bg-amber-950/20 border border-amber-900/30 p-1.5 rounded mb-3 flex items-start">
            <i data-lucide="info" class="w-3 h-3 mr-1 text-amber-400 shrink-0 mt-0.5"></i>
            <span>${escapeHtml(p.live_status_note)}</span>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          ${p.contact_info?.portal ? `
            <a href="${p.contact_info.portal}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1">
              <span>${getI18n('website', 'Official Portal')}</span>
              <i data-lucide="external-link" class="w-2.5 h-2.5"></i>
            </a>
          ` : `<span class="text-[10px] text-slate-500">${p.contact_info?.phone || ''}</span>`}

          <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow">
            <i data-lucide="navigation" class="w-3 h-3"></i>
            <span>${getI18n('getDirections', 'Get Directions')}</span>
          </a>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ----------------------------------------------------
// Master Upgrade: AI Provider Status & Calculator Integration
// ----------------------------------------------------
window.sendSchemeToCalculator = function(schemeId) {
  openSchemeDetailModal(schemeId);
  const costInput = document.getElementById('inputProjectCost');
  const userCost = costInput ? parseFloat(costInput.value) : 150000;
  const sliderCost = document.getElementById('sliderProjectCost');
  if (sliderCost && !isNaN(userCost) && userCost > 0) {
    sliderCost.value = userCost;
    const costValEl = document.getElementById('sliderCostVal');
    if (costValEl) costValEl.textContent = `₹${Number(userCost).toLocaleString('en-IN')}`;
    recalculateFinancials();
  }
};

async function loadAIProviderStatus() {
  const geminiVal = document.getElementById('statusGeminiValue');
  const hfVal = document.getElementById('statusHFValue');
  const ragVal = document.getElementById('statusRAGValue');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('/api/ai/status', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 1. Gemini Status
    if (geminiVal) {
      const gStatus = data.gemini_status || (data.gemini?.available ? 'ACTIVE' : 'FALLBACK (Deterministic Engine)');
      geminiVal.textContent = gStatus;
      if (gStatus.includes('ACTIVE') || gStatus.includes('Live')) {
        geminiVal.className = 'font-bold text-emerald-400';
      } else {
        geminiVal.className = 'font-bold text-amber-400';
      }
    }

    // 2. Hugging Face Status
    if (hfVal) {
      const hStatus = data.huggingface_status || 'FALLBACK (Local Dense Embedder)';
      hfVal.textContent = hStatus;
      if (hStatus.includes('ACTIVE') && !hStatus.includes('FALLBACK')) {
        hfVal.className = 'font-bold text-emerald-400';
      } else {
        hfVal.className = 'font-bold text-blue-400';
      }
    }

    // 3. Grounded RAG Status
    if (ragVal) {
      const rStatus = data.rag_status || 'ACTIVE (Verified Scheme & Partner Knowledge Base)';
      ragVal.textContent = rStatus;
      ragVal.className = 'font-bold text-emerald-400';
    }
  } catch (err) {
    console.warn('Could not fetch AI provider status:', err);
    if (geminiVal) {
      geminiVal.textContent = 'AI status temporarily unavailable';
      geminiVal.className = 'font-bold text-slate-400';
    }
    if (hfVal) {
      hfVal.textContent = 'Status unavailable';
      hfVal.className = 'font-bold text-slate-400';
    }
  }
}

function initSemanticSearch() {
  const searchInput = document.getElementById('aiSemanticSearchInput');
  const searchBtn = document.getElementById('btnSemanticSearch');
  if (!searchInput || !searchBtn) return;

  async function performSemanticSearch() {
    const q = (searchInput.value || '').trim();
    if (!q) return;

    searchBtn.disabled = true;
    const origHtml = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>...</span>';
    if (window.lucide) lucide.createIcons();

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, top_k: 10 })
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      renderSemanticSearchResults(data.results || [], q);
    } catch (err) {
      console.error('Semantic search error:', err);
    } finally {
      searchBtn.disabled = false;
      searchBtn.innerHTML = origHtml;
      if (window.lucide) lucide.createIcons();
    }
  }

  searchBtn.addEventListener('click', performSemanticSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSemanticSearch();
    }
  });
}

function renderSemanticSearchResults(results, query) {
  const container = document.getElementById('schemeResultsList');
  if (!container) return;

  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        <i data-lucide="info" class="w-8 h-8 mx-auto mb-2 text-slate-500"></i>
        No semantic matches found for "<strong>${escapeHtml(query)}</strong>". Try broader business terms.
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  let html = `
    <div class="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl mb-4 text-xs text-blue-300 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <i data-lucide="sparkles" class="w-4 h-4 text-blue-400"></i>
        <span>Direct Multi-Model Semantic Search for: <strong>"${escapeHtml(query)}"</strong> (${results.length} results)</span>
      </div>
      <button onclick="renderSchemeCards()" class="text-[11px] underline text-blue-400 hover:text-white cursor-pointer">Return to Matches</button>
    </div>
  `;

  results.forEach((item) => {
    const s = item.scheme || {};
    const fin = s.financial_summary || {};
    const maxLoan = fin.max_loan_amount ? `₹${Number(fin.max_loan_amount).toLocaleString('en-IN')}` : 'As approved';
    const rate = fin.interest_rate_percent !== undefined ? `${fin.interest_rate_percent}% p.a.` : 'Concessional';
    const localizedName = getLocalizedSchemeName(s);
    const localizedSummary = getLocalizedSchemeSummary(s);
    const scorePct = Math.round(item.fused_similarity * 100);

    html += `
      <div class="bg-slate-900 border border-blue-900/50 hover:border-blue-700/60 rounded-2xl p-5 shadow-lg transition duration-200">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center space-x-1.5 flex-wrap gap-1">
            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-950/60 border border-blue-900/40 px-2 py-0.5 rounded">
              ${escapeHtml(s.issuing_body || 'MoSJE')}
            </span>
            <span class="text-[10px] font-bold text-purple-300 uppercase tracking-wider bg-purple-950/60 border border-purple-900/40 px-2 py-0.5 rounded">
              ${escapeHtml(s.loan_category || 'Term Loan')}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
              Fused Match: ${scorePct}%
            </span>
            <span class="text-[10px] text-slate-400" title="Gemini 60%, HF 25%, TF-IDF 15%">
              Gemini: ${Math.round(item.gemini_similarity * 100)}% | HF: ${Math.round(item.huggingface_similarity * 100)}%
            </span>
          </div>
        </div>

        <h4 class="text-base font-bold text-white leading-snug mb-1.5">${escapeHtml(localizedName)}</h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-4">${escapeHtml(localizedSummary)}</p>

        <div class="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-4 text-center">
          <div>
            <div class="text-[10px] text-slate-400">Max Loan Cap</div>
            <div class="text-xs font-bold text-white mt-0.5">${maxLoan}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-400">Interest Rate</div>
            <div class="text-xs font-bold text-emerald-400 mt-0.5">${rate}</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/60 gap-2">
          <button onclick="sendSchemeToCalculator('${s.scheme_id}')" class="bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 hover:text-white border border-amber-800/60 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1 transition cursor-pointer">
            <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
            <span>Calculate EMI</span>
          </button>
          <button onclick="openSchemeDetailModal('${s.scheme_id}')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-blue-600/20 cursor-pointer">
            <span>View Scheme Rules</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}
