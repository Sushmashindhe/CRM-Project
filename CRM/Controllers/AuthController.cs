using CRM.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (request.Email == "senior@test.com" && request.Password == "1234")
        {
            return Ok(new { name = "Senior Manager", role = "SeniorManager" });
        }

        if (request.Email == "manager@test.com" && request.Password == "1234")
        {
            return Ok(new { name = "Manager", role = "Manager" });
        }

        if (request.Email == "employee@test.com" && request.Password == "1234")
        {
            return Ok(new { name = "Employee", role = "Employee" });
        }

        return Unauthorized();
    }
}