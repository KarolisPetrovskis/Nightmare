import "./ServiceManagement.css";
import "./Management.css";
import Button from "@mui/material/Button";
import { useState } from "react";

type Service = {
    id: number;
    name: string;
    price: number;
    discount: number; 
    durationMinutes: number;
    discountExpires?: string; 
    description?: string;
};

export default function ServiceManagement() {
    const [services, setServices] = useState<Service[]>([
        // { id: 1, name: "Service #1", price: 12, discount: 0, durationMinutes: 30, description: "" }, Example of added service
    ]);

    const [selected, setSelected] = useState<Service | null>(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const [dirty, setDirty] = useState(false);

    const handleNew = () => {
        const s: Service = { id: Date.now(), name: "New Service", price: 0, discount: 0, durationMinutes: 30, description: "" };
        setServices((p) => [...p, s]);
        setSelected(s);
        setDirty(true);
    };

    const toggleDelete = () => setDeleteMode((d) => !d);

    const handleServiceClick = (s: Service) => {
        if (deleteMode) {
            setServices((p) => p.filter(x => x.id !== s.id));
            if (selected?.id === s.id) setSelected(null);
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

    const handleSave = () => {
        if (!selected) return;
        setServices((p) => p.map(s => s.id === selected.id ? selected : s));
        setDirty(false);
    };

    return (
        <div className="management">
            <div className="item-list-container">
                <div className="item-actions">
                    <Button className="item-action-button new-item" onClick={handleNew}>New Service</Button>
                    <Button className={`item-action-button delete-item ${deleteMode ? 'active' : ''}`} onClick={toggleDelete}>Delete current Service</Button>
                </div>

                <h3 className="item-list-label">Services</h3>

                <div className="item-list">
                    {services.map(s => (
                        <div key={s.id} className={`item-card ${selected?.id === s.id ? 'selected' : ''}`} onClick={() => handleServiceClick(s)}>
                            {s.name}
                        </div>
                    ))}
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
                                <input type="number" value={selected.durationMinutes} onChange={(e) => updateField('durationMinutes', parseInt(e.target.value || '0'))} />
                            </div>

                            <div className="info-box">
                                <label>Discount expiration date</label>
                                <input type="date" value={selected.discountExpires || ''} onChange={(e) => updateField('discountExpires', e.target.value)} />
                            </div>
                        </div>

                        <div className="service-description">
                            <h3>Service description</h3>
                            <textarea value={selected.description} onChange={(e) => updateField('description', e.target.value)} />
                        </div>

                        {dirty && (
                            <Button className={`save-button active`} onClick={handleSave}>Save</Button>
                        )}
                    </>)}
            </div>

        </div>
    );
}
