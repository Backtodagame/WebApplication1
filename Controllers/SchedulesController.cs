// File: Controllers/SchedulesController.cs

using Microsoft.AspNetCore.Mvc;
using ScheduleBackend.Api.Repositories;
using System.Collections.Generic;
using ScheduleBackend.Api.Models; // <-- Dòng này phải có

namespace ScheduleBackend.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private readonly ScheduleRepository _scheduleRepository;

        public SchedulesController(ScheduleRepository scheduleRepository)
        {
            _scheduleRepository = scheduleRepository;
        }

        [HttpGet]
        public IActionResult GetSchedules(
            [FromQuery] string? startDate,
            [FromQuery] string? endDate,
            [FromQuery] string? chuTri,
            [FromQuery] string? trangThai)
        {
            try
            {
                var schedules = _scheduleRepository.GetFilteredSchedules(startDate, endDate, chuTri, trangThai);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi truy vấn Schedules: " + ex.Message);
                return StatusCode(500, new { message = "Lỗi máy chủ khi truy vấn lịch." });
            }
        }

        [HttpPost]
        // File: Controllers/SchedulesController.cs (THAY THẾ phương thức PostSchedule)

        [HttpPost]
        public IActionResult PostSchedule([FromBody] Schedule newSchedule)
        {
            // Kiểm tra tính hợp lệ cơ bản
            if (newSchedule == null || string.IsNullOrEmpty(newSchedule.ChuTriEmail))
            {
                return BadRequest(new { message = "Dữ liệu đăng ký không hợp lệ: Thiếu Chủ trì." });
            }

            try
            {
                // Gọi repository để lưu
                int newId = _scheduleRepository.Create(newSchedule);

                // Trả về kết quả
                return StatusCode(201, new { message = "Đăng ký lịch thành công, chờ duyệt.", id = newId });
            }
            catch (Exception ex)
            {
                // Xử lý lỗi (ví dụ: lỗi DB, lỗi format)
                Console.WriteLine("Lỗi khi tạo lịch: " + ex.Message);
                return StatusCode(500, new { message = "Lỗi máy chủ: Không thể đăng ký lịch." });
            }
        }
        [HttpPatch("{id}/approve")]
        public IActionResult ApproveSchedule(int id)
        {
            try
            {
                // Gọi repository để cập nhật trạng thái sang "da_duyet"
                bool success = _scheduleRepository.UpdateStatus(id, "da_duyet");

                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy lịch hẹn để duyệt." });
                }

                // Trả về kết quả
                return Ok(new { message = "Đã duyệt lịch thành công." });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi duyệt lịch: " + ex.Message);
                return StatusCode(500, new { message = "Lỗi máy chủ khi duyệt lịch." });
            }
        }
    }
}
