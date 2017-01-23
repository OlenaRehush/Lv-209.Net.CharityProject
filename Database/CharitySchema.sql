USE database_name
GO

/*IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'columnName' AND Object_ID = Object_ID(N'tableName'))
BEGIN
    ALTER TABLE tableName
	ADD columnName datatype
END
GO
*/