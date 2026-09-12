import { useMemo, useState } from "react";
import { HeartPulse, LogOut, Plus, Users, Stethoscope, Building2, LayoutDashboard, Clock } from "lucide-react";
import { clearUserSession } from "../../auth/auth";

const initialDoctors = [
  { id: 1, name: "Dr. Ananya Rao", department: "General Medicine", status: "Available" },
  { id: 2, name: "Dr. Vikram Shah", department: "Cardiology", status: "In consultation" },
  { id: 3, name: "Dr. Meera Nair", department: "Pediatrics", status: "Available" },
  { id: 4, name: "Dr. Rajesh Kulkarni", department: "Orthopedics", status: "Available" },
];

const initialQueues = [
  { department: "General Medicine", patients: 18, next: "P-1042", wait: "12 min", color: "bg-emerald-600" },
  { department: "Cardiology", patients: 7, next: "P-1028", wait: "24 min", color: "bg-sky-600" },
  { department: "Pediatrics", patients: 11, next: "P-1037", wait: "18 min", color: "bg-amber-500" },
  { department: "Orthopedics", patients: 5, next: "P-1019", wait: "9 min", color: "bg-violet-600" },
];

const QUEUE_COLORS = ["bg-emerald-600", "bg-sky-600", "bg-amber-500", "bg-violet-600", "bg-rose-500", "bg-teal-600", "bg-indigo-500", "bg-orange-500"];

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [queues, setQueues] = useState(initialQueues);
  const [department, setDepartment] = useState("All departments");
  const [doctorName, setDoctorName] = useState("");
  const [doctorDepartment, setDoctorDepartment] = useState("General Medicine");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const departments = useMemo(
    () => ["All departments", ...new Set(queues.map((queue) => queue.department))],
    [queues],
  );
  const visibleQueues = department === "All departments" ? queues : queues.filter((queue) => queue.department === department);
  const totalPatients = queues.reduce((total, queue) => total + queue.patients, 0);

  function addDoctor(event) {
    event.preventDefault();
    const name = doctorName.trim();
    if (!name) return;
    setDoctors((currentDoctors) => [...currentDoctors, { id: Date.now(), name, department: doctorDepartment, status: "Available" }]);
    setDoctorName("");
    setIsAddDoctorOpen(false);
  }

  function addDepartment(event) {
    event.preventDefault();
    const name = newDepartmentName.trim();
    if (!name) return;
    const exists = queues.some((queue) => queue.department.toLowerCase() === name.toLowerCase());
    if (exists) return;
    setQueues((currentQueues) => [
      ...currentQueues,
      { department: name, patients: 0, next: "—", wait: "0 min", color: QUEUE_COLORS[currentQueues.length % QUEUE_COLORS.length] },
    ]);
    setNewDepartmentName("");
    setIsAddDepartmentOpen(false);
  }

  function callNextPatient(departmentName) {
    setQueues((currentQueues) => currentQueues.map((queue) => (
      queue.department === departmentName && queue.patients > 0 ? { ...queue, patients: queue.patients - 1 } : queue
    )));
  }

  function signOut() {
    clearUserSession();
    window.location.assign("/login");
  }

  return (
    <main className="min-h-screen bg-slate-200/60 font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="navbar mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300">
              <HeartPulse className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-xl font-black leading-none tracking-[-0.03em] text-slate-950">
                  Medi<span className="text-emerald-700">Kiosk</span>
                </p>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Allopathy &amp; Ayurveda
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">Clinic Patient Intake &amp; Registration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">Today, 12 September 2026</span>
            <button className="btn btn-sm border-slate-200 bg-white text-slate-600 hover:border-emerald-700 hover:bg-emerald-700 hover:text-white" type="button" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Hospital name panel — dark emerald */}
        <div className="rounded-2xl bg-emerald-800 p-6 shadow-lg shadow-emerald-900/30 sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Admin Control Panel</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Aayush Integrated Super-Specialty Hospital</h1>
            <p className="mt-2 text-sm text-emerald-200/80">Administration &amp; Central Triage Dispatch Control</p>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto lg:hidden">
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "dashboard" ? "bg-emerald-700 text-white" : "bg-white text-slate-600 shadow-sm"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "doctors" ? "bg-emerald-700 text-white" : "bg-white text-slate-600 shadow-sm"}`}
            onClick={() => setActiveTab("doctors")}
          >
            Doctors
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "patients" ? "bg-emerald-700 text-white" : "bg-white text-slate-600 shadow-sm"}`}
            onClick={() => setActiveTab("patients")}
          >
            Patients
          </button>
        </div>

        {/* Content area: floating sidebar + main content */}
        <div className="mt-8 flex gap-6">
          {/* Floating sidebar */}
          <aside className="sticky top-8 hidden h-fit w-56 shrink-0 flex-col rounded-2xl bg-white p-4 shadow-md shadow-slate-300/40 lg:flex">
            <nav className="space-y-1">
              <SidebarLink
                icon={LayoutDashboard}
                label="Dashboard"
                active={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
              />
              <SidebarLink
                icon={Stethoscope}
                label="Doctors"
                active={activeTab === "doctors"}
                onClick={() => setActiveTab("doctors")}
              />
              <SidebarLink
                icon={Users}
                label="Patients"
                active={activeTab === "patients"}
                onClick={() => setActiveTab("patients")}
              />
            </nav>
          </aside>

          {/* Main panel content */}
          <div className="flex-1 space-y-6">
            {/* 1. DASHBOARD PANEL */}
            {activeTab === "dashboard" && (
              <>
                {/* Summary cards — 50/50 split */}
                <section className="flex gap-4" aria-label="Daily summary">
                  <SummaryCard
                    icon={Users}
                    label="Patients waiting"
                    value={totalPatients}
                    detail="Across all departments"
                  />
                  <SummaryCard
                    icon={Stethoscope}
                    label="Doctors on duty"
                    value={`${doctors.filter((d) => d.status === "Available").length} / ${doctors.length}`}
                    detail="Assigned to today"
                  />
                </section>

                {/* Active patient queues — table */}
                <section className="rounded-2xl bg-white p-6 shadow-md shadow-slate-300/40">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Active patient queues</h2>
                      <p className="mt-1 text-sm text-slate-500">Call the next patient from any department.</p>
                    </div>
                    <select
                      className="select select-bordered w-full border-slate-300 bg-white sm:w-56"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      aria-label="Filter queues by department"
                    >
                      {departments.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                          <th className="py-2 font-semibold">Department</th>
                          <th className="py-2 font-semibold">Next Patient</th>
                          <th className="py-2 font-semibold">Avg Wait</th>
                          <th className="py-2 text-center font-semibold">Waiting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleQueues.map((queue) => (
                          <tr key={queue.department} className="border-b border-slate-50 transition-colors hover:bg-slate-50/60">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${queue.color}`} aria-hidden="true" />
                                <span className="font-semibold text-slate-900">{queue.department}</span>
                              </div>
                            </td>
                            <td className="py-2 text-slate-600">{queue.next}</td>
                            <td className="py-2">
                              <span className="badge badge-sm border-emerald-200 bg-emerald-50 text-emerald-700">{queue.wait}</span>
                            </td>
                            <td className="py-2 text-center">
                              <span className="text-lg font-bold text-slate-950">{queue.patients}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* 2. DOCTORS PANEL */}
            {activeTab === "doctors" && (
              <section className="space-y-6">
                {/* Summary cards */}
                <div className="flex gap-4">
                  <SummaryCard
                    icon={Stethoscope}
                    label="Doctors on duty"
                    value={`${doctors.filter((d) => d.status === "Available").length} / ${doctors.length}`}
                    detail="Currently available staff"
                  />
                  <SummaryCard
                    icon={Building2}
                    label="Active Departments"
                    value={queues.length}
                    detail="Clinical specialties"
                  />
                </div>

                {/* Available doctors list */}
                <div className="rounded-2xl bg-white p-5 shadow-md shadow-slate-300/40">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Hospital Doctors</h2>
                      <p className="text-xs text-slate-500">All assigned and available doctors on duty.</p>
                    </div>
                    <span className="badge badge-sm border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {doctors.length} Total Doctors
                    </span>
                  </div>

                  {/* Compact Doctors Table with visible borders and gray odd rows */}
                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="table table-sm w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                          <th className="border-r border-slate-200 px-3 py-2 font-semibold">Doctor</th>
                          <th className="border-r border-slate-200 px-3 py-2 font-semibold">Department</th>
                          <th className="px-3 py-2 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.map((doctor, index) => (
                          <tr
                            key={doctor.id}
                            className={`border-b border-slate-200 transition-colors ${
                              index % 2 === 0 ? "bg-slate-100/80" : "bg-white"
                            } hover:bg-slate-200/60`}
                          >
                            <td className="border-r border-slate-200 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-[11px] font-bold text-emerald-800">
                                  {doctor.name.replace("Dr. ", "").charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-slate-900">{doctor.name}</span>
                              </div>
                            </td>
                            <td className="border-r border-slate-200 px-3 py-2 text-xs text-slate-600">{doctor.department}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  doctor.status === "Available"
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                    : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    doctor.status === "Available" ? "bg-emerald-600" : "bg-amber-500"
                                  }`}
                                />
                                {doctor.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Buttons below list to Add Doctors and Add Department */}
                  <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-3.5">
                    <button
                      type="button"
                      onClick={() => setIsAddDoctorOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
                    >
                      <Plus className="h-3.5 w-3.5 shrink-0" /> Add Doctor
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddDepartmentOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-900"
                    >
                      <Building2 className="h-3.5 w-3.5 shrink-0" /> Add Department
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 3. PATIENTS PANEL */}
            {activeTab === "patients" && (
              <section className="space-y-6">
                {/* Summary cards */}
                <div className="flex gap-4">
                  <SummaryCard
                    icon={Users}
                    label="Patients waiting"
                    value={totalPatients}
                    detail="Across all departments"
                  />
                  <SummaryCard
                    icon={Clock}
                    label="Active queues"
                    value={queues.length}
                    detail="Departments serving patients"
                  />
                </div>

                {/* Patient Queues Table */}
                <section className="rounded-2xl bg-white p-5 shadow-md shadow-slate-300/40">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Patient Department Queues</h2>
                      <p className="text-xs text-slate-500">Live triage status and dispatch control.</p>
                    </div>
                    <select
                      className="select select-bordered select-sm w-full border-slate-300 bg-white sm:w-52"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      aria-label="Filter queues by department"
                    >
                      {departments.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>

                  {/* Bordered table with balanced spacing and gray odd rows */}
                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="table table-sm w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                          <th className="border-r border-slate-200 px-3.5 py-2 font-semibold">Department</th>
                          <th className="border-r border-slate-200 px-3.5 py-2 font-semibold">Next Patient</th>
                          <th className="border-r border-slate-200 px-3.5 py-2 font-semibold">Avg Wait</th>
                          <th className="px-3.5 py-2 text-center font-semibold">Waiting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleQueues.map((queue, index) => (
                          <tr
                            key={queue.department}
                            className={`border-b border-slate-200 transition-colors ${
                              index % 2 === 0 ? "bg-slate-100/80" : "bg-white"
                            } hover:bg-slate-200/60`}
                          >
                            <td className="border-r border-slate-200 px-3.5 py-2">
                              <div className="flex items-center gap-2.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${queue.color}`} aria-hidden="true" />
                                <span className="text-sm font-semibold text-slate-900">{queue.department}</span>
                              </div>
                            </td>
                            <td className="border-r border-slate-200 px-3.5 py-2 text-xs text-slate-600">{queue.next}</td>
                            <td className="border-r border-slate-200 px-3.5 py-2">
                              <span className="badge badge-sm border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700">{queue.wait}</span>
                            </td>
                            <td className="px-3.5 py-2 text-center">
                              <span className="text-sm font-bold text-slate-950">{queue.patients}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Add Doctor modal */}
      {isAddDoctorOpen && (
        <dialog className="modal modal-open" open>
          <div className="modal-box max-w-md">
            <h2 className="text-xl font-bold text-slate-900">Add a doctor</h2>
            <p className="mt-1 text-sm text-slate-500">Assign a doctor to a department queue.</p>
            <form className="mt-5 space-y-4" onSubmit={addDoctor}>
              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-semibold text-slate-700">Doctor name</label>
                <input
                  className="input input-bordered w-full bg-white border-slate-300 text-sm focus:border-emerald-600 focus:outline-emerald-600"
                  value={doctorName}
                  onChange={(event) => setDoctorName(event.target.value)}
                  placeholder="Dr. Priya Menon"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-semibold text-slate-700">Department</label>
                <select
                  className="select select-bordered w-full bg-white border-slate-300 text-sm focus:border-emerald-600 focus:outline-emerald-600"
                  value={doctorDepartment}
                  onChange={(event) => setDoctorDepartment(event.target.value)}
                >
                  {queues.map((queue) => (
                    <option key={queue.department}>{queue.department}</option>
                  ))}
                </select>
              </div>
              <div className="modal-action">
                <button className="btn btn-ghost" type="button" onClick={() => setIsAddDoctorOpen(false)}>
                  Cancel
                </button>
                <button className="btn border-0 bg-emerald-700 text-white hover:bg-emerald-800" type="submit">
                  Add doctor
                </button>
              </div>
            </form>
          </div>
          <button className="modal-backdrop" type="button" aria-label="Close dialog" onClick={() => setIsAddDoctorOpen(false)}>
            Close
          </button>
        </dialog>
      )}

      {/* Add Department modal */}
      {isAddDepartmentOpen && (
        <dialog className="modal modal-open" open>
          <div className="modal-box max-w-md">
            <h2 className="text-xl font-bold text-slate-900">Add a department</h2>
            <p className="mt-1 text-sm text-slate-500">Create a new department queue.</p>
            <form className="mt-5 space-y-4" onSubmit={addDepartment}>
              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-semibold text-slate-700">Department name</label>
                <input
                  className="input input-bordered w-full bg-white border-slate-300 text-sm focus:border-emerald-600 focus:outline-emerald-600"
                  value={newDepartmentName}
                  onChange={(event) => setNewDepartmentName(event.target.value)}
                  placeholder="e.g. Dermatology"
                  required
                />
              </div>
              <div className="modal-action">
                <button className="btn btn-ghost" type="button" onClick={() => setIsAddDepartmentOpen(false)}>
                  Cancel
                </button>
                <button className="btn border-0 bg-emerald-700 text-white hover:bg-emerald-800" type="submit">
                  Add department
                </button>
              </div>
            </form>
          </div>
          <button className="modal-backdrop" type="button" aria-label="Close dialog" onClick={() => setIsAddDepartmentOpen(false)}>
            Close
          </button>
        </dialog>
      )}

    </main>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-800"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
      title={label}
      onClick={onClick}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {label}
    </button>
  );
}

function SummaryCard({ icon: Icon, label, value, detail }) {
  return <article className="card flex-1 bg-white shadow-md shadow-slate-300/40"><div className="card-body px-4 py-3"><div className="flex items-center justify-between"><p className="text-xs font-medium text-slate-500">{label}</p><Icon className="h-4 w-4 text-emerald-600" aria-hidden="true" /></div><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p><p className="text-[11px] text-slate-400">{detail}</p></div></article>;
}

