import { useEffect, useMemo, useState } from "react";
import { HeartPulse, LogOut, Plus, Users, Stethoscope, Building2, LayoutDashboard, Clock } from "lucide-react";
import { clearUserSession, getStoredUser } from "../../auth/auth";
import { adminApi, authApi } from "../../api/client";

const QUEUE_COLORS = ["bg-emerald-600", "bg-sky-600", "bg-amber-500", "bg-violet-600", "bg-rose-500", "bg-teal-600", "bg-indigo-500", "bg-orange-500"];

export default function AdminDashboard() {
  const user = getStoredUser();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState({ active: 0, total: 0 });
  const [department, setDepartment] = useState("All departments");
  const [doctorName, setDoctorName] = useState("");
  const [doctorDepartmentId, setDoctorDepartmentId] = useState(null);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [doctorRoomNumber, setDoctorRoomNumber] = useState("");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentPatientLabel, setNewDepartmentPatientLabel] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [deptRes, doctorRes, statsRes] = await Promise.all([
        adminApi.departments(),
        adminApi.doctors(),
        adminApi.stats(),
      ]);
      setDepartments(
        deptRes.departments.map((d, idx) => ({
          id: d.department_id,
          name: d.department_name,
          patientLabel: d.patient_label,
          doctorsOnDuty: d.doctors_on_duty,
          waiting: d.waiting,
          avgWait: d.avg_wait_minutes,
          color: QUEUE_COLORS[idx % QUEUE_COLORS.length],
        }))
      );
      setDoctors(doctorRes.doctors);
      setDoctorsOnDuty(statsRes.doctors);
      if (!doctorDepartmentId && deptRes.departments.length > 0) {
        setDoctorDepartmentId(deptRes.departments[0].department_id);
      }
    } catch {
      // Dashboard fetch failure - panels just render empty until next load.
    }
  }

  const departmentNames = useMemo(
    () => ["All departments", ...departments.map((d) => d.name)],
    [departments],
  );
  const visibleDepartments = department === "All departments" ? departments : departments.filter((d) => d.name === department);
  const totalPatients = departments.reduce((total, d) => total + d.waiting, 0);

  async function addDoctor(event) {
    event.preventDefault();
    setFormError("");
    const name = doctorName.trim();
    if (!name || !doctorEmail.trim() || !doctorPassword || !doctorDepartmentId) return;

    try {
      await adminApi.createDoctor({
        name,
        email: doctorEmail.trim(),
        password: doctorPassword,
        department_id: doctorDepartmentId,
        room_number: doctorRoomNumber.trim(),
      });
      await loadAll();
      setDoctorName("");
      setDoctorEmail("");
      setDoctorPassword("");
      setDoctorRoomNumber("");
      setIsAddDoctorOpen(false);
    } catch (err) {
      setFormError(err.message || "Could not add doctor.");
    }
  }

  async function addDepartment(event) {
    event.preventDefault();
    setFormError("");
    const name = newDepartmentName.trim();
    if (!name) return;

    try {
      await adminApi.createDepartment({ name, patient_label: newDepartmentPatientLabel.trim() });
      await loadAll();
      setNewDepartmentName("");
      setNewDepartmentPatientLabel("");
      setIsAddDepartmentOpen(false);
    } catch (err) {
      setFormError(err.message || "Could not add department.");
    }
  }

  async function signOut() {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, still clear the local session below.
    }
    clearUserSession();
    window.location.assign("/login");
  }

  return (
    <main className="min-h-screen bg-slate-200/60 font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-2xs">
        <div className="navbar w-full px-4 py-2.5 sm:px-8 sm:py-3 min-h-[68px] sm:min-h-[76px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300/80 shadow-xs">
              <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2">
                <p className="text-lg sm:text-xl lg:text-2xl font-black leading-none tracking-[-0.03em] text-slate-950">
                  Medi<span className="text-emerald-700">Kiosk</span>
                </p>
                <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Admin Control Panel
                </span>
              </div>
              <p className="hidden sm:block mt-1 text-xs font-semibold text-slate-500">Aayush Integrated Super-Specialty Hospital</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-800">
              {user?.name || "Admin"}
            </span>
            <button
              className="btn btn-sm border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 hover:border-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors rounded-xl px-3.5 shadow-xs"
              type="button"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
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
                        {departmentNames.map((item) => <option key={item}>{item}</option>)}
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
                        {visibleDepartments.map((d, index) => (
                          <tr
                            key={d.id}
                            className={`transition-colors ${
                              index % 2 === 0 ? "bg-slate-100/90" : "bg-white"
                            } hover:bg-slate-200/60`}
                          >
                            <td className="border border-slate-300 px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${d.color}`} aria-hidden="true" />
                                <span className="text-xs font-semibold text-slate-900">{d.name}</span>
                              </div>
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5">
                              <span className="badge badge-sm border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700">{d.avgWait} min</span>
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 text-center">
                              <span className="text-xs font-bold text-slate-950">{d.waiting}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card bottom: Showing status on left, Patients waiting & Doctors on duty stats on right */}
                  <div className="mt-3 flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      Showing <strong className="font-semibold text-slate-800">{visibleDepartments.length}</strong> of {departments.length} departments
                    </span>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Users className="h-3.5 w-3.5 text-emerald-600" />
                        Patients waiting: <strong className="font-bold text-slate-900">{totalPatients}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                        Doctors on duty: <strong className="font-bold text-slate-900">{doctorsOnDuty.active_today ?? doctorsOnDuty.active} / {doctorsOnDuty.total}</strong>
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
                                  {doctor.avatar_initial}
                                </div>
                                <span className="text-xs font-semibold text-slate-900">{doctor.name}</span>
                              </div>
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 text-xs text-slate-600">{doctor.department_name}</td>
                            <td className="border border-slate-300 px-3 py-1.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  doctor.status === "available"
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                    : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    doctor.status === "available" ? "bg-emerald-600" : "bg-amber-500"
                                  }`}
                                />
                                {doctor.status_display}
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
                        Doctors on duty: <strong className="font-bold text-slate-900">{doctors.filter((d) => d.status === "available").length} / {doctors.length}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                        <Building2 className="h-3.5 w-3.5 text-slate-600" />
                        Active Departments: <strong className="font-bold text-slate-900">{departments.length}</strong>
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
                      {departments.length} Total Departments
                    </span>
                  </div>

                  {/* Bordered compact table with gray odd rows and scrollbar if side/height overflows */}
                  <div className="mt-2.5 max-h-[380px] overflow-auto rounded-xl border border-slate-300 shadow-sm [scrollbar-width:thin]">
                    <table className="w-full min-w-[500px] border-collapse border border-slate-300 text-left text-xs">
                      <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                        <tr className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-700">
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Department</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Patient-Facing Label</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Doctors on Duty</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5">Avg Wait</th>
                          <th className="border border-slate-300 bg-slate-100 px-3 py-1.5 text-center">Waiting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((d, index) => (
                          <tr
                            key={d.id}
                            className={`transition-colors ${
                              index % 2 === 0 ? "bg-slate-100/90" : "bg-white"
                            } hover:bg-slate-200/60`}
                          >
                            <td className="border border-slate-300 px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${d.color}`} aria-hidden="true" />
                                <span className="text-xs font-semibold text-slate-900">{d.name}</span>
                              </div>
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 text-xs text-slate-600">
                              {d.patientLabel ? (
                                <span className="font-medium text-emerald-700">{d.patientLabel}</span>
                              ) : (
                                <span className="italic text-slate-400">Same as name</span>
                              )}
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 text-xs text-slate-600">
                              {d.doctorsOnDuty.length > 0 ? (
                                <span className="font-medium text-slate-800">{d.doctorsOnDuty.join(", ")}</span>
                              ) : (
                                <span className="italic text-slate-400">No doctor assigned</span>
                              )}
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5">
                              <span className="badge badge-sm border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700">{d.avgWait} min</span>
                            </td>
                            <td className="border border-slate-300 px-3 py-1.5 text-center">
                              <span className="text-xs font-bold text-slate-950">{d.waiting}</span>
                            </td>
                          </tr>
                        ))}
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
                        Active Departments: <strong className="font-bold text-slate-900">{departments.length}</strong>
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
                  value={doctorDepartmentId || ""}
                  onChange={(event) => setDoctorDepartmentId(Number(event.target.value))}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
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
                <p className="mt-1 text-[11px] text-slate-400">Doctor will use this email &amp; password to sign in to the Doctor Portal.</p>
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-semibold text-slate-700">Room Number (optional)</label>
                <input
                  className="input input-bordered w-full bg-white border-slate-300 text-sm focus:border-emerald-600 focus:outline-emerald-600"
                  value={doctorRoomNumber}
                  onChange={(event) => setDoctorRoomNumber(event.target.value)}
                  placeholder="e.g. Room 201 • Cardiology Wing"
                />
              </div>
              {formError && <p className="text-xs font-semibold text-rose-700">{formError}</p>}
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
                  placeholder="e.g. Ophthalmology"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-semibold text-slate-700">Patient-facing label (optional)</label>
                <input
                  className="input input-bordered w-full bg-white border-slate-300 text-sm focus:border-emerald-600 focus:outline-emerald-600"
                  value={newDepartmentPatientLabel}
                  onChange={(event) => setNewDepartmentPatientLabel(event.target.value)}
                  placeholder="e.g. Eyes (defaults to department name if left blank)"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  This is what patients see on the kiosk instead of the department name above.
                </p>
              </div>
              {formError && <p className="text-xs font-semibold text-rose-700">{formError}</p>}
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
