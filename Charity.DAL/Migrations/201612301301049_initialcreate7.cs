namespace Charity.DAL.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class initialcreate7 : DbMigration
    {
        public override void Up()
        {
            DropIndex("dbo.Needs", new[] { "CompletedByUserId_Id" });
            DropColumn("dbo.Needs", "User_Id");
            RenameColumn(table: "dbo.Needs", name: "CompletedByUserId_Id", newName: "User_Id");
            CreateIndex("dbo.Needs", "CompletedByUserId_Id");
        }
        
        public override void Down()
        {
            DropIndex("dbo.Needs", new[] { "CompletedByUserId_Id" });
            RenameColumn(table: "dbo.Needs", name: "User_Id", newName: "CompletedByUserId_Id");
            AddColumn("dbo.Needs", "User_Id", c => c.Int());
            CreateIndex("dbo.Needs", "CompletedByUserId_Id");
        }
    }
}
