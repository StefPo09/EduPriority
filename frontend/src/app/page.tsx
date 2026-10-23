"use client";

import dynamic from "next/dynamic";
import { BrowserRouter, Route, Routes } from "react-router";
import NewRequestPage from "@/app-pages/NewRequestPage";
import DashboardPage from "@/app-pages/DashboardPage";
import RequestDetailPage from "@/app-pages/RequestDetailPage";
import ExportPage from "@/app-pages/ExportPage";
import Navigation from "@/components/shared/Navigation";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Navigation />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-12 lg:py-10">
          <Routes>
            <Route path="/" element={<NewRequestPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
