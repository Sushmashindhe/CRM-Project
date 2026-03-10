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

    // GET all managers
    [HttpGet]
    public IActionResult GetManagers()
    {
        return Ok(_context.Managers.ToList());
    }

    // ADD manager
    [HttpPost]
    public IActionResult AddManager(Managers manager)
    {

        manager.Role = "Manager";

        _context.Managers.Add(manager);

        _context.SaveChanges();

        return Ok(manager);

    }

    // UPDATE manager
    [HttpPut("{id}")]
    public IActionResult UpdateManager(int id, Managers manager)
    {

        var existing = _context.Managers.Find(id);

        if (existing == null)
            return NotFound();

        existing.Name = manager.Name;
        existing.Email = manager.Email;
        existing.Password = manager.Password;
        existing.ManagerType = manager.ManagerType;

        _context.SaveChanges();

        return Ok(existing);

    }

    // DELETE manager
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