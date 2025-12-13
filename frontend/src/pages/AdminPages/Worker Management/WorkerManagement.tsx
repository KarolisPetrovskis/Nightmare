import "./WorkerManagement.css";
import Button from "@mui/material/Button";
import { useState } from "react";

type Worker = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
};

// Mock data constants
const SAMPLE_WORKERS: Worker[] = [
  { id: 1, name: "John Smith", phone: "+37067676", email: "jsmith67@gmail.com" },
  { id: 2, name: "Jane Doe", phone: "+37048165", email: "jdoe@gmail.com" },
];

export default function WorkerManagement() {
  const [workers, setWorkers] = useState<Worker[]>(SAMPLE_WORKERS);

  const handleNew = () => {
    // TODO: Open modal to create new worker
  };

  const handleMoreDetails = (w: Worker) => {
    // TODO: Open modal or navigate to detailed worker edit page
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
    </div>
  );
}
