namespace DeliveryAPI.Models
{
    public class DeliveryItem
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public bool IsDelivered { get; set; } = false;
        
        // Foreign key
        public int DeliveryId { get; set; }
        public Delivery Delivery { get; set; } = null!;
    }
}
