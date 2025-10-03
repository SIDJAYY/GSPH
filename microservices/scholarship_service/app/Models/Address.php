<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'type',
        'address_line_1',
        'address_line_2',
        'barangay',
        'district',
        'city',
        'province',
        'region',
        'zip_code',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // Accessors
    public function getFullAddressAttribute(): string
    {
        $address = $this->address_line_1;
        if ($this->address_line_2) {
            $address .= ', ' . $this->address_line_2;
        }
        if ($this->barangay) {
            $address .= ', ' . $this->barangay;
        }
        if ($this->district) {
            $address .= ', ' . $this->district;
        }
        if ($this->city) {
            $address .= ', ' . $this->city;
        }
        if ($this->province) {
            $address .= ', ' . $this->province;
        }
        if ($this->region) {
            $address .= ', ' . $this->region;
        }
        if ($this->zip_code) {
            $address .= ' ' . $this->zip_code;
        }
        return $address;
    }
}
