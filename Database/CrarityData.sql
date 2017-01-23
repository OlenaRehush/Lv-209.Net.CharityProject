USE database_name
GO

/*IF NOT EXISTS(SELECT Id FROM table_name WHERE Id = value1)
BEGIN
	INSERT INTO table_name (column1,column2,column3,...)
	VALUES (value1,value2,value3,...);
END
GO
*/