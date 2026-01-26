/**
 * Mock Data Migration Script
 *
 * This script migrates the mock data to Supabase database
 * Run this script once after setting up the database schema
 *
 * Usage:
 * 1. Make sure your .env file has the correct Supabase credentials
 * 2. Run: npx tsx src/scripts/migrate-mock-data.ts
 */

import { supabase } from '../lib/supabase';
import { mockClubs, mockActivities, categories } from '../data/mockData';

async function migrateCategories() {
  console.log('🏷️  Migrating categories...');

  try {
    // Get existing categories
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('name');

    const existingNames = new Set(existingCategories?.map(c => c.name) || []);

    // Filter out categories that already exist and 'all'
    const categoriesToInsert = categories
      .filter(cat => cat.id !== 'all' && !existingNames.has(cat.name))
      .map((cat, index) => ({
        name: cat.name,
        icon: cat.icon,
        display_order: index + 1,
      }));

    if (categoriesToInsert.length === 0) {
      console.log('✅ Categories already exist, skipping...');
      return;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select();

    if (error) throw error;

    console.log(`✅ Migrated ${data?.length || 0} categories`);
  } catch (error) {
    console.error('❌ Error migrating categories:', error);
    throw error;
  }
}

async function migrateClubs() {
  console.log('🏛️  Migrating clubs...');

  try {
    // Get all categories to map names to IDs
    const { data: categoriesData, error: catError } = await supabase
      .from('categories')
      .select('id, name');

    if (catError) throw catError;

    const categoryMap = new Map(
      categoriesData?.map(cat => [cat.name, cat.id]) || []
    );

    // Get existing clubs to avoid duplicates
    const { data: existingClubs } = await supabase
      .from('clubs')
      .select('name');

    const existingNames = new Set(existingClubs?.map(c => c.name) || []);

    // Transform mock clubs to database format
    const clubsToInsert = mockClubs
      .filter(club => !existingNames.has(club.name))
      .map(club => ({
        name: club.name,
        category_id: categoryMap.get(club.category) || null,
        short_description: club.shortDescription,
        description: club.description,
        president: club.president,
        contact: club.contact,
        club_room: club.clubRoom,
        recruitment_start: club.recruitmentStart,
        recruitment_end: club.recruitmentEnd,
        regular_schedule: club.regularSchedule,
        instagram_handle: club.instagramHandle,
        logo_url: club.logoUrl,
        cover_image_url: club.coverImageUrl,
        member_count: club.memberCount || 0,
        is_recruiting: club.isRecruiting,
      }));

    if (clubsToInsert.length === 0) {
      console.log('✅ Clubs already exist, skipping...');
      return;
    }

    const { data, error } = await supabase
      .from('clubs')
      .insert(clubsToInsert)
      .select();

    if (error) throw error;

    console.log(`✅ Migrated ${data?.length || 0} clubs`);
    return data;
  } catch (error) {
    console.error('❌ Error migrating clubs:', error);
    throw error;
  }
}

async function migrateActivities() {
  console.log('📸 Migrating activities...');

  try {
    // Get all clubs to map mock club IDs to database IDs
    const { data: clubsData, error: clubError } = await supabase
      .from('clubs')
      .select('id, name');

    if (clubError) throw clubError;

    // Create a map from mock club data to actual club IDs
    const mockClubIdMap = new Map<string, string>();
    mockClubs.forEach(mockClub => {
      const dbClub = clubsData?.find(c => c.name === mockClub.name);
      if (dbClub) {
        mockClubIdMap.set(mockClub.id, dbClub.id);
      }
    });

    // Get existing activities to avoid duplicates
    const { data: existingActivities } = await supabase
      .from('club_activities')
      .select('image_url');

    const existingImageUrls = new Set(
      existingActivities?.map(a => a.image_url) || []
    );

    // Transform mock activities to database format
    const activitiesToInsert = mockActivities
      .filter(activity => {
        const dbClubId = mockClubIdMap.get(activity.clubId);
        return dbClubId && !existingImageUrls.has(activity.imageUrl);
      })
      .map(activity => ({
        club_id: mockClubIdMap.get(activity.clubId)!,
        image_url: activity.imageUrl,
        caption: activity.caption,
        is_instagram: activity.isInstagram,
        created_at: activity.createdAt,
      }));

    if (activitiesToInsert.length === 0) {
      console.log('✅ Activities already exist, skipping...');
      return;
    }

    const { data, error } = await supabase
      .from('club_activities')
      .insert(activitiesToInsert)
      .select();

    if (error) throw error;

    console.log(`✅ Migrated ${data?.length || 0} activities`);
  } catch (error) {
    console.error('❌ Error migrating activities:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting mock data migration...\n');

  try {
    // Check Supabase connection
    const { data, error } = await supabase.from('categories').select('count');
    if (error) {
      console.error('❌ Cannot connect to Supabase. Please check your environment variables.');
      console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
      process.exit(1);
    }

    // Run migrations in order
    await migrateCategories();
    await migrateClubs();
    await migrateActivities();

    console.log('\n✅ Migration completed successfully!');
    console.log('\nYou can now view your data in the Supabase dashboard.');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();
