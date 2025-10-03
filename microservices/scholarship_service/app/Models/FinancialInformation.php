<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialInformation extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'total_annual_income',
        'monthly_income',
        'number_of_children',
        'number_of_siblings',
        'home_ownership_status',
        'is_4ps_beneficiary',
    ];

    protected $casts = [
        'total_annual_income' => 'decimal:2',
        'monthly_income' => 'decimal:2',
        'number_of_children' => 'integer',
        'number_of_siblings' => 'integer',
        'is_4ps_beneficiary' => 'boolean',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // Scopes
    public function scopeLowIncome($query, $threshold = 100000)
    {
        return $query->where('total_annual_income', '<', $threshold);
    }

    public function scope4psBeneficiary($query)
    {
        return $query->where('is_4ps_beneficiary', true);
    }
}
