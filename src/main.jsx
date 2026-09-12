import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './pages/Medikiosk.jsx'
import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/dashboard/admin', element: <AdminDashboard /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
