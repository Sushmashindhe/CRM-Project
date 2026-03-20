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

    // ---------------- CUSTOMER SEND REQUIREMENT ----------------
    [HttpPost]
    public IActionResult SendRequirement([FromBody] CustomerRequirement req)
    {
        if (req == null)
            return BadRequest("Requirement data missing");

        req.Status = "Pending";
        req.AssignedTo = "Not Assigned";

        _context.CustomerRequirements.Add(req);
        _context.SaveChanges();

        return Ok(req);
    }

    // ---------------- CUSTOMER SEE THEIR REQUIREMENTS ----------------
    [HttpGet("my/{customerId}")]
    public IActionResult GetMyRequirements(int customerId)
    {
        var data = _context.CustomerRequirements
            .Where(x => x.CustomerId == customerId)
            .ToList();

        return Ok(data);
    }

    // ---------------- SENIOR MANAGER GET ALL ----------------
    [HttpGet]
    [Authorize(Roles = "SeniorManager")]
    public IActionResult GetAllRequirements()
    {
        var data = _context.CustomerRequirements.ToList();
        return Ok(data);
    }

    // ---------------- DELETE REQUIREMENT ----------------
    [HttpDelete("requirement/{id}")]
    public IActionResult DeleteRequirement(int id)
    {
        var req = _context.CustomerRequirements.Find(id);

        if (req == null)
            return NotFound("Requirement not found");

        _context.CustomerRequirements.Remove(req);
        _context.SaveChanges();

        return Ok("Requirement deleted successfully");
    }

    // ---------------- ASSIGN TO MANAGER ----------------
    [HttpPut("assign")]
    [Authorize(Roles = "SeniorManager")]
    public IActionResult AssignRequirement([FromBody] AssignDTO dto)
    {
        var req = _context.CustomerRequirements.Find(dto.RequirementId);

        if (req == null)
            return NotFound("Requirement not found");

        // prevent re-assign
        if (req.ManagerId != null)
            return BadRequest("Already assigned");

        var manager = _context.Managers.Find(dto.ManagerId);

        if (manager == null)
            return NotFound("Manager not found");

        req.ManagerId = manager.Id;
        req.AssignedTo = manager.Name;
        req.Status = "Assigned";

        _context.SaveChanges();

        return Ok(new
        {
            message = $"Assigned to {manager.Name}"
        });
    }

    // ---------------- MANAGER GET ASSIGNED REQUIREMENTS ----------------
    [HttpGet("assigned")]
    [Authorize(Roles = "Manager")]
    public IActionResult GetAssigned()
    {
        var managerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var data = _context.CustomerRequirements
            .Where(r => r.ManagerId == managerId)
            .ToList();

        return Ok(data);
    }

    // ---------------- UPDATE STATUS ----------------
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

    // ---------------- STATS ----------------
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

    // ---------------- EMPLOYEE COUNT ----------------
    [HttpGet("employee-count")]
    public IActionResult GetEmployeeCount()
    {
        return Ok(_context.Employees.Count());
    }

    // ---------------- PUSH TO EMPLOYEES ----------------
    [HttpPost("push-to-employees/{id}")]
    [Authorize(Roles = "Manager")]
    public IActionResult PushToEmployees(int id)
    {
        var req = _context.CustomerRequirements.Find(id);

        if (req == null)
            return NotFound("Requirement not found");

        var managerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        var manager = _context.Managers.Find(managerId);

        if (manager == null)
            return Unauthorized();

        List<Employees> employees;

        // FILTER BASED ON MANAGER TYPE
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
    [HttpPost("assign")]
    [Authorize(Roles = "Manager")]
    public IActionResult AssignRequirement([FromBody] AssignRequest request)
    {
        var req = _context.CustomerRequirements.Find(request.RequirementId);

        if (req == null)
            return NotFound("Requirement not found");

        // 🚫 Prevent duplicate assignment
        if (req.IsAssigned)
            return BadRequest("Requirement already assigned");

        var emp = _context.Employees.Find(request.EmployeeId);

        if (emp == null)
            return NotFound("Employee not found");

        // ✅ Assign to specific employee
        req.EmployeeId = emp.Id;
        req.AssignedTo = emp.Name;
        req.IsAssigned = true;
        req.Status = "Assigned";

        _context.SaveChanges();

        return Ok(new { message = "Assigned successfully" });
    }
    [HttpGet("employee")]
    [Authorize(Roles = "Employee")]
    public IActionResult GetEmployeeRequirements()
    {
        var empClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (empClaim == null)
            return Unauthorized();

        int empId = int.Parse(empClaim.Value);

        var data = _context.CustomerRequirements
            .Where(r => r.EmployeeId == empId)
            .ToList();

        return Ok(data);
    }
}