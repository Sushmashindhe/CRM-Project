namespace CRM.Models
{
    public class ResetRequest
    {
        public string Email { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}