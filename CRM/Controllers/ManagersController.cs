using CRM.Data;
using CRM.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ManagersController : ControllerBase
{
    private readonly AppDbContext _context;

    public ManagersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetManagers()
    {
        return Ok(_context.Managers.ToList());
    }

    [HttpPost]
    public IActionResult AddManager([FromBody] Managers manager)
    {
        if (manager == null)
        {
            return BadRequest("Manager data is null");
        }

        manager.Role = "Manager";

        _context.Managers.Add(manager);
        _context.SaveChanges();

        return Ok(manager);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteManager(int id)
    {
        var manager = _context.Managers.Find(id);

        if (manager == null)
            return NotFound();

        _context.Managers.Remove(manager);
        _context.SaveChanges();

        return Ok();
    }
}