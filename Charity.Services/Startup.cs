using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Charity.Services.Startup))]

namespace Charity.Services
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
