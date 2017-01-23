namespace Charity.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class i4 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.TypeOfSpheres", "NameOfCelebration", c => c.String());
            AlterColumn("dbo.TypeOfSpheres", "OfficialDateOfCelebration", c => c.DateTime());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.TypeOfSpheres", "OfficialDateOfCelebration", c => c.DateTime(nullable: false));
            DropColumn("dbo.TypeOfSpheres", "NameOfCelebration");
        }
    }
}
