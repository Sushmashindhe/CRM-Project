using CRM.Data;
using CRM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class ProjectUpdatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectUpdatesController(AppDbContext context)
    {
        _context = context;
    }

    // EMPLOYEE ADD UPDATE
    [HttpPost]
    public IActionResult AddUpdate([FromBody] ProjectUpdate update)
    {
        update.CreatedAt = DateTime.UtcNow;

        _context.ProjectUpdates.Add(update);
        _context.SaveChanges();

        return Ok(update);
    }

    // MANAGER VIEW UPDATES
    [HttpGet]
    public IActionResult GetUpdates()
    {
        var updates = _context.ProjectUpdates
            .OrderByDescending(x => x.CreatedAt)
            .ToList();

        return Ok(updates);
    }

    [HttpPut("feedback/{id}")]
    public IActionResult AddFeedback(int id, [FromBody] string feedback)
    {
        var update = _context.ProjectUpdates.Find(id);

        if (update == null)
            return NotFound();

        update.Feedback = feedback;

        _context.SaveChanges();

        return Ok(update);
    }

    [HttpGet("manager")]
    [Authorize(Roles = "Manager")]
    public IActionResult GetUpdatesForManager()
    {
        var managerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var updates = _context.ProjectUpdates
            .Where(u => u.Employee.ManagerId == managerId) // still filter by manager
            .Select(u => new {
                u.Id,
                u.EmployeeId,
                u.EmployeeName,  // directly from table 
                u.ProjectName,
                u.UpdateText,
                u.CreatedAt,
                u.Feedback
            })
            .OrderByDescending(u => u.CreatedAt)
            .ToList();

        return Ok(updates);
    }

    [HttpGet("employee")]
    [Authorize(Roles = "Employee")]
    public IActionResult GetUpdatesForEmployee()
    {
        var employeeId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var updates = _context.ProjectUpdates
            .Where(u => u.EmployeeId == employeeId)
            .ToList();

        return Ok(updates);
    }
}