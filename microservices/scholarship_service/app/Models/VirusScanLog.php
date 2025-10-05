<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class VirusScanLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'scannable_type',
        'scannable_id',
        'file_name',
        'file_hash',
        'scan_type',
        'is_clean',
        'threat_name',
        'scan_duration',
        'scan_details',
        'ip_address',
        'user_agent',
        'status'
    ];

    protected $casts = [
        'is_clean' => 'boolean',
        'scan_duration' => 'decimal:3',
        'scan_details' => 'array'
    ];

    // Relationships
    public function scannable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeClean($query)
    {
        return $query->where('is_clean', true);
    }

    public function scopeInfected($query)
    {
        return $query->where('is_clean', false);
    }

    public function scopeByType($query, $scanType)
    {
        return $query->where('scan_type', $scanType);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    // Methods
    public function getThreatDisplayAttribute(): string
    {
        return $this->threat_name ?? ($this->is_clean ? 'Clean' : 'Unknown threat');
    }

    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            'passed' => 'Passed',
            'failed' => 'Failed',
            'error' => 'Error',
            'timeout' => 'Timeout',
            default => 'Unknown'
        };
    }
}
