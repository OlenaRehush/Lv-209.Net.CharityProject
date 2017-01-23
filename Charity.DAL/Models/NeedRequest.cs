using System;

namespace Charity.DAL.Models
{
    public class NeedRequest
    {
        public int Id { get; set; }
        public virtual ApplicationUser User { get; set; }
        public virtual Need Need { get; set; }
        public bool Status { get; set; }
        public DateTime Date { get; set; }
        public string Phone { get; set; }
        public bool IsAnonymous { get; set; }
        public string Description { get; set; }
    }
}
