using Charity.DAL.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace Charity.DAL
{
    public class CharityContext : IdentityDbContext<ApplicationUser, CustomRole, int, CustomUserLogin, CustomUserRole, CustomUserClaim> 
    {
        private static CharityContext _charityContext = null;
        public CharityContext()
            : base("DefaultConnection")
        {

        }

        public DbSet<Company> Companies { get; set; }
        public DbSet<Need> Needs { get; set; }
        public DbSet<Organization> Organisations { get; set; }
        public DbSet<TypeOfNeed> TypeOfNeeds { get; set; }
        public DbSet<SocialSphere> SocialSphere { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<SocialWorker> SocialWorkers { get; set; }
        public DbSet<Media> Media { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<NeedRequest> NeedRequests { get; set; }

        public static CharityContext Create()
        {
            if (_charityContext == null)
            {
                _charityContext = new CharityContext();
            }
            return _charityContext;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            #region AddPrimaryKeys
            modelBuilder.Entity<CustomUserRole>().HasKey(x => new { x.UserId, x.RoleId });
            modelBuilder.Entity<CustomRole>().HasKey(x => x.Id);
            modelBuilder.Entity<CustomUserClaim>().HasKey(x => x.UserId);
            modelBuilder.Entity<CustomUserLogin>().HasKey(x => x.UserId);
            modelBuilder.Entity<ApplicationUser>().HasKey(x => x.Id);
            modelBuilder.Entity<Organization>().HasKey(x => x.Id);
            modelBuilder.Entity<Company>().HasKey(x => x.Id);
            modelBuilder.Entity<Need>().HasKey(x => x.Id);
            modelBuilder.Entity<SocialSphere>().HasKey(x => x.Id);
            modelBuilder.Entity<Resource>().HasKey(x => x.Id);
            modelBuilder.Entity<SocialWorker>().HasKey(x => x.Id);
            modelBuilder.Entity<TypeOfNeed>().HasKey(x => x.Id);
            modelBuilder.Entity<Media>().HasKey(x => x.Id);
            modelBuilder.Entity<Tag>().HasKey(x => x.Id);
            modelBuilder.Entity<NeedRequest>().HasKey(x => x.Id);

            #endregion

            #region AddAutogenerateId
            
            modelBuilder.Entity<NeedRequest>()
                .Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<Need>()
                .Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);
                       
            modelBuilder.Entity<Media>()
                .Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<SocialSphere>()
                .Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<Resource>()
                .Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);
            
            modelBuilder.Entity<SocialWorker>()
                .Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<Tag>()
                .Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<TypeOfNeed>()
                .Property(t => t.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            #endregion

            #region RelationshipsInTheDatabase

            modelBuilder.Entity<ApplicationUser>()
                .HasMany<NeedRequest>(c => c.NeedRequests)
                .WithRequired(c => c.User);

            modelBuilder.Entity<Need>()
                .HasMany<NeedRequest>(c => c.NeedRequests)
                .WithRequired(c => c.Need);

            modelBuilder.Entity<TypeOfNeed>()
                .HasMany<Need>(c => c.Needs)
                .WithRequired(c => c.TypeOfNeed);

            modelBuilder.Entity<Company>()
                .HasMany<Resource>(c => c.Resources)
                .WithRequired(c => c.Company);
            
            modelBuilder.Entity<SocialWorker>()
                .HasMany<SocialSphere>(c => c.Sphere)
                .WithRequired(c => c.Worker);

            modelBuilder.Entity<TypeOfSphere>()
                .HasMany<SocialSphere>(c => c.SocialSphere)
                .WithRequired(c => c.Type);
            
            modelBuilder.Entity<Need>()
                .HasMany<Tag>(c => c.Tags)
                .WithRequired(c => c.Need);
            
            modelBuilder.Entity<Need>()
                .HasMany<Media>(c => c.Media)
                .WithRequired(c => c.Need);
            
            modelBuilder.Entity<ApplicationUser>()
              .HasOptional<Company>(c => c.Company)
              .WithRequired(c => c.User);

            modelBuilder.Entity<ApplicationUser>()
                .HasOptional<Organization>(c => c.Organization)
                .WithRequired(c => c.User);

            modelBuilder.Entity<ApplicationUser>()
                .HasMany<Need>(c => c.Needs)
                .WithOptional(c => c.User);

          
            #endregion
        }
    }
}
