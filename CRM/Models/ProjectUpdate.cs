namespace CRM.Models
{
    public class ProjectUpdate
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = null!;
        public string ProjectName { get; set; } = null!;
        public string UpdateText { get; set; } = null!;

        public string? Feedback { get; set; }   // NEW

        public DateTime CreatedAt { get; set; }
    }
}
