import "./CurrentScheduleManagement.css";
import "../Management.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import SnackbarNotification from "../../components/SnackBar/SnackNotification";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/Loading/LoadingSpinner";

interface Appointment {
  nid: number;
  code: string;
  employeeId: number;
  appointmentStart: string; // UTC ISO datetime from API
  appointmentEnd: string;   // UTC ISO datetime from API
  customerName?: string;
  businessId: number;
  serviceId: number;
  appointmentDate: string;
}

interface Employee {
  nid: number;
  name: string;
  surname?: string;
  userType: number;
}

interface Service {
  nid: number;
  name: string;
  timeMin: number;
}

interface Business {
  nid: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  type: string;
  ownerId: number;
  workStart?: string; // UTC ISO datetime from API
  workEnd?: string;   // UTC ISO datetime from API
}

// const MOCK_BUSINESS_ID = 12;
const DEFAULT_EARLIEST_TIME = "09:00";
const DEFAULT_LATEST_TIME = "18:00";

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function extractTimeAsIs(dateTimeString: string): string {
  if (!dateTimeString) return "09:00";
  const timeMatch = dateTimeString.match(/(\d{2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`;
  }
  return "09:00";
}

function getSlotIndex(time: string, businessStartTime: string = DEFAULT_EARLIEST_TIME): number {
  const minutes = timeToMinutes(time);
  const baseMinutes = timeToMinutes(businessStartTime);
  return (minutes - baseMinutes) / 30;
}

export default function CurrentScheduleManagement() {
  const { date } = useParams<{ date: string }>();
  const { businessId, userId, userType } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessHours, setBusinessHours] = useState<{ start: string; end: string }>({
    start: DEFAULT_EARLIEST_TIME,
    end: DEFAULT_LATEST_TIME,
  });
  
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

  // Generate time slots based on business hours
  const generateTimeSlots = (workStart: string, workEnd: string): string[] => {
    const slots: string[] = [];
    const startMinutes = timeToMinutes(workStart);
    const endMinutes = timeToMinutes(workEnd);
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      slots.push(minutesToTime(minutes));
    }
    return slots;
  };

  // Fetch business, employees, services, and appointments
  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return; // Wait for business ID to load
      
      setLoading(true);
      try {
        const [busRes, empRes, servRes] = await Promise.all([
          fetch(`/api/business/${businessId}`),
          fetch(`/api/employees?businessId=${businessId}&page=1&perPage=100`),
          fetch(`/api/services?businessId=${businessId}&page=1&perPage=100`),
        ]);

        if (!busRes.ok || !empRes.ok || !servRes.ok) throw new Error('Failed to fetch data');

        const businessData = await busRes.json();
        const employeesData = await empRes.json();
        const servicesData = await servRes.json();

        setBusiness(businessData);
        setEmployees(employeesData);
        setServices(servicesData);
        
        // Filter employees based on current user's role
        let filtered = employeesData;
        if (userType === 2) {
          // Manager: can schedule for staff (userType 1) and himself
          filtered = employeesData.filter((emp: Employee) => 
            emp.userType === 1 || emp.nid === userId
          );
        } else if (userType === 3) {
          // Owner: can schedule for managers (2), staff (1), and himself
          filtered = employeesData.filter((emp: Employee) => 
            emp.userType === 1 || emp.userType === 2 || emp.nid === userId
          );
        } else if (userType === 4) {
          // SuperAdmin: same as owner but exclude himself
          filtered = employeesData.filter((emp: Employee) => 
            (emp.userType === 1 || emp.userType === 2 || emp.userType === 3) && emp.nid !== userId
          );
        }
        setFilteredEmployees(filtered);
        
        // Extract business hours AS-IS (don't convert timezone)
        // Business owner set these hours and they should display exactly as entered
        let workStart = DEFAULT_EARLIEST_TIME;
        let workEnd = DEFAULT_LATEST_TIME;
        
        if (businessData?.workStart && businessData?.workEnd) {
          workStart = extractTimeAsIs(businessData.workStart);
          workEnd = extractTimeAsIs(businessData.workEnd);
        }
        
        setBusinessHours({ start: workStart, end: workEnd });
        const slots = generateTimeSlots(workStart, workEnd);
        setTimeSlots(slots);

        // Fetch appointments for the selected date
        if (date) {
          const res = await fetch(`/api/appointment?AppointmentDate=${date}&page=1&perPage=100`);
          if (res.ok) {
            const appointmentsData = await res.json();
            setAppointments(appointmentsData);
          }
        }
      } catch (error) {
        const slots = generateTimeSlots(DEFAULT_EARLIEST_TIME, DEFAULT_LATEST_TIME);
        setTimeSlots(slots);
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
  }, [date, businessId]);

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

  // Calculate appointment position and height (extract times as-is)
  const getAppointmentStyle = (appointment: Appointment) => {
    const startTime = extractTimeAsIs(appointment.appointmentStart);
    const endTime = extractTimeAsIs(appointment.appointmentEnd);
    
    const startSlot = getSlotIndex(startTime, businessHours.start);
    const endSlot = getSlotIndex(endTime, businessHours.start);
    const slotHeight = 50;
    const top = startSlot * slotHeight;
    const height = (endSlot - startSlot) * slotHeight;
    return { top: `${top}px`, height: `${height}px` };
  };

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
    const startTime = extractTimeAsIs(appointment.appointmentStart);
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
        setSnackbar({
          open: true,
          message: 'Failed to delete appointment',
          type: 'error',
        });
      }
    }
  };

  const handleSaveAppointment = async () => {
    const selectedService = services.find(
      (s) => s.nid === Number(newAppointment.serviceId)
    );
    
    if (!selectedService) return;

    // Calculate end time based on service duration (all in local time)
    const startMinutes = timeToMinutes(newAppointment.startTime);
    const endMinutes = startMinutes + selectedService.timeMin;
    const endTime = minutesToTime(endMinutes);

    const dateObj = parseDate(date);
    const dateStr = formatDate(dateObj);
    const [startHours, startMins] = newAppointment.startTime.split(":").map(Number);
    const [endHours, endMins] = endTime.split(":").map(Number);
    
    const appointmentStartISO = `${dateStr}T${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}:00.000Z`;
    const appointmentEndISO = `${dateStr}T${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00.000Z`;
    const appointmentDateISO = `${dateStr}T00:00:00.000Z`;

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
            appointmentStart: appointmentStartISO,
            appointmentEnd: appointmentEndISO,
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
            businessId: businessId,
            serviceId: Number(newAppointment.serviceId),
            employeeId: Number(newAppointment.employeeId),
            appointmentDate: appointmentDateISO,
            appointmentStart: appointmentStartISO,
            appointmentEnd: appointmentEndISO,
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
        
        <div className="time-labels">
          <div className="time-label-header-spacer"></div>
          {timeSlots.map((slot, index) => (
            <div 
              key={index} 
              className={`time-label ${index % 2 === 0 ? "full-hour" : "half-hour"}`}
            >
              {slot}
            </div>
          ))}
        </div>
      </div>

      <div className="schedule-main">
        <div className="schedule-header">
          {loading ? (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <LoadingSpinner size="large" />
            </div>
          ) : (
            filteredEmployees.map((employee) => (
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

        <div className="schedule-grid">
          {filteredEmployees.map((employee) => (
            <div key={employee.nid} className="worker-column">
              {/* Time grid lines - one row per slot */}
              {timeSlots.map((slot, index) => (
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
                {filteredEmployees.map((employee) => (
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
                min={businessHours.start}
                max={businessHours.end}
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