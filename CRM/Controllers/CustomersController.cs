using CRM.Data;
using CRM.DTOs;
using CRM.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    // CUSTOMER REGISTER
    [HttpPost("register")]
    public IActionResult Register(Customers customer)
    {
        customer.Password = BCrypt.Net.BCrypt.HashPassword(customer.Password);

        _context.Customers.Add(customer);
        _context.SaveChanges();

        return Ok(customer);
    }

    // CUSTOMER LOGIN (NO JWT)
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDTO login)
    {
        var customer = _context.Customers
            .FirstOrDefault(x => x.Email.ToLower() == login.Email.ToLower());

        if (customer == null)
            return Unauthorized("Email not found");

        bool validPassword = BCrypt.Net.BCrypt.Verify(login.Password, customer.Password);

        if (!validPassword)
            return Unauthorized("Invalid password");

        return Ok(new
        {
            role = "Customer",
            user = customer
        });
    }
}