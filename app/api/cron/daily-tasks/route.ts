import { connect_db, get_db } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { processReserves } from '@/components/cron/tasks/process-reserve';
import { checkOverdueFines } from '@/components/cron/tasks/check-overdue';

export async function GET() {
  try {
    await connect_db();
    const db = get_db();
    
    console.log('🚀 Starting daily cron tasks at', new Date().toISOString());
    
    // Run Task 1: Process reserves
    console.log('📚 Task 1: Processing reservations...');
    const reservesResult = await processReserves(db);
    console.log('✅ Task 1 complete:', reservesResult.message);
    
    // Run Task 2: Check overdue fines
    console.log('💰 Task 2: Checking overdue fines...');
    const finesResult = await checkOverdueFines(db);
    console.log('✅ Task 2 complete:', finesResult.message);
    
    console.log('🎉 All daily tasks completed successfully');
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasks: {
        processReserves: reservesResult,
        checkOverdueFines: finesResult
      },
      summary: {
        reservationsProcessed: reservesResult.processed,
        loansCheckedForFines: finesResult.message,
        totalTasksCompleted: 2
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error in daily cron tasks:', error);
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
