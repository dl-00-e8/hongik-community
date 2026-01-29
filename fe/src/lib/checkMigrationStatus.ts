/**
 * Helper utility to check if database migrations have been applied
 * Run this in browser console: window.checkMigrationStatus()
 */

import { supabase } from './supabase';

export async function checkMigrationStatus() {
  console.log('🔍 Checking database migration status...\n');

  try {
    // Check if club_admins table exists by attempting a query
    const { data: clubAdminsData, error: clubAdminsError } = await supabase
      .from('club_admins')
      .select('id')
      .limit(1);

    if (clubAdminsError) {
      if (clubAdminsError.code === '42P01') {
        // Table doesn't exist
        console.log('❌ club_admins table does NOT exist');
        console.log('\n📝 Migration needed: Run the migration in fe/supabase/migrations/add_club_admins.sql');
        console.log('\nHow to apply:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and run the SQL from fe/supabase/migrations/add_club_admins.sql');
      } else {
        console.log('⚠️ Error checking club_admins table:', clubAdminsError);
      }
    } else {
      console.log('✅ club_admins table exists');

      // Check if there are any entries
      const { count } = await supabase
        .from('club_admins')
        .select('*', { count: 'exact', head: true });

      console.log(`📊 club_admins entries: ${count || 0}`);

      if (count === 0) {
        console.log('\n⚠️ No entries in club_admins table');
        console.log('💡 Tip: Check if migration data was populated from users.club_id');
      }
    }

    // Check users table for club_admin role users
    const { data: clubAdminUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role, club_id')
      .eq('role', 'club_admin');

    if (usersError) {
      console.log('⚠️ Error checking users table:', usersError);
    } else {
      console.log(`\n👥 Users with club_admin role: ${clubAdminUsers?.length || 0}`);

      if (clubAdminUsers && clubAdminUsers.length > 0) {
        console.log('\nClub admin users:');
        clubAdminUsers.forEach((user) => {
          console.log(`  - ${user.email} (club_id: ${user.club_id || 'null'})`);
        });

        const usersWithClubId = clubAdminUsers.filter(u => u.club_id !== null);
        const usersWithoutClubId = clubAdminUsers.filter(u => u.club_id === null);

        if (usersWithClubId.length > 0) {
          console.log(`\n✅ ${usersWithClubId.length} club admin(s) have club_id set (fallback will work)`);
        }
        if (usersWithoutClubId.length > 0) {
          console.log(`\n⚠️ ${usersWithoutClubId.length} club admin(s) have NO club_id (need club_admins table)`);
        }
      }
    }

    // Check clubs table
    const { count: clubsCount } = await supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true });

    console.log(`\n🎯 Total clubs in database: ${clubsCount || 0}`);

    console.log('\n✨ Migration status check complete!');

  } catch (error) {
    console.error('❌ Error during migration check:', error);
  }
}

// Expose to window for easy access
if (typeof window !== 'undefined') {
  (window as any).checkMigrationStatus = checkMigrationStatus;
  console.log('💡 Run window.checkMigrationStatus() to check database migration status');
}