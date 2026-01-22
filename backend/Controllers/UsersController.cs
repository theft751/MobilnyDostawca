using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeliveryAPI.Data;
using DeliveryAPI.DTOs;

namespace DeliveryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("drivers")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetDrivers()
        {
            var drivers = await _context.Users
                .Where(u => u.Role == "Driver")
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role
                })
                .ToListAsync();

            return Ok(drivers);
        }
    }
}
