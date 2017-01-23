namespace Charity.Services.Models
{
    public class CompanyDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public string Address { get; set; }
        public string WebSite { get; set; }
        public string Description {get; set;}
    }
}
