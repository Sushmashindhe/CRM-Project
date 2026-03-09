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
    public IActionResult AddEmployee(Employees emp)
    {

        _context.Employees.Add(emp);
        _context.SaveChanges();

        return Ok(emp);
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