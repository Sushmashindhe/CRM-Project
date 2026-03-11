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
            if (login.Email == "senior@test.com" && login.Password == "1234")
            {
                return Ok(new
                {
                    name = "Senior Manager",
                    role = "SeniorManager"
                });
            }
            var manager = _context.Managers
                .FirstOrDefault(x => x.Email.ToLower() == login.Email.ToLower());
            if (manager == null)
                return Unauthorized("Email not found");
            bool validPassword = BCrypt.Net.BCrypt.Verify(login.Password, manager.Password);
            if (!validPassword)
                return Unauthorized("Invalid password");
            var claims = new[]
            {
                new Claim(ClaimTypes.Email, manager.Email),
                new Claim(ClaimTypes.Role, manager.Role)
            };
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
            );
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                role = manager.Role,
                email = manager.Email
            });
        }
        
    }
}
