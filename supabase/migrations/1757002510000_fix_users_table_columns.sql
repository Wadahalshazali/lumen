/*
# [Fix] Add Missing Columns to Users Table
This migration ensures that the `users` table contains the necessary columns for student data (`student_id`, `major`, `academic_year`) by adding them if they do not already exist. It also sets up or replaces the `handle_updated_at` function and associated triggers for automatically managing `updated_at` timestamps.

## Query Description:
- **Safety**: This script is safe to run multiple times. It uses `IF NOT EXISTS` for adding columns and `CREATE OR REPLACE` for the function, preventing errors on re-runs.
- **Impact**: It modifies the structure of the `users` table by adding new columns but does not alter or delete existing data. It also ensures `updated_at` fields are automatically managed across `users` and `materials` tables.
- **Precautions**: No special precautions are needed as this is a non-destructive operation.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false (but columns can be dropped manually if needed)

## Structure Details:
- **Tables Affected**: `public.users`, `public.materials`
- **Columns Added (if missing)**: `student_id`, `major`, `academic_year` to `public.users`
- **Functions Created/Replaced**: `public.handle_updated_at()`
- **Triggers Created**: `on_users_updated`, `on_materials_updated` (after dropping if they exist)

## Security Implications:
- RLS Status: Unchanged. This script does not modify RLS policies.
- Policy Changes: No.
- Auth Requirements: Requires permissions to alter tables and create triggers.

## Performance Impact:
- Indexes: None added or removed.
- Triggers: Adds triggers that fire on `UPDATE` operations, which has a negligible performance impact.
- Estimated Impact: Low.
*/

-- Create or replace the function to automatically update the `updated_at` timestamp.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add student-specific columns to the `users` table if they don't already exist.
-- This prevents errors if the migration is run more than once.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS major VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50);

-- Drop the trigger if it exists, then create it for the `users` table.
-- This ensures the trigger is correctly configured.
DROP TRIGGER IF EXISTS on_users_updated ON public.users;
CREATE TRIGGER on_users_updated
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Drop the trigger if it exists, then create it for the `materials` table.
DROP TRIGGER IF EXISTS on_materials_updated ON public.materials;
CREATE TRIGGER on_materials_updated
BEFORE UPDATE ON public.materials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
