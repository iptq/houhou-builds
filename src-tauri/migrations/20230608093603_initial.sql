CREATE TABLE IF NOT EXISTS [SrsEntrySet] (
  [ID] integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
  [CreationDate] bigint NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  [NextAnswerDate] bigint, 
  [Meanings] [nvarchar(300)] NOT NULL, 
  [Readings] [nvarchar(100)] NOT NULL, 
  [CurrentGrade] smallint NOT NULL DEFAULT 0, 
  [FailureCount] integer NOT NULL DEFAULT 0, 
  [SuccessCount] integer NOT NULL DEFAULT 0, 
  [AssociatedVocab] [nvarchar(100)], 
  [AssociatedKanji] [nvarchar(10)], 
  [MeaningNote] [nvarchar(1000)], 
  [ReadingNote] [nvarchar(1000)], 
  [SuspensionDate] bigint, 
  [Tags] [nvarchar(300)], 
  [LastUpdateDate] BIGINT, 
  [IsDeleted] BOOLEAN NOT NULL DEFAULT false, 
  [ServerId] integer
);