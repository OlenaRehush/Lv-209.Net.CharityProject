using Charity.DAL.Models;
using System;
using System.Collections.Generic;

namespace Charity.Services.Models
{
    public class FeedbackDTO
    {
        public int NeedId { get; set; }
        public int VolunteerId { get; set; }
        public Media Photos { get; set; }
        public Media Video { get; set; }
        public Media Feedback { get; set; }
        public int Grade { get; set; }
    }
}
