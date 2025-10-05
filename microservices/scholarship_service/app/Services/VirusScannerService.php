<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;
use App\Models\VirusScanLog;

class VirusScannerService
{
    private string $scannerType;
    private array $config;

    public function __construct()
    {
        $this->scannerType = config('virus.scanner_type', 'clamd'); // clamd, clamscan, virustotal, defender
        $this->config = config('virus', []);
    }

    /**
     * Scan an uploaded file for viruses
     * 
     * @param UploadedFile $file
     * @return array ['clean' => bool, 'threat' => string|null, 'scan_time' => float]
     */
    public function scanFile(UploadedFile $file): array
    {
        $startTime = microtime(true);
        $filePath = $file->getPathname();
        
        Log::info('Starting virus scan', [
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'scanner_type' => $this->scannerType
        ]);

        try {
            switch ($this->scannerType) {
                case 'clamd':
                    $result = $this->scanWithClamd($filePath);
                    break;
                case 'clamscan':
                    $result = $this->scanWithClamscan($filePath);
                    break;
                case 'virustotal':
                    $result = $this->scanWithVirusTotal($file);
                    break;
                case 'defender':
                    $result = $this->scanWithWindowsDefender($filePath);
                    break;
                default:
                    throw new \Exception("Unknown scanner type: {$this->scannerType}");
            }

            $scanTime = microtime(true) - $startTime;
            
            Log::info('Virus scan completed', [
                'file_name' => $file->getClientOriginalName(),
                'clean' => $result['clean'],
                'scan_time' => $scanTime,
                'threat' => $result['threat'] ?? null
            ]);

            // Log scan result to database
            $this->logScanResult($file, $result, $scanTime, 'passed');

            return [
                'clean' => $result['clean'],
                'threat' => $result['threat'] ?? null,
                'scan_time' => $scanTime
            ];

        } catch (\Exception $e) {
            Log::error('Virus scan failed', [
                'file_name' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
                'scan_time' => microtime(true) - $startTime
            ]);

            $scanTime = microtime(true) - $startTime;
            
            // Log error scan result to database
            $this->logScanResult($file, [
                'clean' => false,
                'threat' => 'Scanner failure: ' . $e->getMessage()
            ], $scanTime, 'error');

            // In case of scanner failure, we might want to reject the file
            // or allow it through based on security policy
            return [
                'clean' => false, // Fail-safe: reject when scanner fails
                'threat' => 'Scanner failure: ' . $e->getMessage(),
                'scan_time' => $scanTime
            ];
        }
    }

    /**
     * Scan using ClamAV daemon (faster)
     */
        private function scanWithClamd(string $filePath): array
    {
        // Check if ClamAV daemon is available
        if (!$this->config['clamd_enabled']) {
            throw new \Exception('ClamAV daemon is not configured');
        }

        $socket = fsockopen(
            $this->config['clamd_host'], 
            $this->config['clamd_port'], 
            $errno, 
            $errstr, 
            10
        );

        if (!$socket) {
            throw new \Exception("Cannot connect to ClamAV daemon: $errstr ($errno)");
        }

        // Send SCAN command
        fwrite($socket, "SCAN " . $filePath . "\n");
        
        // Read response
        $response = fread($socket, 1024);
        fclose($socket);

        if (strpos($response, 'OK') !== false) {
            return ['clean' => true, 'threat' => null];
        } else {
            // Extract threat name from response like "FILENAME: ThreatName.1"
            preg_match('/: (.*) FOUND/', $response, $matches);
            return ['clean' => false, 'threat' => $matches[1] ?? 'Unknown threat'];
        }
    }

    /**
     * Scan using ClamAV command line
     */
    private function scanWithClamscan(string $filePath): array
    {
        if (!$this->config['clamscan_path']) {
            throw new \Exception('ClamAV scan path not configured');
        }

        $command = $this->config['clamscan_path'] . 
                  ' --stdout --no-summary ' . 
                  escapeshellarg($filePath) . ' 2>&1';
        
        $output = shell_exec($command);
        
        if (strpos($output, 'Infected files: 0') !== false) {
            return ['clean' => true, 'threat' => null];
        } else {
            // Extract threat name
            preg_match('/^.*: (.*) FOUND$/', $output, $matches);
            return ['clean' => false, 'threat' => $matches[1] ?? 'Unknown threat'];
        }
    }

    /**
     * Scan using VirusTotal API
     */
    private function scanWithVirusTotal(UploadedFile $file): array
    {
        if (!$this->config['virustotal_api_key']) {
            throw new \Exception('VirusTotal API key not configured');
        }

        // Upload file to VirusTotal
        $client = new \GuzzleHttp\Client();
        
        $response = $client->post('https://www.virustotal.com/api/v3/files', [
            'headers' => [
                'x-apikey' => $this->config['virustotal_api_key']
            ],
            'multipart' => [
                [
                    'name' => 'file',
                    'contents' => fopen($file->getPathname(), 'r'),
                    'filename' => $file->getClientOriginalName()
                ]
            ]
        ]);

        $data = json_decode($response->getBody(), true);
        $scanId = $data['data']['id'];

        // Wait for scan to complete (with timeout)
        $maxWait = 60; // seconds
        $waitTime = 0;
        
        while ($waitTime < $maxWait) {
            sleep(2);
            $waitTime += 2;
            
            $statusResponse = $client->get("https://www.virustotal.com/api/v3/analyses/{$scanId}", [
                'headers' => [
                    'x-apikey' => $this->config['virustotal_api_key']
                ]
            ]);
            
            $statusData = json_decode($statusResponse->getBody(), true);
            
            if ($statusData['data']['attributes']['status'] === 'completed') {
                $stats = $statusData['data']['attributes']['stats'];
                $malicious = $stats['malicious'] ?? 0;
                
                if ($malicious === 0) {
                    return ['clean' => true, 'threat' => null];
                } else {
                    return ['clean' => false, 'threat' => "Detected by {$malicious} engines"];
                }
            }
        }

        throw new \Exception('VirusTotal scan timeout');
    }

    /**
     * Scan using Windows Defender
     */
    private function scanWithWindowsDefender(string $filePath): array
    {
        $command = sprintf(
            'powershell "try { $result = & \'C:\\Program Files\\Windows Defender\\MpCmdRun.exe\' -Scan -ScanType 3 -File %s; if ($LASTEXITCODE -eq 0) { \"SCAN_SUCCESS\" } else { \"SCAN_THREAT_DETECTED\" } } catch { \"SCAN_ERROR: \" + $_.Exception.Message }"', 
            escapeshellarg($filePath)
        );
        
        $output = shell_exec($command);
        
        if (strpos($output, 'SCAN_SUCCESS') !== false) {
            return ['clean' => true, 'threat' => null];
        } elseif (strpos($output, 'SCAN_THREAT_DETECTED') !== false) {
            return ['clean' => false, 'threat' => 'Threat detected by Windows Defender'];
        } else {
            throw new \Exception('Windows Defender scan error: ' . $output);
        }
    }

    /**
     * Scan file hash instead of entire file (faster)
     */
    public function scanFileHash(UploadedFile $file): array
    {
        $fileHash = hash_file('sha256', $file->getPathname());
        
        // For VirusTotal, check existing hash first
        if ($this->scannerType === 'virustotal' && $this->config['virustotal_api_key']) {
            $client = new \GuzzleHttp\Client();
            
            try {
                $response = $client->get("https://www.virustotal.com/api/v3/files/{$fileHash}", [
                    'headers' => [
                        'x-apikey' => $this->config['virustotal_api_key']
                    ]
                ]);
                
                $data = json_decode($response->getBody(), true);
                $malicious = $data['data']['attributes']['last_analysis_stats']['malicious'] ?? 0;
                
                if ($malicious === 0) {
                    return ['clean' => true, 'threat' => null];
                } else {
                    return ['clean' => false, 'threat' => "Detected by {$malicious} engines"];
                }
            } catch (\Exception $e) {
                // If hash check fails, fall back to full file scan
                return $this->scanFile($file);
            }
        }
        
        // For other scanners, fall back to full file scan
        return $this->scanFile($file);
    }

    /**
     * Log scan result to database
     */
    private function logScanResult(UploadedFile $file, array $result, float $scanTime, string $status): void
    {
        try {
            VirusScanLog::create([
                'file_name' => $file->getClientOriginalName(),
                'file_hash' => hash_file('sha256', $file->getPathname()),
                'scan_type' => $this->scannerType,
                'is_clean' => $result['clean'],
                'threat_name' => $result['threat'] ?? null,
                'scan_duration' => $scanTime,
                'scan_details' => [
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'extension' => $file->getClientOriginalExtension()
                ],
                'status' => $status
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log virus scan result', [
                'error' => $e->getMessage(),
                'file_name' => $file->getClientOriginalName()
            ]);
        }
    }

    /**
     * Get scan statistics
     */
    public function getScanStatistics(int $days = 30): array
    {
        $startDate = now()->subDays($days);
        
        $stats = VirusScanLog::where('.created_at', '>=', $startDate)
            ->selectRaw('
                COUNT(*) as total_scans,
                COUNT(CASE WHEN is_clean = 1 THEN 1 END) as clean_files,
                COUNT(CASE WHEN is_clean = 0 THEN 1 END) as infected_files,
                COUNT(CASE WHEN status = "error" THEN 1 END) as scan_errors,
                AVG(scan_duration) as avg_scan_time,
                scan_type
            ')
            ->groupBy('scan_type')
            ->get();

        return [
            'period_days' => $days,
            'scanners' => $stats,
            'total_scans' => $stats->sum('total_scans'),
            'clean_files' => $stats->sum('clean_files'),
            'infected_files' => $stats->sum('infected_files'),
            'scan_errors' => $stats->sum('scan_errors'),
            'infection_rate' => $stats->sum('total_scans') > 0 
                ? round(($stats->sum('infected_files') / $stats->sum('total_scans')) * 100, 2) 
                : 0
        ];
    }
}
