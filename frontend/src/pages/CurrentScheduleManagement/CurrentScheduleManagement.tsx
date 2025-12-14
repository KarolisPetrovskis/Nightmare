//TODO:
// Decide on what format? AM/PM or 24h to display (in wireframe schedule displays AM/PM, but time input uses 24h format)
// Decide on time slot intervals (currently 30min based on wireframe, but need to confirm)
// Implemented Add Appointment as a popup, but from documentation it is not clear if they intended it to be a separate page or a modal.

import "./CurrentScheduleManagement.css";
import "../Management.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import SnackbarNotification from "../../components/SnackBar/SnackNotification";

interface Appointment {
  nid: number;
  code: string;
  employeeId: number;
  appointmentStart: string; // ISO datetime
  appointmentEnd: string;   // ISO datetime
  customerName?: string;
  businessId: number;
  serviceId: number;
  appointmentDate: string;
}

interface Employee {
  nid: number;
  name: string;
  surname?: string;
}

interface Service {
  nid: number;
  name: string;
  timeMin: number; // in minutes
}

// Mock business ID - in production, get from context/auth
const MOCK_BUSINESS_ID = 1;

const sampleAppointments: Appointment[] = [];

// Time slots from 8am to 2pm (based on wireframe example, need to discuss on which interval to use)
const timeSlots = [
  "8 am", "8:30 am", "9 am", "9:30 am", "10 am", "10:30 am",
  "11 am", "11:30 am", "12 am", "12:30 am", "1 pm", "1:30 pm", "2 pm"
];

// Schedule time boundaries - users can only pick times within these bounds
const EARLIEST_SCHEDULED_TIME = "08:00";
const LATEST_SCHEDULED_TIME = "14:00";

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function getSlotIndex(time: string): number {
  const minutes = timeToMinutes(time);
  const baseMinutes = 8 * 60; // 8:00 AM
  return (minutes - baseMinutes) / 30;
}

// Extract time from ISO datetime
function extractTimeFromISO(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function CurrentScheduleManagement() {
  const { date } = useParams<{ date: string }>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    employeeId: "",
    serviceId: "",
    startTime: "",
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  // Fetch employees, services, and appointments on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, servRes] = await Promise.all([
          fetch(`/api/employees?businessId=${MOCK_BUSINESS_ID}&page=1&perPage=100`),
          fetch(`/api/services?businessId=${MOCK_BUSINESS_ID}&page=1&perPage=100`),
        ]);

        if (!empRes.ok || !servRes.ok) throw new Error('Failed to fetch data');

        const employeesData = await empRes.json();
        const servicesData = await servRes.json();

        setEmployees(employeesData);
        setServices(servicesData);

        // Fetch appointments for the selected date
        if (date) {
          // Convert date string (YYYY-MM-DD) to ISO datetime at midnight
          const appointmentDate = new Date(date);
          appointmentDate.setHours(0, 0, 0, 0);
          const res = await fetch(`/api/appointment?AppointmentDate=${appointmentDate.toISOString()}&page=1&perPage=100`);
          if (res.ok) {
            const appointmentsData = await res.json();
            setAppointments(appointmentsData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load schedule data',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  // Parse date from URL or use today
  const parseDate = (dateStr: string | undefined): Date => {
    if (dateStr) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  const currentDate = parseDate(date);

  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    const startTime = extractTimeFromISO(appointment.appointmentStart);
    const endTime = extractTimeFromISO(appointment.appointmentEnd);
    const startSlot = getSlotIndex(startTime);
    const endSlot = getSlotIndex(endTime);
    const slotHeight = 50; // matches CSS .time-row height
    const top = startSlot * slotHeight;
    const height = (endSlot - startSlot) * slotHeight;
    return { top: `${top}px`, height: `${height}px` };
  };

  // Get appointments for a specific employee
  const getEmployeeAppointments = (employeeId: number) => {
    return appointments.filter((a) => a.employeeId === employeeId);
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setSelectedAppointmentId(null);
    setNewAppointment({ customerName: "", employeeId: "", serviceId: "", startTime: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appointment: Appointment) => {
    setIsEditMode(true);
    setSelectedAppointmentId(appointment.nid);
    const startTime = extractTimeFromISO(appointment.appointmentStart);
    setNewAppointment({
      customerName: appointment.customerName || "",
      employeeId: String(appointment.employeeId),
      serviceId: String(appointment.serviceId),
      startTime: startTime,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedAppointmentId(null);
    setNewAppointment({ customerName: "", employeeId: "", serviceId: "", startTime: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewAppointment((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        const response = await fetch(`/api/appointment/${appointmentId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete appointment');
        
        setAppointments((prev) => prev.filter((a) => a.nid !== appointmentId));
        
        setSnackbar({
          open: true,
          message: 'Appointment deleted successfully!',
          type: 'success',
        });
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete appointment',
          type: 'error',
        });
      }
    }
  };

  const handleSaveAppointment = async () => {
    // Find the selected service to get its duration
    const selectedService = services.find(
      (s) => s.nid === Number(newAppointment.serviceId)
    );
    
    if (!selectedService) return;

    // Calculate end time based on service duration
    const startMinutes = timeToMinutes(newAppointment.startTime);
    const endMinutes = startMinutes + selectedService.timeMin;
    const endTime = minutesToTime(endMinutes);

    // Create appointment date from URL date and times
    const dateObj = parseDate(date);
    const [startHours, startMins] = newAppointment.startTime.split(":").map(Number);
    const [endHours, endMins] = endTime.split(":").map(Number);
    
    const appointmentStart = new Date(dateObj);
    appointmentStart.setHours(startHours, startMins, 0, 0);
    
    const appointmentEnd = new Date(dateObj);
    appointmentEnd.setHours(endHours, endMins, 0, 0);

    try {
      if (isEditMode && selectedAppointmentId) {
        // Update existing appointment
        const response = await fetch(`/api/appointment/${selectedAppointmentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: newAppointment.customerName,
            employeeId: Number(newAppointment.employeeId),
            serviceId: Number(newAppointment.serviceId),
            appointmentStart: appointmentStart.toISOString(),
            appointmentEnd: appointmentEnd.toISOString(),
          }),
        });

        if (!response.ok) throw new Error('Failed to update appointment');
        
        const updatedApt = await response.json();
        setAppointments((prev) =>
          prev.map((a) => (a.nid === selectedAppointmentId ? updatedApt : a))
        );
        
        setSnackbar({
          open: true,
          message: 'Appointment updated successfully!',
          type: 'success',
        });
      } else {
        // Create new appointment
        const response = await fetch('/api/appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: `APT-${Date.now()}`,
            businessId: MOCK_BUSINESS_ID,
            serviceId: Number(newAppointment.serviceId),
            employeeId: Number(newAppointment.employeeId),
            appointmentDate: dateObj,
            appointmentStart: appointmentStart.toISOString(),
            appointmentEnd: appointmentEnd.toISOString(),
            customerName: newAppointment.customerName,
            total: 0,
            statusId: 1,
          }),
        });

        if (!response.ok) throw new Error('Failed to create appointment');
        
        const newApt = await response.json();
        setAppointments((prev) => [...prev, newApt]);
        
        setSnackbar({
          open: true,
          message: 'Appointment created successfully!',
          type: 'success',
        });
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving appointment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save appointment',
        type: 'error',
      });
    }
  };

  const isFormValid = newAppointment.customerName && newAppointment.employeeId && newAppointment.serviceId && newAppointment.startTime;

  return (
    <div className="management day-schedule-page">
      <div className="schedule-left-column">
        <Button className="add-appointment-btn" onClick={handleOpenModal}>
          Add new appointment
        </Button>
        <span className="current-date">{formatDate(currentDate)}</span>
        
        {/* Time labels under date */}
        <div className="time-labels">
          {/* Empty space to align with worker headers */}
          <div className="time-label-header-spacer"></div>
          {timeSlots.map((slot, index) => (
            <div key={index} className={`time-label ${index % 2 === 0 ? "full-hour" : "half-hour"}`}>
              {slot}
            </div>
          ))}
        </div>
      </div>

      <div className="schedule-main">
        {/* Header row with employees */}
        <div className="schedule-header">
          {loading ? (
            <div style={{ opacity: 0.5 }}>Loading employees...</div>
          ) : (
            employees.map((employee) => (
              <div key={employee.nid} className="worker-column-header">
                <div className="worker-avatar">
                  <svg viewBox="0 0 100 100" className="avatar-placeholder">
                    <rect width="100" height="100" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
                    <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <span className="worker-name">{employee.name}</span>
              </div>
            ))
          )}
        </div>

        {/* Schedule grid */}
        <div className="schedule-grid">
          {/* Employee columns with appointments */}
          {employees.map((employee) => (
            <div key={employee.nid} className="worker-column">
              {/* Time grid lines */}
              {timeSlots.map((_, index) => (
                <div key={index} className={`time-row ${index % 2 === 0 ? "full-hour" : "half-hour"}`}></div>
              ))}
              
              {/* Appointments overlay */}
              {getEmployeeAppointments(employee.nid).map((appointment) => (
                <div
                  key={appointment.nid}
                  className="appointment-block"
                  style={getAppointmentStyle(appointment)}
                  onClick={() => handleOpenEditModal(appointment)}
                  title="Click to edit or delete"
                >
                  <span className="appointment-text">{appointment.customerName || "Appointment"}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditMode ? "Edit Appointment" : "Add New Appointment"}</h3>
            
            <div className="info-box">
              <label>Customer name</label>
              <input
                type="text"
                placeholder="name"
                value={newAppointment.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
              />
            </div>

            <div className="info-box">
              <label>Serving employee</label>
              <select
                value={newAppointment.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.nid} value={employee.nid}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="info-box">
              <label>Service type</label>
              <select
                value={newAppointment.serviceId}
                onChange={(e) => handleInputChange("serviceId", e.target.value)}
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service.nid} value={service.nid}>
                    {service.name} ({service.timeMin} min)
                  </option>
                ))}
              </select>
            </div>

            <div className="info-box">
              <label>Service time start</label>
              <input
                type="time"
                placeholder="time to start"
                value={newAppointment.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                min={EARLIEST_SCHEDULED_TIME}
                max={LATEST_SCHEDULED_TIME}
              />
            </div>

            <div className="modal-actions">
              {isEditMode && selectedAppointmentId && (
                <Button 
                  className="item-action-button delete-item" 
                  onClick={() => {
                    handleDeleteAppointment(selectedAppointmentId);
                    handleCloseModal();
                  }}
                >
                  Delete
                </Button>
              )}
              <Button className="item-action-button new-item" onClick={handleCloseModal}>
                Cancel
              </Button>
              <button
                className={`save-button ${isFormValid ? "active" : ""}`}
                onClick={handleSaveAppointment}
                disabled={!isFormValid}
              >
                {isEditMode ? "Update" : "Save"}
              </button>
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
