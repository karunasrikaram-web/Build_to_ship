import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, User, Mail, ShieldAlert, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function ComplaintDetailModal({ complaint, onClose, onStatusUpdated }) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [currentStatus, setCurrentStatus] = useState(complaint.status);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaint.id);

      if (error) throw error;

      setCurrentStatus(newStatus);
      setUpdateSuccess(true);
      if (onStatusUpdated) {
        onStatusUpdated(complaint.id, newStatus);
      }
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setUpdateError(err.message || 'Error updating complaint status.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="category-tag">{complaint.category}</span>
              <span className={`badge badge-${currentStatus.toLowerCase().replace(' ', '-')}`}>
                ● {currentStatus}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Complaint Details
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Title
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {complaint.title}
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Description
            </div>
            <div
              style={{
                marginTop: '0.35rem',
                padding: '0.85rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {complaint.description}
            </div>
          </div>

          {/* Meta details grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                <MapPin size={14} color="var(--primary)" />
                <span>LOCATION</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem', color: 'var(--text-main)' }}>
                {complaint.location}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                <Calendar size={14} />
                <span>DATE LODGED</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '0.25rem', color: 'var(--text-main)' }}>
                {formatDate(complaint.created_at)}
              </div>
            </div>

            {complaint.profiles && (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <User size={14} />
                    <span>STUDENT NAME</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem', color: 'var(--text-main)' }}>
                    {complaint.profiles.name || 'Unknown'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Mail size={14} />
                    <span>STUDENT EMAIL</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '0.25rem', color: 'var(--text-main)' }}>
                    {complaint.profiles.email || 'N/A'}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Admin Status Management Action Box */}
          {isAdmin ? (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid #bfdbfe',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ShieldAlert size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                  Administrator Resolution Controls
                </span>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Update the complaint status to inform the student of current progress:
              </p>

              {updateError && (
                <div style={{ color: '#dc2626', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                  {updateError}
                </div>
              )}

              {updateSuccess && (
                <div style={{ color: '#16a34a', fontSize: '0.825rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Check size={14} /> Status updated successfully!
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Pending', 'In Progress', 'Resolved'].map((statusOption) => (
                  <button
                    key={statusOption}
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange(statusOption)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      border: currentStatus === statusOption ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: currentStatus === statusOption ? 'var(--primary)' : '#ffffff',
                      color: currentStatus === statusOption ? '#ffffff' : 'var(--text-main)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: '#f1f5f9',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                color: 'var(--text-muted)',
              }}
            >
              Status updates are managed by the college administrative maintenance department.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: '#e2e8f0',
              color: 'var(--text-main)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

