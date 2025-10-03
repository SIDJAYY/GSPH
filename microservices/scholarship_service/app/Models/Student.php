<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id',
        'user_id',
        'student_id_number',
        'first_name',
        'last_name',
        'middle_name',
        'extension_name',
        'sex',
        'civil_status',
        'nationality',
        'birth_place',
        'birth_date',
        'is_pwd',
        'pwd_specification',
        'religion',
        'height_cm',
        'weight_kg',
        'contact_number',
        'email_address',
        'is_employed',
        'is_job_seeking',
        'is_currently_enrolled',
        'is_graduating',
        'is_solo_parent',
        'is_indigenous_group',
        'is_registered_voter',
        'voter_nationality',
        'has_paymaya_account',
        'preferred_mobile_number',
    ];

    protected $casts = [
        'is_pwd' => 'boolean',
        'is_employed' => 'boolean',
        'is_job_seeking' => 'boolean',
        'is_currently_enrolled' => 'boolean',
        'is_graduating' => 'boolean',
        'is_solo_parent' => 'boolean',
        'is_indigenous_group' => 'boolean',
        'is_registered_voter' => 'boolean',
        'has_paymaya_account' => 'boolean',
        'birth_date' => 'date',
        'height_cm' => 'decimal:2',
        'weight_kg' => 'decimal:2',
    ];

    // Relationships
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function familyMembers(): HasMany
    {
        return $this->hasMany(FamilyMember::class);
    }

    public function financialInformation(): HasOne
    {
        return $this->hasOne(FinancialInformation::class);
    }

    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class);
    }

    public function currentAcademicRecord(): HasOne
    {
        return $this->hasOne(AcademicRecord::class)->where('is_current', true);
    }

    public function scholarshipApplications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        $name = $this->first_name;
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }
        $name .= ' ' . $this->last_name;
        if ($this->extension_name) {
            $name .= ' ' . $this->extension_name;
        }
        return $name;
    }

    // Scopes
    public function scopeCurrentlyEnrolled($query)
    {
        return $query->where('is_currently_enrolled', true);
    }

    public function scopePwd($query)
    {
        return $query->where('is_pwd', true);
    }

    public function scopeSoloParent($query)
    {
        return $query->where('is_solo_parent', true);
    }
}
