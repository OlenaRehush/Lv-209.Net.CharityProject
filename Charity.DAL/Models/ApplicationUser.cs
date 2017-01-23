using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Charity.DAL.Models
{
    public class ApplicationUser : IdentityUser<int, CustomUserLogin, CustomUserRole, CustomUserClaim> 
    {

        public string FullName { get; set; }

        public DateTime Birthday { get; set; }

        public string Gender { get; set; }

        public string Description { get; set; }

        public double Rating { get; set; }

        public string PhotoURL { get; set; }

        public string Address { get; set; }

        public string WebSite { get; set; }
        public bool isBanned { get; set; }
        public virtual Company Company { get; set; }
        public virtual Organization Organization { get; set; }
        public virtual ICollection<Need> Needs { get; set; }
        public virtual ICollection<NeedRequest> NeedRequests { get; set; }


        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser, int> manager, string authenticationType = DefaultAuthenticationTypes.ApplicationCookie)
        {
            // Note the authenticationType must match the one defined in
            // CookieAuthenticationOptions.AuthenticationType 
            var userIdentity = await manager.CreateIdentityAsync(
                this, authenticationType);
            // Add custom user claims here 
            return userIdentity;
        } 
    }
}
