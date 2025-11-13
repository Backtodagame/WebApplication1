// Trí tạo Model đăng nhập
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models // Đảm bảo namespace này khớp với nơi ApplicationUser.cs nằm
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập Email.")]
        [EmailAddress(ErrorMessage = "Địa chỉ Email không hợp lệ.")]
        [Display(Name = "Địa chỉ Email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập Mật khẩu.")]
        [DataType(DataType.Password)]
        [Display(Name = "Mật khẩu")]
        public string Password { get; set; }

        [Display(Name = "Ghi nhớ đăng nhập")]
        public bool RememberMe { get; set; }
        public string? ReturnUrl { get; set; } // Dùng kiểu string? để cho phép giá trị null
    }
}
