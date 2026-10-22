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
        <main className="w-full max-w-262.5 px-5 py-7 md:px-11.5 md:py-10.25">
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
