<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class FeedbackController extends Controller
{
    public function generateFeedback(Request $request)
    {
        $remainingBudget = $request->input('remainingBudget');
        $limit = $request->input('limit');
        $isPositive = $remainingBudget >= 0;
        $formattedAmount = number_format(abs($remainingBudget), 2, ',', '.');
        $formattedLimit = $limit !== null ? number_format($limit, 2, ',', '.') : 'Belum diatur';

        $promptText = $isPositive
            ? "Anggap kamu adalah seorang teman. Sisa duit teman kamu adalah Rp {$formattedAmount} dari uang perbulannya yaitu {$formattedLimit}. Berikan pujian untuk temanmu dikarenakan teman kamu sudah bisa mengorganisasikan keuangan dengan baik. Pastikan untuk menyebutkan jumlah sisa duit teman kamu."
            : "Anggap kamu adalah seorang teman, Teman kamu telah melakukan overbudget sejumlah Rp {$formattedAmount}. Berikan roasting maksimal yang membuat orang ini sadar akan situasinya. Pastikan untuk menyebutkan jumlah sisa duit dalam hasil roasting. Dan jangan lupa kasih kata-kata untuk perbaikan ke depannya agar tidak overbudget.";
        $apiKey = env('GEMINI_API_KEY');
        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $promptText],
                        ],
                    ],
                ],
            ]);

        if ($response->successful()) {
            $data = $response->json();
            if (!empty($data['candidates'][0]['content']['parts'][0]['text'])) {
                return response()->json(['feedback' => $data['candidates'][0]['content']['parts'][0]['text']]);
            }
        }

        return response()->json(['error' => 'Unable to generate feedback.'], 500);
    }
}
