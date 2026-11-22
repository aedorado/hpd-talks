'use client';

import React, { useRef } from 'react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  heardCount: number;
  totalLectures: number;
  starredCount: number;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onResetAll: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  heardCount,
  totalLectures,
  starredCount,
  onExport,
  onImportFile,
  onResetAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const remaining = Math.max(0, totalLectures - heardCount);

  return (
    <div className="modal active" id="backupModal" aria-hidden="false" style={{ display: 'flex' }}>
      <div className="modal-overlay" id="backupOverlay" onClick={onClose}></div>
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 className="modal-title">Progress &amp; Local Storage</h2>
          <button className="modal-close-btn" id="closeBackupModalBtn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-text">
            Your listening progress is saved locally in this browser. To transfer your progress to your phone or another
            device, export it as a file:
          </p>

          <div className="stats-summary-card">
            <div className="stat-box">
              <span className="stat-val" id="statTotalHeard">
                {heardCount}
              </span>
              <span className="stat-lbl">Talks Heard</span>
            </div>
            <div className="stat-box">
              <span className="stat-val" id="statTotalRemaining">
                {remaining}
              </span>
              <span className="stat-lbl">Remaining</span>
            </div>
            <div className="stat-box">
              <span className="stat-val" id="statTotalFavorites">
                {starredCount}
              </span>
              <span className="stat-lbl">Favorites</span>
            </div>
          </div>

          <div className="backup-actions">
            <div className="backup-card">
              <h4>Export Progress</h4>
              <p>Download a backup JSON file containing your heard talks and favorites.</p>
              <button className="btn btn-secondary w-full" id="exportDataBtn" onClick={onExport}>
                Download Progress Backup (.json)
              </button>
            </div>

            <div className="backup-card">
              <h4>Import Progress</h4>
              <p>Restore your saved progress from a previously downloaded backup JSON file.</p>
              <label className="btn btn-secondary w-full file-upload-btn">
                Choose Backup File
                <input
                  ref={fileInputRef}
                  type="file"
                  id="importFileInput"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onImportFile(e.target.files[0]);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="danger-zone">
            <button
              className="btn btn-danger btn-sm"
              id="resetProgressBtn"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all your listening progress? This cannot be undone.')) {
                  onResetAll();
                }
              }}
            >
              Reset All Heard Talks (Clear Local Storage)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
