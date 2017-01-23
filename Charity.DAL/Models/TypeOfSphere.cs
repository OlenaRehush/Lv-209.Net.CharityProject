using System;
using System.Collections.Generic;

namespace Charity.DAL.Models
{
    public class TypeOfSphere
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime? OfficialDateOfCelebration { get; set; }
        public string NameOfCelebration { get; set; }
        public virtual ICollection<SocialSphere> SocialSphere { get; set; }
    }
}
