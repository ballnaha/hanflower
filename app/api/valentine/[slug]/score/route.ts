
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    const params = await context.params;

    try {
        const { searchParams } = new URL(request.url);
        const pId = searchParams.get('playerId');

        // 1. Total players globally 
        const totalPlayers = await (prisma as any).valentineScore.count();

        // 2. Global Top 10
        const topScores = await (prisma as any).valentineScore.findMany({
            orderBy: { score: 'desc' },
            take: 10,
            select: {
                id: true,
                playerId: true,
                name: true,
                score: true,
                createdAt: true
            }
        });

        let userRank = null;
        let userBestScore = 0;
        if (pId) {
            const userScore = await (prisma as any).valentineScore.findFirst({
                where: { playerId: pId },
                orderBy: { score: 'desc' }
            });

            if (userScore) {
                userBestScore = userScore.score;
                const countHigher = await (prisma as any).valentineScore.count({
                    where: {
                        score: { gt: userScore.score }
                    }
                });
                userRank = countHigher + 1;
            }
        }

        return NextResponse.json({
            scores: topScores,
            totalPlayers,
            userRank,
            userBestScore
        });
    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    const params = await context.params;
    const { slug } = params;

    try {
        const { playerId, name, score, duration } = await request.json();

        // Validation Logic
        const scoreInt = parseInt(score);
        const durationInt = parseInt(duration) || 1;

        if (!playerId || !name || score === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Anti-Cheat Check
        const maxPlausibleScore = (durationInt * 250) + 550;
        if (scoreInt > maxPlausibleScore && scoreInt > 500) {
            return NextResponse.json({ error: 'Invalid score detected' }, { status: 403 });
        }

        if (durationInt < 3 && scoreInt > 100) {
            return NextResponse.json({ error: 'Too fast!' }, { status: 403 });
        }

        // Find the current card ID for logging purposes
        const card = await (prisma as any).valentineCard.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        // 1. GLOBAL Name Check
        const nameTaken = await (prisma as any).valentineScore.findFirst({
            where: {
                name: name,
                playerId: { not: playerId }
            }
        });

        if (nameTaken) {
            return NextResponse.json({ error: 'ชื่อนี้มีคนใช้แล้ว ลองชื่ออื่นดูนะ!' }, { status: 409 });
        }

        // 2. GLOBAL UPSERT
        const existingScore = await (prisma as any).valentineScore.findFirst({
            where: { playerId: playerId },
            orderBy: { score: 'desc' }
        });

        let result;
        if (existingScore) {
            result = await (prisma as any).valentineScore.update({
                where: { id: existingScore.id },
                data: {
                    name: name,
                    score: scoreInt > existingScore.score ? scoreInt : existingScore.score,
                    cardId: card.id
                }
            });
        } else {
            result = await (prisma as any).valentineScore.create({
                data: {
                    cardId: card.id,
                    playerId,
                    name,
                    score: scoreInt
                }
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error submitting global score:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
