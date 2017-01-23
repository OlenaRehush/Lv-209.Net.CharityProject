using System;

namespace Charity.Services.Models
{
    public class NeedRequestDTO
    {
        public int Id { get; set; }
        public bool Status { get; set; }
        public DateTime Date { get; set; }
        public string Phone { get; set; }
        public bool IsAnonymous { get; set; }
        public string Description { get; set; }
        public int Need_Id { get; set; }
        public int User_Id { get; set; }
    }
}
