import "./BusinessView.css";
import "../../Management.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import SnackbarNotification from "../../../components/SnackBar/SnackNotification";
import { useAuth } from "../../../context/AuthContext";

interface Business {
  nid: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: number;
  ownerId?: number;
  workStart?: string;
  workEnd?: string;
}

interface FormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  type: number;
  ownerId: number;
  workStart: string;
  workEnd: string;
}

// Mock owner ID - in production, get this from user context/auth
const MOCK_OWNER_ID = 1;
const MOCK_TYPE = 1; // Either need to add this to the form, or set every type to 1 by default.

const emptyBusiness: FormData = {
  name: "",
  address: "",
  phone: "",
  email: "",
  type: MOCK_TYPE,
  ownerId: MOCK_OWNER_ID,
  workStart: "09:00",
  workEnd: "17:00",
};

export default function BusinessView() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyBusiness);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  // Check if user is super admin
  useEffect(() => {
    const checkPermissions = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/employees/${userId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const userData = await response.json();
        
        // Only super admin (type 3) can access this page
        if (userData.userType !== 3) {
          setSnackbar({
            open: true,
            message: 'Access denied. Only super admins can access this page.',
            type: 'error',
          });
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setSnackbar({
          open: true,
          message: 'Failed to verify permissions',
          type: 'error',
        });
      }
    };
    
    checkPermissions();
  }, [userId, navigate]);

  // Fetch businesses from API on component mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        console.log('Fetching all businesses for super admin...');
        
        // Fetch all employees to get potential owner IDs
        // Note: BusinessId=1 is a dummy value to satisfy DTO validation
        const employeesResponse = await fetch(`/api/employees?BusinessId=1&Page=0&PerPage=1000`, {
          credentials: 'include',
        });
        
        if (!employeesResponse.ok) {
          const errorText = await employeesResponse.text();
          console.error('Failed to fetch employees:', errorText);
          throw new Error('Failed to fetch employees');
        }
        
        const employees = await employeesResponse.json();
        console.log('Fetched employees:', employees);
        
        // Get unique owner IDs (employee nids could be business owners)
        const potentialOwnerIds = [...new Set(employees.map((emp: any) => emp.nid))];
        console.log('Potential owner IDs:', potentialOwnerIds);
        
        // Fetch businesses for each potential owner
        const businessPromises = potentialOwnerIds.map(async (ownerId: number) => {
          try {
            const response = await fetch(`/api/business?OwnerId=${ownerId}`, {
              credentials: 'include',
            });
            if (response.ok) {
              const businesses = await response.json();
              return Array.isArray(businesses) ? businesses : [];
            }
            return [];
          } catch (error) {
            console.error(`Failed to fetch businesses for owner ${ownerId}:`, error);
            return [];
          }
        });
        
        const businessArrays = await Promise.all(businessPromises);
        // Flatten arrays and remove duplicates by nid
        const allBusinesses = businessArrays.flat();
        const uniqueBusinesses = Array.from(
          new Map(allBusinesses.map(b => [b.nid, b])).values()
        );
        console.log('Fetched businesses:', uniqueBusinesses);
        setBusinesses(uniqueBusinesses);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load businesses',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData(emptyBusiness);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (business: Business) => {
    // Extract HH:mm from workStart/workEnd if they contain full datetime
    const extractTimeFromTimestamp = (timestamp?: string): string => {
      if (!timestamp) return "09:00";
      // Try to match HH:mm format
      const timeMatch = timestamp.match(/(\d{2}):(\d{2})/);
      if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
      }
      return "09:00";
    };

    setIsEditMode(true);
    setEditingId(business.nid);
    setFormData({
      name: business.name,
      address: business.address || "",
      phone: business.phone || "",
      email: business.email || "",
      type: business.type || MOCK_TYPE,
      ownerId: business.ownerId || MOCK_OWNER_ID,
      workStart: extractTimeFromTimestamp(business.workStart),
      workEnd: extractTimeFromTimestamp(business.workEnd),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(emptyBusiness);
    setEditingId(null);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    console.log(`Field: ${field}, Value: ${value}, Type: ${typeof value}`);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    console.log('Saving with formData:', formData);
    try {
      if (isEditMode && editingId) {
        // Update existing business
        // Convert time strings to ISO datetime (using today's date)
        const today = new Date().toISOString().split('T')[0];
        const workStartDateTime = `${today}T${formData.workStart}:00Z`;
        const workEndDateTime = `${today}T${formData.workEnd}:00Z`;

        const response = await fetch(`/api/business/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            type: formData.type,
            ownerId: formData.ownerId,
            workStart: workStartDateTime,
            workEnd: workEndDateTime,
          }),
        });
        if (!response.ok) throw new Error('Failed to update business');
        setBusinesses((prev) =>
          prev.map((b) =>
            b.nid === editingId
              ? { ...b, ...formData }
              : b
          )
        );
        setSnackbar({
          open: true,
          message: 'Business updated successfully!',
          type: 'success',
        });
      } else {
        // Create new business
        // Convert time strings to ISO datetime (using today's date)
        const today = new Date().toISOString().split('T')[0];
        const workStartDateTime = `${today}T${formData.workStart}:00Z`;
        const workEndDateTime = `${today}T${formData.workEnd}:00Z`;

        const response = await fetch('/api/business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            type: formData.type,
            ownerId: formData.ownerId,
            workStart: workStartDateTime,
            workEnd: workEndDateTime,
          }),
        });
        if (!response.ok) throw new Error('Failed to create business');
        const newBusiness = await response.json();
        setBusinesses((prev) => [...prev, newBusiness]);
        setSnackbar({
          open: true,
          message: 'Business created successfully!',
          type: 'success',
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving business:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save business',
        type: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this business?")) {
      try {
        const response = await fetch(`/api/business/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete business');
        setBusinesses((prev) => prev.filter((b) => b.nid !== id));
        setSnackbar({
          open: true,
          message: 'Business deleted successfully!',
          type: 'success',
        });
      } catch (error) {
        console.error('Error deleting business:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete business',
          type: 'error',
        });
      }
    }
  };

  const isFormValid = formData.name && formData.email && formData.ownerId > 0;

  // Filter businesses by search query (ID or name)
  const filteredBusinesses = businesses.filter((b) =>
    b.nid.toString().includes(searchQuery) ||
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="management business-view-page">
      <div className="search-box">
        <label>Search:</label>
        <input
          type="text"
          placeholder="ID/name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button className="item-action-button new-item" onClick={handleOpenCreateModal}>
          Create Business
        </Button>
      </div>

      <div className="business-list">
        <table className="business-table">
          <thead>
            <tr>
              <th>Business ID</th>
              <th>Business Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', opacity: 0.5 }}>Loading...</td>
              </tr>
            ) : (
              filteredBusinesses.map((business) => (
                <tr key={business.nid}>
                  <td>{business.nid}</td>
                  <td>{business.name}</td>
                  <td>{business.email}</td>
                  <td className="actions-cell">
                    <Button
                      className="item-action-button new-item"
                      onClick={() => handleOpenEditModal(business)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="item-action-button delete-item"
                      onClick={() => handleDelete(business.nid)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && businesses.length === 0 && (
          <div className="no-data">No businesses found.</div>
        )}
      </div>

      {/* Create/Edit Business Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        PaperProps={{
          className: "business-modal",
        }}
      >
        <DialogContent className="business-modal-content">
          <h3>{isEditMode ? "Edit Business" : "Create New Business"}</h3>

          <div className="info-box">
            <label>Business Name *</label>
            <input
              type="text"
              placeholder="Enter business name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="info-box">
            <label>Address</label>
            <input
              type="text"
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="info-box">
            <label>Phone</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div className="info-box">
            <label>Email *</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div className="info-box">
            <label>Owner ID *</label>
            <input
              type="number"
              placeholder="Enter owner user ID"
              value={formData.ownerId}
              onChange={(e) => handleInputChange("ownerId", parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="info-box">
            <label>Business Type</label>
            <input
              type="number"
              placeholder="Enter business type"
              value={formData.type}
              onChange={(e) => handleInputChange("type", parseInt(e.target.value, 10) || 1)}
            />
          </div>

          <div className="info-box">
            <label>Work Starts</label>
            <input
              type="time"
              value={formData.workStart}
              onChange={(e) => handleInputChange("workStart", e.target.value)}
            />
          </div>

          <div className="info-box">
            <label>Work Ends</label>
            <input
              type="time"
              value={formData.workEnd}
              onChange={(e) => handleInputChange("workEnd", e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <Button className="item-action-button delete-item" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              className={`item-action-button new-item ${isFormValid ? "" : "disabled"}`}
              onClick={handleSave}
              disabled={!isFormValid}
            >
              {isEditMode ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SnackbarNotification
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        type={snackbar.type}
      />
    </div>
  );
}