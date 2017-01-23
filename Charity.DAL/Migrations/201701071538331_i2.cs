namespace Charity.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class i2 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Media", "Data", c => c.String());
            AlterColumn("dbo.Media", "Type", c => c.Int(nullable: false));
            DropColumn("dbo.Media", "Link");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Media", "Link", c => c.String());
            AlterColumn("dbo.Media", "Type", c => c.String());
            DropColumn("dbo.Media", "Data");
        }
    }
}
