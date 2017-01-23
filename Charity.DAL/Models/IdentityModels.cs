using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;

namespace Charity.DAL.Models
{
    public class CustomUserRole : IdentityUserRole<int> { }
    public class CustomUserClaim : IdentityUserClaim<int> { }
    public class CustomUserLogin : IdentityUserLogin<int> { }

    public class CustomRole : IdentityRole<int, CustomUserRole>
    {
        public CustomRole() { }
        public CustomRole(string name) { Name = name; }
    }

    public class CustomUserStore : UserStore<ApplicationUser, CustomRole, int,
        CustomUserLogin, CustomUserRole, CustomUserClaim>
    {
        public CustomUserStore(CharityContext context)
            : base(context)
        {
        }
    }

    public class CustomRoleStore : RoleStore<CustomRole, int, CustomUserRole>,
        IQueryableRoleStore<CustomRole, int>,
        IRoleStore<CustomRole, int>, IDisposable
    {
        public CustomRoleStore()
            : base(new IdentityDbContext())
        {
            base.DisposeContext = true;
        }
        public CustomRoleStore(CharityContext context)
            : base(context)
        {
        }
    }
}
