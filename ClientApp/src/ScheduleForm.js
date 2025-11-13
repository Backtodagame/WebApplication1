import React, { useRef, useState, useEffect } from 'react';
import {
  Form,
  Button,
  DatePicker,
  TimePicker,
  Select,
  Switch,
  message,
  Input 
} from 'antd';
import { Editor } from '@tinymce/tinymce-react';

const { RangePicker } = TimePicker;
const { Option } = Select;

// 1. DỮ LIỆU USERS TẠM THỜI (để tránh gọi API Users chưa tồn tại ở C#)
const MOCK_USER_OPTIONS = [
  { label: 'Admin', value: 'admin@gmail.com' },
  { label: 'Le Tien Dung', value: 'ltdung@dut.udn.vn' },
  { label: 'PGS.TS. Nguyễn Hồng Hải', value: 'nhhai@dut.udn.vn' },
  { label: 'Nguyen Huu Hieu', value: 'nhhieu@dut.udn.vn' },
  { label: 'Huynh Phuong Nam', value: 'hpnam@dut.udn.vn' }
];


const ScheduleForm = () => {
  const [form] = Form.useForm();
  const editorNoiDungRef = useRef(null);
  const editorThanhPhanRef = useRef(null);
  
  const [locationOptions, setLocationOptions] = useState([]);
  
  // Sửa: Dùng dữ liệu cứng tạm thời cho users
  const userOptions = MOCK_USER_OPTIONS; 

  // --- SỬA LOGIC FETCH CHỈ CÒN LOCATION ---
  useEffect(() => {
    // 2. GỌI API LOCATIONS BẰNG CỔNG C# MỚI
    fetch('https://localhost:7059/api/locations?format=antd')
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => setLocationOptions(data))
      .catch(error => {
          console.error('Lỗi tải địa điểm:', error);
          message.error('Lỗi tải địa điểm. Đã thử gọi API C# (7059).');
      });
      
    // (Bỏ qua fetch users cũ)

  }, []); 
  // --- HẾT PHẦN SỬA ---


  // (Hàm onFinish và handleHostChange giữ nguyên)
  const onFinish = (values) => {
    const noiDung = editorNoiDungRef.current ? editorNoiDungRef.current.getContent() : '';
    const thanhPhan = editorThanhPhanRef.current ? editorThanhPhanRef.current.getContent() : '';

    if (!noiDung || noiDung.trim() === '') {
      message.error('Vui lòng nhập Nội dung!');
      return; 
    }

    const fullData = {
      ...values, 
      noiDung,
      thanhPhan,
    };

    // 3. GỌI API POST BẰNG CỔNG C# MỚI
    fetch('https://localhost:7059/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData),
    })
    .then(res => res.json())
    .then(result => {
      message.success(result.message);
      form.resetFields(); 
      if (editorNoiDungRef.current) editorNoiDungRef.current.setContent('');
      if (editorThanhPhanRef.current) editorThanhPhanRef.current.setContent('');
    })
    .catch(() => message.error('Có lỗi xảy ra khi đăng ký!'));
  };

  // Hàm này đã được sửa để hoạt động với dữ liệu cứng
  const handleHostChange = (selectedValue) => {
    const selectedUser = userOptions.find(u => u.value === selectedValue);

    if (selectedUser) {
      form.setFieldsValue({
        chuTriTen: selectedUser.label
      });
    } else {
      form.setFieldsValue({
        chuTriTen: undefined
      });
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', maxWidth: '800px', margin: 'auto' }}>
      <h2>Tạo Lịch Tuần</h2>
      <Form
        form={form} 
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ thuocPhuLuc: false, guiMail: false }}
      >
        {/* (Các trường khác giữ nguyên) */}
        <Form.Item name="ngay" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="thoiGian" label="Thời gian (Bắt đầu - Kết thúc)" rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}>
          <RangePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="thuocPhuLuc" label="Thuộc phụ lục" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="Nội dung">
          <Editor apiKey='gcwiz4nqpl1ayyyc6jufm6ubb04zdbvio0dct1vaec17lrql' onInit={(evt, editor) => editorNoiDungRef.current = editor} init={{ height: 250, menubar: false, plugins: 'anchor autolink link lists searchreplace table visualblocks wordcount', toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | table link' }} />
        </Form.Item>
        <Form.Item label="Thành Phần">
          <Editor apiKey='gcwiz4nqpl1ayyyc6jufm6ubb04zdbvio0dct1vaec17lrql' onInit={(evt, editor) => editorThanhPhanRef.current = editor} init={{ height: 250, menubar: false, plugins: 'anchor autolink link lists searchreplace table visualblocks wordcount', toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | table link' }} />
        </Form.Item>
        <Form.Item name="guiMail" label="Gửi mail cho thành phần" valuePropName="checked">
          <Switch />
        </Form.Item>
        
        {/* ĐỊA ĐIỂM (LOCATION) */}
        <Form.Item name="diaDiem" label="Địa điểm" rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}>
          <Select showSearch placeholder="Chọn địa điểm" options={locationOptions} loading={locationOptions.length === 0} />
        </Form.Item>

        {/* CHỦ TRÌ (HOST) */}
        <Form.Item name="chuTriEmail" label="Chủ trì (Chọn tài khoản)" rules={[{ required: true, message: 'Vui lòng chọn tài khoản chủ trì!' }]}>
          <Select 
            showSearch 
            placeholder="Chọn người dùng" 
            options={userOptions} // Dùng dữ liệu cứng tạm thời
            loading={userOptions.length === 0} 
            onChange={handleHostChange}
            allowClear
          />
        </Form.Item>
        
        <Form.Item name="chuTriTen" label="Tên hiển thị chủ trì" rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]}>
          <Input placeholder="Sẽ tự động điền khi bạn chọn tài khoản ở trên" disabled />
        </Form.Item>
        {/* --- HẾT SỬA --- */}

        <Form.Item>
          <Button type="primary" htmlType="submit">Đăng ký</Button>
        </Form.Item>
      </Form>
    </div>
  );
};
export default ScheduleForm;