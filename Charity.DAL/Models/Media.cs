using Charity.DAL.Enums;

namespace Charity.DAL.Models
{
    public class Media
    {
        public int Id { get; set; }
        public MediaType Type { get; set; }
        public string Data { get; set; }
        public Need Need { get; set; }
    }
}
