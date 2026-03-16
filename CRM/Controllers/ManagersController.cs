using CRM.Data;
using CRM.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;

namespace CRM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ManagersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ManagersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles ="SeniorManager")]
        public IActionResult AddManager([FromBody] Managers manager)
        {
            manager.Role = "Manager";
            // HASH PASSWORD
            manager.Password = BCrypt.Net.BCrypt.HashPassword(manager.Password);
            _context.Managers.Add(manager);
            _context.SaveChanges();
            return Ok(new { message = "Manager created" });
        }

        [HttpGet]
        [Authorize(Roles = "SeniorManager")]

        public IActionResult GetManagers()
        {
            var managers = _context.Managers.Select(m => new
            {
                m.Id,
                m.Name,
                m.Email,
                m.Role,
                m.ManagerType,
                m.PlaceOfBirth,
                m.Status
            }).ToList();
            return Ok(managers);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SeniorManager")]
        public IActionResult UpdateManager(int id, [FromBody] Managers updatedManager)
        {
            var manager = _context.Managers.Find(id);

            if (manager == null)
                return NotFound();

            manager.Name = updatedManager.Name;
            manager.Email = updatedManager.Email;
            manager.ManagerType = updatedManager.ManagerType;
            manager.PlaceOfBirth = updatedManager.PlaceOfBirth;
            _context.SaveChanges();

            return Ok(new { message = "Manager updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SeniorManager")]
        public IActionResult DeleteManager(int id)
        {
            var manager = _context.Managers.Find(id);
            if (manager == null)
                return NotFound();
            _context.Managers.Remove(manager);
            _context.SaveChanges();
            return Ok("Deleted");
        }

        [HttpDelete("requirement/{id}")]
        [Authorize(Roles = "SeniorManager")]
        public IActionResult DeleteRequirement(int id)
        {
            var req = _context.CustomerRequirements.Find(id);

            if (req == null)
                return NotFound();

            _context.CustomerRequirements.Remove(req);
            _context.SaveChanges();

            return Ok(new { message = "Requirement rejected" });
        }

        [HttpPut("status/{id}")]
        [Authorize(Roles = "Manager,SeniorManager")]
        public IActionResult UpdateStatus(int id)
        {
            var manager = _context.Managers.Find(id);

            if (manager == null)
                return NotFound();

            manager.Status = manager.Status == "Active" ? "Inactive" : "Active";

            _context.SaveChanges();

            return Ok(new { status = manager.Status });
        }
    }
}
