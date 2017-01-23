namespace Charity.DAL.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Need Need { get; set; }
    }
}
