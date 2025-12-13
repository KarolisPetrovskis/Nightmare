import "./BusinessView.css";
import "../../Management.css";
import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

interface Business {
  id: number;
  name: string;
  email: string;
}

// Sample data
const sampleBusinesses: Business[] = [
  { id: 17138369, name: "Papa's cafeteria", email: "Papa.caf@gmail.com" },
  { id: 15384654, name: "John's pizzeria", email: "Johnny.Cage@gmail.com" },
  { id: 12374632, name: "KFC", email: "kfc@gmail.com" },
];

const emptyBusiness = {
  name: "",
  email: "",
};

export default function BusinessView() {
  const [businesses, setBusinesses] = useState<Business[]>(sampleBusinesses);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyBusiness);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData(emptyBusiness);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (business: Business) => {
    setIsEditMode(true);
    setEditingId(business.id);
    setFormData({
      name: business.name,
      email: business.email,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(emptyBusiness);
    setEditingId(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (isEditMode && editingId) {
      // Update existing business
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? { ...b, ...formData }
            : b
        )
      );
      // TODO: add PUT call
    } else {
      // Create new business
      const newBusiness: Business = {
        id: Date.now(),
        ...formData,
      };
      setBusinesses((prev) => [...prev, newBusiness]);
      // TODO: add POST call
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this business?")) {
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      // add DELETE call
    }
  };

  const isFormValid = formData.name && formData.email;

  // Filter businesses by search query (ID or name)
  const filteredBusinesses = businesses.filter((b) =>
    b.id.toString().includes(searchQuery) ||
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
      </div>

      <div className="business-list">
        <table className="business-table">
          <thead>
            <tr>
              <th>Business ID</th>
              <th>Business Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.map((business) => (
              <tr key={business.id}>
                <td>{business.id}</td>
                <td>{business.name}</td>
                <td>{business.email}</td>
                <td className="actions-cell">
                  <Button
                    className="item-action-button new-item"
                    onClick={() => handleOpenEditModal(business)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {businesses.length === 0 && (
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
            <label>Email *</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
    </div>
  );
}