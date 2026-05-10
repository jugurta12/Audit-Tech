import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ Import du singleton

export const dynamic = "force-dynamic";

// Headers CORS centralisés — une seule source de vérité
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:4200",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Preflight CORS — obligatoire pour Angular
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200, // ← 200 au lieu de 204
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:4200",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(request: Request) {
  try {
    const { siteUrl } = await request.json();
    const apiKey = process.env.PAGESPEED_API_KEY;

    // 1. Vérifications de base
    if (!siteUrl) return NextResponse.json({ error: "URL manquante" }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });

    console.log(`🚀 Analyse Google Deep-Dive : ${siteUrl}`);

    // 2. Appel API Google (On demande la catégorie PERFORMANCE)
    const googleRes = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(siteUrl)}&category=PERFORMANCE&key=${apiKey}`
    );
    
    const data = await googleRes.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }
    
    // 3. Extraction du score Performance
    const lighthouse = data.lighthouseResult;
    const realScore = Math.round(lighthouse.categories.performance.score * 100);

    // 4. EXTRACTION DES RECOMMANDATIONS (La nouveauté !)
    // On filtre les audits qui ont un score faible (problèmes) et on prend les 3 premiers
    const audits = lighthouse.audits;
    const recommendations = Object.values(audits)
      .filter((a: any) => a.score !== null && a.score < 0.5 && a.title) // Uniquement les scores < 50%
      .sort((a: any, b: any) => (a.score || 0) - (b.score || 0)) // Les plus critiques en premier
      .slice(0, 3) // On en garde 3
      .map((a: any) => a.title) // On récupère juste le titre (ex: "Compresser les images")
      .join(', '); // On transforme en une seule phrase

    console.log(`✅ Score : ${realScore} | Problèmes : ${recommendations || 'Aucun'}`);

    // 5. Sauvegarde en base de données
    const nouvelAudit = await prisma.audit.create({
      data: {
        url: siteUrl,
        score: realScore,
        status: "completed",
        details: recommendations || "Optimisation parfaite !" // On stocke ici
      },
    });

    // 6. Réponse avec headers CORS
    return NextResponse.json(nouvelAudit, {
      headers: { 
        'Access-Control-Allow-Origin': 'http://localhost:4200',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur critique POST:", error);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const take = Number(searchParams.get('take')) || 10;
    const skip = Number(searchParams.get('skip')) || 0;

    const [audits, total] = await Promise.all([
      prisma.audit.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.audit.count(),
    ]);

    return NextResponse.json({ data: audits, total }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('❌ Erreur GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll');

    if (clearAll === 'true') {
      await prisma.audit.deleteMany({});
      return NextResponse.json({ message: "Historique vidé" }, {
        headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' }
      });
    }

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    await prisma.audit.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Audit supprimé" }, {
      headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' }
    });

  } catch (error) {
    console.error("❌ Erreur DELETE:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}