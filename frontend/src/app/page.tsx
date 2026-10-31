"use client";

import dynamic from "next/dynamic";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { useEffect } from "react";
import NewRequestPage from "@/app-pages/NewRequestPage";
import DashboardPage from "@/app-pages/DashboardPage";
import RequestDetailPage from "@/app-pages/RequestDetailPage";
import ExportPage from "@/app-pages/ExportPage";
import HomePage from "@/app-pages/HomePage";
import StartPage from "@/app-pages/StartPage";
import { LoginPage, SignupPage } from "@/app-pages/AuthPages";
import CalendarPage from "@/app-pages/CalendarPage";
import MaterialsPage from "@/app-pages/MaterialsPage";
import SchedulePage from "@/app-pages/SchedulePage";
import ClassPage from "@/app-pages/ClassPage";
import SettingsPage from "@/app-pages/SettingsPage";
import Navigation from "@/components/shared/navigation";
import { ThemeProvider } from "@/components/shared/ThemeContext";

function AppContent() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const publicPage =
    pathname === "/" || pathname === "/signup" || pathname === "/login";

  useEffect(() => {
    if (publicPage) return;
    if (!localStorage.getItem("edupriority:account")) {
      navigate("/login", { replace: true });
    }
  }, [navigate, publicPage]);

  return (
    <div
      className={
        publicPage
          ? "min-h-screen"
          : "flex min-h-screen flex-col md:flex-row"
      }
    >
      {!publicPage && <Navigation />}
      <main
        className={
          publicPage
            ? "min-h-screen"
            : "min-h-screen min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-12 lg:py-10"
        }
      >
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/requests/new" element={<NewRequestPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/home/calendar" element={<CalendarPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/class" element={<ClassPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
