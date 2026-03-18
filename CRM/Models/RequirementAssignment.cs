namespace CRM.Models
{
    public class RequirementAssignment
    {
        public int Id { get; set; }

        public int RequirementId { get; set; }
        public CustomerRequirement Requirement { get; set; }

        public int EmployeeId { get; set; }
        public Employees Employee { get; set; }

        public string Status { get; set; } = "Assigned";
    }
}
