using Charity.DAL.Enums;
using System.Collections.Generic;

namespace Charity.DAL.Models
{
    public class SocialWorker
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public int Rating { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public Gender Gender { get; set; }
        public string Address { get; set; }
        public string ImageLink { get; set; }
        public virtual ICollection<SocialSphere> Sphere { get; set; }

    }
}
