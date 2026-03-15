namespace CRM.Models
{
    public class Managers
    {
        public int Id { get; set; }

        public string Name { get; set; } = "";

        public string Email { get; set; } = "";

        public string Role { get; set; } = "Manager";

        public string ManagerType { get; set; } = "";

        public string Password { get; set; } = "";

        public string? PlaceOfBirth { get; set; }

    }
}