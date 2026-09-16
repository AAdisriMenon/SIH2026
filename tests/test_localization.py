import unittest
import subprocess
import json
import re
import os

class TestLocalization(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        cls.translations_js = os.path.abspath("frontend/translations.js").replace("\\", "/")
        cls.app_js = os.path.abspath("frontend/app.js").replace("\\", "/")

    def test_all_23_languages_loaded_and_complete(self):
        """Verify that all 23 languages are present and have zero missing keys compared to English."""
        test_html = f"""<!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <script src="file:///{self.translations_js}"></script>
        </head><body><pre id="out"></pre><script>
        const en = TRANSLATIONS['en'];
        const enKeys = Object.keys(en);
        const results = {{}};
        for (const lang of Object.keys(TRANSLATIONS)) {{
          const l = TRANSLATIONS[lang];
          const missing = enKeys.filter(k => l[k] === undefined);
          results[lang] = {{
            keyCount: Object.keys(l).length,
            missingCount: missing.length,
            hasStepPrefix: l.stepPrefix !== undefined && l.stepPrefix !== 'undefined',
            hasDocMandatory: l.docMandatory !== undefined && l.docMandatory !== 'undefined',
            hasYearsSuffix: l.yearsSuffix !== undefined && l.yearsSuffix !== 'undefined'
          }};
        }}
        document.getElementById('out').textContent = JSON.stringify(results);
        </script></body></html>"""

        scratch_html = os.path.abspath("tests/scratch_test_lang.html").replace("\\", "/")
        with open(scratch_html, "w", encoding="utf-8") as f:
            f.write(test_html)

        res = subprocess.run([self.edge_path, "--headless=new", "--virtual-time-budget=2000", "--dump-dom", f"file:///{scratch_html}"], capture_output=True, text=True, encoding="utf-8")
        if os.path.exists(scratch_html):
            os.remove(scratch_html)

        m = re.search(r'<pre id="out">(.*?)</pre>', res.stdout, re.DOTALL)
        self.assertTrue(m, "DOM pre#out not found")
        data = json.loads(m.group(1))

        all_23_expected = [
            "en", "hi", "mr", "ta", "bn", "te", "gu", "kn", "ml", "pa",
            "or", "as", "ur", "sa", "ne", "mai", "kok", "brx", "doi", "ks",
            "mni", "sat", "sd"
        ]

        self.assertEqual(len(data), 23, f"Expected 23 languages, got {{len(data)}}")
        for lang in all_23_expected:
            self.assertIn(lang, data, f"Language {{lang}} missing from TRANSLATIONS")
            stats = data[lang]
            self.assertEqual(stats["missingCount"], 0, f"Language {{lang}} has missing keys vs English")
            self.assertTrue(stats["hasStepPrefix"], f"Language {{lang}} missing stepPrefix")
            self.assertTrue(stats["hasDocMandatory"], f"Language {{lang}} missing docMandatory")
            self.assertTrue(stats["hasYearsSuffix"], f"Language {{lang}} missing yearsSuffix")

    def test_no_undefined_in_modal_and_cards_across_languages(self):
        """Verify that opening the detail modal and rendering cards in EN, HI, ML, MR, TA, TE, KN, BN never produces 'undefined'."""
        test_html = f"""<!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <script src="file:///{self.translations_js}"></script>
        <script src="file:///{self.app_js}"></script>
        </head><body><pre id="out"></pre><script>
        const testLangs = ['en', 'hi', 'ml', 'mr', 'ta', 'te', 'kn', 'bn'];
        const results = {{}};

        const mockScheme = {{
          scheme_id: 'nbcfdc-new-swarnima',
          scheme_name: 'New Swarnima Scheme for Women',
          issuing_body: 'NBCFDC, MoSJE',
          summary: 'Term loan up to 2 lakh at 5% interest for OBC women entrepreneurs.',
          purpose: 'Provide concessional credit to backward class female entrepreneurs.',
          eligibility_status: 'ELIGIBLE',
          semantic_score: 95,
          last_verified: '2026-09-16',
          financial_summary: {{
            max_loan_amount: 200000,
            interest_rate_percent: 5,
            subsidy_percent: 0,
            max_tenure_years: 5
          }},
          documents: [
            {{ name: 'Aadhaar Card', mandatory: true, notes: 'Identity and address proof' }},
            {{ name: 'OBC Caste Certificate', mandatory: true, notes: 'Valid OBC status certificate' }},
            {{ name: 'Income Certificate', mandatory: false, notes: 'Below 3 lakh p.a.' }}
          ],
          application_process: [
            'Obtain application form from State Channelising Agency (SCA).',
            'Submit project proposal with machinery estimate and KYC documents.',
            'Undergo physical inspection and feasibility vetting.',
            'Sanction and disbursement of up to 95% project cost.'
          ],
          verdicts: [
            {{ criterion: 'Category', status: 'PASS', reason: 'OBC category matches statutory mandate.' }},
            {{ criterion: 'Gender', status: 'PASS', reason: 'Female applicant matches women focus.' }},
            {{ criterion: 'Income', status: 'PASS', reason: 'Income below 3,00,000 threshold.' }}
          ]
        }};

        for (const lang of testLangs) {{
          state.currentLang = lang;
          
          const sName = getLocalizedSchemeName(mockScheme);
          const sSum = getLocalizedSchemeSummary(mockScheme);
          const sDoc0 = getLocalizedDocName(mockScheme.documents[0].name);
          const sDoc1 = getLocalizedDocName(mockScheme.documents[1].name);
          const stepPfx = getI18n('stepPrefix');
          const docMand = getI18n('docMandatory');
          const docOpt = getI18n('docOptional');
          const yrSuffix = getI18n('yearsSuffix');
          const verPfx = getI18n('verifiedPrefix');
          const statElig = getI18n('statusEligible');

          const step1 = `${{stepPfx}} 1`;
          const step2 = `${{stepPfx}} 2`;

          const allTexts = [sName, sSum, sDoc0, sDoc1, step1, step2, docMand, docOpt, yrSuffix, verPfx, statElig];
          const hasUndefined = allTexts.some(t => t === undefined || String(t).includes('undefined') || t === '');

          results[lang] = {{
            sName: sName,
            sDoc0: sDoc0,
            step1: step1,
            docMand: docMand,
            hasUndefined: hasUndefined
          }};
        }}

        document.getElementById('out').textContent = JSON.stringify(results);
        </script></body></html>"""

        scratch_html = os.path.abspath("tests/scratch_test_modal_loc.html").replace("\\", "/")
        with open(scratch_html, "w", encoding="utf-8") as f:
            f.write(test_html)

        res = subprocess.run([self.edge_path, "--headless=new", "--virtual-time-budget=2000", "--dump-dom", f"file:///{scratch_html}"], capture_output=True, text=True, encoding="utf-8")
        if os.path.exists(scratch_html):
            os.remove(scratch_html)

        m = re.search(r'<pre id="out">(.*?)</pre>', res.stdout, re.DOTALL)
        self.assertTrue(m, "DOM pre#out not found")
        data = json.loads(m.group(1))

        for lang, item in data.items():
            self.assertFalse(item["hasUndefined"], f"Found undefined in language {{lang}}: {{item}}")
            self.assertNotEqual(item["sName"], "", f"Scheme name empty for {{lang}}")
            self.assertFalse("undefined" in item["step1"], f"Undefined step prefix in {{lang}}: {{item['step1']}}")

        # Explicit Malayalam checks
        self.assertIn("സ്വർണിമ", data["ml"]["sName"])
        self.assertIn("ഘട്ടം 1", data["ml"]["step1"])
        self.assertEqual(data["ml"]["docMand"], "നിർബന്ധിതം")

        # Explicit Hindi checks
        self.assertIn("स्वर्णिम", data["hi"]["sName"])
        self.assertIn("चरण 1", data["hi"]["step1"])
        self.assertEqual(data["hi"]["docMand"], "अनिवार्य")

        # Explicit Tamil checks
        self.assertIn("ஸ்வர்ணிமா", data["ta"]["sName"])
        self.assertIn("படி 1", data["ta"]["step1"])

if __name__ == "__main__":
    unittest.main()
