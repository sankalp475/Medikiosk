import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './pages/Medikiosk.jsx'
import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx'
import DoctorDashboard from './pages/dashboard/DoctorDashboard.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [{ path: '/dashboard/admin', element: <AdminDashboard /> }],
  },
  {
    element: <ProtectedRoute allowedRoles={["doctor"]} />,
    children: [{ path: '/dashboard/doctor', element: <DoctorDashboard /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
