using System;
using System.Collections.Generic;

namespace Charity.Services.Models
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public List<string> Roles { get; set; }
        public string PhotoURL { get; set; }
        public string UserName { get; set; }
        public DateTime Birthday { get; set; }
        public double Rating { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string WebSite { get; set; }
        public bool isEmailConfirmed { get; set; }
        public bool isBanned { get; set; }
        public string Description { get; set; }
    }
}
