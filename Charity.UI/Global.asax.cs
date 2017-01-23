using Charity.DAL;
using System.Web.Http;


namespace Charity.UI
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {        
            GlobalConfiguration.Configure(WebApiConfig.Register);
            //CharityContext c = new CharityContext();
            //c.Database.CreateIfNotExists();
        }
    }
}
