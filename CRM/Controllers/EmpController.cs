using BCrypt.Net;
using CRM.Data;
using CRM.DTOs;
using CRM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public EmpController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        /* ============================
           Employee Login
        ============================ */

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDTO login)
        {
            var employee = _context.Employees
                .FirstOrDefault(e => e.Email == login.Email);

            if (employee == null)
                return Unauthorized("Invalid email");

            bool validPassword =
                BCrypt.Net.BCrypt.Verify(login.Password, employee.Password);

            if (!validPassword)
                return Unauthorized("Invalid password");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, employee.Id.ToString()),
                new Claim(ClaimTypes.Name, employee.Name),
                new Claim(ClaimTypes.Role, employee.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var creds = new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds);

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                role = employee.Role,
                user = employee
            });
        }

        

        /* ============================
           View Employee Profile
        ============================ */

        [Authorize(Roles = "Employee")]
        [HttpGet("profile/{id}")]
        public IActionResult GetEmployee(int id)
        {
            var emp = _context.Employees
                .Include(e => e.Manager)  // important
                .FirstOrDefault(e => e.Id == id);

            if (emp == null)
                return NotFound();

            return Ok(new
            {
                emp.Id,
                emp.Name,
                emp.Email,
                emp.Phone,
                emp.EmployeeType,
                emp.ManagerId,
                ManagerName = emp.Manager != null ? emp.Manager.Name : "Not Assigned"
            });
        }

        /* ============================
           Update Employee Profile
        ============================ */

        [Authorize(Roles = "Employee")]
        [HttpPut("{id}")]
        public IActionResult UpdateEmployee(int id, Employees emp)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            if (userId != id)
                return Forbid("You can only update your own profile");

            var existing = _context.Employees.Find(id);

            if (existing == null)
                return NotFound();

            if (_context.Employees.Any(e => e.Email == emp.Email))
            {
                return BadRequest("Email already exists");
            }

            existing.Name = emp.Name;
            existing.Email = emp.Email;
            existing.Phone = emp.Phone;

            _context.SaveChanges();

            return Ok(existing);
        }

        [HttpGet("employee/{empId}")]
        [Authorize(Roles = "Employee")]
        public IActionResult GetEmployeeRequirements(int empId)
        {
            var data = _context.RequirementAssignments
                .Where(x => x.EmployeeId == empId)
                .Select(x => new
                {
                    x.Requirement.Id,
                    x.Requirement.Title,
                    x.Requirement.Description,
                    x.Status
                })
                .ToList();

            return Ok(data);
        }

        [AllowAnonymous]
        [HttpGet("total-employees")]
        public IActionResult GetTotalEmployees()
        {
            var totalEmployees = _context.Employees.Count(); // All employees in EmpController table
            return Ok(totalEmployees);
        }

        [HttpGet("employee-types")]
        public IActionResult EmployeeTypes()
        {
            try
            {
                var data = _context.Employees
                    .GroupBy(e => (e.EmployeeType ?? "Unknown").Trim().ToLower())
                    .Select(g => new
                    {
                        role = g.Key,
                        count = g.Count()
                    })
                    .ToList();

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}