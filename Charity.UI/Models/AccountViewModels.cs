using Charity.DAL.Models;
using System;
using System.Collections.Generic;

namespace Charity.UI.Models
{
    // Models returned by AccountController actions.
    public class ExternalLoginViewModel
    {
        public string Name { get; set; }

        public string Url { get; set; }

        public string State { get; set; }
    }

    public class ManageInfoViewModel
    {
        public string LocalLoginProvider { get; set; }

        public string Email { get; set; }

        public IEnumerable<UserLoginInfoViewModel> Logins { get; set; }

        public IEnumerable<ExternalLoginViewModel> ExternalLoginProviders { get; set; }
    }

    public class Date
    {
        public int Day { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }

    public class UserInfoViewModel
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public Date Birthday { get; set; }
        public string Gender { get; set; }
        public string Description { get; set; }
        public string PhotoURL { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public List<string> RoleName { get; set; }
        public string WebSite { get; set; }
        public double Rating { get; set; }
        public Company Company { get; set; }
        public Organization Organization { get; set; }
        public bool HasRegistered { get; set; }
        public string LoginProvider { get; set; }
        public ICollection<Need> Needs { get; set; }
        public ICollection<NeedRequest> Requests { get; set; }
    }

    public class UserLoginInfoViewModel
    {
        public string LoginProvider { get; set; }

        public string ProviderKey { get; set; }
    }
}
