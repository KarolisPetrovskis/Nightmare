import './ServiceManagement.css';
import '../Management.css';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import PaginationComponent from '../../components/Pagination/PaginationComponent';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';
import { useAuth } from '../../context/AuthContext';

type Service = {
  nid?: number;
  name: string;
  price: number;
  discount?: number;
  timeMin: number;
  vatId?: number;
  businessId?: number;
  discountTime?: string;
  description?: string;
};

type VatOption = {
  vatId: number;
  name: string;
  percentage: number;
};

export default function ServiceManagement() {
  const { businessId, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [vatOptions, setVatOptions] = useState<VatOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Service | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [page, setPage] = useState(1);
  const servicesPerPage = 7;

  const [vatDropdownOpen, setVatDropdownOpen] = useState(false);
  const [selectedVatOption, setSelectedVatOption] = useState<VatOption | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  const updateBusinessId = (id: number | null) => {
    setBusinessId(id);
    businessIdRef.current = id;
  };

  // Fetch business ID
  const fetchBusinessId = async (): Promise<number> => {
    try {
      const response = await fetch('/api/auth/businessId', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access services');
        }
        throw new Error(`Failed to get business ID: ${response.statusText}`);
      }

      const id = await response.json();
      setBusinessId(id);
      //console.log(id);
      return id;
    } catch (error) {
      console.error('Error fetching business ID:', error);
      throw error;
    }
  };

  // Fetch services
  const fetchServices = async (id: number) => {
    try {
      console.log(id);
      const response = await fetch(
        `/api/services?businessId=${id}&page=1&perPage=100`
      );
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  };
  // Fetch VAT options
  const fetchVatOptions = async () => {
    try {
      const response = await fetch(`/api/VAT?page=0&perPage=100`);
      if (!response.ok) throw new Error('Failed to fetch VAT options');
      const vatData = await response.json();

      // Map to required format
      const mappedVatOptions = vatData.map((vat: any) => ({
        vatId: vat.nid,
        name: vat.name,
        percentage: vat.percentage,
      }));

      setVatOptions(mappedVatOptions);

      // Set default VAT option
      if (mappedVatOptions.length > 0) {
        const defaultVat = mappedVatOptions[0];
        setSelectedVatOption(defaultVat);
      }
    } catch (error) {
      console.error('Error fetching VAT options:', error);
      setVatOptions([]);
    }
  };

  // Initial data loading.
  useEffect(() => {
    if (authLoading || !businessId) return;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const id = await fetchBusinessId();
        console.log('Id is this:', id);
        updateBusinessId(id);

        if (id === null) {
          throw new Error('Please login to access services');
          //navigate('/');
          //return;
        }

        //console.log('bus Id is this:', businessIdRef.current);

        await fetchServices(id);
        await fetchVatOptions();
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [businessId, authLoading]);

  // Update selected VAT when service changes
  useEffect(() => {
    if (selected?.vatId && vatOptions.length > 0) {
      const vatOption = vatOptions.find((vat) => vat.vatId === selected.vatId);
      if (vatOption) {
        setSelectedVatOption(vatOption);
      } else {
        // If VAT ID not found in options, use first one
        setSelectedVatOption(vatOptions[0]);
      }
    }
  }, [selected, vatOptions]);

  const paginatedServices = services.slice(
    (page - 1) * servicesPerPage,
    page * servicesPerPage
  );

  const handleNew = () => {
    const defaultVatId =
      vatOptions.length > 0 ? vatOptions[0].vatId : undefined;

    const s: Service = {
      nid: -1,
      name: '',
      price: 0,
      discount: 0,
      timeMin: 30,
      vatId: defaultVatId,
      businessId: businessId || undefined,
      description: '',
    };
    setSelected(s);
    setDirty(true);
  };

  const toggleDelete = () => setDeleteMode((d) => !d);

  const handleServiceClick = async (s: Service) => {
    if (deleteMode) {
      if (!s.nid) return;
      try {
        const response = await fetch(`/api/services/${s.nid}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete service');

        setServices((p) => p.filter((x) => x.nid !== s.nid));
        if (selected?.nid === s.nid) setSelected(null);

        setSnackbar({
          open: true,
          message: 'Service deleted',
          type: 'success',
        });
      } catch (error) {
        console.error('Error deleting service:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete service',
          type: 'error',
        });
      }
    } else {
      setSelected({ ...s });
      setDirty(false);
    }
  };

  const updateField = (k: keyof Service, value: any) => {
    if (!selected) return;
    const upd = { ...selected, [k]: value } as Service;
    setSelected(upd);
    setDirty(true);
  };

  const handleVatSelect = (vatOption: VatOption) => {
    setSelectedVatOption(vatOption);
    updateField('vatId', vatOption.vatId);
    setVatDropdownOpen(false);
  };

  const handleSave = async () => {
    if (!selected || !businessId) {
      setSnackbar({
        open: true,
        message: 'Business information not available',
        type: 'error',
      });
      return;
    }

    // Validation
    let errorMessage = '';
    if (!selected.name.trim()) errorMessage = 'Service name is required';
    else if (isNaN(selected.price) || selected.price <= 0)
      errorMessage = 'Valid price (>0) is required';
    else if (isNaN(selected.timeMin) || selected.timeMin <= 0)
      errorMessage = 'Valid service time (>0) is required';
    else if (!selected.vatId) errorMessage = 'VAT rate is required';

    if (errorMessage) {
      setSnackbar({
        open: true,
        message: errorMessage,
        type: 'error',
      });
      return;
    }

    try {
      const payload = {
        name: selected.name,
        price: selected.price,
        discount: selected.discount || 0,
        timeMin: selected.timeMin,
        vatId: selected.vatId,
        businessId: businessId,
        description: selected.description || null,
        ...(selected.discountTime && { discountTime: selected.discountTime }),
      };

      let response: Response;

      if (selected.nid === -1 || !selected.nid) {
        // Create
        response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create service');

        const newService = await response.json();
        setServices((p) => [...p, newService]);
        setSelected(newService);
      } else {
        // Update
        response = await fetch(`/api/services/${selected.nid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to update service');

        setServices((p) =>
          p.map((s) => (s.nid === selected.nid ? selected : s))
        );
      }

      setDirty(false);
      setSnackbar({
        open: true,
        message: 'Service saved successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving service:', error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to save service',
        type: 'error',
      });
    }
  };

  return (
    <div className="management service-management">
      <div className="item-list-container">
        <div className="item-actions">
          <Button className="item-action-button new-item" onClick={handleNew}>
            New Service
          </Button>
          <Button
            className={`item-action-button delete-item ${
              deleteMode ? 'active' : ''
            }`}
            onClick={toggleDelete}
          >
            Delete Services
          </Button>
        </div>

        <h3 className="item-list-label">Services</h3>

        <div className="item-list">
          {loading ? (
            <p style={{ opacity: 0.5 }}>Loading services...</p>
          ) : (
            paginatedServices.map((s) => (
              <div
                key={s.nid}
                className={`item-card ${
                  selected?.nid === s.nid ? 'selected' : ''
                }`}
                onClick={() => handleServiceClick(s)}
              >
                {s.name}
                {deleteMode && (
                  <span
                    className="delete-x"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!s.nid) return;

                      try {
                        const response = await fetch(`/api/services/${s.nid}`, {
                          method: 'DELETE',
                        });

                        if (!response.ok) throw new Error('Failed to delete');

                        setServices((p) => p.filter((x) => x.nid !== s.nid));
                        if (selected?.nid === s.nid) setSelected(null);

                        setSnackbar({
                          open: true,
                          message: 'Service deleted',
                          type: 'success',
                        });
                      } catch (error) {
                        console.error('Error deleting service:', error);
                        setSnackbar({
                          open: true,
                          message: 'Failed to delete service',
                          type: 'error',
                        });
                      }
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
            count={Math.ceil(services.length / servicesPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </div>
      </div>

      <div className="info-container">
        <h2 className="section-title">Service Management</h2>

        {!selected ? (
          <p style={{ opacity: 0.5 }}>Select or create a service.</p>
        ) : (
          <>
            <div className="service-top-grid">
              <div className="info-box">
                <label>Service name</label>
                <input
                  value={selected.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="info-box">
                <label>Service price</label>
                <input
                  type="number"
                  value={selected.price}
                  onChange={(e) =>
                    updateField('price', parseFloat(e.target.value || '0'))
                  }
                />
              </div>

              <div className="info-box">
                <label>Service discount (%)</label>
                <input
                  type="number"
                  value={selected.discount}
                  onChange={(e) =>
                    updateField('discount', parseFloat(e.target.value || '0'))
                  }
                />
              </div>

              <div className="info-box">
                <label>Service time to complete (min)</label>
                <input
                  type="number"
                  value={selected.timeMin}
                  onChange={(e) =>
                    updateField('timeMin', parseInt(e.target.value || '0'))
                  }
                />
              </div>

              {/* VAT Dropdown */}
              <div className="info-box">
                <label>VAT Rate</label>
                <div className="vat-dropdown-container">
                  <div
                    className="vat-dropdown-toggle"
                    onClick={() => setVatDropdownOpen(!vatDropdownOpen)}
                  >
                    {selectedVatOption ? (
                      <span>
                        {selectedVatOption.name} ({selectedVatOption.percentage}
                        %)
                      </span>
                    ) : (
                      <span>Select VAT rate</span>
                    )}
                    <span className="vat-dropdown-arrow">▼</span>
                  </div>

                  {vatDropdownOpen && vatOptions.length > 0 && (
                    <div className="vat-dropdown-menu">
                      {vatOptions.map((vat) => (
                        <div
                          key={vat.vatId}
                          className={`vat-dropdown-item ${
                            selectedVatOption?.vatId === vat.vatId
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() => handleVatSelect(vat)}
                        >
                          <span className="vat-name">{vat.name}</span>
                          <span className="vat-percentage">
                            {vat.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {vatDropdownOpen && vatOptions.length === 0 && (
                    <div className="vat-dropdown-menu">
                      <div className="vat-dropdown-item disabled">
                        No VAT options available
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-box">
                <label>Discount expiration date & time</label>
                <input
                  type="datetime-local"
                  value={
                    selected.discountTime
                      ? new Date(selected.discountTime)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      const localDate = new Date(e.target.value);
                      updateField('discountTime', localDate.toISOString());
                    } else {
                      updateField('discountTime', undefined);
                    }
                  }}
                />
              </div>
            </div>

            <div className="service-description">
              <label>Service description</label>
              <textarea
                value={selected.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {dirty && (
              <Button className={`save-button active`} onClick={handleSave}>
                Save
              </Button>
            )}
          </>
        )}
      </div>
      <SnackbarNotification
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        type={snackbar.type}
      />
    </div>
  );
}
