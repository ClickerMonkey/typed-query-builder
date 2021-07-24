CREATE EXTENSION postgis;
CREATE TABLE "group" (
  "id" SERIAL,
  "name" VARCHAR(128) NOT NULL,
  PRIMARY KEY ("id")
);
CREATE TABLE "person" (
  "id" SERIAL,
  "name" VARCHAR(128) NOT NULL,
  "email" VARCHAR(128) NOT NULL,
  "location" POINT,
  PRIMARY KEY ("id")
);
CREATE TABLE "person_group" (
  "group_id" INT NOT NULL,
  "person_id" INT NOT NULL,
  "status" SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY ("group_id", "person_id"),
  FOREIGN KEY ("group_id") REFERENCES "group" ON DELETE CASCADE,
  FOREIGN KEY ("person_id") REFERENCES "person" ON DELETE CASCADE
);
CREATE TABLE "task" (
  "id" SERIAL,
  "group_id" INT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "details" TEXT NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT FALSE,
  "done_at" TIMESTAMP NULL,
  "parent_id" INT NULL,
  "assigned_to" INT NULL,
  "assigned_at" TIMESTAMP NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" INT NULL,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("group_id") REFERENCES "group" ON DELETE CASCADE,
  FOREIGN KEY ("parent_id") REFERENCES "task" ON DELETE NO ACTION,
  FOREIGN KEY ("assigned_to") REFERENCES "person" ON DELETE SET NULL,
  FOREIGN KEY ("created_by") REFERENCES "person" ON DELETE NO ACTION
);
CREATE TABLE "locations" (
  "id" SERIAL,
  "location" GEOMETRY,
  "name" TEXT,
  PRIMARY KEY ("id")
);
CREATE INDEX "locations_index" ON "locations" USING GIST (geography("location"));