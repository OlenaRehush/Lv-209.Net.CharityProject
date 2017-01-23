namespace Charity.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class i3 : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.ApplicationUsers", "Rating", c => c.Double(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.ApplicationUsers", "Rating", c => c.Int(nullable: false));
        }
    }
}
