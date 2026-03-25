using CRM.Data;
using CRM.DTOs;
using CRM.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDTO login)
        {
            // Senior Manager login
            if (login.Email.Trim().ToLower() == "virat@senior.com" && login.Password == "Virat@1111")
            {
                var token = GenerateToken(login.Email, "SeniorManager", 0);

                return Ok(new
                {
                    token = token,
                    role = "SeniorManager",
                    email = login.Email
                });
            }

            // Manager login
            var manager = _context.Managers
                .FirstOrDefault(x => x.Email.ToLower() == login.Email.ToLower());

            if (manager != null)
            {
                bool validPassword = BCrypt.Net.BCrypt.Verify(login.Password, manager.Password);

                if (!validPassword)
                    return Unauthorized("Invalid password");

                var managerToken = GenerateToken(manager.Email, manager.Role, manager.Id);

                return Ok(new
                {
                    token = managerToken,
                    id = manager.Id,
                    role = manager.Role,
                    name = manager.Name,
                    email = manager.Email,
                    phone = manager.Phone,   // ✅ add this
                    managerType = manager.ManagerType,
                    status = manager.Status   // ✅ ADD THIS

                });
            }

            //Employee login

            var employee = _context.Employees

                .FirstOrDefault(x => x.Email.ToLower() == login.Email.ToLower());

            if (employee != null)

            {

                bool validPassword = BCrypt.Net.BCrypt.Verify(login.Password, employee.Password);

                if (!validPassword)

                    return Unauthorized("Invalid password");

                var employeeToken = GenerateToken(employee.Email, employee.Role, employee.Id);

                return Ok(new

                {

                    token = employeeToken,

                    role = employee.Role,

                    id = employee.Id,

                    name = employee.Name,

                    email = employee.Email,

                    employeeType = employee.EmployeeType

                });

            }


            // Customer login
            var customer = _context.Customers
                .FirstOrDefault(x => x.Email.ToLower() == login.Email.ToLower());

            if (customer != null)
            {
                bool validPassword = BCrypt.Net.BCrypt.Verify(login.Password, customer.Password);

                if (!validPassword)
                    return Unauthorized("Invalid password");

                return Ok(new
                {
                    role = "Customer",
                    user = customer
                });
            }

            return Unauthorized("User not found");
        }

        [HttpPost("verify-placeofbirth")]
        public IActionResult VerifyPlaceOfBirth([FromBody] VerifyRequest req)
        {
            // First check Manager
            var manager = _context.Managers
                .FirstOrDefault(x => x.Email == req.Email &&
                                     x.PlaceOfBirth.ToLower() == req.PlaceOfBirth.ToLower());

            if (manager != null)
                return Ok();

            // Then check Employee
            var employee = _context.Employees
                .FirstOrDefault(x => x.Email == req.Email &&
                                     x.PlaceOfBirth.ToLower() == req.PlaceOfBirth.ToLower());

            if (employee != null)
                return Ok();

            return BadRequest("Email or Place Of Birth incorrect");
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetRequest req)
        {
            var user = _context.Managers
                .FirstOrDefault(x => x.Email.ToLower() == req.Email.ToLower());

            if (user != null)
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
                _context.SaveChanges();
                return Ok("Password updated successfully");
            }

            // ADDED: Employee password reset
            var employee = _context.Employees
                .FirstOrDefault(x => x.Email.ToLower() == req.Email.ToLower());

            if (employee != null)
            {
                employee.Password = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
                _context.SaveChanges();
                return Ok("Password updated successfully");
            }

            return BadRequest("User not found");
        }
        private string GenerateToken(string email, string role, int id, string? managerType = null)
        {
            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Email, email),
        new Claim(ClaimTypes.Role, role),
        new Claim(ClaimTypes.NameIdentifier, id.ToString()) // ✅ must be NameIdentifier
    };

            if (managerType != null)
                claims.Add(new Claim("ManagerType", managerType));

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddMinutes(120), // increased for testing
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}