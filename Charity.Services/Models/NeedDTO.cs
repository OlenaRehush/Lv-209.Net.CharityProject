using Charity.DAL.Models;
using System;
using System.Collections.Generic;

namespace Charity.Services.Models
{
    public class NeedDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateEnd { get; set; }
        public string Description { get; set; }
        public List<string> Photos { get; set; }
        public List<string> Videos { get; set; }
        public string ImageLink { get; set; }
        public string User { get; set; }
        public int? UserId { get; set; }
        public string Feedback { get; set; }
        public int OrganizationId { get; set; }
        public string UserPhoneNumber { get; set; }
        public string UserPhoto { get; set; }
        public string Organization { get; set; }
        public string TypeOfNeed { get; set; }
    }
}
