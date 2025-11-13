// File: Controllers/LocationsController.cs

using Microsoft.AspNetCore.Mvc;
using ScheduleBackend.Api.Repositories; // Import Repositories
using ScheduleBackend.Api.Models;
namespace ScheduleBackend.Api.Controllers
{
    // Attributes quan trọng để định nghĩa đây là Controller
    [Route("api/[controller]")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly LocationRepository _locationRepository;

        // Dependency Injection: Nhận LocationRepository
        public LocationsController(LocationRepository locationRepository)
        {
            _locationRepository = locationRepository;
        }

        // --- 1. GET /api/locations (Lấy danh sách cho Frontend) ---
        [HttpGet]
        public IActionResult GetLocations([FromQuery] string? format) // <-- THÊM DẤU ? VÀO ĐÂY
        {
            var locations = _locationRepository.GetAll();

            // Logic Controller: Xử lý định dạng đầu ra
            if (format == "antd") // Dành cho ô Select trong Form Đăng Ký
            {
                var antdOptions = locations.Select(loc => new {
                    label = loc.Ten,
                    value = loc.Ten
                }).ToList();
                return Ok(antdOptions);
            }

            // Mặc định: Trả về dữ liệu thô (Dành cho Trang Quản Lý)
            return Ok(locations);
        }

        // --- 2. POST /api/locations (Thêm mới) ---
        [HttpPost]
        public IActionResult PostLocation([FromBody] Location newLocation)
        {
            if (newLocation == null || string.IsNullOrWhiteSpace(newLocation.Ten))
            {
                return BadRequest(new { message = "Tên địa điểm là bắt buộc." });
            }

            try
            {
                // LƯU Ý: Bạn cần chạy lại dự án để tạo Model Location.cs trước
                int newId = _locationRepository.Create(newLocation);
                return StatusCode(201, new { message = "Đã thêm địa điểm thành công.", id = newId });
            }
            catch (Exception)
            {
                // Thêm logging chi tiết ở đây
                return StatusCode(500, new { message = "Lỗi máy chủ khi thêm địa điểm." });
            }
        }

        // --- 3. DELETE /api/locations/{id} (Xóa) ---
        [HttpDelete("{id}")]
        public IActionResult DeleteLocation(int id)
        {
            try
            {
                bool success = _locationRepository.Delete(id);
                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy địa điểm để xóa." });
                }
                return Ok(new { message = "Đã xóa địa điểm thành công." });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Lỗi máy chủ khi xóa địa điểm." });
            }
        }
    }
}
