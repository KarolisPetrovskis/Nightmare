// TODO: What is planid???
// TODO: Superadmin neeeds to view all employees across businesses, needed changes in backend for it.
import "./WorkerManagement.css";
import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SnackbarNotification from "../../../components/SnackBar/SnackNotification";
import { useAuth } from "../../../context/AuthContext";

type Worker = {
  nid?: number;
  name: string;
  surname: string;
  password: string;
  phone?: string;
  email?: string;
  telephone?: string;
  address?: string;
  salary?: string;
  bankAccount?: string;
  bossId?: string;
  userType: number;
};

type ApiWorker = {
  nid: number;
  name: string;
  surname: string;
  email: string;
  telephone?: string;
  address?: string;
  salary?: number;
  bankAccount?: string;
  bossId?: number;
  userType: number;
};

type SnackbarState = {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
};

export default function WorkerManagement() {
  const navigate = useNavigate();
  const { businessId, userId, isLoading: authLoading } = useAuth();
  const [workers, setWorkers] = useState<ApiWorker[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWorker, setCurrentWorker] = useState<ApiWorker | null>(null);
  const [formData, setFormData] = useState<Worker>({
    name: '',
    surname: '',
    password: '',
    phone: '',
    email: '',
    address: '',
    salary: '',
    bankAccount: '',
    bossId: '',
    userType: 1, // Default to staff
  });
  const [loading, setLoading] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', type: 'info' });

  // Fetch current user's type and validate permissions
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/employees/${userId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const userData = await response.json();
        setCurrentUserType(userData.userType);
        
        // Check if user has permission (manager=2 or super admin=3)
        if (userData.userType !== 2 && userData.userType !== 3) {
          showSnackbar('You do not have permission to access this page', 'error');
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        showSnackbar('Failed to load user information', 'error');
      }
    };
    
    fetchCurrentUser();
  }, [userId, navigate]);

  // Fetch employees on component mount
  useEffect(() => {
    if (businessId && currentUserType !== null) {
      fetchEmployees();
    }
  }, [businessId, currentUserType]);

  const fetchEmployees = async () => {
    if (!businessId && currentUserType !== 3) {
      showSnackbar('Business ID not available', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // For now, use business endpoint for all users
      const url = `/api/employees/business?businessId=${businessId}&page=0&perPage=1000`;
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setWorkers(data);
    } catch (error) {
      showSnackbar('Error fetching employees', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbar({ open: true, message, type });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleNew = () => {
    if (!userId || !businessId) {
      showSnackbar('Authentication required', 'error');
      return;
    }
    
    setCurrentWorker(null);
    setFormData({
      name: '',
      surname: '',
      password: '',
      phone: '',
      email: '',
      address: '',
      salary: '',
      bankAccount: '',
      bossId: userId.toString(),
      userType: 1, // Default to staff
    });
    setIsModalOpen(true);
  };

  const handleMoreDetails = (w: ApiWorker) => {
    setCurrentWorker(w);
    setFormData({
      name: w.name,
      surname: w.surname,
      password: '',
      phone: w.telephone || '',
      email: w.email,
      address: w.address || '',
      salary: w.salary ? w.salary.toString() : '',
      bankAccount: w.bankAccount || '',
      bossId: w.bossId ? w.bossId.toString() : (userId ? userId.toString() : ''),
      userType: w.userType || 1,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentWorker(null);
    setFormData({
      name: '',
      surname: '',
      password: '',
      phone: '',
      email: '',
      address: '',
      salary: '',
      bankAccount: '',
      bossId: '',
      userType: 1,
    });
  };

  const handleInputChange = (field: keyof Worker, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.surname || !formData.email) {
      showSnackbar('Please fill in all required fields', 'warning');
      return;
    }
    
    if (!userId || !businessId) {
      showSnackbar('Authentication required', 'error');
      return;
    }
    
    // Validate userType is either staff (1) or manager (2)
    if (formData.userType !== 1 && formData.userType !== 2) {
      showSnackbar('User type must be either Staff or Manager', 'warning');
      return;
    }

    try {
      setLoading(true);
      if (currentWorker) {
        // Update existing worker
        const updatePayload: any = {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          telephone: formData.phone,
          userType: formData.userType,
          businessId: businessId,
          address: formData.address,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
          bankAccount: formData.bankAccount,
          bossId: userId,
        };
        
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        
        const response = await fetch(`/api/employees/${currentWorker.nid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updatePayload),
        });
        if (!response.ok) throw new Error('Failed to update employee');
        showSnackbar('Employee updated successfully', 'success');
      } else {
        // Create new worker
        if (!formData.password) {
          showSnackbar('Password is required for new employees', 'warning');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/employees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            password: formData.password,
            telephone: formData.phone,
            userType: formData.userType,
            businessId: businessId,
            address: formData.address,
            salary: formData.salary ? parseFloat(formData.salary) : undefined,
            bankAccount: formData.bankAccount,
            bossId: userId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Backend error response:', errorData);
          throw new Error(`Failed to create employee: ${errorData}`);
        }
        showSnackbar('Employee created successfully', 'success');
      }
      
      // Refresh the employee list
      await fetchEmployees();
      handleCloseModal();
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'Error saving employee', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (worker: ApiWorker) => {
    if (!confirm(`Are you sure you want to delete ${worker.name} ${worker.surname}?`)) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${worker.nid}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete employee');
      showSnackbar('Employee deleted successfully', 'success');
      await fetchEmployees();
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'Error deleting employee', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
          {workers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              {loading ? 'Loading employees...' : 'No employees found'}
            </div>
          ) : (
            workers.map((w) => (
              <div key={w.nid} className="worker-table-row">
                <div className="col-name">{w.name} {w.surname}</div>
                <div className="col-phone">{w.telephone || '-'}</div>
                <div className="col-email">{w.email}</div>
                <div className="col-action">
                  <Button className="more-details-btn" onClick={() => handleMoreDetails(w)}>
                    More details
                  </Button>
                  <Button className="delete-btn" onClick={() => handleDelete(w)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="worker-sidebar">
        <Button className="create-new-btn" onClick={handleNew} disabled={loading}>
          Create new
        </Button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{currentWorker ? 'Edit Employee' : 'Create New Employee'}</h3>

            <div className="info-box">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="First name"
              />
            </div>

            <div className="info-box">
              <label>Surname *</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div className="info-box">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email"
              />
            </div>

            <div className="info-box">
              <label>Password {currentWorker ? '(optional to keep current)' : '*'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={currentWorker ? 'Leave blank to keep current' : 'Enter password'}
              />
            </div>

            <div className="info-box">
              <label>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div className="info-box">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Address"
              />
            </div>

            <div className="info-box">
              <label>Salary</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="Salary"
              />
            </div>

            <div className="info-box">
              <label>User Type *</label>
              <select
                value={formData.userType}
                onChange={(e) => handleInputChange('userType', parseInt(e.target.value))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value={1}>Staff</option>
                <option value={2}>Manager</option>
              </select>
            </div>

            <div className="info-box">
              <label>Bank Account</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                placeholder="Bank account"
              />
            </div>

            <div className="modal-actions">
              <Button variant="contained" className="modal-cancel-btn" onClick={handleCloseModal} disabled={loading}>
                Cancel
              </Button>
              <Button variant="contained" className="modal-save-btn" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      <SnackbarNotification
        open={snackbar.open}
        onClose={closeSnackbar}
        message={snackbar.message}
        type={snackbar.type}
      />
    </div>
  );
}
