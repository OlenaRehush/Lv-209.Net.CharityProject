namespace Charity.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class i1 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Needs", "Description", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Needs", "Description");
        }
    }
}
