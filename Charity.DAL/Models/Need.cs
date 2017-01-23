using Charity.DAL.Enums;
using System;
using System.Collections.Generic;

namespace Charity.DAL.Models
{
    public class Need 
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public State State { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateEnd { get; set; }
        public string ImageLink { get; set; }
        public ICollection<Tag> Tags { get; set; }
        public virtual ICollection<Media> Media { get; set; }
        public virtual ApplicationUser User { get; set; }
        public virtual TypeOfNeed TypeOfNeed { get; set; }
        public virtual ICollection<NeedRequest> NeedRequests { get; set; }
    }
}
