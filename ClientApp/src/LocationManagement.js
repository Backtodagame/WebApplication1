import React, { useState, useEffect } from 'react';
import { Table, message, Button, Typography, Modal, Form, Input, Popconfirm, Space } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

// --- 1. SỬA CỔNG API ---
const API_URL = 'https://localhost:7059/api/locations'; // Dùng cổng C#

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 1. Hàm gọi API
  const fetchLocations = () => {
    setLoading(true);
    // Gọi API C# (để lấy dữ liệu thô cho Bảng)
    fetch(API_URL) 
      .then(response => response.json())
      .then(data => {
        setLocations(data.map(item => ({ ...item, key: item.id })));
        setLoading(false);
      })
      .catch(error => {
        message.error('Không thể tải danh sách địa điểm.');
        setLoading(false);
      });
  };

  // 2. Gọi API khi tải
  useEffect(() => {
    fetchLocations();
  }, []);

  // 3. Hàm xử lý Tạo
  const handleCreate = (values) => {
    // Gọi API C# (POST)
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values), // Gửi { ten: "..." }
    })
    .then(res => res.json())
    .then(result => {
      if (result.error) {
        message.error(result.error);
      } else {
        message.success(result.message);
        setIsModalVisible(false);
        form.resetFields();
        fetchLocations(); // Tải lại danh sách
      }
    })
    .catch(() => message.error('Có lỗi xảy ra.'));
  };

  // 4. Hàm xử lý Xóa
  const handleDelete = (id) => {
    // Gọi API C# (DELETE)
    fetch(`${API_URL}/${id}`, { 
      method: 'DELETE' 
    })
    .then(res => res.json())
    .then(result => {
      if (result.error) {
        message.error(result.error);
      } else {
        message.success(result.message);
        fetchLocations(); // Tải lại danh sách
      }
    })
    .catch(() => message.error('Có lỗi xảy ra.'));
  };

  // 5. Định nghĩa các cột
  const columns = [
    {
      title: 'TT',
      key: 'tt',
      render: (text, record, index) => index + 1,
      width: 80,
    },
    {
      title: 'Tên',
      dataIndex: 'ten',
      key: 'ten',
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
      width: 200,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa địa điểm này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger size="small">Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '0px' }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>
          Danh Sách Địa Điểm
        </Title>
        <Button 
          type="primary" 
          style={{ backgroundColor: '#28a745' }}
          onClick={() => setIsModalVisible(true)}
        >
          Tạo
        </Button>
      </Space>
      
      <Table
        columns={columns}
        dataSource={locations}
        loading={loading}
        bordered
        size="small"
      />

      <Modal
        title="Tạo địa điểm mới"
        open={isModalVisible} // Dùng 'open' cho antd v5
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="ten"
            label="Tên địa điểm"
            rules={[{ required: true, message: 'Vui lòng nhập tên địa điểm!' }]}
          >
            <Input placeholder="Ví dụ: Hội trường F" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LocationManagement;