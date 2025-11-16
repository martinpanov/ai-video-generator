import { STATUS } from "@/app/constants";
import prisma from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete failed jobs older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await prisma.job.deleteMany({
      where: {
        status: STATUS.FAILED,
        updatedAt: {
          lt: oneHourAgo
        }
      }
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Deleted ${result.count} failed jobs older than 1 hour`
    });
  } catch (error: any) {
    console.error('Failed to cleanup jobs:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup jobs' },
      { status: 500 }
    );
  }
}
