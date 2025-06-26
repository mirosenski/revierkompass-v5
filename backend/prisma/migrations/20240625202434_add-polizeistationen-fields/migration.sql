-- Add new fields for police stations
ALTER TABLE "police_stations" ADD COLUMN "responsibility_area" TEXT;
ALTER TABLE "police_stations" ADD COLUMN "praesidium_id" TEXT REFERENCES "police_stations"("id");
