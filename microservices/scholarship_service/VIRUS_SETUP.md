# Antivirus Scanning Setup Guide

This guide explains how to set up antivirus scanning for uploaded documents in the GSM Scholarship Management System.

## Overview

The system now includes comprehensive antivirus scanning capabilities that automatically scan all uploaded documents before they are processed and stored. This protects against malware, trojans, search engines, and other malicious content.

## Features

- **Multiple Scanner Support**: ClamAV Daemon/CLI, VirusTotal API, Windows Defender
- **Automatic Scanning**: All uploaded documents are scanned before processing
- **Comprehensive Logging**: All scan results are logged to the database
- **Performance Monitoring**: Track scan times and success rates
- **Fail-Safe**: Files are rejected if scanner fails (security-first approach)

## Installation & Setup

### Option 1: ClamAV (Recommended - Free & Open Source)

#### Windows Setup:
1. Download ClamAV from: https://www.clamav.net/downloads
2. Install ClamAV
3. Update virus definitions: `freshclam`
4. Configure in `.env`:

```env
VIRUS_SCANNER_TYPE=clamd
CLAMD_ENABLED=true
CLAMD_HOST=localhost
CLAMD_PORT=3310
CLAMSCAN_PATH=C:\\ClamAV\\bin\\clamscan.exe
VIRUS_LOG_SCANS=true
```

#### Linux Setup:
```bash
# Install ClamAV
sudo apt-get install clamav clamav-daemon
sudo freshclam

# Enable and start daemon
sudo systemctl enable clamav-daemon
sudo systemctl start clamav-daemon

# Configure in .env:
```

```env
VIRUS_SCANNER_TYPE=clamd
CLAMD_ENABLED=true
CLAMD_HOST=localhost
CLAMD_PORT=3310
CLAMSCAN_PATH=/usr/bin/clamscan
VIRUS_LOG_SCANS=true
```

### Option 2: VirusTotal API (Cloud-based)

1. Get API key from: https://www.virustotal.com/
2. Configure in `.env`:

```env
VIRUS_SCANNER_TYPE=virustotal
VIRUSTOTAL_API_KEY=your_api_key_here
VIRUS_SCAN_TIMEOUT=60
VIRUS_LOG_SCANS=true
```

### Option 3: Windows Defender (Windows only)

```env
VIRUS_SCANNER_TYPE=defender
WINDOWS_DEFENDER_PATH=C:\\Program Files\\Windows Defender\\MpCmdRun.exe
VIRUS_LOG_SCANS=true
```

## Database Setup

Run the migration to create virus scan logs table:

```bash
cd microservices/scholarship_service
php artisan migrate
```

## Configuration Options

### Environment Variables

```env
# Scanner Type: disabled, clamd, clamscan, virustotal, defender
VIRUS_SCANNER_TYPE=clamd

# ClamAV Settings
CLAMD_ENABLED=true
CLAMD_HOST=localhost
CLAMD_PORT=3310
CLAMSCAN_PATH=/usr/bin/clamscan

# VirusTotal Settings
VIRUSTOTAL_API_KEY=your_api_key_here
VIRUSTOTAL_BASE_URL=https://www.virustotal.com/api/v3

# Windows Defender Settings
WINDOWS_DEFENDER_PATH=C:\\Program Files\\Windows Defender\\MpCmdRun.exe

# Scan Behavior
VIRUS_SCAN_TIMEOUT=30           # Scan timeout in seconds
VIRUS_SCAN_MAX_RETRIES=3        # Max retry attempts
VIRUS_SCAN_FALLBACK_POLICY=reject  # reject or allow when scanner fails

# Upload restrictions
VIRUS_LOG_SCANS=true           # Enable scan logging
VIRUS_LOG_LEVEL=info          # debug, info, warning, error
```

## Testing the Setup

### 1. Test with Clean File
Upload a common document (PDF, DOCX) - it should process normally.

### 2. Test Scanner Response
Check logs for scan results:
```bash
tail -f storage/logs/laravel.log | grep "virus scan"
```

### 3. View Scan Statistics
Create a controller method to display statistics:

```php
public function scanStats(Request $request)
{
    $scanner = app(VirusScannerService::class);
    return response()->json($scanner->getScanStatistics(30)); // Last 30 days
}
```

## Usage in Frontend

The frontend automatically handles virus scan responses:

- **Success**: File uploads normally
- **Virus Detected**: Upload is rejected with security message
- **Scanner Error**: Upload is rejected with error message

Example error response:
```json
{
    "success": false,
    "message": "File upload rejected due to security concerns",
    "data": {
        "reason": "Virus scan detected malicious content",
        "threat": "Trojan.Generic.123456",
        "scan_time": 0.045
    }
}
```

## Monitoring & Logs

### Database Logs
Query virus scan logs:
```sql
SELECT 
    file_name,
    scan_type,
    is_clean,
    threat_name,
    scan_duration,
    created_at
FROM virus_scan_logs 
ORDER BY created_at DESC;
```

### Laravel Logs
Monitor scan activity:
```bash
# View recent scan logs
tail -f storage/logs/laravel.log | grep -i "virus"

# Count infected files
grep -c "virus detected" storage/logs/laravel.log
```

## Security Considerations

1. **Fail-Safe Policy**: When enabled, files are rejected if virus scanner fails
2. **Regular Updates**: Keep virus definitions updated (especially ClamAV)
3. **Performance**: Virus scanning adds ~50-200ms per file upload
4. **Storage**: Scan logs are stored indefinitely - consider cleanup policies

## Troubleshooting

### Scanner Not Working
1. Check scanner daemon status for ClamAV: `systemctl status clamav-daemon`
2. Test scanner manually: `clamscan /path/to/file`
3. Check logs: `tail -f storage/logs/laravel.log`

### Performance Issues
1. Reduce scan timeout: `VIRUS_SCAN_TIMEOUT=15`
2. Use ClamAV daemon instead_of CLI: `VIRUS_SCANNER_TYPE=clamd`
3. Monitor scan duration in logs

### False Positives
- Adjust VirusTotal thresholds
- Whitelist common file types
- Review detection rules

## Advanced Features

### Custom Scanner
Implement your own scanner by extending `VirusScannerService` class.

### Integration with Admin Panel
Add scan statistics dashboard showing:
- Scan success/failure rates
- Threat types detected
- Upload rejection reasons
- Scanner performance metrics

### Automated Cleanup
Set up scheduled jobs to clean old scan logs:
```php
// In app/Console/Kernel.php
$schedule->call(function () {
    VirusScanLog::where('created_at', '<', now()->subMonths(6))
               ->delete();
})->monthly();
```
