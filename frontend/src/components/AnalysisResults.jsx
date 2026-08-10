import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

export default function AnalysisResults({ data }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [bulletInput, setBulletInput] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [rewrites, setRewrites] = useState([]);
  const [loadingRewrite, setLoadingRewrite] = useState(false);

  const [coverLetter, setCoverLetter] = useState('');
  const [loadingCL, setLoadingCL] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('resume_history') || '[]');
    setHistory(saved);

    if (data && data.filename) {
      const newEntry = {
        id: Date.now(),
        filename: data.filename,
        date: new Date().toLocaleDateString(),
        score: data.ats_overall_score,
        jobMatch: data.job_match_score || 0,
        data: data
      };

      const exists = saved.some(item => item.filename === data.filename && item.score === data.ats_overall_score);
      if (!exists) {
        const updated = [newEntry, ...saved].slice(0, 10);
        setHistory(updated);
        localStorage.setItem('resume_history', JSON.stringify(updated));
      }
    }
  }, [data]);

  const downloadPDF = () => {
    const element = document.getElementById('report-container');
    const opt = {
      margin: 0.4,
      filename: `${data?.filename || 'Resume'}_Career_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleRewrite = async () => {
    if (!bulletInput.trim()) return;
    setLoadingRewrite(true);
    try {
      const res = await fetch('http://localhost:8000/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet_point: bulletInput, target_role: targetRole })
      });
      const result = await res.json();
      setRewrites(result.improved_options || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRewrite(false);
    }
  };

  const handleCoverLetter = async () => {
    if (!data?.raw_text) return;
    setLoadingCL(true);
    try {
      const res = await fetch('http://localhost:8000/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: data.raw_text, job_description: "" })
      });
      const result = await res.json();
      setCoverLetter(result.cover_letter || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCL(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    localStorage.removeItem('resume_history');
    setHistory([]);
  };

  if (!data) return null;

  return (
    <div style={containerStyle} className="animate-fade-in">
      {/* Top Header Card */}
      <div style={headerStyle} className="hover-glow">
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
            Resume Intelligence & Career Hub
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Auditing <span style={{ color: '#4f46e5', fontWeight: '600' }}>{data.filename || 'Uploaded Resume'}</span>
          </p>
        </div>
        <button onClick={downloadPDF} style={downloadBtnStyle} className="hover-glow">
          📥 Export Summary PDF
        </button>
      </div>

      {/* Navigation Tab Bar */}
      <div style={navStyle}>
        <button onClick={() => setActiveTab('overview')} style={tabStyle(activeTab === 'overview')}>
          🎯 ATS Overview
        </button>
        <button onClick={() => setActiveTab('rewriter')} style={tabStyle(activeTab === 'rewriter')}>
          ✨ Bullet Improver
        </button>
        <button onClick={() => setActiveTab('coverletter')} style={tabStyle(activeTab === 'coverletter')}>
          💌 Cover Letter
        </button>
        <button onClick={() => setActiveTab('history')} style={tabStyle(activeTab === 'history')}>
          📜 Scan History ({history.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SCORES */}
      {activeTab === 'overview' && (
        <div id="report-container" style={contentBoxStyle} className="animate-pop-in">
          {/* Main Hero Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
            <div style={heroCardStyle('#e0e7ff', '#3730a3', '#c7d2fe')} className="hover-glow">
              <span style={heroTagStyle('#c7d2fe', '#312e81')}>Overall ATS Readiness</span>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#1e1b4b', margin: '10px 0 2px 0' }}>
                {data.ats_overall_score}<span style={{ fontSize: '18px', color: '#4338ca' }}>/100</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#3730a3' }}>
                {data.ats_overall_score >= 80 ? '🌟 Highly optimized for recruiter screens.' : '💡 Strategic adjustments recommended.'}
              </p>
            </div>

            <div style={heroCardStyle('#dcfce7', '#166534', '#bbf7d0')} className="hover-glow">
              <span style={heroTagStyle('#bbf7d0', '#14532d')}>Role Match Confidence</span>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#064e3b', margin: '10px 0 2px 0' }}>
                {data.job_match_score || 75}%
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>
                Technical keyword alignment with target roles.
              </p>
            </div>
          </div>

          {/* Sub-Score Breakdown Meters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '26px' }}>
            <div style={subCardStyle} className="hover-glow">
              <span style={subLabelStyle}>Formatting & Layout</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                {data.breakdown?.formatting_score}%
              </div>
            </div>
            <div style={subCardStyle} className="hover-glow">
              <span style={subLabelStyle}>Relevance</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#4f46e5', marginTop: '4px' }}>
                {data.breakdown?.relevance_score}%
              </div>
            </div>
            <div style={subCardStyle} className="hover-glow">
              <span style={subLabelStyle}>Metrics & Impact</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
                {data.breakdown?.impact_score}%
              </div>
            </div>
          </div>

          {/* Keyword Match Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '26px' }}>
            <div style={badgeContainerStyle('#f0fdf4', '#16a34a', '#bbf7d0')}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#14532d' }}>✅ Detected Technical Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {data.matching_keywords?.map((kw, i) => (
                  <span key={i} style={chipStyle('#dcfce7', '#15803d')}>{kw}</span>
                ))}
              </div>
            </div>

            <div style={badgeContainerStyle('#fef2f2', '#dc2626', '#fecaca')}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#7f1d1d' }}>⚠️ Recommended Additions</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {data.missing_keywords?.map((kw, i) => (
                  <span key={i} style={chipStyle('#fee2e2', '#b91c1c')}>{kw}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Feedback */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', color: '#0f172a' }}>💡 Recommendations for Maximum Impact</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {data.suggestions?.map((tip, i) => (
                <div key={i} style={tipStyle} className="hover-glow">
                  <span style={{ fontSize: '16px', marginRight: '10px' }}>👉</span>
                  <span style={{ color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULLET REWRITER */}
      {activeTab === 'rewriter' && (
        <div style={contentBoxStyle} className="animate-pop-in">
          <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>✨ Interactive Bullet Point Improver</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
            Reframe basic project sentences into metric-driven statements using Google's X-Y-Z formula.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Target Job Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Full-Stack Developer / Software Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Original Bullet Point</label>
            <textarea
              rows={3}
              placeholder="e.g. Developed a web application for user authentication and dashboard tracking"
              value={bulletInput}
              onChange={(e) => setBulletInput(e.target.value)}
              style={textareaStyle}
            />
          </div>

          <button onClick={handleRewrite} disabled={loadingRewrite} style={primaryBtnStyle} className="hover-glow">
            {loadingRewrite ? '✨ Processing Options...' : 'Generate 3 Improved Options'}
          </button>

          {rewrites.length > 0 && (
            <div style={{ marginTop: '24px' }} className="animate-fade-in">
              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Select an Improved Version:</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                {rewrites.map((opt, i) => (
                  <div key={i} style={optionBoxStyle} className="hover-glow">
                    <p style={{ margin: 0, color: '#1e293b', fontSize: '14px', flex: 1, lineHeight: '1.5' }}>{opt}</p>
                    <button onClick={() => copyToClipboard(opt)} style={secondaryBtnStyle}>
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COVER LETTER */}
      {activeTab === 'coverletter' && (
        <div style={contentBoxStyle} className="animate-pop-in">
          <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>💌 AI Cover Letter Writer</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
            Generate a personalized 3-paragraph cover letter crafted from your resume experience.
          </p>

          {!coverLetter ? (
            <button onClick={handleCoverLetter} disabled={loadingCL} style={primaryBtnStyle} className="hover-glow">
              {loadingCL ? '✍️ Draft Cover Letter...' : 'Generate Cover Letter'}
            </button>
          ) : (
            <div className="animate-fade-in">
              <textarea
                rows={12}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                style={textareaStyle}
              />
              <button onClick={() => copyToClipboard(coverLetter)} style={primaryBtnStyle} className="hover-glow">
                {copied ? 'Copied to Clipboard! ✅' : 'Copy Cover Letter'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SCAN HISTORY */}
      {activeTab === 'history' && (
        <div style={contentBoxStyle} className="animate-pop-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>📜 Recent Resume Scans</h3>
            {history.length > 0 && (
              <button onClick={clearHistory} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No scan history found.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {history.map((item) => (
                <div key={item.id} style={historyRowStyle} className="hover-glow">
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.filename}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Scanned on {item.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#4f46e5' }}>{item.score}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>/100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Light Mode Modern Inline Styles
const containerStyle = {
  maxWidth: '860px',
  margin: '30px auto',
  color: '#0f172a'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '18px',
  background: '#ffffff',
  padding: '20px 24px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
};

const downloadBtnStyle = {
  padding: '10px 18px',
  background: '#0f172a',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '600',
  fontSize: '13px',
  cursor: 'pointer'
};

const navStyle = {
  display: 'flex',
  gap: '8px',
  marginBottom: '20px',
  background: '#f1f5f9',
  padding: '6px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0'
};

const tabStyle = (active) => ({
  flex: 1,
  padding: '10px 14px',
  borderRadius: '8px',
  border: 'none',
  background: active ? '#ffffff' : 'transparent',
  color: active ? '#4f46e5' : '#64748b',
  fontWeight: active ? '700' : '600',
  fontSize: '13px',
  cursor: 'pointer',
  boxShadow: active ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
  transition: 'all 0.15s ease'
});

const contentBoxStyle = {
  background: '#ffffff',
  padding: '26px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
};

const heroCardStyle = (bg, color, border) => ({
  background: bg,
  padding: '20px',
  borderRadius: '14px',
  border: `1px solid ${border}`
});

const heroTagStyle = (bg, color) => ({
  background: bg,
  color: color,
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.4px'
});

const subCardStyle = {
  background: '#f8fafc',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0'
};

const subLabelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const badgeContainerStyle = (bg, titleColor, border) => ({
  background: bg,
  padding: '16px',
  borderRadius: '14px',
  border: `1px solid ${border}`
});

const chipStyle = (bg, color) => ({
  background: bg,
  color: color,
  padding: '5px 12px',
  borderRadius: '16px',
  fontSize: '12px',
  fontWeight: '600'
});

const tipStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  background: '#f8fafc',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  marginBottom: '6px',
  color: '#334155'
};

const inputStyle = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none'
};

const textareaStyle = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  outline: 'none'
};

const primaryBtnStyle = {
  padding: '11px 22px',
  background: '#4f46e5',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '14px',
  cursor: 'pointer'
};

const secondaryBtnStyle = {
  padding: '6px 12px',
  background: '#e0e7ff',
  color: '#4338ca',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '12px',
  cursor: 'pointer'
};

const optionBoxStyle = {
  background: '#f8fafc',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px'
};

const historyRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 18px',
  background: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0'
};