using CRM.Data;
using CRM.DTOs;
using CRM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class CustomerRequirementsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomerRequirementsController(AppDbContext context)
    {
        _context = context;
    }

    // CUSTOMER SEND REQUIREMENT
    [HttpPost]
    public IActionResult SendRequirement([FromBody] CustomerRequirement req)
    {
        if (req == null)
            return BadRequest("Requirement data missing");

        req.Status = "Pending"; // Set default status here

        req.AssignedTo = "Not Assigned";

        _context.CustomerRequirements.Add(req);
        _context.SaveChanges();

        return Ok(req);
    }

    // CUSTOMER SEE THEIR REQUIREMENTS
    [HttpGet("my/{customerId}")]
    public IActionResult GetMyRequirements(int customerId)
    {
        var data = _context.CustomerRequirements
            .Where(x => x.CustomerId == customerId)
            .ToList();

        return Ok(data);
    }

    [HttpGet]
    [Authorize(Roles = "SeniorManager")]
    public IActionResult GetAllRequirements()
    {
        var data = _context.CustomerRequirements.ToList();

        return Ok(data);
    }

    [HttpDelete("requirement/{id}")]
    public IActionResult DeleteRequirement(int id)
    {
        var req = _context.CustomerRequirements.Find(id);

        if (req == null)
        {
            return NotFound("Requirement not found");
        }

        _context.CustomerRequirements.Remove(req);
        _context.SaveChanges();

        return Ok("Requirement deleted successfully");
    }

    [HttpPut("push/{id}")]
    public IActionResult PushRequirement(int id)
    {
        var req = _context.CustomerRequirements.Find(id);

        if (req == null)
            return NotFound("Requirement not found");

        if (req.Category == "IT")
            req.AssignedTo = "IT Manager";
        else
            req.AssignedTo = "Non IT Manager";

        req.Status = "Assigned";

        _context.SaveChanges();

        return Ok(req);
    }

    [HttpGet("assigned/{type}")]
    [Authorize(Roles = "Manager")]
    public IActionResult GetAssigned(string type)
    {
        var data = _context.CustomerRequirements
            .Where(r => r.AssignedTo == type)
            .ToList();

        return Ok(data);
    }

    [HttpPut("status/{id}")]
    public IActionResult UpdateStatus(int id, [FromBody] StatusDTO dto)
    {
        var req = _context.CustomerRequirements.FirstOrDefault(x => x.Id == id);

        if (req == null)
            return NotFound();

        req.Status = dto.Status;

        _context.SaveChanges();

        return Ok(req);
    }

    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        var stats = _context.CustomerRequirements
            .GroupBy(x => x.Status)
            .Select(g => new
            {
                status = g.Key,
                count = g.Count()
            })
            .ToList();

        return Ok(stats);
    }

    [HttpGet("employee-count")]
    public IActionResult GetEmployeeCount()
    {
        return Ok(_context.Employees.Count());
    }

    [HttpPost("push-to-employees/{id}")]
    [Authorize(Roles = "Manager")]
    public IActionResult PushToEmployees(int id)
    {
        var req = _context.CustomerRequirements.Find(id);

        if (req == null)
            return NotFound("Requirement not found");

        // Get manager from token
        var managerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var manager = _context.Managers.Find(managerId);

        if (manager == null)
            return Unauthorized();

        List<Employees> employees;

        // 🔥 FILTER BASED ON MANAGER TYPE
        if (manager.ManagerType == "IT")
        {
            employees = _context.Employees
                .Where(e => e.EmployeeType == "Developer"
                         || e.EmployeeType == "QA"
                         || e.EmployeeType == "DevOps")
                .ToList();
        }
        else
        {
            employees = _context.Employees
                .Where(e => e.EmployeeType == "HR Services"
                         || e.EmployeeType == "Finance"
                         || e.EmployeeType == "Sales")
                .ToList();
        }

        // 🔥 ASSIGN TO EACH EMPLOYEE
        foreach (var emp in employees)
        {
            bool exists = _context.RequirementAssignments
                .Any(x => x.RequirementId == id && x.EmployeeId == emp.Id);

            if (!exists)
            {
                _context.RequirementAssignments.Add(new RequirementAssignment
                {
                    RequirementId = id,
                    EmployeeId = emp.Id,
                    Status = "Assigned"
                });
            }
        }

        req.Status = "Assigned";

        _context.SaveChanges();

        return Ok(new
        {
            message = $"Pushed to {employees.Count} employees"
        });
    }
}