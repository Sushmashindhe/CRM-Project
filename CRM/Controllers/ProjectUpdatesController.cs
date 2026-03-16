using CRM.Data;
using CRM.Models;
using Microsoft.AspNetCore.Mvc;

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
}