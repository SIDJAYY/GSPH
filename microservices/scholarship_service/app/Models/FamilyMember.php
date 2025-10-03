<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'relationship',
        'first_name',
        'last_name',
        'middle_name',
        'extension_name',
        'contact_number',
        'employer',
        'monthly_income',
        'is_alive',
        'is_employed',
        'is_ofw',
        'is_pwd',
        'pwd_specification',
    ];

    protected $casts = [
        'is_alive' => 'boolean',
        'is_employed' => 'boolean',
        'is_ofw' => 'boolean',
        'is_pwd' => 'boolean',
        'monthly_income' => 'decimal:2',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
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
    public function scopeParents($query)
    {
        return $query->whereIn('relationship', ['father', 'mother']);
    }

    public function scopeAlive($query)
    {
        return $query->where('is_alive', true);
    }

    public function scopeEmployed($query)
    {
        return $query->where('is_employed', true);
    }
}
