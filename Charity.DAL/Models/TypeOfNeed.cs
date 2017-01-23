using System.Collections.Generic;

namespace Charity.DAL.Models
{
    public class TypeOfNeed
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public ICollection<Need> Needs { get; set; }

    }
}
