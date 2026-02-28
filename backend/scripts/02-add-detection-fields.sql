-- Migration: Add YOLO detection and Grad-CAM heatmap fields to images table
-- This script adds support for object detection and explainability features

-- Add columns to images table if they don't already exist
ALTER TABLE images
ADD COLUMN IF NOT EXISTS detected_objects JSONB,
ADD COLUMN IF NOT EXISTS heatmap_path VARCHAR(512);

-- Create index on detected_objects for faster queries
CREATE INDEX IF NOT EXISTS idx_images_detected_objects ON images USING GIN (detected_objects);

-- Update the updated_at timestamp for all images to reflect the schema change
UPDATE images SET updated_at = CURRENT_TIMESTAMP WHERE detected_objects IS NULL;

-- Log completion
SELECT 'Migration completed: Added detection and heatmap fields to images table';
