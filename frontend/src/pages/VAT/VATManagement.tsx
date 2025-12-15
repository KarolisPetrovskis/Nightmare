import '../Management.css';
import './VATManagement.css';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';

type VatItem = {
  nid: number;
  name: string;
  percentage: number | null;
  dateCreated: string;
};

export default function VATManagement() {
  const [vatItems, setVatItems] = useState<VatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVat, setSelectedVat] = useState<VatItem | null>(null);
  const [editableVat, setEditableVat] = useState<VatItem | null>(null);
  const [dirty, setDirty] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [page, setPage] = useState(1);
  const vatPerPage = 7;
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [vatToDelete, setVatToDelete] = useState<VatItem | null>(null);

  // Load VAT items
  useEffect(() => {
    const loadVATItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/VAT?page=0&perPage=100`);
        if (!response.ok) throw new Error('Failed to fetch VAT rates');
        const data = await response.json();
        setVatItems(data);
      } catch (error) {
        console.error('Error loading VAT items:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load VAT rates',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadVATItems();
  }, []);

  // Update dirty state
  useEffect(() => {
    if (!editableVat || !selectedVat) {
      setDirty(false);
      return;
    }

    const isDirty =
      editableVat.name !== selectedVat.name ||
      editableVat.percentage !== selectedVat.percentage;

    setDirty(isDirty);
  }, [editableVat, selectedVat]);

  const handleNewVat = () => {
    const emptyVat: VatItem = {
      nid: -1,
      name: '',
      percentage: null,
      dateCreated: new Date().toISOString(),
    };

    setSelectedVat(emptyVat);
    setEditableVat(emptyVat);
    setDirty(false);
  };

  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
  };

  const handleVatClick = (vat: VatItem) => {
    if (deleteMode) {
      setVatToDelete(vat);
      setConfirmDeleteOpen(true);
    } else {
      setSelectedVat(vat);
      setEditableVat({ ...vat });
      setDirty(false);
    }
  };

  const updateField = (key: keyof VatItem, value: string | number | null) => {
    setEditableVat((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!editableVat) return;

    // Validation
    let errorMessage = '';
    if (!editableVat.name.trim()) {
      errorMessage = 'VAT name is required';
    } else if (
      editableVat.percentage !== null &&
      (isNaN(Number(editableVat.percentage)) ||
        editableVat.percentage < 0 ||
        editableVat.percentage > 100)
    ) {
      errorMessage = 'Percentage must be between 0 and 100';
    }

    if (errorMessage) {
      setSnackbar({
        open: true,
        message: errorMessage,
        type: 'error',
      });
      return;
    }

    try {
      if (editableVat.nid === -1) {
        // Create new VAT
        const payload = {
          name: editableVat.name,
          percentage:
            editableVat.percentage === null ? 0 : editableVat.percentage,
        };

        const response = await fetch('/api/VAT', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create VAT rate');

        const newVat = await response.json();
        setVatItems((prev) => [...prev, newVat]);
        setSelectedVat(newVat);
        setEditableVat(newVat);
      } else {
        // Update existing VAT
        const payload = {
          name: editableVat.name,
          percentage:
            editableVat.percentage === null ? 0 : editableVat.percentage,
        };

        const response = await fetch(`/api/VAT/${editableVat.nid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to update VAT rate');

        setVatItems((prev) =>
          prev.map((v) => (v.nid === editableVat.nid ? editableVat : v))
        );
      }

      setDirty(false);
      setSnackbar({
        open: true,
        message: 'VAT rate saved successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving VAT:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save VAT rate',
        type: 'error',
      });
    }
  };

  const confirmDelete = async () => {
    if (!vatToDelete) return;

    try {
      const response = await fetch(`/api/VAT/${vatToDelete.nid}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete VAT rate');

      setVatItems((prev) => prev.filter((v) => v.nid !== vatToDelete.nid));

      if (selectedVat?.nid === vatToDelete.nid) {
        setSelectedVat(null);
        setEditableVat(null);
        setDirty(false);
      }

      setSnackbar({
        open: true,
        message: 'VAT rate deleted successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete VAT rate',
        type: 'error',
      });
    } finally {
      setConfirmDeleteOpen(false);
      setVatToDelete(null);
      setDeleteMode(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setVatToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const paginatedVats = vatItems.slice(
    (page - 1) * vatPerPage,
    page * vatPerPage
  );

  return (
    <div className="management">
      <div className="item-list-container">
        <div className="item-actions">
          <Button
            className="item-action-button new-item"
            onClick={handleNewVat}
          >
            New VAT Rate
          </Button>

          <Button
            className={`item-action-button delete-item ${
              deleteMode ? 'active' : ''
            }`}
            onClick={toggleDeleteMode}
          >
            Delete VAT Rates
          </Button>
        </div>

        <h3 className="item-list-label">VAT Rates</h3>
        <div className="item-list">
          {loading ? (
            <p style={{ opacity: 0.5, padding: '20px' }}>
              Loading VAT rates...
            </p>
          ) : vatItems.length === 0 ? (
            <p style={{ opacity: 0.5, padding: '20px' }}>
              No VAT rates found. Create one!
            </p>
          ) : (
            paginatedVats.map((vat) => (
              <div
                key={vat.nid}
                className={`item-card ${
                  selectedVat?.nid === vat.nid ? 'selected' : ''
                }`}
                onClick={() => handleVatClick(vat)}
              >
                <div className="vat-item-content">
                  <div className="vat-name">{vat.name}</div>
                  <div className="vat-percentage-display">
                    {vat.percentage === null ? 'Exempt' : `${vat.percentage}%`}
                  </div>
                  <div className="vat-date">
                    Created: {formatDate(vat.dateCreated)}
                  </div>
                </div>
                {deleteMode && (
                  <span
                    className="delete-x"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVatToDelete(vat);
                      setConfirmDeleteOpen(true);
                    }}
                  >
                    ✖
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="item-list-pagination">
          <PaginationComponent
            count={Math.ceil(vatItems.length / vatPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </div>
      </div>

      <div className="info-container">
        <h2 className="section-title">VAT Rate Information</h2>
        {!editableVat ? (
          <p style={{ opacity: 0.5 }}>Select or create a VAT rate.</p>
        ) : (
          <>
            <div className="info-grid">
              <div className="info-box">
                <label>VAT Rate Name</label>
                <input
                  type="text"
                  value={editableVat.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Standard, Reduced, Exempt"
                />
              </div>

              <div className="info-box">
                <label>Percentage (%)</label>
                <input
                  type="number"
                  placeholder="Leave empty for exempt"
                  min="0"
                  max="100"
                  step="0.1"
                  value={
                    editableVat.percentage === null
                      ? ''
                      : editableVat.percentage
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    updateField(
                      'percentage',
                      value === '' ? null : parseFloat(value)
                    );
                  }}
                />
                <small style={{ color: '#888', fontSize: '0.8rem' }}>
                  Leave empty or set to 0 for exempt/0% VAT
                </small>
              </div>

              {editableVat.nid !== -1 && (
                <div className="info-box">
                  <label>Date Created</label>
                  <div className="readonly-field">
                    {formatDate(editableVat.dateCreated)}
                  </div>
                </div>
              )}
            </div>

            <Button
              className={`save-button ${dirty ? 'active' : ''}`}
              disabled={!dirty}
              onClick={handleSave}
            >
              Save
            </Button>
          </>
        )}
      </div>

      {confirmDeleteOpen && vatToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div
            className="modal-content option-tree-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400 }}
          >
            <div className="option-tree-header" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Confirm Delete</h3>
              <button
                className="delete-tree modal-close"
                onClick={cancelDelete}
              >
                ✖
              </button>
            </div>

            <p style={{ marginBottom: 24, fontSize: '1rem' }}>
              Are you sure you want to delete the VAT rate "{vatToDelete.name}"?
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <Button
                className="item-action-button new-item"
                onClick={cancelDelete}
              >
                Cancel
              </Button>

              <Button
                onClick={confirmDelete}
                sx={{
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#bb2929ff' },
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <SnackbarNotification
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        type={snackbar.type}
      />
    </div>
  );
}
