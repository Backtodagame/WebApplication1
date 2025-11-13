const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const dayjs = require('dayjs');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// (Kết nối DB giữ nguyên)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lich_tuan_db'
});
db.connect((err) => {
  if (err) { console.error('Lỗi kết nối MySQL:', err); return; }
  console.log('Đã kết nối thành công đến MySQL!');
});

// --- DỮ LIỆU USERS (Giữ nguyên) ---
const users = [
  { label: 'PGS.TS. Nguyễn Hồng Hải - Phó Hiệu trưởng', value: 'nhhai@dut.udn.vn' },
  { label: 'Phòng CTSV', value: 'Phong Cong tac Sinh vien' },
  { label: 'Trường Ban Thanh tra Nhân dân', value: 'nvnguyen@dut.udn.vn' },
  { label: 'Chủ tịch hội đồng TS. Huỳnh Phương Nam', value: 'Huynh Phuong Nam' },
  { label: 'Admin', value: 'admin@gmail.com' },
  { label: 'Le Tien Dung', value: 'ltdung@dut.udn.vn' },
  { label: 'Nguyen Huu Hieu', value: 'nhhieu@dut.udn.vn' },
];
// ---------------------------------

// --- SỬA LẠI API ĐỊA ĐIỂM ---
// Xóa mảng 'locations' giả

// 1. API GET /api/locations (Lấy từ DB)
// 1. API GET /api/locations (SỬA LẠI: Trả về dữ liệu thô từ DB)
app.get('/api/locations', (req, res) => {
  // Chúng ta cần 'id' để Xóa, 'ten' để hiển thị, 'ngayTao'
  db.query("SELECT id, ten, ngayTao FROM locations ORDER BY ten", (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy địa điểm:', err);
      res.status(500).json({ error: 'Lỗi máy chủ' });
      return;
    }
    res.json(results); // Trả về dữ liệu gốc
  });
});

// 2. API POST /api/locations (Thêm địa điểm mới)
app.post('/api/locations', (req, res) => {
  const { ten } = req.body; // Lấy 'ten' từ React

  if (!ten) {
    return res.status(400).json({ error: 'Tên địa điểm là bắt buộc' });
  }

  const sql = "INSERT INTO locations (ten) VALUES (?)";
  db.query(sql, [ten], (err, result) => {
    if (err) {
      console.error('Lỗi khi thêm địa điểm:', err);
      res.status(500).json({ error: 'Lỗi máy chủ' });
      return;
    }
    res.status(201).json({ message: 'Đã thêm địa điểm thành công', newId: result.insertId });
  });
});

// 3. API DELETE /api/locations/:id (Xóa địa điểm)
app.delete('/api/locations/:id', (req, res) => {
  const { id } = req.params;
  
  db.query("DELETE FROM locations WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error('Lỗi khi xóa địa điểm:', err);
      res.status(500).json({ error: 'Lỗi máy chủ' });
      return;
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
    }
    res.status(200).json({ message: 'Đã xóa địa điểm thành công' });
  });
});
// --- HẾT SỬA API ĐỊA ĐIỂM ---


app.get('/api/users', (req, res) => {
  res.json(users);
});

// (API GET /schedules giữ nguyên)
app.get('/api/schedules', (req, res) => {
  const { startDate, endDate, chuTri, trangThai } = req.query; 
  let sql = "SELECT * FROM schedules";
  const params = [];
  const whereClauses = []; 
  if (startDate && endDate) {
    whereClauses.push("ngay BETWEEN ? AND ?");
    params.push(startDate);
    params.push(endDate);
  }
  if (chuTri) {
    whereClauses.push("chuTriEmail = ?");
    params.push(chuTri);
  }
  if (trangThai && trangThai !== 'Tất cả') {
    whereClauses.push("trangThai = ?");
    params.push(trangThai);
  }
  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }
  sql += " ORDER BY ngay, batDau";
  if (whereClauses.length === 0) {
    sql += " LIMIT 100";
  }
  db.query(sql, params, (err, results) => {
    if (err) { console.error('Lỗi truy vấn:', err); res.status(500).json({ error: 'Lỗi máy chủ' }); return; }
    res.json(results);
  });
});

// (API POST /schedules giữ nguyên)
app.post('/api/schedules', (req, res) => {
  const { ngay, thoiGian, thuocPhuLuc, noiDung, thanhPhan, guiMail, diaDiem, chuTriTen, chuTriEmail } = req.body;
  const ngayFormatted = dayjs(ngay).format('YYYY-MM-DD');
  const batDauFormatted = dayjs(thoiGian[0]).format('HH:mm:ss');
  const ketThucFormatted = dayjs(thoiGian[1]).format('HH:mm:ss');
  const sql = `INSERT INTO schedules (ngay, batDau, ketThuc, thuocPhuLuc, noiDung, thanhPhan, guiMail, diaDiem, chuTriTen, chuTriEmail, trangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_duyet')`;
  const values = [ngayFormatted, batDauFormatted, ketThucFormatted, thuocPhuLuc, noiDung, thanhPhan, guiMail, diaDiem, chuTriTen, chuTriEmail];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Lỗi khi chèn dữ liệu:', err);
      res.status(500).json({ error: 'Không thể đăng ký lịch, có lỗi máy chủ.' });
      return;
    }
    console.log('Đã thêm 1 lịch mới vào database!');
    res.status(201).json({ message: 'Đăng ký lịch thành công, đang chờ duyệt!' });
  });
});

// (API PATCH /approve giữ nguyên)
app.patch('/api/schedules/:id/approve', (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE schedules SET trangThai = ? WHERE id = ?";
  const values = ["da_duyet", id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      res.status(500).json({ error: 'Không thể duyệt lịch.' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Không tìm thấy lịch hẹn để duyệt.' });
      return;
    }
    console.log(`Đã duyệt lịch hẹn ID: ${id}`);
    res.status(200).json({ message: 'Đã duyệt lịch thành công.' });
  });
});


app.listen(port, () => {
  console.log(`Backend API đang chạy tại http://localhost:${port}`);
});
