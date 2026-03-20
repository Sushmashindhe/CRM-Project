namespace CRM.Models
{
    public class CustomerRequirement
    {
        public int Id { get; set; }

        public string Title { get; set; } = null!;

        public string Description { get; set; } = null!;

        public string Category { get; set; } = null!;

        public string Status { get; set; } = null!;

        public int CustomerId { get; set; }

        public string AssignedTo { get; set; } = null!;

        public int? ManagerId { get; set; }   // 🔥 NEW

        public int? EmployeeId { get; set; }   // assign to specific employee

        public bool IsAssigned { get; set; } = false; // prevent reassign
    }
}
