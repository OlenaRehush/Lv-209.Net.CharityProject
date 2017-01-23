using System;
using Microsoft.AspNet.Identity;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Owin;
using Charity.Services.Providers;
using Charity.DAL.Models;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security.Google;
using Microsoft.Owin.Security.Facebook;
using System.Configuration;

namespace Charity.Services
{
    public partial class Startup
    {
        public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }

        public static string PublicClientId { get; private set; }

        // For more information on configuring authentication, please visit https://go.microsoft.com/fwlink/?LinkId=301864
        public void ConfigureAuth(IAppBuilder app)
        {
            // Configure the db context and user manager to use a single instance per request
            //app.CreatePerOwinContext(CharityContext.Create);
            app.CreatePerOwinContext<ApplicationUserManager>(ApplicationUserManager.Create);
            app.CreatePerOwinContext<ApplicationRoleManager>(ApplicationRoleManager.Create);

            // Enable the application to use a cookie to store information for the signed in user
            // and to use a cookie to temporarily store information about a user logging in with a third party login provider
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/login"),
                Provider = new CookieAuthenticationProvider
                {
                    OnValidateIdentity = SecurityStampValidator
                        .OnValidateIdentity<ApplicationUserManager, ApplicationUser, int>(
                            validateInterval: TimeSpan.FromMinutes(30),
                            regenerateIdentityCallback: (manager, user) =>
                                user.GenerateUserIdentityAsync(manager),
                            getUserIdCallback: (id) => (id.GetUserId<int>()))
                }
            });

            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // Configure the application for OAuth based flow
            PublicClientId = "self";
            OAuthOptions = new OAuthAuthorizationServerOptions
            {
                TokenEndpointPath = new PathString("/Token"),
                Provider = new ApplicationOAuthProvider(PublicClientId),
                AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(30),
                // In production mode set AllowInsecureHttp = false
                AllowInsecureHttp = true
            };

            // Enable the application to use bearer tokens to authenticate users
            app.UseOAuthBearerTokens(OAuthOptions);

            // Uncomment the following lines to enable logging in with third party login providers
            //app.UseMicrosoftAccountAuthentication(
            //    clientId: "",
            //    clientSecret: "");

            //app.UseTwitterAuthentication(
            //    consumerKey: "",
            //    consumerSecret: "");
            app.UseGoogleAuthentication(new GoogleOAuth2AuthenticationOptions()
            {
                ClientId = "596204041006-mfjm1o1fhraln49v9ja3csh6aar06kta.apps.googleusercontent.com",
                ClientSecret = "_GPslcJjBN6vBpaPBuG_8_O2",
               

            });

            #region Facebook
            app.UseFacebookAuthentication(
                appId: "1740290402966376",
                appSecret: "c7643a2f25cdb8ee63d9ad1dacf77295");
            //var facebookAuthenticationOptions = new FacebookAuthenticationOptions()
            //{

            //    AppId = ConfigurationManager.AppSettings["FaceI"],
            //    AppSecret = ConfigurationManager.AppSettings["FaceS"],
            //    Provider = new FacebookAuthenticationProvider()
            //    {
            //        OnAuthenticated = async context =>
            //       {
            //           context.Identity.AddClaim(new System.Security.Claims.Claim("FacebookAccessToken", context.AccessToken));
            //       }
            //    }

            //};
            //facebookAuthenticationOptions.Scope.Add("public_profile");
            //facebookAuthenticationOptions.Scope.Add("email");
            //facebookAuthenticationOptions.Scope.Add("user_birthday");
            //app.UseFacebookAuthentication(facebookAuthenticationOptions);
            #endregion

            #region Google
            //var googleAuthenticationOptions = new GoogleOAuth2AuthenticationOptions()
            //{
            //    ClientId = ConfigurationManager.AppSettings["GglI"],
            //    ClientSecret = ConfigurationManager.AppSettings["GglS"],
            //    Provider = new GoogleOAuth2AuthenticationProvider()
            //    {
            //        OnAuthenticated = async context =>
            //        {
            //            context.Identity.AddClaim(new System.Security.Claims.Claim("GoogleAccessToken", context.AccessToken));
            //            foreach (var claim in context.User)
            //            {
            //                var claimType = string.Format("urn:google:{0}", claim.Key);
            //                string claimValue = claim.Value.ToString();
            //                if (!context.Identity.HasClaim(claimType, claimValue))
            //                    context.Identity.AddClaim(new System.Security.Claims.Claim(claimType, claimValue, "XmlSchemaString", "Google"));
            //            }
            //            {

            //            }
            //        }
            //    }
            //};
            //googleAuthenticationOptions.Scope.Add("http://www.googleapis.com/auth/plus.login email");
            //app.UseGoogleAuthentication(googleAuthenticationOptions);
            #endregion
        }
    }
}
