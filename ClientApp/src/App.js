import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

// Import các trang
import MainLayout from './MainLayout';
import ScheduleDashboard from './ScheduleDashboard';
import ScheduleForm from './ScheduleForm';
import LocationManagement from './LocationManagement';
import AdminSchedulePage from './AdminSchedulePage'; // <-- 1. IMPORT TRANG ADMIN MỚI

// (Đối tượng ngôn ngữ tùy chỉnh giữ nguyên)
const customLocale = {
  ...viVN,
  TimePicker: {
    ...viVN.TimePicker,
    ok: 'Chọn', 
  },
  DatePicker: {
    ...viVN.DatePicker,
    lang: {
      ...viVN.DatePicker.lang,
      ok: 'Chọn',
    }
  },
};

function App() {
  return (
    <ConfigProvider locale={customLocale}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ScheduleDashboard />} />
            <Route path="dang-ky" element={<ScheduleForm />} />
            <Route path="dia-diem" element={<LocationManagement />} />
            
            {/* 2. SỬA LẠI ROUTE NÀY */}
            <Route path="quan-ly" element={<AdminSchedulePage />} /> 
            
            <Route path="nguoi-dung" element={<div>Trang Người dùng (chưa tạo)</div>} />
            <Route path="khoa-phong" element={<div>Trang Khoa/Phòng (chưa tạo)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;