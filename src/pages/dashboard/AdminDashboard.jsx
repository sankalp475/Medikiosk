import { useMemo, useState } from "react";
import { HeartPulse, LogOut, Plus, Users, Stethoscope, Building2, LayoutDashboard, Clock } from "lucide-react";
import { clearUserSession } from "../../auth/auth";
import { getStoredDoctors, saveStoredDoctors, getStoredQueues, saveStoredQueues, saveStoredAccount } from "../../storage/db";

const QUEUE_COLORS = ["bg-emerald-600", "bg-sky-600", "bg-amber-500", "bg-violet-600", "bg-rose-500", "bg-teal-600", "bg-indigo-500", "bg-orange-500"];

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState(() => getStoredDoctors());
  const [queues, setQueues] = useState(() => getStoredQueues());
  const [department, setDepartment] = useState("All departments");
  const [doctorName, setDoctorName] = useState("");
  const [doctorDepartment, setDoctorDepartment] = useState("General Medicine");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
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
    const email = doctorEmail.trim() || `${name.toLowerCase().replace(/[^a-z]/g, "")}@hospital.org`;
    const newDoctor = {
      id: Date.now(),
      name,
      department: doctorDepartment,
      email,
      status: "Available",
    };

    setDoctors((currentDoctors) => {
      const updated = [...currentDoctors, newDoctor];
      saveStoredDoctors(updated);
      return updated;
    });

    // Save doctor account into localStorage so they can log in immediately
    saveStoredAccount({
      email,
      password: doctorPassword || "doctor123",
      role: "doctor",
      name,
      department: doctorDepartment,
    });

    setDoctorName("");
    setDoctorEmail("");
    setDoctorPassword("");
    setIsAddDoctorOpen(false);
  }

  function addDepartment(event) {
    event.preventDefault();
    const name = newDepartmentName.trim();
    if (!name) return;
    const exists = queues.some((queue) => queue.department.toLowerCase() === name.toLowerCase());
    if (exists) return;

    setQueues((currentQueues) => {
      const updated = [
        ...currentQueues,
        { department: name, patients: 0, next: "—", wait: "0 min", color: QUEUE_COLORS[currentQueues.length % QUEUE_COLORS.length] },
      ];
      saveStoredQueues(updated);
      return updated;
    });

    setNewDepartmentName("");
    setIsAddDepartmentOpen(false);
  }

  function callNextPatient(departmentName) {
    setQueues((currentQueues) => {
      const updated = currentQueues.map((queue) => (
        queue.department === departmentName && queue.patients > 0 ? { ...queue, patients: queue.patients - 1 } : queue
      ));
      saveStoredQueues(updated);
      return updated;
    });
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

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {/* Hospital name panel — compact dark emerald */}
        <div className="rounded-2xl bg-emerald-800 p-4 sm:p-5 shadow-md shadow-emerald-900/20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">Admin Control Panel</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">Aayush Integrated Super-Specialty Hospital</h1>
            <p className="mt-1 text-xs text-emerald-200/80">Administration &amp; Central Triage Dispatch Control</p>
          </div>
        </div>

        {/* Mobile Navigation Tabs with horizontal scrollbar if screen is narrow */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] lg:hidden">
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "dashboard" ? "bg-emerald-700 text-white" : "bg-white text-slate-600 shadow-sm"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "departments" ? "bg-emerald-700 text-white" : "bg-white text-slate-600 shadow-sm"}`}
            onClick={() => setActiveTab("departments")}
          >
            Departments
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === "doctors" ? "bg-emerald-700 text-white" : "bg-white text-slate-600 shadow-sm"}`}
            onClick={() => setActiveTab("doctors")}
          >
            Doctors
          </button>
        </div>

        {/* Content area: floating sidebar + main content with symmetric gap-5 mt-5 */}
        <div className="mt-5 flex gap-5">
          {/* Floating sidebar with overflow scrollbar if height overflows screen */}
          <aside className="sticky top-6 hidden h-fit max-h-[calc(100vh-3rem)] w-52 shrink-0 flex-col overflow-y-auto [scrollbar-width:thin] rounded-2xl bg-white p-3.5 shadow-md shadow-slate-300/40 lg:flex">
            <nav className="space-y-1">
              <SidebarLink
                icon={LayoutDashboard}
                label="Dashboard"
                active={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
              />
              <SidebarLink
                icon={Building2}
                label="Departments"
                active={activeTab === "departments"}
                onClick={() => setActiveTab("departments")}
              />
              <SidebarLink
                icon={Stethoscope}
                label="Doctors"
                active={activeTab === "doctors"}
                onClick={() => setActiveTab("doctors")}
              />
            </nav>
          </aside>

          {/* Main panel content */}
          <div className="flex-1 space-y-5">
            {/* 1. DASHBOARD PANEL */}
            {activeTab === "dashboard" && (
              <section>
                {/* Active patient queues card — compact bordered table with gray odd rows, embedded stats badges, and scrollbars */}
                <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-md shadow-slate-300/40">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Active patient queues</h2>
                      <p className="text-xs text-slate-500">Live patient queue status across all departments.</p>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <select
                        className="select select-bordered select-sm border-slate-300 bg-white text-xs sm:w-44"
                        value={department}
                        onChange={(event) => setDepartment(event.target.value)}
                        aria-label="Filter queues by department"
                      >
                        {departments.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2.5 max-h-[380px] overflow-auto rounded-xl border border-slate-300 shadow-sm [scrollbar-width:thin]">
                    <table className="w-full min-w-[500px] border-collapse border border-slate-300 text-left text-xs">
                      <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                        <tr className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-700">
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Department</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Avg Wait</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5 text-center">Waiting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleQueues.map((queue, index) => (
                          <tr
                            key={queue.department}
                            className={`transition-colors ${
                              index % 2 === 0 ? "bg-slate-100/90" : "bg-white"
                            } hover:bg-slate-200/60`}
                          >
                            <td className="border border-slate-300 px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${queue.color}`} aria-hidden="true" />
                                <span className="text-xs font-semibold text-slate-900">{queue.department}</span>
                              </div>
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5">
                              <span className="badge badge-sm border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700">{queue.wait}</span>
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 text-center">
                              <span className="text-xs font-bold text-slate-950">{queue.patients}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card bottom: Showing status on left, Patients waiting & Doctors on duty stats on right */}
                  <div className="mt-3 flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      Showing <strong className="font-semibold text-slate-800">{visibleQueues.length}</strong> of {queues.length} departments
                    </span>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Users className="h-3.5 w-3.5 text-emerald-600" />
                        Patients waiting: <strong className="font-bold text-slate-900">{totalPatients}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                        Doctors on duty: <strong className="font-bold text-slate-900">{doctors.filter((d) => d.status === "Available").length} / {doctors.length}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 2. DOCTORS PANEL */}
            {activeTab === "doctors" && (
              <section>
                {/* Available doctors list card */}
                <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-md shadow-slate-300/40">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Hospital Doctors</h2>
                      <p className="text-xs text-slate-500">All assigned and available doctors on duty.</p>
                    </div>
                    <span className="badge badge-sm border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {doctors.length} Total Doctors
                    </span>
                  </div>

                  {/* Compact Doctors Table with visible borders, gray odd rows, and scrollbar if side/height overflows */}
                  <div className="mt-2.5 max-h-[380px] overflow-auto rounded-xl border border-slate-300 shadow-sm [scrollbar-width:thin]">
                    <table className="w-full min-w-[500px] border-collapse border border-slate-300 text-left text-xs">
                      <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                        <tr className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-700">
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Doctor</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Department</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.map((doctor, index) => (
                          <tr
                            key={doctor.id}
                            className={`transition-colors ${
                              index % 2 === 0 ? "bg-slate-100/90" : "bg-white"
                            } hover:bg-slate-200/60`}
                          >
                            <td className="border border-slate-300 px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-[11px] font-bold text-emerald-800">
                                  {doctor.name.replace("Dr. ", "").charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-slate-900">{doctor.name}</span>
                              </div>
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 text-xs text-slate-600">{doctor.department}</td>
                            <td className="border border-slate-300 px-3 py-1.5">
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

                  {/* Card bottom: Add Doctor button on left, duty/dept stats on right */}
                  <div className="mt-3 flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setIsAddDoctorOpen(true)}
                      className="flex w-fit items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
                    >
                      <Plus className="h-3.5 w-3.5 shrink-0" /> Add Doctor
                    </button>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                        Doctors on duty: <strong className="font-bold text-slate-900">{doctors.filter((d) => d.status === "Available").length} / {doctors.length}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Building2 className="h-3.5 w-3.5 text-slate-600" />
                        Active Departments: <strong className="font-bold text-slate-900">{queues.length}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 3. DEPARTMENTS PANEL */}
            {activeTab === "departments" && (
              <section>
                {/* Departments Card */}
                <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-md shadow-slate-300/40">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Hospital Departments</h2>
                      <p className="text-xs text-slate-500">Manage clinical specialties, triage queues, and doctor assignments.</p>
                    </div>
                    <span className="badge badge-sm border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {queues.length} Total Departments
                    </span>
                  </div>

                  {/* Bordered compact table with gray odd rows and scrollbar if side/height overflows */}
                  <div className="mt-2.5 max-h-[380px] overflow-auto rounded-xl border border-slate-300 shadow-sm [scrollbar-width:thin]">
                    <table className="w-full min-w-[500px] border-collapse border border-slate-300 text-left text-xs">
                      <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                        <tr className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-700">
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Department</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Doctors on Duty</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Avg Wait</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5 text-center">Waiting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queues.map((queue, index) => {
                          const deptDoctors = doctors.filter((d) => d.department === queue.department);
                          return (
                            <tr
                              key={queue.department}
                              className={`transition-colors ${
                                index % 2 === 0 ? "bg-slate-100/90" : "bg-white"
                              } hover:bg-slate-200/60`}
                            >
                              <td className="border border-slate-300 px-3 py-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`h-2.5 w-2.5 rounded-full ${queue.color}`} aria-hidden="true" />
                                  <span className="text-xs font-semibold text-slate-900">{queue.department}</span>
                                </div>
                              </td>
                              <td className="border border-slate-300 px-3 py-1.5 text-xs text-slate-600">
                                {deptDoctors.length > 0 ? (
                                  <span className="font-medium text-slate-800">
                                    {deptDoctors.map((d) => d.name).join(", ")}
                                  </span>
                                ) : (
                                  <span className="italic text-slate-400">No doctor assigned</span>
                                )}
                              </td>
                              <td className="border border-slate-300 px-3 py-1.5">
                                <span className="badge badge-sm border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700">{queue.wait}</span>
                              </td>
                              <td className="border border-slate-300 px-3 py-1.5 text-center">
                                <span className="text-xs font-bold text-slate-950">{queue.patients}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Card bottom: Add Department button on left, stats on right */}
                  <div className="mt-3 flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setIsAddDepartmentOpen(true)}
                      className="flex w-fit items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
                    >
                      <Plus className="h-3.5 w-3.5 shrink-0" /> Add Department
                    </button>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                        Active Departments: <strong className="font-bold text-slate-900">{queues.length}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-600" />
                        Waiting Patients: <strong className="font-bold text-slate-900">{totalPatients}</strong>
                      </span>
                    </div>
                  </div>
                </div>
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

              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-semibold text-slate-700">Doctor Email ID</label>
                <input
                  type="email"
                  className="input input-bordered w-full bg-white border-slate-300 text-sm focus:border-emerald-600 focus:outline-emerald-600"
                  value={doctorEmail}
                  onChange={(event) => setDoctorEmail(event.target.value)}
                  placeholder="dr.priya@hospital.org"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-semibold text-slate-700">Login Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full bg-white border-slate-300 text-sm focus:border-emerald-600 focus:outline-emerald-600"
                  value={doctorPassword}
                  onChange={(event) => setDoctorPassword(event.target.value)}
                  placeholder="Set initial password for staff login"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-400">Doctor will use this email &amp; password to sign in to the Doctor Workspace.</p>
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

