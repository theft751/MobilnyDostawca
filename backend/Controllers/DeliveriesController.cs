using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeliveryAPI.Data;
using DeliveryAPI.DTOs;
using DeliveryAPI.Models;
using System.Security.Claims;

namespace DeliveryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DeliveriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DeliveriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<DeliveryDTO>> CreateDelivery(CreateDeliveryDTO dto)
        {
            var delivery = new Delivery
            {
                OrderNumber = dto.OrderNumber,
                CustomerName = dto.CustomerName,
                DeliveryAddress = dto.DeliveryAddress,
                AssignedDriverId = dto.AssignedDriverId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                Items = dto.Items.Select(i => new DeliveryItem
                {
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price,
                    IsDelivered = false
                }).ToList()
            };

            _context.Deliveries.Add(delivery);
            await _context.SaveChangesAsync();

            var result = new DeliveryDTO
            {
                Id = delivery.Id,
                OrderNumber = delivery.OrderNumber,
                CustomerName = delivery.CustomerName,
                DeliveryAddress = delivery.DeliveryAddress,
                Status = delivery.Status,
                CreatedAt = delivery.CreatedAt,
                CompletedAt = delivery.CompletedAt
            };

            return CreatedAtAction(nameof(GetDelivery), new { id = delivery.Id }, result);
        }

        // GET: api/Deliveries
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DeliveryDTO>>> GetDeliveries()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            IQueryable<Models.Delivery> query = _context.Deliveries;

            if (userRole == "Driver")
            {
                query = query.Where(d => d.AssignedDriverId == userId && (d.Status == "InProgress" || d.Status == "Completed"));
            }

            var deliveries = await query
                .OrderBy(d => d.CreatedAt)
                .Select(d => new DeliveryDTO
                {
                    Id = d.Id,
                    OrderNumber = d.OrderNumber,
                    CustomerName = d.CustomerName,
                    DeliveryAddress = d.DeliveryAddress,
                    Status = d.Status,
                    AssignedDriverId = d.AssignedDriverId,
                    CreatedAt = d.CreatedAt,
                    CompletedAt = d.CompletedAt
                })
                .ToListAsync();

            return Ok(deliveries);
        }

        // GET: api/Deliveries/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DeliveryDTO>> GetDelivery(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var delivery = await _context.Deliveries
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
            {
                return NotFound();
            }

            if (userRole == "Driver" && delivery.AssignedDriverId != userId)
            {
                return Forbid();
            }

            var deliveryDto = new DeliveryDTO
            {
                Id = delivery.Id,
                OrderNumber = delivery.OrderNumber,
                CustomerName = delivery.CustomerName,
                DeliveryAddress = delivery.DeliveryAddress,
                Status = delivery.Status,
                CreatedAt = delivery.CreatedAt,
                CompletedAt = delivery.CompletedAt
            };

            return Ok(deliveryDto);
        }

        [HttpGet("{id}/items")]
        public async Task<ActionResult<IEnumerable<DeliveryItemDTO>>> GetDeliveryItems(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var delivery = await _context.Deliveries
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
            {
                return NotFound();
            }

            if (userRole == "Driver" && delivery.AssignedDriverId != userId)
            {
                return Forbid();
            }

            var items = await _context.DeliveryItems
                .Where(i => i.DeliveryId == id)
                .Select(i => new DeliveryItemDTO
                {
                    Id = i.Id,
                    DeliveryId = i.DeliveryId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price,
                    IsDelivered = i.IsDelivered
                })
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/Deliveries/5/complete
        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteDelivery(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var delivery = await _context.Deliveries
                .Include(d => d.Items)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
            {
                return NotFound();
            }

            // Check authorization
            if (userRole == "Driver" && delivery.AssignedDriverId != userId)
            {
                return Forbid();
            }

            // Mark all items as delivered
            foreach (var item in delivery.Items)
            {
                item.IsDelivered = true;
            }

            delivery.Status = "Completed";
            delivery.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Delivery completed successfully" });
        }

        // POST: api/Deliveries/5/items/3/deliver
        [HttpPost("{deliveryId}/items/{itemId}/deliver")]
        public async Task<IActionResult> DeliverItem(int deliveryId, int itemId)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var delivery = await _context.Deliveries
                .Include(d => d.Items)
                .FirstOrDefaultAsync(d => d.Id == deliveryId);

            if (delivery == null)
            {
                return NotFound(new { message = "Delivery not found" });
            }

            // Check authorization
            if (userRole == "Driver" && delivery.AssignedDriverId != userId)
            {
                return Forbid();
            }

            var item = delivery.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null)
            {
                return NotFound(new { message = "Item not found" });
            }

            item.IsDelivered = true;

            // Check if all items are delivered
            if (delivery.Items.All(i => i.IsDelivered))
            {
                delivery.Status = "Completed";
                delivery.CompletedAt = DateTime.UtcNow;
            }
            else
            {
                delivery.Status = "InProgress";
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Item delivered successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDelivery(int id)
        {
            var delivery = await _context.Deliveries.FindAsync(id);

            if (delivery == null)
            {
                return NotFound();
            }

            _context.Deliveries.Remove(delivery);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Deliveries/stats/completed
        [HttpGet("stats/completed")]
        public async Task<ActionResult<int>> GetCompletedCount()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (userRole != "Manager" && userRole != "Admin")
            {
                return Forbid();
            }

            var count = await _context.Deliveries.CountAsync(d => d.Status == "Completed");
            return Ok(count);
        }

        // GET: api/Deliveries/stats/inprogress
        [HttpGet("stats/inprogress")]
        public async Task<ActionResult<int>> GetInProgressCount()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (userRole != "Manager" && userRole != "Admin")
            {
                return Forbid();
            }

            var count = await _context.Deliveries.CountAsync(d => d.Status == "InProgress");
            return Ok(count);
        }

        // GET: api/Deliveries/stats/pending
        [HttpGet("stats/pending")]
        public async Task<ActionResult<int>> GetPendingCount()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (userRole != "Manager" && userRole != "Admin")
            {
                return Forbid();
            }

            var count = await _context.Deliveries.CountAsync(d => d.Status == "Pending");
            return Ok(count);
        }
    }
}
