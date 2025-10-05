<?php

namespace App\Http\Controllers;

use App\Services\VirusScannerService;
use App\Models\VirusScanLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VirusScanController extends Controller
{
    private VirusScannerService $virusScanner;

    public function __construct(VirusScannerService $virusScanner)
    {
        $this->virusScanner = $virusScanner;
    }

    /**
     * Get virus scan statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        $stats = $this->virusScanner->getScanStatistics($days);

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get recent scan logs
     */
    public function logs(Request $request): JsonResponse
    {
        $query = VirusScanLog::query();
        
        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('clean_only')) {
            $query->where('is_clean', $request->boolean('clean_only'));
        }
        
        if ($request->has('days')) {
            $query->where('created_at', '>=', now()->subDays($request->get('days')));
        }

        $logs = $query->orderBy('created_at', 'desc')
                     ->limit($request->get('limit', 50))
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $logs,
            'meta' => [
                'total' => $logs->count(),
                'filters_applied' => $request->only(['status', 'clean_only', 'days'])
            ]
        ]);
    }

    /**
     * Test virus scanner (admin only)
     */
    public function test(): JsonResponse
    {
        $config = config('virus');
        
        return response()->json([
            'success' => true,
            'data' => [
                'scanner_type' => $config['scanner_type'],
                'is_enabled' => $config['scanner_type'] !== 'disabled',
                'config' => [
                    'clamd_enabled' => $config['clamd_enabled'] ?? false,
                    'virustotal_configured' => !empty($config['virustotal_api_key']),
                    'windows_defender_configured' => file_exists($config['windows_defender_path'] ?? ''),
                ],
                'timestamp' => now()->toISOString()
            ]
        ]);
    }
}
