using CRM.Data;
using CRM.Models;
using CRM.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
}