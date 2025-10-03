<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScholarshipAward extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'award_amount',
        'award_date',
        'disbursement_schedule',
        'status',
    ];

    protected $casts = [
        'award_amount' => 'decimal:2',
        'award_date' => 'date',
        'disbursement_schedule' => 'array',
    ];

    // Relationships
    public function application(): BelongsTo
    {
        return $this->belongsTo(ScholarshipApplication::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'award_id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDisbursed($query)
    {
        return $query->where('status', 'disbursed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Methods
    public function getTotalPaidAttribute(): float
    {
        return $this->payments()->where('status', 'completed')->sum('amount');
    }

    public function getRemainingAmountAttribute(): float
    {
        return $this->award_amount - $this->total_paid;
    }

    public function isFullyPaid(): bool
    {
        return $this->remaining_amount <= 0;
    }
}
