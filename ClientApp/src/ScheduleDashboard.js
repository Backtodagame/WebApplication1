import React, { useState, useEffect } from 'react';
import { Table, Tag, message, Button, Select, Space, Typography, Switch } from 'antd'; 
import { Link } from 'react-router-dom';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek'; 

dayjs.extend(isoWeek);
dayjs.locale('vi');

const { Option } = Select;
const { Title } = Typography;

// --- 1. SỬA BASE URL VÀ THÊM MOCK DATA ---
const BASE_API_URL = 'https://localhost:7059/api'; // <-- CỔNG C# MỚI

// Dùng dữ liệu cứng tạm thời cho Users (vì API /api/users chưa tồn tại ở C#)
const MOCK_USER_OPTIONS = [
  { label: 'PGS.TS. Nguyễn Hồng Hải - Phó Hiệu trưởng', value: 'nhhai@dut.udn.vn' },
  { label: 'Phòng CTSV', value: 'Phong Cong tac Sinh vien' },
  { label: 'Trường Ban Thanh tra Nhân dân', value: 'nvnguyen@dut.udn.vn' },
  { label: 'Chủ tịch hội đồng TS. Huỳnh Phương Nam', value: 'Huynh Phuong Nam' },
  { label: 'Admin', value: 'admin@gmail.com' },
  { label: 'Le Tien Dung', value: 'ltdung@dut.udn.vn' },
  { label: 'Nguyen Huu Hieu', value: 'nhhieu@dut.udn.vn' },
];
// ----------------------------------------

// (Dữ liệu tuần và trạng thái giữ nguyên)
const weekOptions = [
  { label: "Tuần 40: 30-09-2025 - 06-10-2025", value: "2025-W40", startDate: "2025-09-30", endDate: "2025-10-06" },
  { label: "Tuần 41: 07-10-2025 - 13-10-2025", value: "2025-W41", startDate: "2025-10-07", endDate: "2025-10-13" },
  { label: "Tuần 42: 14-10-2025 - 20-10-2025", value: "2025-W42", startDate: "2025-10-14", endDate: "2025-10-20" },
];
const currentWeekValue = "2025-W42"; 
const statusOptions = [
  { label: 'Tất cả', value: 'Tất cả' },
  { label: 'Chờ duyệt', value: 'cho_duyet' },
  { label: 'Đã duyệt', value: 'da_duyet' },
];


const ScheduleDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedWeek, setSelectedWeek] = useState(currentWeekValue);
  const [userOptions, setUserOptions] = useState(MOCK_USER_OPTIONS); // Dùng MOCK DATA
  const [selectedHost, setSelectedHost] = useState(null); 
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  // HÀM GỌI API (ĐÃ SỬA URL)
  const fetchSchedules = (weekValue, hostValue, statusValue) => {
    setLoading(true);
    const week = weekOptions.find(w => w.value === weekValue);
    
    // 2. SỬ DỤNG BASE_API_URL MỚI
    let apiUrl = new URL(`${BASE_API_URL}/schedules`);

    if (week) apiUrl.searchParams.append('startDate', week.startDate);
    if (hostValue) apiUrl.searchParams.append('chuTri', hostValue); // Gửi email
    if (statusValue && statusValue !== 'Tất cả') apiUrl.searchParams.append('trangThai', statusValue);

    fetch(apiUrl.toString())
      .then(response => response.json())
      .then(data => {
        let processedData = data.map(item => ({ ...item, key: item.id }));
        
        // Xử lý gộp ô (rowSpan)
        for (let i = 0; i < processedData.length; i++) {
          if (processedData[i].rowSpan === 0) continue;
          let count = 1; 
          for (let j = i + 1; j < processedData.length; j++) {
            if (dayjs(processedData[i].ngay).isSame(processedData[j].ngay, 'day')) {
              processedData[j].rowSpan = 0; 
              count++;
            } else { break; }
          }
          processedData[i].rowSpan = count;
        }

        setSchedules(processedData);
        setLoading(false);
      })
      .catch(error => {
        message.error('Không thể tải danh sách lịch. Đảm bảo C# Backend (7059) đang chạy.');
        setLoading(false);
      });
  };

  // useEffect GỌI API (ĐÃ HOÀN CHỈNH)
  useEffect(() => {
    fetchSchedules(selectedWeek, selectedHost, selectedStatus);
  }, [selectedWeek, selectedHost, selectedStatus]); 

  // 3. XÓA BỎ useEffect TẢI USER CŨ (đã dùng MOCK DATA)

  // (Các hàm handle giữ nguyên)
  const handleWeekChange = (newValue) => { setSelectedWeek(newValue); };
  const handleHostChange = (newValue) => { setSelectedHost(newValue); };
  const handleStatusChange = (newValue) => { setSelectedStatus(newValue); };
  
  // (Các cột giữ nguyên)
  const columns = [
    { title: 'Thứ/Ngày', dataIndex: 'ngay', key: 'thuNgay', width: 150, onCell: (record) => ({ rowSpan: record.rowSpan }), render: (text) => { const date = dayjs(text); const dayName = date.format('dddd'); const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1); return (<div style={{ fontWeight: 'bold' }}><div>{capitalizedDayName}</div><div>{date.format('DD/MM/YYYY')}</div></div>); }, },
    { title: 'Thời Gian', key: 'thoiGian', render: (record) => `${record.batDau.slice(0, 5)} - ${record.ketThuc.slice(0, 5)}`, width: 120 },
    { title: 'Nội Dung', dataIndex: 'noiDung', key: 'noiDung', render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} /> },
    { title: 'Thành Phần', dataIndex: 'thanhPhan', key: 'thanhPhan', render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />, width: 300, },
    { title: 'Địa Điểm', dataIndex: 'diaDiem', key: 'diaDiem', width: 150 },
    { title: 'Chủ Trì', dataIndex: 'chuTriTen', key: 'chuTriTen', width: 150 }, 
    { title: 'Tài Khoản Chủ Trì', dataIndex: 'chuTriEmail', key: 'chuTriEmail', width: 150 },
    { title: 'ĐV duyệt', key: 'evDuyet', render: (record) => (<Tag color={record.trangThai === 'cho_duyet' ? 'blue' : 'green'}>{record.trangThai === 'cho_duyet' ? 'CHỜ' : 'OK'}</Tag>), width: 100 },
    { title: 'Hành Động', key: 'hanhDong', render: () => <Button>Thêm MS Outlook</Button>, width: 150 },
  ];

  return (
    <div style={{ padding: '0px' }}>
      
      {/* (Thanh nút giữ nguyên) */}
      <div className="schedule-header-bar">
        <Space>
          <Link to="/dang-ky">
            <Button type="primary" style={{ backgroundColor: '#00a65a' }}>Đăng ký lịch mới</Button>
          </Link>
          <Button danger type="primary" style={{ backgroundColor: '#f39c12' }}>Xóa lịch</Button>
        </Space>
      </div>

      {/* (Hàng Bộ lọc giữ nguyên) */}
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
                onChange={handleWeekChange}
              >
                {weekOptions.map(week => (
                  <Option key={week.value} value={week.value}>{week.label}</Option>
                ))}
              </Select>
            </div>
            <div>
              <span className="filter-label">Lịch của chủ trì</span>
              <Select 
                placeholder="Chọn chủ trì (tài khoản)" 
                style={{ width: 200 }} 
                className="filter-select" 
                allowClear
                value={selectedHost}
                onChange={handleHostChange}
                options={userOptions}
                loading={userOptions.length === 0}
              >
              </Select>
            </div>
            <div>
              <span className="filter-label">Trạng thái lịch</span>
              <Select 
                value={selectedStatus} 
                style={{ width: 150 }} 
                className="filter-select"
                onChange={handleStatusChange}
                options={statusOptions}
              >
              </Select>
            </div>
      </Space>

      {/* (Phần còn lại giữ nguyên) */}
      <Space style={{ marginBottom: 16, display: 'flex' }} wrap>
        <Space>
          <Switch size="small" />
          <span>Lịch của tôi</span>
        </Space>
        <Space>
          <Switch size="small" />
          <span>Lịch của tôi tạo</span>
        </Space>
        <Space>
          <Switch size="small" />
          <span>Thuộc đơn vị</span>
        </Space>
        <Space>
          <Switch size="small" />
          <span>Đã hủy</span>
        </Space>
      </Space>

      <Button style={{ backgroundColor: '#ffc107', color: '#000', marginBottom: 16 }}>
        Danh sách tất cả các lịch
      </Button>
      <Title level={3} style={{ textAlign: 'center' }}>
        LỊCH CÔNG TÁC TUẦN
      </Title>
      <Table
        columns={columns}
        dataSource={schedules}
        loading={loading}
        bordered
        size="small"
      />
    </div>
  );
};

export default ScheduleDashboard;