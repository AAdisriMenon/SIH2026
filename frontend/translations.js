/**
 * Multilingual Translations for MoSJE SIH 2026 Scheme Matching Platform.
 * Supports: English (en), Hindi (hi), Marathi (mr), Tamil (ta).
 */
const TRANSLATIONS = {
  en: {
    // 1. Navigation & Header
    govIndia: "Government of India • Ministry of Social Justice and Empowerment",
    sihBadge: "| Smart India Hackathon 2026 (PS #26092)",
    zeroHallucination: "Zero-Hallucination Verified",
    appTitle: "MoSJE Scheme Matcher",
    appSubtitle: "Concessional Credit for Marginalised Entrepreneurs",
    language: "Language",
    chatAssistantBtn: "AI Scheme Assistant",
    tabAdmin: "Admin Console",

    // 2. Hero & Banner
    heroPill: "Smart India Hackathon 2026",
    heroTitle: "AI-Driven Scheme Discovery for Marginalised Entrepreneurs",
    heroDesc: "Zero-hallucination, explainable government scheme matching tailored for SC, ST, OBC, Minority, Women, and Divyangjan (PwD) entrepreneurs.",

    // 3. Quick Demo Personas
    presetLabel: "Quick Demo Personas:",
    personaRekhaBtn: "🧵 Rekha (OBC Woman • Tailoring)",
    personaSureshBtn: "🔧 Suresh (SC Male • Workshop)",
    personaImranBtn: "🔨 Imran (Minority • Brass Artisan)",
    personaAnitaBtn: "♿ Anita (PwD 50% • Home Crafts)",
    personaRekha: "Rekha (OBC Woman, Tailoring)",
    personaSuresh: "Suresh (SC Male, Workshop)",
    personaImran: "Imran (Minority Male, Artisan)",
    personaAnita: "Anita (PwD Woman, Home Crafts)",

    personaIdeas: {
      rekha: "Starting a tailoring boutique to sew designer garments, ladies blouses, and school uniforms with 3 sewing machines.",
      suresh: "Expanding an automobile repair workshop and small metal fabrication unit with modern pneumatic tools and lathe machine.",
      imran: "Traditional brassware and engraved metal handicraft workshop purchasing modern hand tools and raw brass sheet stock.",
      anita: "Home-based decorative handicrafts, candle making, and a small retail kiosk for independent livelihood."
    },

    // 4. Intake Form
    formTitle: "Enter Entrepreneur Profile",
    voiceInput: "Voice Input",
    voiceListening: "Listening... Speak your details now",
    voiceListeningShort: "Listening...",
    category: "Social Category *",
    gender: "Gender *",
    age: "Age (Years) *",
    annualIncome: "Annual Income (₹) *",
    isPwd: "Person with Disability (PwD)?",
    pwdPercent: "Disability Percentage (%)",
    businessSector: "Business Sector *",
    state: "State / UT *",
    businessIdea: "Describe Your Business Idea *",
    businessIdeaPlaceholder: "e.g. Starting a tailoring boutique to sew women's garments and school uniforms",
    projectCost: "Project Cost (₹) *",
    education: "Education *",
    btnFindSchemes: "Find Eligible Schemes",
    btnMatching: "Evaluating Schemes...",
    btnResetTooltip: "Reset",

    // Dropdown options
    options: {
      category: {
        SC: "Scheduled Caste (SC)",
        ST: "Scheduled Tribe (ST)",
        OBC: "Other Backward Class (OBC)",
        Minority: "Minority Community",
        General: "General Category"
      },
      gender: {
        Female: "Female",
        Male: "Male",
        Transgender: "Transgender"
      },
      sector: {
        "Tailoring/Garments": "Tailoring & Garments",
        "Artisans/Handicrafts": "Artisans & Handicrafts",
        "Manufacturing": "Manufacturing & Workshop",
        "Services": "Service Establishments",
        "Trading": "Retail & Trading",
        "Food Processing": "Food Processing & Agro",
        "Transport": "Commercial Transport",
        "IT/Computer": "IT & Computer Services"
      },
      state: {
        All: "All India",
        Maharashtra: "Maharashtra",
        "Uttar Pradesh": "Uttar Pradesh",
        "Madhya Pradesh": "Madhya Pradesh",
        "Tamil Nadu": "Tamil Nadu",
        Rajasthan: "Rajasthan",
        Bihar: "Bihar",
        "West Bengal": "West Bengal",
        Gujarat: "Gujarat",
        Karnataka: "Karnataka"
      },
      education: {
        None: "Below Class 8",
        "Class 8": "Class 8 Pass",
        "Class 10": "Class 10 Pass (SSC)",
        "Class 12": "Class 12 Pass (HSC)",
        Graduate: "Graduate / Degree"
      }
    },

    // 5. Results & Tabs
    resultsTitle: "Your Verified Scheme Shortlist",
    resultsDesc: "Evaluated deterministically against official MoSJE, NSFDC, NBCFDC, NHFDC, NMDFC & MSME criteria.",
    tabEligible: "Eligible Schemes",
    tabBorderline: "Borderline Matches",
    tabIneligible: "Ineligible Schemes",
    tabEligibleText: "Eligible Schemes",
    tabBorderlineText: "Borderline Matches",
    tabIneligibleText: "Ineligible",
    counterEligible: "Eligible",
    counterBorderline: "Borderline",
    counterIneligible: "Ineligible",
    emptyTierPrefix: "No schemes found in the",
    emptyTierSuffix: "tier for this specific profile.",
    loadingVerifiedSchemes: "Loading verified schemes...",
    loadingEvaluatingRules: "Evaluating deterministic rules and semantic relevance...",
    matchError: "Failed to evaluate schemes. Please verify server connection.",

    // 6. Scheme Cards
    statusEligible: "ELIGIBLE",
    statusBorderline: "NEAR MATCH",
    statusIneligible: "NOT ELIGIBLE",
    relevanceSuffix: "Relevance",
    maxLoan: "Max Concessional Loan",
    interestRate: "Interest Rate",
    benefitType: "Benefit Type",
    asApproved: "As Approved",
    capitalSubsidy: "Capital Subsidy",
    softCredit: "Soft Credit",
    perAnnum: "p.a.",
    concessional: "Concessional",
    whyMatchedAudit: "Why You Matched (Zero-Hallucination Rule Audit)",
    whyIneligibleAudit: "Ineligibility Audit (Failed Criteria)",
    listenAudio: "Listen",
    stopAudio: "Stop",
    viewDetailsEmi: "View Details & EMI",

    // Criteria & Verdict mapping
    criteria: {
      Category: "Social Category",
      Gender: "Gender",
      Income: "Annual Family Income",
      Age: "Age",
      "Project Cost": "Estimated Project Cost",
      Sector: "Business Sector",
      Education: "Education Level",
      Disability: "Disability Benchmark (PwD)",
      State: "State / Location"
    },
    verdicts: {
      PASS: "PASS",
      BORDERLINE: "BORDERLINE",
      FAIL: "FAIL"
    },

    // 7. Modal & Calculator
    modalPurposeTitle: "Scheme Purpose & Scope",
    verifiedPrefix: "Official criteria verified as of",
    calculatorTitle: "Interactive Financial & EMI Calculator",
    liveReducingBalance: "Live Reducing Balance",
    projectCostLabel: "Project Cost:",
    tenureLabel: "Loan Tenure:",
    yearsSuffix: "Years",
    marginMoney: "Own Margin",
    govtSubsidy: "Govt Subsidy",
    termLoan: "Sanctioned Loan",
    monthlyEmi: "Monthly EMI",
    perMonth: "/ mo",
    progMargin: "Margin",
    progSubsidy: "Subsidy",
    progLoan: "Bank Loan",
    docChecklist: "Mandatory Document Checklist",
    docMandatory: "Mandatory",
    docOptional: "Optional",
    howToApply: "Step-by-Step Application Workflow",
    stepPrefix: "Step",
    officialPortal: "Visit Official Portal",
    shareWhatsApp: "WhatsApp",
    printPdf: "Print / PDF",

    // 8. Grounded AI Assistant Drawer
    chatAssistantTitle: "MoSJE Scheme AI Assistant",
    groundedBadge: "Grounded on Verified Guidelines",
    assistantGreeting: "Namaste! I am the MoSJE AI Scheme Advisory Assistant. You can ask me any question regarding eligibility rules, document checklists, subsidies, or application steps for NSFDC, NBCFDC, NHFDC, NMDFC, PMEGP, Stand-Up India, or MUDRA schemes.",
    chips: [
      "What documents do I need for tailoring loan?",
      "What is the PMEGP subsidy rate for women?"
    ],
    chatPlaceholder: "Ask about rules, documents, subsidies...",
    retrievingClauses: "Retrieving verified scheme clauses...",
    verifiedSourcesLabel: "Verified Sources:",
    assistantError: "Failed to retrieve answer. Please try again.",

    // 9. Admin Console & Analytics
    adminTitle: "Admin Scheme Management & Audit Console",
    adminDesc: "Dynamically update income ceilings, cost limits, and interest rates without code deployment.",
    thSchemeName: "Scheme Name",
    thIssuingBody: "Issuing Body",
    thIncomeCap: "Income Cap",
    thMaxCost: "Max Cost",
    thInterest: "Interest %",
    thLastVerified: "Last Verified",
    thAction: "Action",
    btnEdit: "Edit",
    tabAnalytics: "Anonymized Match Analytics & Demand Tracking",
    analyticsTotalProfiles: "Total Profiles Evaluated",
    analyticsSeedCount: "Across 32 seed schemes",
    analyticsTopSectors: "Top Requested Sectors",
    analyticsDemographics: "Demographic Distribution",

    // 10. Receipt / Print / WhatsApp
    receiptTitle: "Ministry of Social Justice and Empowerment (MoSJE)",
    receiptSubtitle: "Government Scheme Shortlist & Verification Receipt",
    receiptApplicantPrefix: "Generated for:",
    receiptEntrepreneur: "Entrepreneur",
    receiptDatePrefix: "Date:",
    receiptTableScheme: "Scheme Name",
    receiptTableBody: "Issuing Body",
    receiptTableLoan: "Max Concessional Loan",
    receiptTableRate: "Interest Rate",
    receiptTableSubsidy: "Subsidy",
    receiptTableUrl: "Official URL",
    receiptNote: "Note: This receipt is generated by the deterministic MoSJE rules engine. Please submit designated KYC, income, and caste certificates at your local District Channelising Agency or Bank Branch.",
    whatsappHeader: "*Government Scheme Shortlist (MoSJE Verified)*",
    whatsappCategory: "Category",
    whatsappSector: "Sector",
    whatsappEligible: "*Eligible Schemes*",
    whatsappLoan: "Max Loan",
    whatsappRate: "Rate",
    whatsappPortal: "Portal",
    whatsappFooter: "_Verified via MoSJE Scheme Matching AI Platform (SIH 2026)_"
  },

  hi: {
    // 1. Navigation & Header
    govIndia: "भारत सरकार • सामाजिक न्याय एवं अधिकारिता मंत्रालय",
    sihBadge: "| स्मार्ट इंडिया हैकथॉन 2026 (PS #26092)",
    zeroHallucination: "शत-प्रतिशत प्रामाणिक व सत्यापित",
    appTitle: "MoSJE योजना मिलान पोर्टल",
    appSubtitle: "वंचित उद्यमियों के लिए रियायती वित्तीय सहायता",
    language: "भाषा",
    chatAssistantBtn: "एआई योजना सहायक",
    tabAdmin: "प्रशासन कंसोल",

    // 2. Hero & Banner
    heroPill: "स्मार्ट इंडिया हैकथॉन 2026",
    heroTitle: "वंचित उद्यमियों के लिए एआई-आधारित सरकारी योजना मिलान",
    heroDesc: "एससी, एसटी, ओबीसी, अल्पसंख्यक, महिला और दिव्यांग (PwD) उद्यमियों के लिए पारदर्शी और प्रामाणिक योजना खोज।",

    // 3. Quick Demo Personas
    presetLabel: "त्वरित डेमो प्रोफाइल:",
    personaRekhaBtn: "🧵 रेखा (ओबीसी महिला • सिलाई कार्य)",
    personaSureshBtn: "🔧 सुरेश (एससी पुरुष • वर्कशॉप)",
    personaImranBtn: "🔨 इमरान (अल्पसंख्यक • दस्तकार)",
    personaAnitaBtn: "♿ अनिता (दिव्यांग महिला • हस्तशिल्प)",
    personaRekha: "रेखा (ओबीसी महिला, सिलाई कार्य)",
    personaSuresh: "सुरेश (एससी पुरुष, वर्कशॉप)",
    personaImran: "इमरान (अल्पसंख्यक, दस्तकार)",
    personaAnita: "अनिता (दिव्यांग महिला, हस्तशिल्प)",

    personaIdeas: {
      rekha: "3 सिलाई मशीनों के साथ महिलाओं के डिजाइनर कपड़े, ब्लाउज और स्कूल यूनिफॉर्म सिलने के लिए सिलाई बुटीक शुरू करना।",
      suresh: "आधुनिक न्यूमेटिक औजारों और लेथ मशीन के साथ ऑटोमोबाइल रिपेयर वर्कशॉप और छोटी मेटल फैब्रिकेशन यूनिट का विस्तार करना।",
      imran: "आधुनिक हाथ औजार और कच्ची पीतल शीट खरीदकर पारंपरिक पीतल के बर्तन और नक्काशीदार धातु हस्तशिल्प कार्यशाला का संचालन।",
      anita: "स्वतंत्र आजीविका के लिए घर-आधारित सजावटी हस्तशिल्प, मोमबत्ती निर्माण और एक छोटा खुदरा कियोस्क शुरू करना।"
    },

    // 4. Intake Form
    formTitle: "उद्यमी का विवरण भरें",
    voiceInput: "आवाज से इनपुट",
    voiceListening: "सुन रहे हैं... अब बोलिए",
    voiceListeningShort: "सुन रहे हैं...",
    category: "सामाजिक श्रेणी / जाति वर्ग *",
    gender: "लिंग *",
    age: "आयु (वर्ष) *",
    annualIncome: "वार्षिक पारिवारिक आय (₹) *",
    isPwd: "क्या आप दिव्यांगजन (PwD) हैं?",
    pwdPercent: "दिव्यांगता प्रतिशत (%)",
    businessSector: "व्यवसाय का प्रमुख क्षेत्र *",
    state: "राज्य / केंद्र शासित प्रदेश *",
    businessIdea: "अपने व्यवसाय या व्यापार का विचार बताएं *",
    businessIdeaPlaceholder: "उदा. महिलाओं के परिधान और स्कूल यूनिफॉर्म सिलने के लिए सिलाई बुटीक शुरू करना",
    projectCost: "अनुमानित परियोजना लागत (₹) *",
    education: "शैक्षणिक योग्यता *",
    btnFindSchemes: "पात्र योजनाएं खोजें",
    btnMatching: "योजनाओं की जांच जारी है...",
    btnResetTooltip: "रीसेट करें",

    // Dropdown options
    options: {
      category: {
        SC: "अनुसूचित जाति (SC)",
        ST: "अनुसूचित जनजाति (ST)",
        OBC: "अन्य पिछड़ा वर्ग (OBC)",
        Minority: "अल्पसंख्यक समुदाय",
        General: "सामान्य वर्ग"
      },
      gender: {
        Female: "महिला",
        Male: "पुरुष",
        Transgender: "उभयलिंगी (ट्रांसजेंडर)"
      },
      sector: {
        "Tailoring/Garments": "सिलाई एवं परिधान",
        "Artisans/Handicrafts": "शिल्पकार एवं हस्तशिल्प",
        "Manufacturing": "विनिर्माण एवं वर्कशॉप",
        "Services": "सेवा प्रतिष्ठान / सेवाएं",
        "Trading": "खुदरा व्यापार एवं दुकान",
        "Food Processing": "खाद्य प्रसंस्करण एवं कृषि",
        "Transport": "वाणिज्यिक परिवहन",
        "IT/Computer": "आईटी एवं कंप्यूटर सेवाएं"
      },
      state: {
        All: "अखिल भारतीय (सभी राज्य)",
        Maharashtra: "महाराष्ट्र",
        "Uttar Pradesh": "उत्तर प्रदेश",
        "Madhya Pradesh": "मध्य प्रदेश",
        "Tamil Nadu": "तमिलनाडु",
        Rajasthan: "राजस्थान",
        Bihar: "बिहार",
        "West Bengal": "पश्चिम बंगाल",
        Gujarat: "गुजरात",
        Karnataka: "कर्नाटक"
      },
      education: {
        None: "कक्षा 8 से कम",
        "Class 8": "कक्षा 8 उत्तीर्ण",
        "Class 10": "कक्षा 10 उत्तीर्ण (मैट्रिक)",
        "Class 12": "कक्षा 12 उत्तीर्ण (इंटरमीडिएट)",
        Graduate: "स्नातक / उच्च डिग्री"
      }
    },

    // 5. Results & Tabs
    resultsTitle: "आपकी सत्यापित योजनाओं की सूची",
    resultsDesc: "MoSJE, NSFDC, NBCFDC, NHFDC, NMDFC और MSME के आधिकारिक नियमों के अनुसार जांचा गया।",
    tabEligible: "पात्र योजनाएं",
    tabBorderline: "निकटवर्ती योजनाएं",
    tabIneligible: "अपात्र योजनाएं",
    tabEligibleText: "पात्र योजनाएं",
    tabBorderlineText: "निकटवर्ती योजनाएं",
    tabIneligibleText: "अपात्र",
    counterEligible: "पात्र",
    counterBorderline: "निकटवर्ती",
    counterIneligible: "अपात्र",
    emptyTierPrefix: "इस श्रेणी में कोई योजना नहीं मिली:",
    emptyTierSuffix: "इस विशिष्ट प्रोफाइल के लिए।",
    loadingVerifiedSchemes: "सत्यापित योजनाओं को लोड किया जा रहा है...",
    loadingEvaluatingRules: "प्रामाणिक नियमों और प्रासंगिकता का विश्लेषण जारी है...",
    matchError: "योजना मूल्यांकन विफल रहा। कृपया सर्वर कनेक्शन की जांच करें।",

    // 6. Scheme Cards
    statusEligible: "पात्र",
    statusBorderline: "निकटवर्ती",
    statusIneligible: "अपात्र",
    relevanceSuffix: "प्रासंगिकता",
    maxLoan: "अधिकतम रियायती ऋण",
    interestRate: "ब्याज दर",
    benefitType: "लाभ का प्रकार",
    asApproved: "परियोजना अनुसार",
    capitalSubsidy: "पूंजी सब्सिडी",
    softCredit: "रियायती ऋण",
    perAnnum: "वार्षिक",
    concessional: "रियायती",
    whyMatchedAudit: "आप क्यों पात्र हैं? (पारदर्शी नियम ऑडिट)",
    whyIneligibleAudit: "अपात्रता का कारण (विफल नियम)",
    listenAudio: "सुनें",
    stopAudio: "रोकें",
    viewDetailsEmi: "विवरण एवं ईएमआई देखें",

    // Criteria & Verdict mapping
    criteria: {
      Category: "सामाजिक श्रेणी / जाति",
      Gender: "लिंग",
      Income: "वार्षिक पारिवारिक आय",
      Age: "आयु सीमा",
      "Project Cost": "अनुमानित परियोजना लागत",
      Sector: "व्यवसाय क्षेत्र",
      Education: "शैक्षणिक योग्यता",
      Disability: "दिव्यांगता स्तर (PwD)",
      State: "राज्य / स्थान"
    },
    verdicts: {
      PASS: "उत्तीर्ण",
      BORDERLINE: "सीमांत",
      FAIL: "विफल"
    },

    // 7. Modal & Calculator
    modalPurposeTitle: "योजना का उद्देश्य एवं दायरा",
    verifiedPrefix: "आधिकारिक नियम सत्यापन तिथि:",
    calculatorTitle: "वित्तीय एवं ईएमआई कैलकुलेटर",
    liveReducingBalance: "घटती शेष राशि विधि",
    projectCostLabel: "परियोजना लागत:",
    tenureLabel: "ऋण अवधि:",
    yearsSuffix: "वर्ष",
    marginMoney: "स्वयं का अंशदान (मार्जिन)",
    govtSubsidy: "सरकारी पूंजी सब्सिडी",
    termLoan: "स्वीकृत बैंक ऋण",
    monthlyEmi: "अनुमानित मासिक ईएमआई",
    perMonth: "/ माह",
    progMargin: "मार्जिन",
    progSubsidy: "सब्सिडी",
    progLoan: "बैंक ऋण",
    docChecklist: "आवश्यक दस्तावेजों की चेकलिस्ट",
    docMandatory: "अनिवार्य",
    docOptional: "वैकल्पिक",
    howToApply: "आवेदन कैसे करें (चरणबद्ध प्रक्रिया)",
    stepPrefix: "चरण",
    officialPortal: "आधिकारिक पोर्टल पर जाएं",
    shareWhatsApp: "व्हाट्सएप",
    printPdf: "प्रिंट / डाउनलोड",

    // 8. Grounded AI Assistant Drawer
    chatAssistantTitle: "MoSJE योजना एआई सहायक",
    groundedBadge: "आधिकारिक दिशानिर्देशों पर आधारित",
    assistantGreeting: "नमस्ते! मैं MoSJE योजना परामर्श एआई सहायक हूँ। आप मुझसे NSFDC, NBCFDC, NHFDC, NMDFC, PMEGP, स्टैंड-अप इंडिया या मुद्रा योजनाओं के पात्रता नियमों, आवश्यक दस्तावेजों, सब्सिडी और आवेदन प्रक्रिया के बारे में कोई भी प्रश्न पूछ सकते हैं।",
    chips: [
      "सिलाई व्यवसाय ऋण के लिए कौन से दस्तावेज चाहिए?",
      "महिलाओं के लिए PMEGP सब्सिडी दर क्या है?"
    ],
    chatPlaceholder: "नियमों, दस्तावेजों या सब्सिडी के बारे में पूछें...",
    retrievingClauses: "सत्यापित योजना नियमों की खोज जारी है...",
    verifiedSourcesLabel: "सत्यापित संदर्भ स्रोत:",
    assistantError: "उत्तर प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।",

    // 9. Admin Console & Analytics
    adminTitle: "प्रशासन योजना प्रबंधन एवं ऑडिट कंसोल",
    adminDesc: "बिना कोड डिप्लॉयमेंट के आय सीमा, लागत और ब्याज दरों में बदलाव करें।",
    thSchemeName: "योजना का नाम",
    thIssuingBody: "जारीकर्ता संस्था",
    thIncomeCap: "आय सीमा",
    thMaxCost: "अधिकतम लागत",
    thInterest: "ब्याज %",
    thLastVerified: "अंतिम सत्यापन",
    thAction: "कार्रवाई",
    btnEdit: "संपादित करें",
    tabAnalytics: "योजना मिलान विश्लेषण एवं मांग ट्रैकिंग",
    analyticsTotalProfiles: "कुल जांचे गए प्रोफाइल",
    analyticsSeedCount: "32 सत्यापित सरकारी योजनाओं में",
    analyticsTopSectors: "सर्वाधिक मांग वाले क्षेत्र",
    analyticsDemographics: "जनसांख्यिकी वितरण",

    // 10. Receipt / Print / WhatsApp
    receiptTitle: "सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE)",
    receiptSubtitle: "सरकारी योजना शॉर्टलिस्ट एवं सत्यापन रसीद",
    receiptApplicantPrefix: "आवेदक:",
    receiptEntrepreneur: "उद्यमी",
    receiptDatePrefix: "दिनांक:",
    receiptTableScheme: "योजना का नाम",
    receiptTableBody: "जारीकर्ता संस्था",
    receiptTableLoan: "अधिकतम रियायती ऋण",
    receiptTableRate: "ब्याज दर",
    receiptTableSubsidy: "सब्सिडी",
    receiptTableUrl: "आधिकारिक वेबसाइट",
    receiptNote: "नोट: यह रसीद MoSJE के प्रामाणिक नियमों द्वारा तैयार की गई है। कृपया अपने निकटतम जिला चैनलाइजिंग एजेंसी या बैंक शाखा में केवाईसी, आय और जाति प्रमाण पत्र प्रस्तुत करें।",
    whatsappHeader: "*सरकारी योजना शॉर्टलिस्ट (MoSJE द्वारा सत्यापित)*",
    whatsappCategory: "सामाजिक श्रेणी",
    whatsappSector: "व्यवसाय क्षेत्र",
    whatsappEligible: "*पात्र योजनाएं*",
    whatsappLoan: "अधिकतम ऋण",
    whatsappRate: "ब्याज दर",
    whatsappPortal: "वेबसाइट",
    whatsappFooter: "_MoSJE योजना मिलान एआई प्लेटफॉर्म (SIH 2026) द्वारा सत्यापित_",

    // Scheme Name & Summary Dictionary
    schemes: {
      "nsfdc-term-loan": {
        name: "NSFDC मियादी ऋण योजना (टर्म लोन)",
        summary: "अनुसूचित जाति के उद्यमियों के लिए विनिर्माण, सेवा, परिवहन और व्यापार में व्यवहार्य परियोजनाओं हेतु ₹50 लाख तक की रियायती मियादी ऋण सहायता।"
      },
      "nsfdc-msy": {
        name: "महिला समृद्धि योजना (MSY)",
        summary: "अनुसूचित जाति की महिला उद्यमियों को ₹1,40,000 तक का अत्यंत रियायती सूक्ष्म ऋण (4% वार्षिक ब्याज) स्वयं सहायता समूहों या प्रत्यक्ष चैनल के माध्यम से।"
      },
      "nsfdc-mcf": {
        name: "माइक्रो क्रेडिट फाइनेंस (MCF) योजना",
        summary: "लघु व्यवसाय, व्यापार, और कारीगरी गतिविधियों के लिए अनुसूचित जाति के लाभार्थियों को ₹1.5 लाख तक का त्वरित एवं रियायती सूक्ष्म ऋण।"
      },
      "nsfdc-green-business": {
        name: "हरित व्यवसाय योजना (Green Business)",
        summary: "ई-रिक्शा, सौर ऊर्जा उपकरण, और पर्यावरण-अनुकूल हरित पहलों के लिए अनुसूचित जाति के व्यक्तियों हेतु ₹30 लाख तक का रियायती ऋण।"
      },
      "nsfdc-lvy": {
        name: "लघु व्यवसाय योजना (LVY)",
        summary: "अनुसूचित जाति के उद्यमियों के लिए सेवा और व्यापार क्षेत्र में लघु उद्यम स्थापित करने हेतु ₹5 लाख तक का रियायती ऋण।"
      },
      "nsfdc-may": {
        name: "महिला अधिकारिता योजना (MAY)",
        summary: "अनुसूचित जाति की महिला उद्यमियों के आर्थिक सशक्तिकरण के लिए विनिर्माण एवं सेवा इकाइयों हेतु ₹5 लाख तक का ऋण (4% ब्याज दर)।"
      },
      "nbcfdc-new-swarnima": {
        name: "नई स्वर्णिमा योजना (महिलाएं)",
        summary: "अन्य पिछड़ा वर्ग (OBC) की महिला उद्यमियों को आत्मनिर्भर बनाने हेतु ₹2 लाख तक का रियायती सावधि ऋण (5% वार्षिक ब्याज दर)।"
      },
      "nbcfdc-general-term-loan": {
        name: "NBCFDC सामान्य सावधि ऋण योजना",
        summary: "ओबीसी उद्यमियों को विनिर्माण, कृषि, सेवा एवं व्यापार इकाइयों की स्थापना हेतु ₹15 लाख तक का रियायती वित्तपोषण।"
      },
      "nbcfdc-shilp-sampada": {
        name: "शिल्प संपदा योजना (शिल्पकार)",
        summary: "ओबीसी वर्ग के पारंपरिक कारीगरों एवं शिल्पकारों के आधुनिकीकरण, औजारों और कार्यशील पूंजी हेतु ₹10 लाख तक की ऋण सहायता।"
      },
      "nbcfdc-saksham": {
        name: "NBCFDC सक्षम योजना (युवा पेशेवर)",
        summary: "ओबीसी वर्ग के तकनीकी एवं व्यावसायिक युवाओं को स्व-रोजगार उद्यम शुरू करने हेतु ₹15 लाख तक का रियायती ऋण।"
      },
      "nbcfdc-krishi-sampada": {
        name: "NBCFDC कृषि संपदा योजना",
        summary: "ओबीसी किसानों और ग्रामीण उद्यमियों को कृषि प्रसंस्करण, पॉलीहाउस और कृषि-संबद्ध व्यवसायों हेतु ₹10 लाख तक का रियायती ऋण।"
      },
      "nhfdc-divyangjan-swavalamban": {
        name: "दिव्यांगजन स्वावलंबन योजना",
        summary: "दिव्यांग (PwD - न्यूनतम 40% दिव्यांगता) उद्यमियों को किसी भी व्यवहार्य व्यापारिक गतिविधि के लिए ₹50 लाख तक का रियायती वित्तीय ऋण।"
      },
      "nhfdc-micro-credit": {
        name: "NHFDC दिव्यांगजन सूक्ष्म ऋण योजना",
        summary: "दिव्यांग व्यक्तियों को सूक्ष्म व्यवसाय, दुकान, और गृह-आधारित आजीविका शुरू करने हेतु ₹5 लाख तक का रियायती सूक्ष्म ऋण।"
      },
      "nhfdc-young-professionals": {
        name: "NHFDC युवा पेशेवर ऋण योजना",
        summary: "व्यावसायिक व तकनीकी शिक्षा प्राप्त दिव्यांग युवाओं को क्लिनिक, परामर्श केंद्र या स्टार्टअप स्थापित करने हेतु ₹25 लाख तक का ऋण।"
      },
      "nhfdc-assistive-device": {
        name: "NHFDC सहायक उपकरण एवं रेट्रोफिटेड वाहन ऋण",
        summary: "दिव्यांग उद्यमियों को व्यावसायिक मोबिलिटी, रेट्रोफिटेड व्यावसायिक वाहन और सहायक उपकरण खरीदने हेतु रियायती ऋण।"
      },
      "nmdfc-term-loan-line1": {
        name: "NMDFC मियादी ऋण योजना (क्रेडिट लाइन 1)",
        summary: "अल्पसंख्यक समुदाय (मुस्लिम, ईसाई, सिख, बौद्ध, जैन, पारसी) के उद्यमियों को ₹20 लाख तक का रियायती ऋण।"
      },
      "nmdfc-term-loan-line2": {
        name: "NMDFC मियादी ऋण योजना (क्रेडिट लाइन 2)",
        summary: "अल्पसंख्यक समुदाय के परिवारों (आय सीमा ₹8 लाख तक) को व्यवहार्य व्यावसायिक गतिविधियों हेतु ₹30 लाख तक का रियायती ऋण।"
      },
      "nmdfc-virasat": {
        name: "NMDFC विरासत योजना (दस्तकार)",
        summary: "अल्पसंख्यक दस्तकारों और पारंपरिक शिल्पकारों को अपने शिल्प संरक्षण और उत्पादन हेतु ₹10 लाख तक का रियायती ऋण (5% ब्याज दर)।"
      },
      "nmdfc-mahila-samridhi": {
        name: "NMDFC महिला समृद्धि योजना",
        summary: "अल्पसंख्यक महिला उद्यमियों के आर्थिक उत्थान हेतु स्वयं सहायता समूहों के माध्यम से ₹1 लाख तक का सूक्ष्म वित्तपोषण (4% ब्याज दर)।"
      },
      "nmdfc-micro-finance": {
        name: "NMDFC सूक्ष्म वित्तपोषण योजना (प्रत्यक्ष/एनजीओ)",
        summary: "गरीबी रेखा के निकट अल्पसंख्यक परिवारों को लघु व्यवसाय और आजीविका गतिविधियों हेतु ₹1.5 लाख तक का त्वरित सूक्ष्म ऋण।"
      },
      "pmegp-scheme": {
        name: "प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)",
        summary: "सूक्ष्म उद्यमों की स्थापना हेतु ₹50 लाख (विनिर्माण) और ₹20 लाख (सेवा) तक का ऋण, विशेष श्रेणियों व महिलाओं को 25% से 35% पूंजीगत सब्सिडी।"
      },
      "stand-up-india": {
        name: "स्टैंड-अप इंडिया योजना",
        summary: "अनुसूचित जाति (SC), अनुसूचित जनजाति (ST) और महिला उद्यमियों को ग्रीनफील्ड उद्यम स्थापित करने हेतु ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।"
      },
      "mudra-shishu": {
        name: "प्रधानमंत्री मुद्रा योजना (PMMY) - शिशु",
        summary: "छोटे व्यवसायों, दुकानदारों और सूक्ष्म उद्यमियों को शुरुआती पूंजी के लिए बिना किसी बंधक (कोलेटरल) के ₹50,000 तक का ऋण।"
      },
      "mudra-kishore": {
        name: "प्रधानमंत्री मुद्रा योजना (PMMY) - किशोर",
        summary: "स्थापित सूक्ष्म व्यवसायों के विस्तार, मशीनरी और स्टॉक खरीद हेतु ₹50,001 से ₹5 लाख तक का मुद्रा ऋण।"
      },
      "mudra-tarun": {
        name: "प्रधानमंत्री मुद्रा योजना (PMMY) - तरुण",
        summary: "व्यवसाय के बड़े विस्तार और आधुनिक औजारों के लिए ₹5 लाख से ₹10 लाख तक का कोलेटरल-मुक्त कार्यशील पूंजी व मियादी ऋण।"
      },
      "pm-vishwakarma": {
        name: "पीएम विश्वकर्मा योजना",
        summary: "18 पारंपरिक व्यवसायों के कारीगरों और शिल्पकारों को औजार किट प्रोत्साहन (₹15,000), कौशल प्रशिक्षण और 5% रियायती ब्याज पर ₹3 लाख तक का कोलेटरल-मुक्त ऋण।"
      },
      "pm-svanidhi": {
        name: "पीएम स्वनिधि (स्ट्रीट वेंडर्स आत्मनिर्भर निधि)",
        summary: "शहरी वेंडरों और रेहड़ी-पटरी वालों को ₹10,000 से ₹50,000 तक का कोलेटरल-मुक्त कार्यशील पूंजी ऋण एवं 7% ब्याज सब्सिडी।"
      },
      "vcf-sc": {
        name: "अनुसूचित जातियों के लिए वेंचर कैपिटल फंड (VCF-SC)",
        summary: "एससी उद्यमियों के स्वामित्व वाले उच्च-विकास वाले स्टार्ट-अप और विनिर्माण नवाचारों को ₹5 करोड़ तक का इक्विटी एवं ऋण सहयोग।"
      },
      "mahila-coir-yojana": {
        name: "महिला कॉयर योजना",
        summary: "नारियल रेशा (कॉयर) उद्योग में ग्रामीण महिला उद्यमियों को मोटर चालित रैट्स और उपकरण खरीदने हेतु 75% तक की सरकारी सब्सिडी।"
      },
      "cgtmse-guarantee": {
        name: "सूक्ष्म एवं लघु उद्यम क्रेडिट गारंटी योजना (CGTMSE)",
        summary: "बिना किसी कोलेटरल या तीसरे पक्ष की गारंटी के ₹5 करोड़ तक के एमएसएमई ऋणों के लिए 85% तक की क्रेडिट गारंटी कवर।"
      },
      "dr-ambedkar-special-assistance": {
        name: "डॉ. बी.आर. अंबेडकर विशेष सहायता योजना (SC/ST MSME)",
        summary: "एससी/एसटी सूक्ष्म और लघु उद्यमियों को पूंजी निवेश सब्सिडी, बिजली शुल्क छूट और ब्याज छूट की विशेष सहायता।"
      },
      "sidbi-mahila-udyam-nidhi": {
        name: "सिडबी महिला उद्यम निधि (MUN) योजना",
        summary: "महिला उद्यमियों द्वारा स्थापित नई एमएसएमई परियोजनाओं के लिए 25% तक की सॉफ्ट लोन इक्विटी सहायता (1% सेवा शुल्क पर)।"
      }
    }
  },

  mr: {
    // 1. Navigation & Header
    govIndia: "भारत सरकार • सामाजिक न्याय आणि सक्षमीकरण मंत्रालय",
    sihBadge: "| स्मार्ट इंडिया हॅकाथॉन 2026 (PS #26092)",
    zeroHallucination: "१००% अधिकृत आणि पडताळणीकृत",
    appTitle: "MoSJE योजना शोध पोर्टल",
    appSubtitle: "उद्योजकांसाठी सवलतीचे कर्ज आणि योजना शोध",
    language: "भाषा",
    chatAssistantBtn: "एआई योजना मार्गदर्शक",
    tabAdmin: "प्रशासकीय कक्ष",

    // 2. Hero & Banner
    heroPill: "स्मार्ट इंडिया हॅकाथॉन 2026",
    heroTitle: "उद्योजकांसाठी एआई-आधारित सरकारी योजना शोध",
    heroDesc: "एससी, एसटी, ओबीसी, अल्पसंख्याक, महिला आणि दिव्यांग (PwD) उद्योजकांसाठी पारदर्शक आणि अधिकृत योजना शोध.",

    // 3. Quick Demo Personas
    presetLabel: "डेमो प्रोफाइल निवडा:",
    personaRekhaBtn: "🧵 रेखा (ओबीसी महिला • टेलरिंग)",
    personaSureshBtn: "🔧 सुरेश (एससी पुरुष • वर्कशॉप)",
    personaImranBtn: "🔨 इम्रान (अल्पसंख्याक • कारागीर)",
    personaAnitaBtn: "♿ अनिता (दिव्यांग महिला • हस्तकला)",
    personaRekha: "रेखा (ओबीसी महिला, टेलरिंग)",
    personaSuresh: "सुरेश (एससी पुरुष, वर्कशॉप)",
    personaImran: "इम्रान (अल्पसंख्याक, कारागीर)",
    personaAnita: "अनिता (दिव्यांग महिला, हस्तकला)",

    personaIdeas: {
      rekha: "३ शिलाई यंत्रांच्या साहाय्याने महिलांचे डिझायनर कपडे, ब्लाऊज आणि शालेय गणवेश शिवण्यासाठी टेलरिंग बुटीक सुरू करणे.",
      suresh: "आधुनिक न्यूमॅटिक टूल्स आणि लेथ मशीनसह ऑटोमोबाईल दुरुस्ती कार्यशाळा आणि धातू फॅब्रिकेशन युनिटचा विस्तार करणे.",
      imran: "पारंपरिक पितळेची भांडी आणि कोरीव धातू हस्तकलेसाठी आधुनिक हस्तसाधने व कच्च्या पितळेच्या पत्र्यांची खरेदी करून वर्कशॉप चालवणे.",
      anita: "स्वावलंबी उपजीविकेसाठी घरगुती शोभिवंत हस्तकला, मेणबत्ती निर्मिती आणि लहान किरकोळ विक्री केंद्र सुरू करणे."
    },

    // 4. Intake Form
    formTitle: "उद्योजकाची माहिती भरा",
    voiceInput: "ध्वनी इनपुट",
    voiceListening: "ऐकत आहे... आता बोला",
    voiceListeningShort: "ऐकत आहे...",
    category: "सामाजिक प्रवर्ग *",
    gender: "लिंग *",
    age: "वय (वर्षे) *",
    annualIncome: "वार्षिक कौटुंबिक उत्पन्न (₹) *",
    isPwd: "दिव्यांग व्यक्ती (PwD) आहात का?",
    pwdPercent: "दिव्यांगत्व टक्केवारी (%)",
    businessSector: "व्यवसाय क्षेत्र *",
    state: "राज्य *",
    businessIdea: "तुमच्या व्यवसायाची किंवा कामाची माहिती *",
    businessIdeaPlaceholder: "उदा. महिलांचे कपडे आणि शालेय गणवेश शिवण्यासाठी टेलरिंग बुटीक सुरू करणे",
    projectCost: "अंदाजे प्रकल्प खर्च (₹) *",
    education: "शिक्षण *",
    btnFindSchemes: "पात्र योजना शोधा",
    btnMatching: "योजना तपासत आहे...",
    btnResetTooltip: "रीसेट करा",

    // Dropdown options
    options: {
      category: {
        SC: "अनुसूचित जाती (SC)",
        ST: "अनुसूचित जमाती (ST)",
        OBC: "इतर मागासवर्गीय (OBC)",
        Minority: "अल्पसंख्याक समुदाय",
        General: "सामान्य प्रवर्ग"
      },
      gender: {
        Female: "महिला",
        Male: "पुरुष",
        Transgender: "तृतीयपंथी"
      },
      sector: {
        "Tailoring/Garments": "टेलरिंग आणि कपडे व्यवसाय",
        "Artisans/Handicrafts": "कारागीर आणि हस्तकला",
        "Manufacturing": "उत्पादन आणि वर्कशॉप",
        "Services": "सेवा व्यवसाय",
        "Trading": "किरकोळ व्यापार आणि विक्री",
        "Food Processing": "अन्न प्रक्रिया आणि कृषी उद्योग",
        "Transport": "वाहतूक व्यवसाय",
        "IT/Computer": "माहिती तंत्रज्ञान व संगणक"
      },
      state: {
        All: "अखिल भारतीय (सर्व राज्ये)",
        Maharashtra: "महाराष्ट्र",
        "Uttar Pradesh": "उत्तर प्रदेश",
        "Madhya Pradesh": "मध्य प्रदेश",
        "Tamil Nadu": "तामिळनाडू",
        Rajasthan: "राजस्थान",
        Bihar: "बिहार",
        "West Bengal": "पश्चिम बंगाल",
        Gujarat: "गुजरात",
        Karnataka: "कर्नाटक"
      },
      education: {
        None: "इयत्ता ८ वी पेक्षा कमी",
        "Class 8": "इयत्ता ८ वी उत्तीर्ण",
        "Class 10": "इयत्ता १० वी उत्तीर्ण (SSC)",
        "Class 12": "इयत्ता १२ वी उत्तीर्ण (HSC)",
        Graduate: "पदवीधर / पदवी"
      }
    },

    // 5. Results & Tabs
    resultsTitle: "तुमच्यासाठी पात्र योजना",
    resultsDesc: "शासकीय नियमांनुसार अचूक तपासणी.",
    tabEligible: "पात्र योजना",
    tabBorderline: "जवळपास पात्र योजना",
    tabIneligible: "अपात्र योजना",
    tabEligibleText: "पात्र योजना",
    tabBorderlineText: "जवळपास पात्र",
    tabIneligibleText: "अपात्र",
    counterEligible: "पात्र",
    counterBorderline: "जवळपास",
    counterIneligible: "अपात्र",
    emptyTierPrefix: "या श्रेणीत कोणतीही योजना सापडली नाही:",
    emptyTierSuffix: "या विशिष्ट प्रोफाइलसाठी.",
    loadingVerifiedSchemes: "योजनांची माहिती लोड होत आहे...",
    loadingEvaluatingRules: "शासकीय नियमांनुसार पात्रता तपासली जात आहे...",
    matchError: "योजना तपासणी अयशस्वी. कृपया सर्व्हर कनेक्शन तपासा.",

    // 6. Scheme Cards
    statusEligible: "पात्र",
    statusBorderline: "जवळपास पात्र",
    statusIneligible: "अपात्र",
    relevanceSuffix: "सुसंगतता",
    maxLoan: "कमाल सवलतीचे कर्ज",
    interestRate: "व्याज दर",
    benefitType: "लाभाचा प्रकार",
    asApproved: "मंजूरीनुसार",
    capitalSubsidy: "भांडवली अनुदान",
    softCredit: "सवलतीचे कर्ज",
    perAnnum: "वार्षिक",
    concessional: "सवलतीचे",
    whyMatchedAudit: "तुम्ही का पात्र आहात? (नियम पडताळणी)",
    whyIneligibleAudit: "अपात्रतेचे कारण (अपात्र निकष)",
    listenAudio: "ऐका",
    stopAudio: "थांबवा",
    viewDetailsEmi: "तपशील आणि ईएमआय पहा",

    // Criteria & Verdict mapping
    criteria: {
      Category: "सामाजिक प्रवर्ग",
      Gender: "लिंग",
      Income: "कौटुंबिक उत्पन्न",
      Age: "वय",
      "Project Cost": "प्रकल्प खर्च",
      Sector: "व्यवसाय क्षेत्र",
      Education: "शिक्षण",
      Disability: "दिव्यांगत्व (PwD)",
      State: "राज्य"
    },
    verdicts: {
      PASS: "पात्र",
      BORDERLINE: "सीमांत",
      FAIL: "अपात्र"
    },

    // 7. Modal & Calculator
    modalPurposeTitle: "योजनेचा उद्देश व व्याप्ती",
    verifiedPrefix: "अधिकृत नियम पडताळणी तारीख:",
    calculatorTitle: "ईएमआय आणि अनुदान गणक",
    liveReducingBalance: "थेट घटती शिल्लक पद्धत",
    projectCostLabel: "प्रकल्प खर्च:",
    tenureLabel: "कर्ज मुदत:",
    yearsSuffix: "वर्षे",
    marginMoney: "स्वतःचे भांडवल (मार्जिन)",
    govtSubsidy: "शासकीय अनुदान",
    termLoan: "मंजूर होणारे बँक कर्ज",
    monthlyEmi: "मासिक हप्ता (EMI)",
    perMonth: "/ महिना",
    progMargin: "मार्जिन",
    progSubsidy: "अनुदान",
    progLoan: "बँक कर्ज",
    docChecklist: "आवश्यक कागदपत्रे",
    docMandatory: "अनिवार्य",
    docOptional: "पर्यायी",
    howToApply: "अर्ज करण्याची प्रक्रिया",
    stepPrefix: "पायरी",
    officialPortal: "अधिकृत संकेतस्थळ",
    shareWhatsApp: "व्हॉट्सॲप",
    printPdf: "प्रिंट / डाउनलोड",

    // 8. Grounded AI Assistant Drawer
    chatAssistantTitle: "MoSJE योजना एआई मार्गदर्शक",
    groundedBadge: "अधिकृत नियमांवर आधारित मदत",
    assistantGreeting: "नमस्कार! मी MoSJE एआय योजना सहाय्यक आहे. तुम्ही मला योजनांच्या पात्रता, आवश्यक कागदपत्रे, अनुदान आणि अर्ज करण्याच्या पद्धतीबद्दल कोणतेही प्रश्न विचारू शकता.",
    chips: [
      "टेलरिंग कर्जासाठी कोणती कागदपत्रे लागतात?",
      "महिलांसाठी PMEGP अनुदानाचे प्रमाण काय आहे?"
    ],
    chatPlaceholder: "कागदपत्रे, अनुदान किंवा नियमांबद्दल विचारा...",
    retrievingClauses: "शासकीय नियमांची तपासणी सुरू आहे...",
    verifiedSourcesLabel: "अधिकृत संदर्भ:",
    assistantError: "उत्तर मिळवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",

    // 9. Admin Console & Analytics
    adminTitle: "प्रशासक नियम व्यवस्थापन कक्ष",
    adminDesc: "योजनांचे नियम आणि मर्यादा अद्ययावत करा.",
    thSchemeName: "योजनेचे नाव",
    thIssuingBody: "संस्था",
    thIncomeCap: "उत्पन्न मर्यादा",
    thMaxCost: "कमाल खर्च",
    thInterest: "व्याज %",
    thLastVerified: "पडताळणी तारीख",
    thAction: "कृती",
    btnEdit: "बदला",
    tabAnalytics: "योजना मागणी व विश्लेषण",
    analyticsTotalProfiles: "एकूण तपासलेले प्रोफाइल",
    analyticsSeedCount: "३२ शासकीय योजनांमध्ये",
    analyticsTopSectors: "सर्वाधिक मागणी असलेले क्षेत्र",
    analyticsDemographics: "सामाजिक वर्गीकरण",

    // 10. Receipt / Print / WhatsApp
    receiptTitle: "सामाजिक न्याय आणि सक्षमीकरण मंत्रालय (MoSJE)",
    receiptSubtitle: "शासकीय योजना निवड व पडताळणी पावती",
    receiptApplicantPrefix: "अर्जदार:",
    receiptEntrepreneur: "उद्योजक",
    receiptDatePrefix: "दिनांक:",
    receiptTableScheme: "योजनेचे नाव",
    receiptTableBody: "संस्था",
    receiptTableLoan: "कमाल सवलतीचे कर्ज",
    receiptTableRate: "व्याज दर",
    receiptTableSubsidy: "अनुदान",
    receiptTableUrl: "अधिकृत संकेतस्थळ",
    receiptNote: "टीप: ही पावती अधिकृत नियमांनुसार तयार करण्यात आली आहे. कृपया कागदपत्रे संबंधित बँक किंवा जिल्हा कार्यालयात सादर करा.",
    whatsappHeader: "*शासकीय योजना निवड (MoSJE पडताळणीकृत)*",
    whatsappCategory: "प्रवर्ग",
    whatsappSector: "व्यवसाय",
    whatsappEligible: "*पात्र योजना*",
    whatsappLoan: "कमाल कर्ज",
    whatsappRate: "व्याज दर",
    whatsappPortal: "संकेतस्थळ",
    whatsappFooter: "_MoSJE योजना शोध एआय प्लॅटफॉर्म (SIH 2026)_",

    // Scheme Name & Summary Dictionary for Authentic Marathi Rendering
    schemes: {
      "nsfdc-term-loan": {
        name: "NSFDC मुदत कर्ज योजना (टर्म लोन)",
        summary: "अनुसूचित जातीच्या उद्योजकांसाठी उत्पादन, सेवा, वाहतूक आणि व्यापार क्षेत्रातील व्यवहार्य प्रकल्पांकरिता ₹५० लाखांपर्यंत सवलतीचे मुदत कर्ज सहाय्य."
      },
      "nsfdc-msy": {
        name: "महिला समृद्धी योजना (MSY)",
        summary: "अनुसूचित जातीच्या महिला उद्योजकांना बचत गट किंवा थेट चॅनेलद्वारे वार्षिक ४% व्याजदराने ₹१,४०,००० पर्यंत अतिसवलतीचे सूक्ष्म कर्ज."
      },
      "nsfdc-mcf": {
        name: "मायक्रो क्रेडिट वित्तपुरवठा योजना (MCF)",
        summary: "लहान व्यवसाय, किरकोळ व्यापार आणि कारागीर उपक्रमांसाठी अनुसूचित जातीच्या लाभार्थ्यांना ₹१.५ लाखांपर्यंत त्वरित व सवलतीचे सूक्ष्म कर्ज."
      },
      "nsfdc-green-business": {
        name: "हरित व्यवसाय योजना (Green Business)",
        summary: "ई-रिक्षा, सौर ऊर्जा उपकरणे आणि पर्यावरणपूरक उपक्रमांसाठी अनुसूचित जातीच्या व्यक्तींकरिता ₹३० लाखांपर्यंत सवलतीचे कर्ज सहाय्य."
      },
      "nsfdc-lvy": {
        name: "लघु व्यवसाय योजना (LVY)",
        summary: "अनुसूचित जातीच्या उद्योजकांना सेवा आणि किरकोळ व्यापार क्षेत्रात लघु उद्योग उभारणीसाठी ₹५ लाखांपर्यंत सवलतीचे कर्ज."
      },
      "nsfdc-may": {
        name: "महिला अधिकारिता योजना (MAY)",
        summary: "अनुसूचित जातीच्या महिला उद्योजकांच्या आर्थिक सबलीकरणासाठी उत्पादन व सेवा घटकांसाठी ४% वार्षिक व्याजाने ₹५ लाखांपर्यंत कर्ज."
      },
      "nbcfdc-new-swarnima": {
        name: "नवीन स्वर्णिमा योजना (महिलांसाठी)",
        summary: "इतर मागासवर्गीय (OBC) महिला उद्योजकांना स्वावलंबी बनवण्यासाठी ५% वार्षिक व्याजदराने ₹२ लाखांपर्यंत सवलतीचे मुदत कर्ज."
      },
      "nbcfdc-general-term-loan": {
        name: "NBCFDC सर्वसाधारण मुदत कर्ज योजना",
        summary: "ओबीसी उद्योजकांना उत्पादन, कृषी, सेवा आणि व्यापार युनिट्सच्या स्थापनेसाठी ₹१५ लाखांपर्यंत सवलतीचा वित्तपुरवठा."
      },
      "nbcfdc-shilp-sampada": {
        name: "शिल्प संपदा योजना (कारागिरांसाठी)",
        summary: "ओबीसी प्रवर्गातील पारंपरिक कारागीर व शिल्पकारांच्या आधुनिकीकरणासाठी, उपकरणांसाठी आणि खेळत्या भांडवलासाठी ₹१० लाखांपर्यंत कर्ज सहाय्य."
      },
      "nbcfdc-saksham": {
        name: "NBCFDC सक्षम योजना (तरुण व्यावसायिकांसाठी)",
        summary: "ओबीसी प्रवर्गातील तांत्रिक व व्यावसायिक शिक्षण घेतलेल्या तरुणांना स्वयंरोजगार प्रकल्प सुरू करण्यासाठी ₹१५ लाखांपर्यंत सवलतीचे कर्ज."
      },
      "nbcfdc-krishi-sampada": {
        name: "NBCFDC कृषी संपदा योजना",
        summary: "ओबीसी शेतकरी आणि ग्रामीण उद्योजकांना कृषी प्रक्रिया, पॉलीहाऊस आणि कृषी संलग्न व्यवसायांसाठी ₹१० लाखांपर्यंत सवलतीचे कर्ज."
      },
      "nhfdc-divyangjan-swavalamban": {
        name: "दिव्यांगजन स्वावलंबन योजना",
        summary: "किमान ४०% दिव्यांगत्व असलेल्या उद्योजकांना कोणत्याही व्यवहार्य व्यावसायिक उपक्रमासाठी ₹५० लाखांपर्यंत सवलतीचे वित्तीय कर्ज सहाय्य."
      },
      "nhfdc-micro-credit": {
        name: "NHFDC दिव्यांगजन सूक्ष्म कर्ज योजना",
        summary: "दिव्यांग व्यक्तींना सूक्ष्म व्यवसाय, छोटे दुकान आणि घरगुती आजीविका सुरू करण्यासाठी ₹५ लाखांपर्यंत सवलतीचे सूक्ष्म कर्ज."
      },
      "nhfdc-young-professionals": {
        name: "NHFDC तरुण व्यावसायिक दिव्यांग कर्ज योजना",
        summary: "व्यावसायिक किंवा तांत्रिक शिक्षण घेतलेल्या दिव्यांग तरुणांना दवाखाना, सल्लागार केंद्र किंवा स्टार्टअप सुरू करण्यासाठी ₹२५ लाखांपर्यंत कर्ज."
      },
      "nhfdc-assistive-device": {
        name: "NHFDC सहाय्यक उपकरणे आणि सुधारित व्यावसायिक वाहन कर्ज",
        summary: "दिव्यांग उद्योजकांना व्यावसायिक सुलभतेसाठी, रेट्रोफिटेड व्यावसायिक वाहने आणि आधुनिक सहाय्यक उपकरणे खरेदी करण्यासाठी सवलतीचे कर्ज."
      },
      "nmdfc-term-loan-line1": {
        name: "NMDFC मुदत कर्ज योजना (क्रेडिट लाइन १)",
        summary: "अल्पसंख्याक समुदायातील (मुस्लिम, ख्रिश्चन, शीख, बौद्ध, जैन, पारशी) उद्योजकांना स्वयंरोजगारासाठी ₹२० लाखांपर्यंत सवलतीचे कर्ज."
      },
      "nmdfc-term-loan-line2": {
        name: "NMDFC मुदत कर्ज योजना (क्रेडिट लाइन २)",
        summary: "८ लाख रुपयांपर्यंत कौटुंबिक उत्पन्न असलेल्या अल्पसंख्याक कुटुंबांना व्यावसायिक प्रकल्पांसाठी ₹३० लाखांपर्यंत सवलतीचे कर्ज."
      },
      "nmdfc-virasat": {
        name: "NMDFC विरासत योजना (कारागिरांसाठी)",
        summary: "पारंपरिक अल्पसंख्याक कारागीर आणि शिल्पकारांना त्यांच्या कलेचे संवर्धन, उत्पादन व विक्रीसाठी ५% व्याजदराने ₹१० लाखांपर्यंत सवलतीचे कर्ज."
      },
      "nmdfc-mahila-samridhi": {
        name: "NMDFC महिला समृद्धी योजना",
        summary: "अल्पसंख्याक महिला उद्योजकांच्या आर्थिक विकासासाठी बचत गटांच्या माध्यमातून ४% व्याजदराने ₹१ लाखांपर्यंत सूक्ष्म कर्ज."
      },
      "nmdfc-micro-finance": {
        name: "NMDFC सूक्ष्म वित्तपुरवठा योजना (थेट / स्वयंसेवी संस्था)",
        summary: "गरजू अल्पसंख्याक कुटुंबांना लहान व्यवसाय आणि उपजीविकेच्या उपक्रमांसाठी ₹१.५ लाखांपर्यंत त्वरित सूक्ष्म वित्तपुरवठा."
      },
      "pmegp-scheme": {
        name: "पंतप्रधान रोजगार निर्मिती कार्यक्रम (PMEGP)",
        summary: "सूक्ष्म उद्योगांसाठी ₹५० लाख (उत्पादन) आणि ₹२० लाख (सेवा) पर्यंत कर्ज, महिला व विशेष प्रवर्गांना २५% ते ३५% भांडवली अनुदान (सब्सिडी)."
      },
      "stand-up-india": {
        name: "स्टँड-अप इंडिया योजना",
        summary: "अनुसूचित जाती (SC), अनुसूचित जमाती (ST) आणि महिला उद्योजकांना नवीन ग्रीनफील्ड उद्योग उभारणीसाठी ₹१० लाख ते ₹१ कोटीपर्यंत बँक कर्ज."
      },
      "mudra-shishu": {
        name: "प्रधानमंत्री मुद्रा योजना (PMMY) - शिशु",
        summary: "लहान व्यावसायिक, दुकानदार आणि सूक्ष्म उपक्रमांना कोणत्याही तारण किंवा जामीनदाराशिवाय सुरुवातीच्या भांडवलासाठी ₹५०,००० पर्यंत कर्ज."
      },
      "mudra-kishore": {
        name: "प्रधानमंत्री मुद्रा योजना (PMMY) - किशोर",
        summary: "कार्यरत सूक्ष्म व्यवसायांचा विस्तार, यंत्रसामग्री खरेदी आणि साठा खरेदीसाठी ₹५०,००१ ते ₹५ लाखांपर्यंत विनातारण मुद्रा कर्ज."
      },
      "mudra-tarun": {
        name: "प्रधानमंत्री मुद्रा योजना (PMMY) - तरुण",
        summary: "स्थापित व्यवसायांच्या मोठ्या विस्तारासाठी आणि आधुनिक उपकरणांसाठी ₹५ लाख ते ₹१० लाखांपर्यंत तारणमुक्त खेळते भांडवल व मुदत कर्ज."
      },
      "pm-vishwakarma": {
        name: "पीएम विश्वकर्मा योजना",
        summary: "१८ पारंपरिक व्यवसायांतील कारागीर व शिल्पकारांना मोफत टूलकिट प्रोत्साहन (₹१५,०००), कौशल्य प्रशिक्षण आणि ५% सवलतीच्या व्याजाने ₹३ लाखांपर्यंत तारणमुक्त कर्ज."
      },
      "pm-svanidhi": {
        name: "पीएम स्वनिधी (फेरीवाले आत्मनिर्भर निधी)",
        summary: "शहरी फेरीवाले व पथविक्रेत्यांना ₹१०,००० ते ₹५०,००० पर्यंत तारणमुक्त खेळते भांडवल कर्ज आणि वेळेवर परतफेडीवर ७% व्याज सवलत (सब्सिडी)."
      },
      "vcf-sc": {
        name: "अनुसूचित जातींसाठी व्हेंचर कॅपिटल फंड (VCF-SC)",
        summary: "अनुसूचित जातीच्या उद्योजकांच्या मालकीच्या उच्च-वाढीच्या स्टार्टअप्स आणि उत्पादन प्रकल्पांना ₹५ कोटींपर्यंत भांडवली इक्विटी आणि कर्ज सहाय्य."
      },
      "mahila-coir-yojana": {
        name: "महिला कॉयर योजना",
        summary: "नारळ काथ्या (कॉयर) उद्योगातील ग्रामीण महिला उद्योजकांना मोटारीवर चालणारे चरखे आणि उपकरणे खरेदी करण्यासाठी ७५% पर्यंत शासकीय अनुदान."
      },
      "cgtmse-guarantee": {
        name: "सूक्ष्म व लघु उद्योग पत हमी योजना (CGTMSE)",
        summary: "कोणत्याही तारण किंवा त्रयस्थ व्यक्तीच्या जामिनाशिवाय ₹५ कोटींपर्यंतच्या एमएसएमई कर्जासाठी ८५% पर्यंत पत हमी (क्रेडिट गॅरंटी) संरक्षण."
      },
      "dr-ambedkar-special-assistance": {
        name: "डॉ. बी.आर. आंबेडकर विशेष सहाय्य योजना (SC/ST MSME)",
        summary: "अनुसूचित जाती/जमातीच्या सूक्ष्म व लघु उद्योजकांना भांडवली गुंतवणूक अनुदान, वीज शुल्क सवलत आणि व्याज अनुदानाची विशेष आर्थिक मदत."
      },
      "sidbi-mahila-udyam-nidhi": {
        name: "सिडबी महिला उद्यम निधी (MUN) योजना",
        summary: "महिला उद्योजकांनी स्थापन केलेल्या नवीन एमएसएमई प्रकल्पांना २५% पर्यंत सॉफ्ट लोन इक्विटी सहाय्य (केवळ १% वार्षिक सेवा शुल्कावर)."
      }
    }
  },

  ta: {
    // 1. Navigation & Header
    govIndia: "இந்திய அரசு • சமூக நீதி மற்றும் அதிகாரமளித்தல் அமைச்சகம்",
    sihBadge: "| ஸ்மார்ட் இந்தியா ஹேக்கத்தான் 2026 (PS #26092)",
    zeroHallucination: "சரிபார்க்கப்பட்ட அரசு திட்டங்கள்",
    appTitle: "MoSJE திட்டப் பொருத்தம் தளம்",
    appSubtitle: "விளிம்புநிலை தொழில்முனைவோருக்கான சலுகைக் கடன்",
    language: "மொழி",
    chatAssistantBtn: "AI திட்ட வழிகாட்டி",
    tabAdmin: "நிர்வாகக் குழு",

    // 2. Hero & Banner
    heroPill: "ஸ்மார்ட் இந்தியா ஹேக்கத்தான் 2026",
    heroTitle: "விளிம்புநிலை தொழில்முனைவோருக்கான AI திட்ட பொருத்தம்",
    heroDesc: "SC, ST, OBC, சிறுபான்மையினர், பெண்கள் மற்றும் மாற்றுத்திறனாளிகளுக்கான நம்பகமான மற்றும் வெளிப்படையான அரசு திட்டங்கள்.",

    // 3. Quick Demo Personas
    presetLabel: "மாதிரி நபர்கள்:",
    personaRekhaBtn: "🧵 ரேகா (OBC பெண் • தையல்)",
    personaSureshBtn: "🔧 சுரேஷ் (SC ஆண் • பட்டறை)",
    personaImranBtn: "🔨 இம்ரான் (சிறுபான்மையினர் • கைவினைஞர்)",
    personaAnitaBtn: "♿ அனிதா (மாற்றுத்திறனாளி பெண் • கைவினை)",
    personaRekha: "ரேகா (OBC பெண், தையல் தொழில்)",
    personaSuresh: "சுரேஷ் (SC ஆண், பட்டறை)",
    personaImran: "இம்ரான் (சிறுபான்மையினர், கைவினைஞர்)",
    personaAnita: "அனிதா (மாற்றுத்திறனாளி பெண், கைவினை)",

    personaIdeas: {
      rekha: "3 தையல் இயந்திரங்களுடன் பெண்களுக்கான ஆடைகள், ரவிக்கைகள் மற்றும் பள்ளி சீருடைகள் தைக்க தையல் கடை தொடங்குதல்.",
      suresh: "நவீன கருவிகள் மற்றும் லேத் இயந்திரத்துடன் கூடிய வாகன பழுதுபார்க்கும் பட்டறை மற்றும் உலோக உற்பத்தி பிரிவை விரிவாக்குதல்.",
      imran: "நவீன கைக்கருவிகள் மற்றும் பித்தளை தகடுகளை வாங்கி பாரம்பரிய பித்தளை பாத்திரங்கள் மற்றும் உலோக கைவினைப் பட்டறையை நடத்துதல்.",
      anita: "சுயாதீன வாழ்வாதாரத்திற்காக வீட்டிலிருந்தே அலங்கார கைவினைப்பொருட்கள், மெழுகுவர்த்தி தயாரித்தல் மற்றும் சிறிய விற்பனை கடை அமைத்தல்."
    },

    // 4. Intake Form
    formTitle: "தொழில்முனைவோர் சுயவிவரம்",
    voiceInput: "குரல் உள்ளீடு",
    voiceListening: "கேட்கிறது... இப்போது பேசவும்",
    voiceListeningShort: "கேட்கிறது...",
    category: "சமூகப் பிரிவு *",
    gender: "பாலினம் *",
    age: "வயது *",
    annualIncome: "ஆண்டு குடும்ப வருமானம் (₹) *",
    isPwd: "மாற்றுத்திறனாளியா (PwD)?",
    pwdPercent: "ஊனமுற்ற சதவீதம் (%)",
    businessSector: "தொழில் துறை *",
    state: "மாநிலம் *",
    businessIdea: "உங்கள் தொழில் யோசனை *",
    businessIdeaPlaceholder: "எ.கா. தையல் கடை மற்றும் பள்ளி சீருடைகள் தயாரித்தல்",
    projectCost: "திட்ட மதிப்பீடு (₹) *",
    education: "கல்வித் தகுதி *",
    btnFindSchemes: "திட்டங்களை கண்டறியவும்",
    btnMatching: "சரிபார்க்கிறது...",
    btnResetTooltip: "மீட்டமை",

    // Dropdown options
    options: {
      category: {
        SC: "பட்டியல் சாதி (SC)",
        ST: "பட்டியல் பழங்குடி (ST)",
        OBC: "இதர பிற்படுத்தப்பட்டோர் (OBC)",
        Minority: "சிறுபான்மையினர் சமூகம்",
        General: "பொதுப் பிரிவு"
      },
      gender: {
        Female: "பெண்",
        Male: "ஆண்",
        Transgender: "திருநங்கை / திருநம்பி"
      },
      sector: {
        "Tailoring/Garments": "தையல் மற்றும் ஆடைகள்",
        "Artisans/Handicrafts": "கைவினைஞர்கள் & கைவினைப்பொருட்கள்",
        "Manufacturing": "உற்பத்தி மற்றும் பட்டறை",
        "Services": "சேவை நிறுவனங்கள்",
        "Trading": "சில்லறை வணிகம்",
        "Food Processing": "உணவு பதப்படுத்துதல் & வேளாண்மை",
        "Transport": "வணிகப் போக்குவரத்து",
        "IT/Computer": "தகவல் தொழில்நுட்ப சேவைகள்"
      },
      state: {
        All: "அனைத்து இந்தியா",
        Maharashtra: "மகாராஷ்டிரா",
        "Uttar Pradesh": "உத்தரப் பிரதேசம்",
        "Madhya Pradesh": "மத்தியப் பிரதேசம்",
        "Tamil Nadu": "தமிழ்நாடு",
        Rajasthan: "ராஜஸ்தான்",
        Bihar: "பீகார்",
        "West Bengal": "மேற்கு வங்காளம்",
        Gujarat: "குஜராத்",
        Karnataka: "கர்நாடகா"
      },
      education: {
        None: "8 ஆம் வகுப்புக்கு கீழ்",
        "Class 8": "8 ஆம் வகுப்பு தேர்ச்சி",
        "Class 10": "10 ஆம் வகுப்பு தேர்ச்சி (SSC)",
        "Class 12": "12 ஆம் வகுப்பு தேர்ச்சி (HSC)",
        Graduate: "பட்டதாரி / கல்லூரி படிப்பு"
      }
    },

    // 5. Results & Tabs
    resultsTitle: "பொருத்தமான அரசு திட்டங்கள்",
    resultsDesc: "அதிகாரப்பூர்வ அரசு விதிகளின்படி சரிபார்க்கப்பட்டது.",
    tabEligible: "தகுதியான திட்டங்கள்",
    tabBorderline: "அருகிலுள்ள பொருத்தங்கள்",
    tabIneligible: "தகுதியற்ற திட்டங்கள்",
    tabEligibleText: "தகுதியான திட்டங்கள்",
    tabBorderlineText: "அருகிலுள்ள பொருத்தங்கள்",
    tabIneligibleText: "தகுதியற்றவை",
    counterEligible: "தகுதியானது",
    counterBorderline: "அருகில்",
    counterIneligible: "தகுதியற்றது",
    emptyTierPrefix: "இந்த பிரிவில் திட்டங்கள் இல்லை:",
    emptyTierSuffix: "இந்த சுயவிவரத்திற்கு.",
    loadingVerifiedSchemes: "திட்டங்கள் ஏற்றப்படுகின்றன...",
    loadingEvaluatingRules: "அரசு விதிகளின்படி சரிபார்க்கப்படுகிறது...",
    matchError: "திட்டங்களை சரிபார்க்க முடியவில்லை. சர்வர் இணைப்பை சரிபார்க்கவும்.",

    // 6. Scheme Cards
    statusEligible: "தகுதியானது",
    statusBorderline: "அருகிலுள்ள பொருத்தம்",
    statusIneligible: "தகுதியற்றது",
    relevanceSuffix: "பொருத்தம்",
    maxLoan: "அதிகபட்ச சலுகைக் கடன்",
    interestRate: "வட்டி விகிதம்",
    benefitType: "நன்மையின் வகை",
    asApproved: "ஒப்புதலின்படி",
    capitalSubsidy: "மூலதன மானியம்",
    softCredit: "சலுகைக் கடன்",
    perAnnum: "ஆண்டுக்கு",
    concessional: "சலுகை",
    whyMatchedAudit: "நீங்கள் தகுதி பெற்றது ஏன்? (விதிகள் ஆய்வு)",
    whyIneligibleAudit: "தகுதியின்மைக்கான காரணம் (தோல்வி)",
    listenAudio: "கேட்கவும்",
    stopAudio: "நிறுத்தவும்",
    viewDetailsEmi: "விவரங்கள் மற்றும் EMI",

    // Criteria & Verdict mapping
    criteria: {
      Category: "சமூகப் பிரிவு",
      Gender: "பாலினம்",
      Income: "ஆண்டு வருமானம்",
      Age: "வயது",
      "Project Cost": "திட்டச் செலவு",
      Sector: "தொழில் துறை",
      Education: "கல்வித்தகுதி",
      Disability: "ஊனம் (PwD)",
      State: "மாநிலம்"
    },
    verdicts: {
      PASS: "தகுதி",
      BORDERLINE: "அருகில்",
      FAIL: "தகுதியற்றது"
    },

    // 7. Modal & Calculator
    modalPurposeTitle: "திட்டத்தின் நோக்கம் மற்றும் வரம்பு",
    verifiedPrefix: "அரசு விதி சரிபார்க்கப்பட்ட தேதி:",
    calculatorTitle: "நிதி & EMI கணக்கீடு",
    liveReducingBalance: "நேரடி குறைந்துவரும் இருப்பு முறை",
    projectCostLabel: "திட்டச் செலவு:",
    tenureLabel: "கடன் காலம்:",
    yearsSuffix: "ஆண்டுகள்",
    marginMoney: "சொந்த பங்களிப்பு",
    govtSubsidy: "அரசு மானியம்",
    termLoan: "வங்கி கடன் தொகை",
    monthlyEmi: "மாதாந்திர EMI",
    perMonth: "/ மாதம்",
    progMargin: "பங்களிப்பு",
    progSubsidy: "மானியம்",
    progLoan: "வங்கி கடன்",
    docChecklist: "தேவையான ஆவணங்கள்",
    docMandatory: "கட்டாயம்",
    docOptional: "விருப்பத்தேர்வு",
    howToApply: "விண்ணப்பிக்கும் முறை",
    stepPrefix: "படி",
    officialPortal: "அதிகாரப்பூர்வ தளம்",
    shareWhatsApp: "வாட்ஸ்அப்",
    printPdf: "அச்சிடுக / பதிவிறக்குக",

    // 8. Grounded AI Assistant Drawer
    chatAssistantTitle: "MoSJE AI திட்ட வழிகாட்டி",
    groundedBadge: "சரிபார்க்கப்பட்ட வழிகாட்டுதல்கள்",
    assistantGreeting: "வணக்கம்! நான் MoSJE AI திட்ட ஆலோசகர். தகுதி விதிகள், ஆவணங்கள், மானியங்கள் மற்றும் விண்ணப்ப நடைமுறைகள் பற்றி நீங்கள் கேட்கலாம்.",
    chips: [
      "தையல் கடனுக்கு என்னென்ன ஆவணங்கள் தேவை?",
      "பெண்களுக்கான PMEGP மானிய விகிதம் என்ன?"
    ],
    chatPlaceholder: "ஆவணங்கள் அல்லது விதிகளைப் பற்றி கேட்கவும்...",
    retrievingClauses: "அரசு விதிகள் பெறப்படுகின்றன...",
    verifiedSourcesLabel: "சான்றுகள்:",
    assistantError: "பதில் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",

    // 9. Admin Console & Analytics
    adminTitle: "திட்ட நிர்வாக மேலாண்மை",
    adminDesc: "விதிகள் மற்றும் வரம்புகளை புதுப்பிக்கவும்.",
    thSchemeName: "திட்டத்தின் பெயர்",
    thIssuingBody: "வழங்கும் நிறுவனம்",
    thIncomeCap: "வருமான உச்சவரம்பு",
    thMaxCost: "அதிகபட்ச செலவு",
    thInterest: "வட்டி %",
    thLastVerified: "சரிபார்க்கப்பட்ட தேதி",
    thAction: "செயல்",
    btnEdit: "மாற்றுக",
    tabAnalytics: "திட்ட பகுப்பாய்வு மற்றும் தேவை கண்காணிப்பு",
    analyticsTotalProfiles: "ஆய்வு செய்யப்பட்ட சுயவிவரங்கள்",
    analyticsSeedCount: "32 அரசு திட்டங்களில்",
    analyticsTopSectors: "அதிகம் கோரப்பட்ட துறைகள்",
    analyticsDemographics: "மக்கள்தொகை பரவல்",

    // 10. Receipt / Print / WhatsApp
    receiptTitle: "சமூக நீதி மற்றும் அதிகாரமளித்தல் அமைச்சகம் (MoSJE)",
    receiptSubtitle: "அரசு திட்ட பட்டியல் மற்றும் சரிபார்ப்பு ரசீது",
    receiptApplicantPrefix: "விண்ணப்பதாரர்:",
    receiptEntrepreneur: "தொழில்முனைவோர்",
    receiptDatePrefix: "தேதி:",
    receiptTableScheme: "திட்டத்தின் பெயர்",
    receiptTableBody: "வழங்கும் நிறுவனம்",
    receiptTableLoan: "அதிகபட்ச சலுகைக் கடன்",
    receiptTableRate: "வட்டி விகிதம்",
    receiptTableSubsidy: "மானியம்",
    receiptTableUrl: "அதிகாரப்பூர்வ தளம்",
    receiptNote: "குறிப்பு: இந்த ரசீது அரசு விதிகளின்படி உருவாக்கப்பட்டது. தேவையான சான்றிதழ்களுடன் உள்ளூர் வங்கி அல்லது மாவட்ட அலுவலகத்தை அணுகவும்.",
    whatsappHeader: "*அரசு திட்ட பட்டியல் (MoSJE சரிபார்க்கப்பட்டது)*",
    whatsappCategory: "பிரிவு",
    whatsappSector: "துறை",
    whatsappEligible: "*தகுதியான திட்டங்கள்*",
    whatsappLoan: "அதிகபட்ச கடன்",
    whatsappRate: "வட்டி",
    whatsappPortal: "தளம்",
    whatsappFooter: "_MoSJE திட்டப் பொருத்தம் AI தளம் (SIH 2026)_",

    // Scheme Name & Summary Dictionary for Authentic Tamil Rendering
    schemes: {
      "nsfdc-term-loan": {
        name: "NSFDC காலக் கடன் திட்டம் (Term Loan)",
        summary: "பட்டியல் சாதி (SC) தொழில்முனைவோருக்கு உற்பத்தி, சேவை, வணிகம் மற்றும் போக்குவரத்துத் துறைகளில் தொழில் தொடங்க ₹50 லட்சம் வரை சலுகைக் கடன் உதவி."
      },
      "nsfdc-msy": {
        name: "மகிளா சம்ரிதி திட்டம் (MSY)",
        summary: "பட்டியல் சாதி பெண் தொழில்முனைவோருக்கு சுயஉதவிக் குழுக்கள் அல்லது நேரடி முறை மூலம் 4% சலுகை வட்டியில் ₹1.40 லட்சம் வரை நுண்கடன் உதவி."
      },
      "nsfdc-mcf": {
        name: "நுண்கடன் நிதி திட்டம் (MCF)",
        summary: "சிறு வணிகம், சில்லறை விற்பனை மற்றும் கைவினைத் தொழில்களுக்காக பட்டியல் சாதியினருக்கு ₹1.5 லட்சம் வரை விரைவான சலுகை நுண்கடன்."
      },
      "nsfdc-green-business": {
        name: "பசுமை வணிகத் திட்டம் (Green Business)",
        summary: "மின்சார ரிக்‌ஷா, சூரிய மின்சக்தி கருவிகள் மற்றும் சுற்றுச்சூழல் நட்பு பசுமை திட்டங்களுக்காக பட்டியல் சாதியினருக்கு ₹30 லட்சம் வரை சலுகைக் கடன்."
      },
      "nsfdc-lvy": {
        name: "சிறு வணிகத் திட்டம் (LVY)",
        summary: "பட்டியல் சாதி தொழில்முனைவோர் சேவை மற்றும் வர்த்தகத் துறைகளில் சிறு நிறுவனங்களைத் தொடங்க ₹5 லட்சம் வரை சலுகைக் கடன்."
      },
      "nsfdc-may": {
        name: "மகளிர் அதிகாரமளித்தல் திட்டம் (MAY)",
        summary: "பட்டியல் சாதி பெண் தொழில்முனைவோரின் பொருளாதார மேம்பாட்டிற்காக உற்பத்தி மற்றும் சேவை பிரிவுகளுக்கு 4% வட்டியில் ₹5 லட்சம் வரை கடன்."
      },
      "nbcfdc-new-swarnima": {
        name: "புதிய ஸ்வர்ணிமா திட்டம் (மகளிருக்கான திட்டம்)",
        summary: "இதர பிற்படுத்தப்பட்ட (OBC) பெண் தொழில்முனைவோர் சுயதொழில் தொடங்க 5% சலுகை வட்டியில் ₹2 லட்சம் வரை காலக் கடன் உதவி."
      },
      "nbcfdc-general-term-loan": {
        name: "NBCFDC பொது காலக் கடன் திட்டம்",
        summary: "OBC தொழில்முனைவோருக்கு உற்பத்தி, விவசாயம், சேவை மற்றும் வர்த்தக பிரிவுகளை அமைக்க ₹15 லட்சம் வரை சலுகை நிதியுதவி."
      },
      "nbcfdc-shilp-sampada": {
        name: "சில்ப் சம்பதா திட்டம் (கைவினைஞர்களுக்கான திட்டம்)",
        summary: "OBC பாரம்பரிய கைவினைஞர்கள் நவீன கருவிகள் மற்றும் மூலப்பொருட்கள் வாங்க ₹10 லட்சம் வரை கடன் உதவி."
      },
      "nbcfdc-saksham": {
        name: "NBCFDC சக்‌ஷம் திட்டம் (இளம் தொழில் வல்லுநர்களுக்கானது)",
        summary: "தொழில்நுட்ப மற்றும் தொழிற்கல்வி முடித்த OBC இளைஞர்கள் சுயதொழில் தொடங்க ₹15 லட்சம் வரை சலுகைக் கடன்."
      },
      "nbcfdc-krishi-sampada": {
        name: "NBCFDC கிருஷி சம்பதா திட்டம்",
        summary: "OBC விவசாயிகள் மற்றும் கிராமப்புற தொழில்முனைவோருக்கு உணவு பதப்படுத்துதல் மற்றும் வேளாண் சார்ந்த தொழில்களுக்கு ₹10 லட்சம் வரை கடன்."
      },
      "nhfdc-divyangjan-swavalamban": {
        name: "திவ்யாங்ஜன் ஸ்வாவலம்பன் திட்டம்",
        summary: "குறைந்தது 40% மாற்றுத்திறன் கொண்ட தொழில்முனைவோருக்கு லாபகரமான வணிகத் திட்டங்களுக்காக ₹50 லட்சம் வரை சலுகைக் கடன் உதவி."
      },
      "nhfdc-micro-credit": {
        name: "NHFDC மாற்றுத்திறனாளிகளுக்கான நுண்கடன் திட்டம்",
        summary: "மாற்றுத்திறனாளிகள் சிறு வணிகம், சிறிய கடை மற்றும் வீட்டுத் தொழில்கள் தொடங்க ₹5 லட்சம் வரை சலுகை நுண்கடன்."
      },
      "nhfdc-young-professionals": {
        name: "NHFDC இளம் மாற்றுத்திறனாளி தொழில் வல்லுநர்களுக்கான திட்டம்",
        summary: "தொழிற்கல்வி பயின்ற மாற்றுத்திறனாளி இளைஞர்கள் கிளினிக், ஆலோசனை மையம் அல்லது ஸ்டார்ட்அப் அமைக்க ₹25 லட்சம் வரை கடன்."
      },
      "nhfdc-assistive-device": {
        name: "NHFDC உதவிகர கருவிகள் & மாற்றியமைக்கப்பட்ட வாகனக் கடன்",
        summary: "மாற்றுத்திறனாளி தொழில்முனைவோர் வணிக பயன்பாட்டிற்கு ஏற்ற மாற்றியமைக்கப்பட்ட வாகனங்கள் மற்றும் கருவிகள் வாங்க சலுகைக் கடன்."
      },
      "nmdfc-term-loan-line1": {
        name: "NMDFC காலக் கடன் திட்டம் (கிரெடிட் லைன் 1)",
        summary: "சிறுபான்மையினர் சமூக (முஸ்லிம், கிறிஸ்தவர், சீக்கியர், பௌத்தர், சமணர், பார்சி) தொழில்முனைவோருக்கு ₹20 லட்சம் வரை சலுகைக் கடன்."
      },
      "nmdfc-term-loan-line2": {
        name: "NMDFC காலக் கடன் திட்டம் (கிரெடிட் லைன் 2)",
        summary: "ஆண்டு வருமானம் ₹8 லட்சம் வரையுள்ள சிறுபான்மையினர் குடும்பங்களுக்கு தொழில் விரிவாக்கத்திற்காக ₹30 லட்சம் வரை சலுகைக் கடன்."
      },
      "nmdfc-virasat": {
        name: "NMDFC விராசத் திட்டம் (கைவினைஞர்களுக்கானது)",
        summary: "பாரம்பரிய சிறுபான்மையின கைவினைஞர்கள் மற்றும் சிற்பிகளுக்கு 5% வட்டியில் ₹10 லட்சம் வரை சலுகைக் கடன் உதவி."
      },
      "nmdfc-mahila-samridhi": {
        name: "NMDFC மகிளா சம்ரிதி திட்டம்",
        summary: "சிறுபான்மையின பெண் தொழில்முனைவோருக்கு சுயஉதவிக் குழுக்கள் வழியாக 4% வட்டியில் ₹1 லட்சம் வரை நுண்கடன் உதவி."
      },
      "nmdfc-micro-finance": {
        name: "NMDFC நுண்நிதித் திட்டம் (நேரடி / NGO முறை)",
        summary: "ஏழை சிறுபான்மையின குடும்பங்கள் சிறு வணிகம் மற்றும் வாழ்வாதார வேலைகளை தொடங்க ₹1.5 லட்சம் வரை உடனடி நுண்கடன்."
      },
      "pmegp-scheme": {
        name: "பிரதமரின் வேலைவாய்ப்பு உருவாக்கும் திட்டம் (PMEGP)",
        summary: "புதிய குறுந்தொழில் தொடங்க ₹50 லட்சம் (உற்பத்தி) மற்றும் ₹20 லட்சம் (சேவை) வரை கடன்; பெண்களுக்கு 25% முதல் 35% வரை மூலதன மானியம்."
      },
      "stand-up-india": {
        name: "ஸ்டாண்ட்-அப் இந்தியா திட்டம்",
        summary: "பட்டியல் சாதி (SC), பழங்குடியினர் (ST) மற்றும் பெண் தொழில்முனைவோர் புதிய தொழில் தொடங்க ₹10 லட்சம் முதல் ₹1 கோடி வரை வங்கிக் கடன்."
      },
      "mudra-shishu": {
        name: "பிரதமரின் முத்ரா திட்டம் (PMMY) - சிசு",
        summary: "சிறு வணிகர்கள், கடைக்காரர்கள் மற்றும் குறுந்தொழில்களுக்கு எவ்வித பிணையமும் இன்றி ஆரம்ப மூலதனமாக ₹50,000 வரை கடன்."
      },
      "mudra-kishore": {
        name: "பிரதமரின் முத்ரா திட்டம் (PMMY) - கிஷோர்",
        summary: "செயல்படும் சிறு தொழில்களை விரிவாக்கம் செய்ய மற்றும் இயந்திரங்கள் வாங்க ₹50,001 முதல் ₹5 லட்சம் வரை பிணையில்லா முத்ரா கடன்."
      },
      "mudra-tarun": {
        name: "பிரதமரின் முத்ரா திட்டம் (PMMY) - தருண்",
        summary: "நன்கு வளர்ந்த நிறுவனங்களின் பெரிய அளவிலான விரிவாக்கத்திற்கு ₹5 லட்சம் முதல் ₹10 லட்சம் வரை பிணையில்லா முத்ரா கடன்."
      },
      "pm-vishwakarma": {
        name: "பிரதமரின் விஸ்வகர்மா திட்டம்",
        summary: "18 பாரம்பரிய தொழில்களில் உள்ள கைவினைஞர்களுக்கு கருவித்தொகுப்பு உதவி (₹15,000), திறன் பயிற்சி மற்றும் 5% வட்டியில் ₹3 லட்சம் வரை பிணையில்லா கடன்."
      },
      "pm-svanidhi": {
        name: "பிரதமரின் ஸ்வநிதி திட்டம் (தெருவோர வியாபாரிகள் நிதி)",
        summary: "தெருவோர வியாபாரிகள் மற்றும் தள்ளுவண்டி கடைக்காரர்களுக்கு ₹10,000 முதல் ₹50,000 வரை பிணையில்லா கடன் மற்றும் 7% வட்டி மானியம்."
      },
      "vcf-sc": {
        name: "பட்டியல் சாதியினருக்கான துணிகர மூலதன நிதி (VCF-SC)",
        summary: "பட்டியல் சாதி தொழில்முனைவோரின் புதிய ஸ்டார்ட்அப் மற்றும் தொழில் நிறுவனங்களுக்கு ₹5 கோடி வரை நிதி முதலீடு மற்றும் கடன் ஆதரவு."
      },
      "mahila-coir-yojana": {
        name: "மகிளா கயிறு திட்டம் (Mahila Coir Yojana)",
        summary: "தேங்காய் நார் (கயிறு) தொழிலில் ஈடுபடும் கிராமப்புற பெண்களுக்கு மோட்டார் பொருத்தப்பட்ட ராட்டினங்கள் வாங்க 75% வரை அரசு மானியம்."
      },
      "cgtmse-guarantee": {
        name: "குறு மற்றும் சிறு நிறுவனங்களுக்கான கடன் உத்தரவாதத் திட்டம் (CGTMSE)",
        summary: "எந்தவொரு பிணையமும் இன்றி ₹5 கோடி வரையிலான MSME கடன்களுக்கு 85% வரை கடன் உத்தரவாதப் பாதுகாப்பு வழங்கப்படுகிறது."
      },
      "dr-ambedkar-special-assistance": {
        name: "டாக்டர் பி.ஆர். அம்பேத்கர் சிறப்பு உதவித் திட்டம் (SC/ST MSME)",
        summary: "SC/ST குறு, சிறு மற்றும் நடுத்தர தொழில்முனைவோருக்கு மூலதன மானியம், மின்கட்டண விலக்கு மற்றும் வட்டி மானிய சிறப்பு உதவி."
      },
      "sidbi-mahila-udyam-nidhi": {
        name: "SIDBI மகிளா உத்யாம் நிதி (MUN) திட்டம்",
        summary: "பெண் தொழில்முனைவோரின் புதிய MSME திட்டங்களுக்கு 25% வரை மென் கடன் மூலதன உதவி (ஆண்டுக்கு வெறும் 1% சேவைக் கட்டணத்தில்)."
      }
    }
  }
};
