import "./ServiceManagement.css";
import "../Management.css";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import PaginationComponent from "../../components/Pagination/PaginationComponent";
import SnackbarNotification from "../../components/SnackBar/SnackNotification";

type Service = {
    nid?: number;
    name: string;
    price: number;
    discount?: number;
    timeMin: number;
    vatId?: number;
    businessId?: number;
    discountTime?: string; // ISO datetime string (e.g., "2025-12-25T00:00:00Z")
    description?: string;
};

// Mock businessId - in production, get this from user context/auth
const MOCK_BUSINESS_ID = 1;
const MOCK_VAT_ID = 1;

export default function ServiceManagement() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState<Service | null>(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const [dirty, setDirty] = useState(false);

    const [page, setPage] = useState(1);
    const servicesPerPage = 7;

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        open: false,
        message: '',
        type: 'success',
    });

    // Fetch services from API on component mount
    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/services?businessId=${MOCK_BUSINESS_ID}&page=1&perPage=100`);
                if (!response.ok) throw new Error('Failed to fetch services');
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to load services',
                    type: 'error',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const paginatedServices = services.slice(
        (page - 1) * servicesPerPage,
        page * servicesPerPage
    );

    const handleNew = () => {
        const s: Service = { 
            nid: -1, 
            name: "", 
            price: 0, 
            discount: 0, 
            timeMin: 30, 
            vatId: MOCK_VAT_ID,
            businessId: MOCK_BUSINESS_ID,
            description: "" 
        };
        setSelected(s);
        setDirty(true);
    };

    const toggleDelete = () => setDeleteMode((d) => !d);

    const handleServiceClick = (s: Service) => {
        if (deleteMode) {
            if (!s.nid) return;
            // Delete from API
            fetch(`/api/services/${s.nid}`, { method: 'DELETE' })
                .then(() => {
                    setServices((p) => p.filter(x => x.nid !== s.nid));
                    if (selected?.nid === s.nid) setSelected(null);
                    setSnackbar({
                        open: true,
                        message: 'Service deleted',
                        type: 'success',
                    });
                })
                .catch((error) => {
                    console.error('Error deleting service:', error);
                    setSnackbar({
                        open: true,
                        message: 'Failed to delete service',
                        type: 'error',
                    });
                });
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

    const handleSave = async () => {
        if (!selected) return;

        let errorMessage = '';
        if (!selected.name.trim() || isNaN(selected.price) || selected.price <= 0 || isNaN(selected.timeMin) || selected.timeMin <= 0) {
            errorMessage = 'Service name, valid price (>0), and service time (>0) are required.';
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

            if (selected.nid === -1 || !selected.nid) {
                // Create new service
                const createPayload = {
                    name: selected.name,
                    price: selected.price,
                    discount: selected.discount || 0,
                    timeMin: selected.timeMin,
                    vatId: MOCK_VAT_ID,
                    businessId: MOCK_BUSINESS_ID,
                    description: selected.description || null,
                    ...(selected.discountTime && { discountTime: selected.discountTime }),
                };
                const response = await fetch('/api/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(createPayload),
                });
                if (!response.ok) throw new Error('Failed to create service');
                const newService = await response.json();
                setServices((p) => [...p, newService]);
                setSelected(newService);
            } else {
                // Update existing service
                const updatePayload = {
                    name: selected.name,
                    price: selected.price,
                    discount: selected.discount,
                    timeMin: selected.timeMin,
                    vatId: MOCK_VAT_ID,
                    description: selected.description || null,
                    ...(selected.discountTime && { discountTime: selected.discountTime }),
                };
                const response = await fetch(`/api/services/${selected.nid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload),
                });
                if (!response.ok) throw new Error('Failed to update service');
                setServices((p) => p.map(s => s.nid === selected.nid ? selected : s));
                setSelected(selected);
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
                message: 'Failed to save service',
                type: 'error',
            });
        }
    };

    return (
        <div className="management service-management">
            <div className="item-list-container">
                <div className="item-actions">
                    <Button className="item-action-button new-item" onClick={handleNew}>New Service</Button>
                    <Button className={`item-action-button delete-item ${deleteMode ? 'active' : ''}`} onClick={toggleDelete}>Delete Services</Button>
                </div>

                <h3 className="item-list-label">Services</h3>

                <div className="item-list">
                    {loading ? (
                        <p style={{ opacity: 0.5 }}>Loading services...</p>
                    ) : (
                        paginatedServices.map(s => (
                            <div key={s.nid} className={`item-card ${selected?.nid === s.nid ? 'selected' : ''}`} onClick={() => handleServiceClick(s)}>
                                {s.name}
                                {deleteMode && (
                                    <span
                                        className="delete-x"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!s.nid) return;
                                            fetch(`/api/services/${s.nid}`, { method: 'DELETE' })
                                                .then(() => {
                                                    setServices((p) => p.filter(x => x.nid !== s.nid));
                                                    if (selected?.nid === s.nid) setSelected(null);
                                                    setSnackbar({
                                                        open: true,
                                                        message: 'Service deleted',
                                                        type: 'success',
                                                    });
                                                })
                                                .catch((error) => {
                                                    console.error('Error deleting service:', error);
                                                    setSnackbar({
                                                        open: true,
                                                        message: 'Failed to delete service',
                                                        type: 'error',
                                                    });
                                                });
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
                        onChange={(_, value) => setPage(value)} // TODO: change _ back to e if event is needed
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
                                <input value={selected.name} onChange={(e) => updateField('name', e.target.value)} />
                            </div>

                            <div className="info-box">
                                <label>Service price</label>
                                <input type="number" value={selected.price} onChange={(e) => updateField('price', parseFloat(e.target.value || '0'))} />
                            </div>

                            <div className="info-box">
                                <label>Service discount (%)</label>
                                <input type="number" value={selected.discount} onChange={(e) => updateField('discount', parseFloat(e.target.value || '0'))} />
                            </div>

                            <div className="info-box">
                                <label>Service time to complete (min)</label>
                                <input type="number" value={selected.timeMin} onChange={(e) => updateField('timeMin', parseInt(e.target.value || '0'))} />
                            </div>

                            <div className="info-box">
                                <label>Discount expiration date & time</label>
                                <input 
                                    type="datetime-local" 
                                    value={selected.discountTime ? new Date(selected.discountTime).toISOString().slice(0, 16) : ''} 
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            // Convert datetime-local to ISO datetime string
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
                            <textarea value={selected.description} onChange={(e) => updateField('description', e.target.value)} />
                        </div>

                        {dirty && (
                            <Button className={`save-button active`} onClick={handleSave}>Save</Button>
                        )}
                    </>)}
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