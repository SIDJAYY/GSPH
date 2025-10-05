<?php

return [
    
    /*
    |--------------------------------------------------------------------------
    | Virus Scanner Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the antivirus scanning functionality for uploaded files.
    | Choose your preferred scanning method and configure accordingly.
    |
    */

    // Scanner type: 'clamd', 'clamscan', 'virustotal', 'defender', 'disabled'
    'scanner_type' => env('VIRUS_SCANNER_TYPE', 'disabled'),

    // ClamAV Daemon Configuration
    'clamd_host' => env('CLAMD_HOST', 'localhost'),
    'clamd_port' => env('CLAMD_PORT', 3310),
    'clamd_enabled' => env('CLAMD_ENABLED', false),

    // ClamAV Command Line Configuration
    'clamscan_path' => env('CLAMSCAN_PATH', '/usr/bin/clamscan'),

    // VirusTotal API Configuration
    'virustotal_api_key' => env('VIRUSTOTAL_API_KEY'),
    'virustotal_base_url' => env('VIRUSTOTAL_BASE_URL', 'https://www.virustotal.com/api/v3'),

    // Windows Defender Configuration
    'windows_defender_path' => env('WINDOWS_DEFENDER_PATH', 'C:\\Program Files\\Windows Defender\\MpCmdRun.exe'),

    // Scanning behavior
    'scan_timeout' => env('VIRUS_SCAN_TIMEOUT', 30), // seconds
    'max_retries' => env('VIRUS_SCAN_MAX_RETRIES', 3),
    'fallback_policy' => env('VIRUS_SCAN_FALLBACK_POLICY', 'reject'), // 'reject' or 'allow'

    // Logging
    'log_scans' => env('VIRUS_LOG_SCANS', true),
    'log_level' => env('VIRUS_LOG_LEVEL', 'info'), // 'debug', 'info', 'warning', 'error'

];
