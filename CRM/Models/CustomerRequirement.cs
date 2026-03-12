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
    }
}
