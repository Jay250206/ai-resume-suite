import React, { useState } from 'react';

export default function ResumeUploader({ onAnalyze, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <div style={wrapperStyle} className="animate-fade-in">
      {/* Hero Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={badgeStyle}>🚀 AI-Powered Career Intelligence</span>
        <h1 style={mainTitleStyle}>Optimize Your Resume for Top ATS Systems</h1>
        <p style={subtitleStyle}>
          Upload your resume to receive instant feedback, score metrics, keyword matching, and bullet point enhancements.
        </p>
      </div>

      {/* Main Upload Card */}
      <div style={cardStyle} className="hover-glow">
        <div style={cardHeaderStyle}>
          <div style={iconBadgeStyle}>📄</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              Resume Analyzer
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Supports PDF or DOCX files up to 10MB
            </p>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={dropzoneStyle(isDragging, Boolean(selectedFile))}
        >
          <input
            type="file"
            id="fileInput"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="fileInput" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
            <div style={cloudIconStyle}>{selectedFile ? '✅' : '☁️'}</div>

            {selectedFile ? (
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '15px', color: '#4f46e5' }}>
                  {selectedFile.name}
                </p>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                </span>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 6px 0', fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>
                  Click to upload <span style={{ color: '#64748b', fontWeight: '400' }}>or drag and drop</span>
                </p>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  PDF, DOCX, or TXT (Max 10MB)
                </span>
              </div>
            )}
          </label>
        </div>

        {/* Start Analysis Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          style={buttonStyle(!selectedFile || loading)}
          className="hover-glow"
        >
          {loading ? '⚡ Analyzing Resume Content...' : 'Start AI Analysis'}
        </button>
      </div>

      {/* Feature Highlights */}
      <div style={featuresGridStyle}>
        <div style={featureCardStyle}>
          <span style={{ fontSize: '18px' }}>🎯</span>
          <div>
            <strong style={featureTitleStyle}>ATS Keyword Audit</strong>
            <p style={featureDescStyle}>Identifies missing skills required for target roles.</p>
          </div>
        </div>
        <div style={featureCardStyle}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <div>
            <strong style={featureTitleStyle}>Google X-Y-Z Rewriter</strong>
            <p style={featureDescStyle}>Reframes bullet points using metrics & action verbs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Light SaaS Theme Styles
const wrapperStyle = {
  maxWidth: '680px',
  margin: '40px auto',
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  padding: '0 16px'
};

const badgeStyle = {
  background: '#e0e7ff',
  color: '#4338ca',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '700',
  display: 'inline-block',
  marginBottom: '12px'
};

const mainTitleStyle = {
  fontSize: '28px',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0 0 10px 0',
  letterSpacing: '-0.5px'
};

const subtitleStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 auto',
  maxWidth: '520px',
  lineHeight: '1.6'
};

const cardStyle = {
  background: '#ffffff',
  padding: '28px',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
  marginBottom: '24px'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px'
};

const iconBadgeStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  background: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px'
};

const dropzoneStyle = (isDragging, hasFile) => ({
  border: `1.5px solid ${isDragging ? '#4f46e5' : hasFile ? '#818cf8' : '#e2e8f0'}`,
  background: isDragging ? '#e0e7ff' : hasFile ? '#f5f3ff' : '#f8fafc',
  padding: '36px 20px',
  borderRadius: '16px',
  textAlign: 'center',
  transition: 'all 0.2s ease',
  marginBottom: '20px',
  cursor: 'pointer',
  boxShadow: isDragging ? '0 0 0 4px rgba(79, 70, 229, 0.1)' : 'none'
});

const cloudIconStyle = {
  fontSize: '32px',
  marginBottom: '10px'
};

const buttonStyle = (disabled) => ({
  width: '100%',
  padding: '14px',
  background: disabled
    ? '#94a3b8'
    : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '700',
  fontSize: '15px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  boxShadow: disabled ? 'none' : '0 4px 14px rgba(79, 70, 229, 0.3)',
  transition: 'all 0.2s ease'
});

const featuresGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px'
};

const featureCardStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  background: '#ffffff',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0'
};

const featureTitleStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '700',
  color: '#0f172a'
};

const featureDescStyle = {
  margin: '2px 0 0 0',
  fontSize: '12px',
  color: '#64748b',
  lineHeight: '1.4'
};