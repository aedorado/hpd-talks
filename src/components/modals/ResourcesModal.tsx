'use client';

import React from 'react';

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterUpadeshamrita: () => void;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = ({
  isOpen,
  onClose,
  onFilterUpadeshamrita,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal active" id="resourcesModal" aria-hidden="false" style={{ display: 'flex' }}>
      <div className="modal-overlay" id="resourcesOverlay" onClick={onClose}></div>
      <div className="modal-dialog modal-dialog-wide">
        <div className="modal-header">
          <h2 className="modal-title">📚 Companion Study Materials</h2>
          <button className="modal-close-btn" id="closeResourcesModalBtn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-text">
            Direct companion study notes, Q&amp;A transcripts, and seminar handouts to deepen your contemplation alongside
            the lectures:
          </p>

          <div className="resource-cards-list">
            {/* Upadeshamrita Resource Card */}
            <article className="resource-detail-card">
              <div className="resource-card-icon">📖</div>
              <div className="resource-card-body">
                <div className="resource-badges">
                  <span className="badge-category">Upadeshamrta (Seminar)</span>
                  <span className="badge-pdf">PDF Document</span>
                  <span className="badge-meta">421 Pages • 6.7 MB</span>
                </div>
                <h3 className="resource-card-title">Sri Upadeshamrita Q&amp;A (WhatsApp Group Compilation)</h3>
                <p className="resource-author">
                  Author: <strong>HG Hari Parshad Das</strong>
                </p>
                <p className="resource-description">
                  Exhaustive 421-page compilation of questions submitted by devotees and answered with granular scriptural
                  analysis by HG Hari Parshad Das throughout the multi-part Sri Upadeshamrita seminar. Covers deep
                  philosophical queries on verses 1 to 11, quoting commentaries of Srila Rupa Goswami, Srila Bhaktivinoda
                  Thakura, and Srila Bhaktisiddhanta Sarasvati Thakura.
                </p>
                <div className="resource-card-actions">
                  <a
                    href="/resources/Answers_HPD_Upadeshamritam_WhatsApp.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Open / Read PDF ↗
                  </a>
                  <a
                    href="/resources/Answers_HPD_Upadeshamritam_WhatsApp.pdf"
                    download="Answers_HPD_Upadeshamritam_WhatsApp.pdf"
                    className="btn btn-secondary btn-sm"
                  >
                    Download PDF (6.7 MB)
                  </a>
                  <button
                    className="btn btn-ghost btn-sm"
                    id="filterUpadeshamritaBtn"
                    onClick={() => {
                      onFilterUpadeshamrita();
                      onClose();
                    }}
                  >
                    View Upadeshamrita Talks (69) →
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
