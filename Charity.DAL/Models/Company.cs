using System.Collections.Generic;

namespace Charity.DAL.Models
{
    public class Company
    {
        public int Id { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public bool IsHiden { get; set; }
        public virtual ApplicationUser User { get; set; }
        public virtual ICollection<Resource> Resources { get; set; }
    }
}
