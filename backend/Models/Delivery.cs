namespace DeliveryAPI.Models
{
    public class Delivery
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, PartiallyCompleted, Completed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        
        // Foreign key
        public int? AssignedDriverId { get; set; }
        public User? AssignedDriver { get; set; }
        
        // Navigation property
        public ICollection<DeliveryItem> Items { get; set; } = new List<DeliveryItem>();
    }
}
