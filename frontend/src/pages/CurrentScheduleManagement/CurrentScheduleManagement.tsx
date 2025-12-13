//TODO:
// Update handleSaveAppointment to call backend API, once we have it.
// Decide on what format? AM/PM or 24h to display (in wireframe schedule displays AM/PM, but time input uses 24h format)
// Decide on time slot intervals (currently 30min based on wireframe, but need to confirm)
// Implemented Add Appointment as a popup, but from documentation it is not clear if they intended it to be a separate page or a modal.

import "./CurrentScheduleManagement.css";
import "../Management.css";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

interface Appointment {
  id: number;
  workerId: number;
  startTime: string; // "HH:MM" format
  endTime: string;   // "HH:MM" format
  description: string;
}

interface Worker {
  id: number;
  name: string;
}

interface ServiceType {
  id: number;
  name: string;
  duration: number; // in minutes
}

// Sample data
const sampleWorkers: Worker[] = [
  { id: 1, name: "Worker name" },
  { id: 2, name: "Worker name" },
  { id: 3, name: "Worker name" },
  { id: 4, name: "Worker name" },
  { id: 5, name: "Worker name" },
];

const sampleServiceTypes: ServiceType[] = [
  { id: 1, name: "Haircut", duration: 30 },
  { id: 2, name: "Beard Trim", duration: 15 },
  { id: 3, name: "Full Service", duration: 60 },
];

const sampleAppointments: Appointment[] = [
  // { id: 1, workerId: 1, startTime: "08:00", endTime: "09:30", description: "Work description" },
  // { id: 2, workerId: 2, startTime: "08:30", endTime: "10:00", description: "Work description" },
  // { id: 3, workerId: 3, startTime: "09:30", endTime: "11:00", description: "Work description" },
  // { id: 4, workerId: 4, startTime: "09:00", endTime: "10:00", description: "Work description" },
  // { id: 5, workerId: 1, startTime: "11:00", endTime: "12:00", description: "Work description" },
  // { id: 6, workerId: 2, startTime: "12:00", endTime: "13:00", description: "Work description" },
  // { id: 7, workerId: 5, startTime: "12:00", endTime: "13:30", description: "Work description" },
];

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

export default function CurrentScheduleManagement() {
  const { date } = useParams<{ date: string }>();
  const [workers] = useState<Worker[]>(sampleWorkers);
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [serviceTypes] = useState<ServiceType[]>(sampleServiceTypes);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    name: "",
    employeeId: "",
    serviceTypeId: "",
    startTime: "",
  });

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
    const startSlot = getSlotIndex(appointment.startTime);
    const endSlot = getSlotIndex(appointment.endTime);
    const slotHeight = 50; // matches CSS .time-row height
    const top = startSlot * slotHeight;
    const height = (endSlot - startSlot) * slotHeight;
    return { top: `${top}px`, height: `${height}px` };
  };

  // Get appointments for a specific worker
  const getWorkerAppointments = (workerId: number) => {
    return appointments.filter((a) => a.workerId === workerId);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAppointment({ name: "", employeeId: "", serviceTypeId: "", startTime: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewAppointment((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAppointment = async () => {
    // Find the selected service to get its duration
    const selectedService = serviceTypes.find(
      (s) => s.id === Number(newAppointment.serviceTypeId)
    );
    
    if (!selectedService) return;

    // Calculate end time based on service duration
    const startMinutes = timeToMinutes(newAppointment.startTime);
    const endMinutes = startMinutes + selectedService.duration;
    const endTime = minutesToTime(endMinutes);

    // Create the new appointment object
    const appointment: Appointment = {
      id: Date.now(), // Temporary ID, backend should return real ID
      workerId: Number(newAppointment.employeeId),
      startTime: newAppointment.startTime,
      endTime: endTime,
      description: newAppointment.name,
    };

  
    // For now, update state directly (remove this when API is ready)
    setAppointments((prev) => [...prev, appointment]);
    
    handleCloseModal();
  };

  const isFormValid = newAppointment.name && newAppointment.employeeId && newAppointment.serviceTypeId && newAppointment.startTime;

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
        {/* Header row with workers */}
        <div className="schedule-header">
          {workers.map((worker) => (
            <div key={worker.id} className="worker-column-header">
              <div className="worker-avatar">
                <svg viewBox="0 0 100 100" className="avatar-placeholder">
                  <rect width="100" height="100" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
                  <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <span className="worker-name">{worker.name}</span>
            </div>
          ))}
        </div>

        {/* Schedule grid */}
        <div className="schedule-grid">
          {/* Worker columns with appointments */}
          {workers.map((worker) => (
            <div key={worker.id} className="worker-column">
              {/* Time grid lines */}
              {timeSlots.map((_, index) => (
                <div key={index} className={`time-row ${index % 2 === 0 ? "full-hour" : "half-hour"}`}></div>
              ))}
              
              {/* Appointments overlay */}
              {getWorkerAppointments(worker.id).map((appointment) => (
                <div
                  key={appointment.id}
                  className="appointment-block"
                  style={getAppointmentStyle(appointment)}
                >
                  <span className="appointment-text">{appointment.description}</span>
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
            <div className="info-box">
              <label>Appointment name</label>
              <input
                type="text"
                placeholder="name"
                value={newAppointment.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="info-box">
              <label>Serving employee</label>
              <select
                value={newAppointment.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
              >
                <option value="">employee from dropdown</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="info-box">
              <label>Service type</label>
              <select
                value={newAppointment.serviceTypeId}
                onChange={(e) => handleInputChange("serviceTypeId", e.target.value)}
              >
                <option value="">service type from dropdown</option>
                {serviceTypes.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
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
              <Button className="item-action-button new-item" onClick={handleCloseModal}>
                Cancel
              </Button>
              <button
                className={`save-button ${isFormValid ? "active" : ""}`}
                onClick={handleSaveAppointment}
                disabled={!isFormValid}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
