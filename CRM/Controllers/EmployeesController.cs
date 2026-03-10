using CRM.Data;
using CRM.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetEmployees()
    {
        return Ok(_context.Employees.ToList());
    }

    [HttpPost]
    public IActionResult AddEmployee([FromBody] Employees emp)
    {
        emp.Role = "Employee";

        _context.Employees.Add(emp);
        _context.SaveChanges();

        return Ok(emp);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateEmployee(int id, Employees emp)
    {
        var existing = _context.Employees.Find(id);

        if (existing == null)
            return NotFound();

        existing.Name = emp.Name;
        existing.Email = emp.Email;
        existing.Password = emp.Password;
        existing.Phone = emp.Phone;
        existing.EmployeeType = emp.EmployeeType;

        _context.SaveChanges();

        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteEmployee(int id)
    {
        var emp = _context.Employees.Find(id);

        if (emp == null)
            return NotFound();

        _context.Employees.Remove(emp);
        _context.SaveChanges();

        return Ok();
    }
}