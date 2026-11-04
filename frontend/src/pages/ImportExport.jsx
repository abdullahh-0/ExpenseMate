import React, { useState } from 'react';
import Icon from '../components/Icon';
import { api } from '../services/api';

export default function ImportExport({ onRefresh }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null);
      setImportSuccess(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      alert('Please select an Excel (.xlsx) or CSV file first.');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.previewImport(formData);
      if (res && res.success) {
        setPreviewData(res);
      } else {
        alert(res?.message || 'Failed to process file preview.');
      }
    } catch (err) {
      alert('Failed to process file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    const rawRecords = previewData?.validRecords || [];
    if (rawRecords.length === 0) {
      alert('No valid records to import.');
      return;
    }

    const recordsToImport = rawRecords.map(r => ({
      date: r.date,
      description: r.description,
      category: r.category || r.suggestedCategoryName || 'Other',
      type: r.type,
      amount: r.amount,
      currency: r.currency || 'PKR'
    }));

    try {
      setLoading(true);
      const res = await api.confirmImport(recordsToImport);
      if (res && res.success) {
        setImportSuccess(res);
        setPreviewData(null);
        setFile(null);
        onRefresh && onRefresh();
      } else {
        alert(res?.message || 'Database import failed.');
      }
    } catch (err) {
      alert('Failed to import records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const summary = previewData?.summary || {
    totalRows: previewData?.totalRows || 0,
    validCount: previewData?.validRecords?.length || 0,
    invalidCount: previewData?.invalidRecords?.length || 0
  };

  const previewRows = previewData?.previewRows || [
    ...(previewData?.validRecords || []),
    ...(previewData?.invalidRecords || [])
  ];

  return (
    <div className="content">
      {/* Header */}
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span></span> DATA MANAGEMENT
          </div>
          <div className="page-title" role="heading" aria-level={1}>
            Import & Export
          </div>
          <p>Upload Excel / CSV datasets with schema validation or export your full ledger.</p>
        </div>
      </section>

      {/* Action Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Import Panel */}
        <article className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="panel-header">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                Import Excel / CSV Dataset
              </div>
              <p>Upload <code>ExpenseMate_Dummy_Dataset_180.xlsx</code> or custom CSV</p>
            </div>
            <div className="mini-icon lavender">
              <Icon name="upload" size={18} />
            </div>
          </div>

          <div style={{
            border: '2px dashed var(--line)',
            borderRadius: 'var(--radius-sm)',
            padding: '24px',
            textAlign: 'center',
            background: 'var(--canvas)',
            cursor: 'pointer'
          }}>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              id="file-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Icon name="fileSpreadsheet" size={28} />
              <strong style={{ fontSize: '13px' }}>
                {file ? file.name : 'Click to select Excel (.xlsx) or CSV file'}
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                Automatically parses rows and checks schema constraints
              </span>
            </label>
          </div>

          <button
            onClick={handlePreview}
            disabled={!file || loading}
            className="primary-button"
            style={{ width: '100%', marginTop: 'auto' }}
          >
            {loading ? 'Processing Dataset...' : 'Upload & Preview Dataset'}
          </button>
        </article>

        {/* Export Panel */}
        <article className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="panel-header">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                Export CSV Ledger
              </div>
              <p>Download full transaction history as formatted spreadsheet</p>
            </div>
            <div className="mini-icon mint">
              <Icon name="download" size={18} />
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, margin: '8px 0' }}>
            Export all stored income and expense entries directly from the database into a standard comma-separated (.csv) file compatible with Excel, Google Sheets, and accounting software.
          </p>

          <a
            href={api.getExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-button"
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: 'var(--ink)'
            }}
          >
            <Icon name="download" size={16} /> Export All Ledger Data (CSV)
          </a>
        </article>
      </div>

      {/* Success Notification */}
      {importSuccess && (
        <div style={{
          background: 'var(--mint)',
          border: '1px solid #b7ecd3',
          color: 'var(--mint-ink)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Icon name="check" size={20} />
          <div>
            <strong>Import Successful!</strong>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              Successfully imported {importSuccess.importedCount} transactions into the database. You can now view them on Overview and Transactions.
            </div>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {previewData && (
        <article className="panel">
          <div className="panel-header" style={{ marginBottom: '16px' }}>
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                Dataset Preview ({summary.totalRows} rows)
              </div>
              <p>
                Valid: <strong style={{ color: 'var(--mint-ink)' }}>{summary.validCount}</strong> • Invalid: <strong style={{ color: 'var(--coral-ink)' }}>{summary.invalidCount}</strong>
              </p>
            </div>
            <button
              onClick={handleConfirmImport}
              disabled={loading || summary.validCount === 0}
              className="primary-button"
            >
              <Icon name="check" size={16} /> Confirm & Import {summary.validCount} Records
            </button>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {previewRows.slice(0, 50).map((row, idx) => (
              <div
                key={idx}
                className="transaction-row"
                style={{
                  gridTemplateColumns: '40px 80px 90px 80px 1fr 120px 90px',
                  background: !row.isValid ? 'rgba(217, 98, 67, 0.05)' : 'transparent'
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--faint)' }}>#{row.rowNumber || idx + 1}</div>
                <div>
                  <span className={`badge ${row.isValid ? 'badge-mint' : 'badge-coral'}`}>
                    {row.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <div className="transaction-date">{row.date || 'N/A'}</div>
                <div style={{ textTransform: 'capitalize', fontSize: '10px' }}>{row.type}</div>
                <div className="transaction-info">
                  <strong>{row.description}</strong>
                  <span>{row.category || row.suggestedCategoryName || 'Uncategorized'}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {row.errors ? row.errors.join(', ') : 'Ready to import'}
                </div>
                <div className="transaction-amount">
                  {row.currency} {Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          {previewRows.length > 50 && (
            <div style={{ textAlign: 'center', padding: '12px', fontSize: '11px', color: 'var(--muted)' }}>
              Showing first 50 rows. All {summary.validCount} valid records will be committed when clicking Confirm.
            </div>
          )}
        </article>
      )}
    </div>
  );
}
