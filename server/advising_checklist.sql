CREATE DATABASE Advising_Checklist;
USE Advising_Checklist;

CREATE TABLE `Adviser` (
  `AdviserID` VARCHAR(200) NOT NULL,
  `A_FirstName` VARCHAR(200) NOT NULL,
  `A_MiddleName` VARCHAR(200) DEFAULT NULL,
  `A_LastName` VARCHAR(200) NOT NULL,
  `AdvisingProgram` VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (`AdviserID`)
);

CREATE TABLE `Course` (
  `CourseID` VARCHAR(200) NOT NULL,
  `CourseDescription` VARCHAR(200) DEFAULT NULL,
  `Units` tinyint DEFAULT NULL,
  `CourseComponents` VARCHAR(200) DEFAULT NULL,
  `College` VARCHAR(200) DEFAULT NULL,
  `Department` VARCHAR(200) DEFAULT NULL,
  `GradingBasis` VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (`CourseID`)
);

CREATE TABLE `CourseCorequisite` (
    `CourseID` VARCHAR(200) NOT NULL,
    `Corequisite` VARCHAR(200) NOT NULL,
    FOREIGN KEY (`CourseId`) REFERENCES `Course`(`CourseId`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`Corequisite`) REFERENCES `Course`(`CourseId`) ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE `CoursePrerequisite` (
  `CourseID` VARCHAR(200) NOT NULL,
  `Prerequisite` VARCHAR(200) DEFAULT NULL,
  FOREIGN KEY (`CourseID`) REFERENCES `Course`(`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`Prerequisite`) REFERENCES `Course`(`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `ProgramChecklist` (
  `StudentProgram` VARCHAR(200) NOT NULL,
  `CourseID` VARCHAR(200) DEFAULT NULL,
  `CourseType` TEXT,
  `PrescribedYear` VARCHAR(200) DEFAULT NULL,
  `PrescribedSemester` VARCHAR(200) DEFAULT NULL,
  `DateLastUpdated` DATE NOT NULL,
  `TimeLastUpdated` TIME NOT NULL,
  FOREIGN KEY (`CourseID`) REFERENCES `Course`(`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `Student` (
  `StudentNumber` VARCHAR(200) NOT NULL,
  `StudentProgram` VARCHAR(200) NOT NULL,
  `AdviserID` VARCHAR(200) DEFAULT NULL,
  `S_FirstName` VARCHAR(200) NOT NULL,
  `S_MiddleName` VARCHAR(200) DEFAULT NULL,
  `S_LastName` VARCHAR(200) NOT NULL,
  `CurrentStanding` VARCHAR(200) DEFAULT NULL,
  `TotalUnitsTaken` int DEFAULT NULL,
  PRIMARY KEY (`StudentNumber`),
  FOREIGN KEY (`AdviserID`) REFERENCES `Adviser`(`AdviserID`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `StudentCourseList` (
  `StudentNumber` VARCHAR(200) NOT NULL,
  `CourseID` VARCHAR(200) DEFAULT NULL,
  `CourseStatus` text,
  `Grade` float DEFAULT NULL,
  `StandingTaken` VARCHAR(200) DEFAULT NULL,
  `AcademicYear` VARCHAR(200) DEFAULT NULL,
  `Semester` VARCHAR(200) DEFAULT NULL,
  `DateSubmitted` date DEFAULT NULL,
  `TimeSubmitted` time DEFAULT NULL,
  FOREIGN KEY (`StudentNumber`) REFERENCES `Student`(`StudentNumber`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`CourseID`) REFERENCES `Course`(`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE
);