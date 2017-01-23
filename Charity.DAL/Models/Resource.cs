namespace Charity.DAL.Models
{
    public class Resource
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageLink { get; set; }
        public virtual Company Company { get; set; }
    }
}
