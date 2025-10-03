<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'campus',
        'contact_number',
        'email',
        'website',
        'classification',
        'address',
        'city',
        'province',
        'region',
        'zip_code',
        'is_public',
        'is_partner_school',
        'is_active',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_partner_school' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class);
    }

    public function scholarshipApplications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class);
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        $name = $this->name;
        if ($this->campus) {
            $name .= ' - ' . $this->campus;
        }
        return $name;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePartnerSchools($query)
    {
        return $query->where('is_partner_school', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByClassification($query, $classification)
    {
        return $query->where('classification', $classification);
    }
}
