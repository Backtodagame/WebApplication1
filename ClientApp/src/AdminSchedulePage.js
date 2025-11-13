import React, { useState, useEffect } from 'react';
import { Table, message, Button, Select, Tabs, Space, Typography, Switch, Tag } from 'antd';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek'; 

dayjs.extend(isoWeek);
dayjs.locale('vi');

const { Option } = Select;
const { Title } = Typography;

// --- 1. SỬA BASE URL ---
const BASE_API_URL = 'https://localhost:7059/api'; // <-- CỔNG C#

// (Dữ liệu tuần - Giống Dashboard)
const weekOptions = [
  { label: "Tuần 40: 30-09-2025 - 06-10-2025", value: "2025-W40", startDate: "2025-09-30", endDate: "2025-10-06" },
  { label: "Tuần 41: 07-10-2025 - 13-10-2025", value: "2025-W41", startDate: "2025-10-07", endDate: "2025-10-13" },
  { label: "Tuần 42: 14-10-2025 - 20-10-2025", value: "2025-W42", startDate: "2025-10-14", endDate: "2025-10-20" },
];
const currentWeekValue = "2025-W42"; 

// Danh sách các Tab Thứ
const dayTabs = [
  { label: 'Thứ Hai', key: '1' }, 
  { label: 'Thứ Ba', key: '2' },
  { label: 'Thứ Tư', key: '3' },
  { label: 'Thứ Năm', key: '4' },
  { label: 'Thứ Sáu', key: '5' },
  { label: 'Thứ Bảy', key: '6' },
  { label: 'Chủ Nhật', key: '7' },
];

const AdminSchedulePage = () => {
  const [allSchedules, setAllSchedules] = useState([]); 
  const [filteredSchedules, setFilteredSchedules] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(currentWeekValue);
  const [activeTabKey, setActiveTabKey] = useState('1'); 

  // (Hàm gọi API giữ nguyên)
  const fetchSchedulesByWeek = (weekValue) => {
    setLoading(true);
    const week = weekOptions.find(w => w.value === weekValue);
    
    let apiUrl = `${BASE_API_URL}/schedules`; 
    if (week) {
      apiUrl += `?startDate=${week.startDate}&endDate=${week.endDate}`;
    }

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const dataWithKey = data.map(item => ({ ...item, key: item.id }));
        setAllSchedules(dataWithKey); 
      })
      .catch(error => message.error('Không thể tải danh sách lịch.'))
      .finally(() => setLoading(false));
  };

  // (useEffect gọi API giữ nguyên)
  useEffect(() => {
    fetchSchedulesByWeek(selectedWeek);
  }, [selectedWeek]);

  // (useEffect lọc Tab giữ nguyên)
  useEffect(() => {
    const dayOfWeek = parseInt(activeTabKey, 10);
    const filtered = allSchedules.filter(s => dayjs(s.ngay).isoWeekday() === dayOfWeek);
    setFilteredSchedules(filtered);
  }, [activeTabKey, allSchedules]);


  // --- 2. THÊM HÀM DUYỆT (GỌI API C#) ---
  const handleApprove = (id) => {
    // Gọi API PATCH C#
    fetch(`${BASE_API_URL}/schedules/${id}/approve`, {
      method: 'PATCH',
    })
    .then(res => {
        if (!res.ok) {
            // Nếu C# trả về lỗi (404, 500), ném lỗi
            return res.json().then(err => { throw new Error(err.message || 'Lỗi không xác định') });
        }
        return res.json();
    })
    .then(result => {
      message.success(result.message);
      // Cập nhật lại trạng thái trong danh sách (state)
      const updateScheduleState = (schedulesList) => {
         return schedulesList.map(schedule => 
            schedule.id === id ? { ...schedule, trangThai: 'da_duyet' } : schedule
         );
      };
      setAllSchedules(updateScheduleState(allSchedules));
      // (useEffect ở trên sẽ tự động cập nhật lại filteredSchedules)
    })
    .catch((err) => message.error(`Không thể duyệt: ${err.message}`));
  };
  // --- HẾT PHẦN SỬA ---


  // --- 3. SỬA LẠI CÁC CỘT (Đơn vị duyệt & Hủy) ---
  const adminColumns = [
    { title: 'TT', key: 'tt', render: (text, record, index) => index + 1, width: 50 },
    { title: 'Thời gian', key: 'thoiGian', render: (r) => `${r.batDau.slice(0, 5)} - ${r.ketThuc.slice(0, 5)}`, width: 120 },
    { title: 'Nội dung', dataIndex: 'noiDung', key: 'noiDung', render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} /> },
    { title: 'Thành phần', dataIndex: 'thanhPhan', key: 'thanhPhan', render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />, width: 250 },
    { title: 'Địa điểm', dataIndex: 'diaDiem', key: 'diaDiem', width: 150 },
    { title: 'Chủ trì', dataIndex: 'chuTriTen', key: 'chuTriTen', width: 150 },
    
    { title: 'Đơn vị đề nghị', dataIndex: 'donViDeNghi', key: 'donViDeNghi', width: 150 },
    
    // Sửa: Dùng 'trangThai' để hiển thị chấm xanh (ĐV Duyệt)
    { 
      title: 'ĐV duyệt', 
      dataIndex: 'trangThai',
      key: 'donViDuyet', 
      width: 100,
      render: (status) => (status === 'da_duyet' ? <Tag color="green" style={{ borderRadius: '50%', height: 20, width: 20, border: 'none' }} /> : <Tag color="gray" style={{ borderRadius: '50%', height: 20, width: 20, border: 'none' }} />) 
    },
    
    { title: 'Bổ sung', key: 'boSung', width: 80, render: () => ('') },
    { title: 'Phụ lục', key: 'phuLuc', width: 80 },
    
    // Sửa: Cột Hủy (thêm nút Duyệt)
    { 
      title: 'Hủy', 
      key: 'huy', 
      width: 100,
      render: (record) => (
        <Space>
          {/* Chỉ hiển thị nút Duyệt nếu đang "chờ duyệt" */}
          {record.trangThai === 'cho_duyet' && (
            <Button type="primary" size="small" onClick={() => handleApprove(record.id)}>
              Duyệt
            </Button>
          )}
          <Button size="small" danger>Hủy</Button>
        </Space>
      )
    },
  ];
  // --- HẾT PHẦN SỬA ---

  return (
    <div style={{ padding: '0px' }}>
      
      {/* (Phần còn lại giữ nguyên) */}
      <div className="schedule-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          Danh sách lịch tuần
        </Title>
        <span style={{ color: 'red', fontWeight: 'bold' }}>
          1 ngày 5 giờ 25 phút 2 giây
        </span>
      </div>

      <Space style={{ marginBottom: 16, display: 'flex' }} wrap align="bottom">
            <div>
              <span className="filter-label">Năm học</span>
              <Select defaultValue="2025-2026" style={{ width: 150 }} className="filter-select">
                <Option value="2025-2026">2025 - 2026</Option>
              </Select>
            </div>
            <div>
              <span className="filter-label">Tuần học</span>
              <Select 
                value={selectedWeek} 
                style={{ width: 250 }} 
                className="filter-select"
                onChange={(value) => setSelectedWeek(value)} 
              >
                {weekOptions.map(week => (
                  <Option key={week.value} value={week.value}>{week.label}</Option>
                ))}
              </Select>
            </div>
            <div>
              <Space>
                <Switch size="small" />
                <span>Đã hủy</span>
              </Space>
            </div>
      </Space>

      <Tabs 
        defaultActiveKey="1" 
        type="card"
        activeKey={activeTabKey}
        onChange={(key) => setActiveTabKey(key)} 
      >
        {dayTabs.map(day => (
          <Tabs.TabPane tab={day.label} key={day.key}>
            <Table
              columns={adminColumns}
              dataSource={filteredSchedules} 
              loading={loading}
              bordered
              size="small"
              pagination={false} 
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminSchedulePage;