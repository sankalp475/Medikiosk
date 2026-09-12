import { useMemo, useState } from "react";
import { HeartPulse } from 'lucide-react';

const initialDoctors = [
  { id: 1, name: "Dr. Ananya Rao", department: "General Medicine", status: "Available" },
  { id: 2, name: "Dr. Vikram Shah", department: "Cardiology", status: "In consultation" },
  { id: 3, name: "Dr. Meera Nair", department: "Pediatrics", status: "Available" },
];

const initialQueues = [
  { department: "General Medicine", patients: 18, next: "P-1042", wait: "12 min", color: "bg-teal-600" },
  { department: "Cardiology", patients: 7, next: "P-1028", wait: "24 min", color: "bg-blue-600" },
  { department: "Pediatrics", patients: 11, next: "P-1037", wait: "18 min", color: "bg-amber-500" },
  { department: "Orthopedics", patients: 5, next: "P-1019", wait: "9 min", color: "bg-violet-600" },
];

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [queues, setQueues] = useState(initialQueues);
  const [department, setDepartment] = useState("All departments");
  const [doctorName, setDoctorName] = useState("");
  const [doctorDepartment, setDoctorDepartment] = useState("General Medicine");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);

  const departments = useMemo(
    () => ["All departments", ...new Set(queues.map((queue) => queue.department))],
    [queues],
  );

  const visibleQueues = department === "All departments"
    ? queues
    : queues.filter((queue) => queue.department === department);

  const totalPatients = queues.reduce((total, queue) => total + queue.patients, 0);

  function addDoctor(event) {
    event.preventDefault();
    const name = doctorName.trim();
    if (!name) return;

    setDoctors((currentDoctors) => [
      ...currentDoctors,
      {
        id: Date.now(),
        name,
        department: doctorDepartment,
        status: "Available",
      },
    ]);
    setDoctorName("");
    setIsAddDoctorOpen(false);
  }

  function callNextPatient(departmentName) {
    setQueues((currentQueues) => currentQueues.map((queue) => (
      queue.department === departmentName && queue.patients > 0
        ? { ...queue, patients: queue.patients - 1 }
        : queue
    )));
  }

  return (
    <main className="min-h-screen bg-base-200 text-base-content">
      <header className="border-b border-base-300 bg-base-100">
        <div className="navbar mx-auto max-w-7xl px-4 sm:px-6">
          <div className="cursor-pointer flex flex-1 flex-row items-center gap-3">
            <HeartPulse />
            <div className="cursor-pointer flex flex-col">
              <p className="font-sans text-2xl font-extrabold leading-none tracking-[-0.04em] text-slate-950">
                Medi<span className="text-cyan-600">kiosk</span>
              </p>
              <p className="text-xs text-base-content/60">Clinic Patient Intake & Registration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-base-content/60 sm:inline">Today, 12 September 2026</span>
            {/* <div className="avatar placeholder">
              <div className="w-9 rounded-full bg-primary text-primary-content">
                <span>AD</span>
              </div>
            </div> */}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Overview</p>
            <h1 className="mt-1 text-3xl font-bold">Good morning, Admin</h1>
            <p className="mt-2 text-base-content/60">Manage doctors and monitor active patient queues.</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setIsAddDoctorOpen(true)}>
            + Add doctor
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Daily summary">
          <SummaryCard label="Patients waiting" value={totalPatients} detail="Across all departments" />
          <SummaryCard label="Doctors on duty" value={doctors.length} detail="All assigned today" />
          <SummaryCard label="Departments active" value={queues.length} detail="Queue monitoring enabled" />
          <SummaryCard label="Avg. wait time" value="16 min" detail="8 min faster than yesterday" />
        </section>

        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="card-title">Active patient queues</h2>
                <p className="text-sm text-base-content/60">Call the next patient from any department.</p>
              </div>
              <select
                className="select select-bordered w-full sm:w-52"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                aria-label="Filter queues by department"
              >
                {departments.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {visibleQueues.map((queue) => (
                <article key={queue.department} className="rounded-box border border-base-300 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${queue.color}`} aria-hidden="true" />
                      <div>
                        <h3 className="font-semibold">{queue.department}</h3>
                        <p className="text-sm text-base-content/60">Next patient: {queue.next}</p>
                      </div>
                    </div>
                    <span className="badge badge-outline">{queue.wait}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">{queue.patients}</p>
                      <p className="text-xs uppercase tracking-wide text-base-content/60">waiting</p>
                    </div>
                    <button className="btn btn-sm btn-outline" type="button" onClick={() => callNextPatient(queue.department)} disabled={!queue.patients}>
                      Call next
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="card-title">Doctors</h2>
                <p className="text-sm text-base-content/60">Current staff assigned to today&apos;s queues.</p>
              </div>
              <button className="btn btn-sm btn-ghost" type="button" onClick={() => setIsAddDoctorOpen(true)}>Manage staff</button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>Doctor</th><th>Department</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="font-medium">{doctor.name}</td>
                      <td>{doctor.department}</td>
                      <td><span className={`badge ${doctor.status === "Available" ? "badge-success" : "badge-warning"}`}>{doctor.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {isAddDoctorOpen && (
        <dialog className="modal modal-open" open>
          <div className="modal-box">
            <h2 className="text-xl font-bold">Add a doctor</h2>
            <p className="mt-1 text-sm text-base-content/60">Assign a doctor to a department queue.</p>
            <form className="mt-5 space-y-4" onSubmit={addDoctor}>
              <label className="form-control">
                <span className="label-text mb-2 font-medium">Doctor name</span>
                <input className="input input-bordered" value={doctorName} onChange={(event) => setDoctorName(event.target.value)} placeholder="Dr. Priya Menon" required />
              </label>
              <label className="form-control">
                <span className="label-text mb-2 font-medium">Department</span>
                <select className="select select-bordered" value={doctorDepartment} onChange={(event) => setDoctorDepartment(event.target.value)}>
                  {queues.map((queue) => <option key={queue.department}>{queue.department}</option>)}
                </select>
              </label>
              <div className="modal-action">
                <button className="btn btn-ghost" type="button" onClick={() => setIsAddDoctorOpen(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Add doctor</button>
              </div>
            </form>
          </div>
          <button className="modal-backdrop" type="button" aria-label="Close dialog" onClick={() => setIsAddDoctorOpen(false)}>Close</button>
        </dialog>
      )}
    </main>
  );
}

function SummaryCard({ label, value, detail }) {
  return (
    <article className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body p-5">
        <p className="text-sm text-base-content/60">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-base-content/50">{detail}</p>
      </div>
    </article>
  );
}
