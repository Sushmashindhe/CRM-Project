namespace CRM.Models
{
    public class Employees
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public string EmployeeType { get; set; } = "";

        public string Password { get; set; } = "";

        public string Role { get; set; } = "Employee";

        public string? PlaceOfBirth { get; set; }
    }
}
