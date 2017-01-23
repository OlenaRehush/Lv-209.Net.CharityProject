namespace Charity.DAL.Models
{
    public class Organization 
    {
        public int Id { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public virtual ApplicationUser User { get; set; }

    }
}
