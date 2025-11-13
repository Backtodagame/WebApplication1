//Trí: Đây là file controller và view cho đăng nhập và đăng ký người dùng







using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;


namespace WebApplication1.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
        }
        //ĐĂNG KÝ
        [HttpGet]
        public IActionResult Register()
        {
            return View(model: new RegisterViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email };
                var result = await _userManager.CreateAsync(user, model.Password);
                if (result.Succeeded)
                {   //Gán vai trò mặc định cho người đăng ký mới
                    await _userManager.AddToRoleAsync(user, "User");
                    //Đăng nhập sau khi đăng ký
                    await _signInManager.SignInAsync(user, isPersistent: false);
                    return RedirectToAction("Index", "Home");
                }
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }
            return View(model);
        }
        //ĐĂNG NHẬP
        [HttpGet]
        public IActionResult Login(string returnUrl = null)
        {
            return View(model: new LoginViewModel { ReturnUrl = returnUrl });
        }


        [HttpPost]
public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
{
    ViewData["ReturnUrl"] = returnUrl;
    if (ModelState.IsValid)
    {
        // 1. TÌM KIẾM NGƯỜI DÙNG BẰNG EMAIL TRỰC TIẾP
        var user = await _userManager.FindByEmailAsync(model.Email);
        
        if (user != null)
        {
            // 2. SỬ DỤNG SignInManager.PasswordSignInAsync VỚI USERNAME ĐÃ TÌM ĐƯỢC
            // (Đảm bảo UserName = Email)
            var result = await _signInManager.PasswordSignInAsync(
                model.Email,
                model.Password,
                isPersistent: false,
                lockoutOnFailure: false);
            
            if (result.Succeeded)
            {
                if (Url.IsLocalUrl(returnUrl)) return Redirect(returnUrl);
                return RedirectToAction("Index", "Home");
            }

            // Xử lý các lỗi cụ thể nếu cần
            if (result.IsLockedOut)
            {
                ModelState.AddModelError(string.Empty, "Tài khoản bị khóa.");
            }
            else if (result.IsNotAllowed)
            {
                ModelState.AddModelError(string.Empty, "Tài khoản chưa được cho phép đăng nhập.");
            }
            else
            {
                ModelState.AddModelError(string.Empty, "Mật khẩu không đúng.");
            }
        }
        else
        {
            // Không tìm thấy người dùng với Email này
            ModelState.AddModelError(string.Empty, "Email không tồn tại.");
        }
    }
    return View(model);

        }

        //Đăng xuất
        // --- Đăng Xuất (Logout) ---
        [HttpPost]
            // Nên dùng [ValidateAntiForgeryToken] trong thực tế, nhưng nếu bạn bỏ qua thì không cần
            // [ValidateAntiForgeryToken] 
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            // Chuyển hướng về trang chủ sau khi đăng xuất
            return RedirectToAction("Index", "Home"); 
        }
    }
}


