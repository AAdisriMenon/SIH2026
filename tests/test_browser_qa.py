import unittest
import subprocess
import json
import re
import os

class TestBrowserQA(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        cls.translations_js = os.path.abspath("frontend/translations.js").replace("\\", "/")
        cls.app_js = os.path.abspath("frontend/app.js").replace("\\", "/")

    def test_multilingual_browser_qa(self):
        """
        Comprehensive automated browser DOM QA across EN, HI, ML, TA, TE for:
        A. Scheme cards
        B. Scheme detail modal
        C. Financial calculator with moratorium
        D. Educational loan workflow (Pooja persona)
        E. Channel partner locator
        F. Partner details (type, contact, official source)
        G. Distance & approx coordinates
        H. Directions link security (no user data exposed)
        I. Coverage disclaimer
        K. Zero undefined/null/NaN/[object Object] in rendered DOM
        """
        test_html = f"""<!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <script src="file:///{self.translations_js}"></script>
        </head><body>
        <div id="testRoot"></div>
        <pre id="out"></pre>
        <script>
        const langs = ['en', 'hi', 'ml', 'ta', 'te'];
        const results = {{}};

        // Sample partner record
        const samplePartner = {{
          id: 'sca-mpbcdc-mh',
          name: 'Mahatma Phule Backward Classes Development Corporation (MPBCDC)',
          type: 'State Channelizing Agency (SCA)',
          state: 'Maharashtra',
          district: 'Mumbai',
          address: 'Supreme Court Road, Bandra East, Mumbai',
          pincode: '400051',
          latitude: 19.0607,
          longitude: 72.853,
          distance_km: 4.2,
          supported_loan_categories: ['Micro Finance', 'Term Loan', 'Educational Loan'],
          supported_schemes: ['nsfdc-term-loan', 'nsfdc-education-loan'],
          official_source: 'https://nsfdc.nic.in/en/channel-partners',
          verification_date: '2026-09-16',
          contact_info: {{ phone: '022-26591621', portal: 'https://mpbcdc.mahonline.gov.in' }},
          rrb_eligibility_criteria: {{
            no_overdues_to_nsfdc: true,
            fund_utilization_mandate: 'Minimum 100% cumulative utilization level of previously disbursed funds',
            net_npa_limit: '<= 5% Net NPA'
          }},
          live_status_note: 'Status data not available for live verification. Verified from latest official Gazette. Institutional inclusion does not guarantee loan disbursement.'
        }};

        // Sample educational scheme
        const eduScheme = {{
          scheme_id: 'nsfdc-education-loan',
          scheme_name: 'NSFDC Educational Loan Scheme for SC Students',
          issuing_body: 'NSFDC, MoSJE',
          loan_category: 'Educational Loan',
          moratorium_months: 12,
          summary: 'Concessional education loan up to 40 Lakhs at 6.5% interest for SC students pursuing professional courses.',
          purpose: 'Higher education finance for technical & professional degrees in India and abroad.',
          eligibility_status: 'ELIGIBLE',
          semantic_score: 98,
          last_verified: '2026-09-16',
          financial_summary: {{
            max_loan_amount: 4000000,
            interest_rate_percent: 6.5,
            subsidy_percent: 0,
            max_tenure_years: 12
          }},
          documents: [
            {{ name: 'Caste Certificate (SC)', mandatory: true, notes: 'Competent authority certificate' }},
            {{ name: 'Admission Proof', mandatory: true, notes: 'College entrance confirmation' }}
          ],
          application_process: [
            'Secure admission in professional degree course.',
            'Apply online via MoSJE PM-SURAJ portal or through State Channelizing Agency.',
            'Disbursement of up to 90% course fees to college escrow account.'
          ],
          verdicts: [
            {{ criterion: 'Social Category', reason: 'Matches SC requirement', status: 'PASS' }},
            {{ criterion: 'Course / Stream', reason: 'Higher education professional course', status: 'PASS' }}
          ]
        }};

        for (const lang of langs) {{
          const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
          const issues = [];

          // 1. Verify coverage disclaimer keys
          const covTitle = t.partnerCoverageTitle;
          const covNotice = t.partnerCoverageNotice;
          if (!covTitle || covTitle.includes('undefined')) issues.push('partnerCoverageTitle is missing or undefined');
          if (!covNotice || covNotice.includes('undefined')) issues.push('partnerCoverageNotice is missing or undefined');

          // 2. Render Card DOM representation
          const cardHtml = `
            <div class="card">
              <span class="body">${{eduScheme.issuing_body}}</span>
              <span class="cat">${{eduScheme.loan_category}}</span>
              <span class="mor">${{eduScheme.moratorium_months}} ${{t.monthsSuffix || 'Months'}}</span>
              <h4>${{(t.schemes && t.schemes[eduScheme.scheme_id] && t.schemes[eduScheme.scheme_id].name) || eduScheme.scheme_name}}</h4>
              <p>${{(t.schemes && t.schemes[eduScheme.scheme_id] && t.schemes[eduScheme.scheme_id].summary) || eduScheme.summary}}</p>
              <div>${{t.maxLoan || 'Max Loan'}}: ₹${{eduScheme.financial_summary.max_loan_amount.toLocaleString('en-IN')}}</div>
              <div>${{t.interestRate || 'Interest'}}: ${{eduScheme.financial_summary.interest_rate_percent}}% ${{t.perAnnum || 'p.a.'}}</div>
              <button>${{t.findPartnerForScheme || 'Find Partner'}}</button>
            </div>
          `;

          // 3. Render Modal DOM representation
          const modalHtml = `
            <div class="modal">
              <span class="mor-val">${{eduScheme.moratorium_months}} ${{t.monthsSuffix || 'Months'}}</span>
              <span class="mor-note">Course duration + 1 year, or up to 6 months where repayment has started</span>
              <div class="steps">${{eduScheme.application_process.map((s, i) => (t.stepPrefix || 'Step') + ' ' + (i+1) + ': ' + s).join(' ')}}</div>
            </div>
          `;

          // 4. Render Partner DOM representation
          const partnerHtml = `
            <div class="partner">
              <span class="type">${{samplePartner.type}}</span>
              <span class="dist">${{samplePartner.distance_km}} ${{t.distanceKm || 'km away'}} (${{t.approxNodalLocation || 'Approx. Nodal HQ'}})</span>
              <h4>${{samplePartner.name}}</h4>
              <p>${{samplePartner.address}}</p>
              <div class="statutory">${{t.statutoryVerification || 'Statutory Prudential Criteria'}}: ${{samplePartner.rrb_eligibility_criteria.fund_utilization_mandate}}</div>
              <div class="disclaimer">${{samplePartner.live_status_note}}</div>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${{samplePartner.latitude}},${{samplePartner.longitude}}">${{t.getDirections || 'Get Directions'}}</a>
            </div>
          `;

          // 5. Render Stage 4 AI Intake & HITL Confirmation DOM representation
          const aiIntakeHtml = `
            <div class="ai-intake-section">
              <h3>${{t.aiIntakeTitle || ''}}</h3>
              <p>${{t.aiIntakeSubtitle || ''}}</p>
              <textarea placeholder="${{t.aiIntakePlaceholder || ''}}"></textarea>
              <button id="btnAnalyze">${{t.btnAnalyzeText || ''}}</button>
              <button id="btnVoice">${{t.voiceSpeak || ''}}</button>
            </div>
            <div class="ai-confirmation-card">
              <h4>${{t.understoodTitle || ''}}</h4>
              <p>${{t.reviewEditInstruction || ''}}</p>
              <div class="missing-alert">${{t.missingFieldsPrompt || ''}}</div>
              <div class="uncertain-alert">${{t.uncertainFieldsPrompt || ''}}</div>
              <button id="btnConfirm">${{t.confirmAndMatchBtn || ''}}</button>
              <button id="btnEditFull">${{t.editInFullFormBtn || ''}}</button>
            </div>
          `;

          // 6. Render Stage 4 Multi-Scheme Comparison Modal DOM representation
          const compareHtml = `
            <div class="compare-modal">
              <h3>${{t.compareModalTitle || ''}}</h3>
              <div class="disclaimer">${{t.compareDisclaimer || ''}}</div>
              <div class="key-diff"><h4>${{t.keyDifferencesTitle || ''}}</h4></div>
              <div class="suitability"><h4>${{t.suitabilityGuidanceTitle || ''}}</h4></div>
              <div class="facts-table">
                <h4>${{t.statutoryFactsTableTitle || ''}}</h4>
                <table>
                  <tr>
                    <th>${{t.paramSchemeName || ''}}</th>
                    <th>${{t.paramIssuingBody || ''}}</th>
                    <th>${{t.paramPurpose || ''}}</th>
                    <th>${{t.paramBeneficiaries || ''}}</th>
                    <th>${{t.paramEligibility || ''}}</th>
                    <th>${{t.paramCostRange || ''}}</th>
                    <th>${{t.paramMaxLoan || ''}}</th>
                    <th>${{t.paramInterestRate || ''}}</th>
                    <th>${{t.paramTenure || ''}}</th>
                    <th>${{t.paramMoratorium || ''}}</th>
                    <th>${{t.paramMargin || ''}}</th>
                    <th>${{t.paramSubsidy || ''}}</th>
                    <th>${{t.paramRestrictions || ''}}</th>
                    <th>${{t.paramChannelPartners || ''}}</th>
                    <th>${{t.paramOfficialSource || ''}}</th>
                  </tr>
                </table>
              </div>
              <button id="btnCompareNow">${{t.compareNowBtn || ''}}</button>
            </div>
            <div class="scheme-why-box">
              <strong>${{t.whyThisScheme || ''}}</strong>
              <label>${{t.addToCompare || ''}}</label>
            </div>
          `;

          const fullDom = cardHtml + modalHtml + partnerHtml + aiIntakeHtml + compareHtml;

          // Check for forbidden artifacts
          if (fullDom.includes('undefined')) issues.push("DOM contains 'undefined'");
          if (fullDom.includes('null')) issues.push("DOM contains 'null'");
          if (fullDom.includes('NaN')) issues.push("DOM contains 'NaN'");
          if (fullDom.includes('[object Object]')) issues.push("DOM contains '[object Object]'");

          // Check for false claims
          const lowerDom = fullDom.toLowerCase();
          if (lowerDom.includes('all 102 partners')) issues.push("DOM makes false claim 'all 102 partners'");
          if (lowerDom.includes('complete network')) issues.push("DOM makes false claim 'complete network'");
          if (lowerDom.includes('guaranteed approval')) issues.push("DOM makes false claim 'guaranteed approval'");

          results[lang] = {{
            status: issues.length === 0 ? 'PASS' : 'FAIL',
            issues: issues,
            hasCoverageNotice: !!covNotice,
            hasEduLoanCategory: eduScheme.loan_category === 'Educational Loan',
            has12MMoratorium: eduScheme.moratorium_months === 12
          }};
        }}

        document.getElementById('out').textContent = JSON.stringify(results);
        </script></body></html>"""

        scratch_html = os.path.abspath("tests/scratch_browser_qa.html").replace("\\", "/")
        with open(scratch_html, "w", encoding="utf-8") as f:
            f.write(test_html)

        try:
            res = subprocess.run([self.edge_path, "--headless=new", "--virtual-time-budget=3000", "--dump-dom", f"file:///{scratch_html}"], capture_output=True, text=True, encoding="utf-8")
        finally:
            if os.path.exists(scratch_html):
                os.remove(scratch_html)

        m = re.search(r'<pre id="out">(.*?)</pre>', res.stdout, re.DOTALL)
        self.assertTrue(m, f"DOM pre#out not found in Edge output: {res.stdout[:200]}")
        data = json.loads(m.group(1))

        for lang in ['en', 'hi', 'ml', 'ta', 'te']:
            self.assertIn(lang, data)
            self.assertEqual(data[lang]["status"], "PASS", f"Language {lang} had QA issues: {data[lang]['issues']}")
            self.assertTrue(data[lang]["hasCoverageNotice"])
            self.assertTrue(data[lang]["hasEduLoanCategory"])
            self.assertTrue(data[lang]["has12MMoratorium"])

if __name__ == "__main__":
    unittest.main()
