import "./WorkerManagement.css";
import Button from "@mui/material/Button";
import { useState } from "react";

type Worker = {
  id: number;
  name: string;
  surname: string;
  password: string;
  phone?: string;
  email?: string;
  Salary: string;
};

// Mock data constants
const SAMPLE_WORKERS: Worker[] = [
  { id: 1, name: "John Smith", surname: "Smith", password: "password123", phone: "+37067676", email: "jsmith67@gmail.com", Salary: "50000" },
  { id: 2, name: "Jane Doe", surname: "Doe", password: "password456", phone: "+37048165", email: "jdoe@gmail.com", Salary: "55000" },
];

export default function WorkerManagement() {
  const [workers, setWorkers] = useState<Worker[]>(SAMPLE_WORKERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWorker, setCurrentWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState<Worker>({ id: 0, name: '', surname: '', password: '', phone: '', email: '', Salary: '' });

  const handleNew = () => {
    setCurrentWorker(null);
    setFormData({ id: Date.now(), name: '', surname: '', password: '', phone: '', email: '', Salary: '' });
    setIsModalOpen(true);
  };

  const handleMoreDetails = (w: Worker) => {
    setCurrentWorker(w);
    setFormData({ ...w });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentWorker(null);
    setFormData({ id: 0, name: '', surname: '', password: '', phone: '', email: '', Salary: '' });
  };

  const handleInputChange = (field: keyof Worker, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (currentWorker) {
      // Update existing worker
      setWorkers((prev) => prev.map((w) => (w.id === currentWorker.id ? formData : w)));
    } else {
      // Create new worker
      setWorkers((prev) => [...prev, formData]);
    }
    handleCloseModal();
  };

  return (
    <div className="worker-management-page">
      {/* Main content area: large table-like list */}
      <div className="worker-table-area">
        {/* Table-like header row */}
        <div className="worker-table-header">
          <div className="col-name">Name</div>
          <div className="col-phone">Phone</div>
          <div className="col-email">Email</div>
          <div className="col-action"></div>
        </div>

        {/* Worker rows */}
        <div className="worker-table-rows">
          {workers.map((w) => (
            <div key={w.id} className="worker-table-row">
              <div className="col-name">{w.name}</div>
              <div className="col-phone">{w.phone}</div>
              <div className="col-email">{w.email}</div>
              <div className="col-action">
                <Button className="more-details-btn" onClick={() => handleMoreDetails(w)}>
                  More details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="worker-sidebar">
        <Button className="create-new-btn" onClick={handleNew}>
          Create new
        </Button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{currentWorker ? 'Edit Worker' : 'Create New Worker'}</h3>

            <div className="info-box">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="First name"
              />
            </div>

            <div className="info-box">
              <label>Surname</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div className="info-box">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <div className="info-box">
              <label>Phone number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Phone"
              />
            </div>

            <div className="info-box">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email"
              />
            </div>

            <div className="info-box">
              <label>Salary</label>
              <input
                type="text"
                value={formData.Salary}
                onChange={(e) => handleInputChange('Salary', e.target.value)}
                placeholder="Salary"
              />
            </div>

            <div className="modal-actions">
              <Button variant="contained" className="modal-cancel-btn" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="contained" className="modal-save-btn" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
