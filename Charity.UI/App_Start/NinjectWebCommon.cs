using Charity.Services;
using Charity.Common.DependencyResolve;
using Charity.DAL;
using Charity.DAL.Models;
using Microsoft.Web.Infrastructure.DynamicModuleHelper;
using Ninject;
using Ninject.Web.Common;
using System;
using System.Web;
using System.Web.Http;

[assembly: WebActivatorEx.PreApplicationStartMethod(typeof(Charity.UI.App_Start.NinjectWebCommon), "Start")]
[assembly: WebActivatorEx.ApplicationShutdownMethodAttribute(typeof(Charity.UI.App_Start.NinjectWebCommon), "Stop")]

namespace Charity.UI.App_Start
{
    public static class NinjectWebCommon 
    {
        private static readonly Bootstrapper bootstrapper = new Bootstrapper();
        private static IKernel _kernel;
        /// <summary>
        /// Starts the application
        /// </summary>
        public static void Start() 
        {
            DynamicModuleUtility.RegisterModule(typeof(OnePerRequestHttpModule));
            DynamicModuleUtility.RegisterModule(typeof(NinjectHttpModule));
            bootstrapper.Initialize(CreateKernel);
        }
        
        /// <summary>
        /// Stops the application.
        /// </summary>
        public static void Stop()
        {
            bootstrapper.ShutDown();
        }

        /// <summary>
        /// Creates the kernel that will manage your application.
        /// </summary>
        /// <returns>The created kernel.</returns>
        private static IKernel CreateKernel()
        {
            if (_kernel == null)
            {
                _kernel = new StandardKernel();
                _kernel.Bind<Func<IKernel>>().ToMethod(ctx => () => new Bootstrapper().Kernel);
                _kernel.Bind<IHttpModule>().To<HttpApplicationInitializationHttpModule>();

                RegisterServices(_kernel);

                // Install our Ninject-based IDependencyResolver into the Web API config
                GlobalConfiguration.Configuration.DependencyResolver = new NinjectDependencyResolver(_kernel);
            }

            return _kernel;
        }

        /// <summary>
        /// Load your modules or register your services here!
        /// </summary>
        /// <param name="kernel">The kernel.</param>
        private static void RegisterServices(IKernel kernel)
        {
            kernel.Bind<CharityContext>().ToConstant(CharityContext.Create());
            kernel.Bind<ApplicationUserManager>().To<ApplicationUserManager>();
            kernel.Bind<IRepository<Company>>().To<Repository<Company>>();
            kernel.Bind<IRepository<CustomRole>>().To<Repository<CustomRole>>();
            kernel.Bind<IRepository<CustomUserRole>>().To<Repository<CustomUserRole>>();
            kernel.Bind<IRepository<CustomUserClaim>>().To<Repository<CustomUserClaim>>();
            kernel.Bind<IRepository<CustomUserLogin>>().To<Repository<CustomUserLogin>>();
            kernel.Bind<IRepository<Organization>>().To<Repository<Organization>>();
            kernel.Bind<IRepository<Media>>().To<Repository<Media>>();
            kernel.Bind<IRepository<Need>>().To<Repository<Need>>();
            kernel.Bind<IRepository<SocialSphere>>().To<Repository<SocialSphere>>();
            kernel.Bind<IRepository<Resource>>().To<Repository<Resource>>();
            kernel.Bind<IRepository<TypeOfSphere>>().To<Repository<TypeOfSphere>>();
            kernel.Bind<IRepository<SocialWorker>>().To<Repository<SocialWorker>>();
            kernel.Bind<IRepository<Tag>>().To<Repository<Tag>>();
            kernel.Bind<IRepository<TypeOfNeed>>().To<Repository<TypeOfNeed>>();
            kernel.Bind<IRepository<ApplicationUser>>().To<Repository<ApplicationUser>>();
            kernel.Bind<IRepository<NeedRequest>>().To<Repository<NeedRequest>>();
        }
    }
}
