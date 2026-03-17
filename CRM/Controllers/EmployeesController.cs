using CRM.Data;
using CRM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Manager,SeniorManager")]
    public IActionResult GetEmployees()
    {
        return Ok(_context.Employees.ToList());
    }




[HttpPost]
[Authorize(Roles = "Manager")]
public IActionResult AddEmployee([FromBody] Employees emp)
{
    try
    {
        var managerClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (managerClaim == null)
            return Unauthorized("Manager ID missing in token");

        int managerId = int.Parse(managerClaim.Value);

        emp.Role = "Employee";
        emp.ManagerId = managerId; // ✅ THIS FIXES YOUR ISSUE
        emp.Password = BCrypt.Net.BCrypt.HashPassword(emp.Password);

        _context.Employees.Add(emp);
        _context.SaveChanges();

        return Ok(emp);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message); // 🔥 will show real error
    }
}

[HttpPut("{id}")]
    [Authorize(Roles = "Manager")]

    public IActionResult UpdateEmployee(int id, Employees emp)
    {
        var existing = _context.Employees.Find(id);

        if (existing == null)
            return NotFound();

        existing.Name = emp.Name;
        existing.Email = emp.Email;
        existing.Phone = emp.Phone;
        existing.EmployeeType = emp.EmployeeType;
        existing.PlaceOfBirth = emp.PlaceOfBirth;

        if (!string.IsNullOrEmpty(emp.Password))
        {
            existing.Password = BCrypt.Net.BCrypt.HashPassword(emp.Password);
        }

        _context.SaveChanges();

        return Ok(existing);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager")]

    public IActionResult DeleteEmployee(int id)
    {
        var emp = _context.Employees.Find(id);

        if (emp == null)
            return NotFound();

        _context.Employees.Remove(emp);
        _context.SaveChanges();

        return Ok();
    }

    // ---------------- Total Overview ----------------
    [AllowAnonymous]
[HttpGet("total-managers")]
public IActionResult GetTotalManagers()
{
    var totalManagers = _context.Managers.Count(); // All managers in EmployeesController table
    return Ok(totalManagers);
}

    // ---------------- Employees per Manager ----------------
    [AllowAnonymous]
    [HttpGet("manager-count")]
    public IActionResult GetEmployeesPerManager()
    {
        var data = _context.Employees
            .Where(e => e.Role == "Employee")
            .Include(e => e.Manager)
            .GroupBy(e => e.Manager != null ? e.Manager.Name : "Unassigned")
            .Select(g => new
            {
                managerName = g.Key,
                count = g.Count()
            })
            .ToList();

        return Ok(data);
    }
}