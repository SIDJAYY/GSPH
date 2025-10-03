<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'birth_date' => 'date',
        'is_pwd' => 'boolean',
        'is_employed' => 'boolean',
        'is_job_seeking' => 'boolean',
        'is_currently_enrolled' => 'boolean',
        'is_graduating' => 'boolean',
        'is_solo_parent' => 'boolean',
        'is_indigenous_group' => 'boolean',
        'is_registered_voter' => 'boolean',
        'has_paymaya_account' => 'boolean',
        'height_cm' => 'decimal:2',
        'weight_kg' => 'decimal:2',
    ];

    /**
     * Get the user that owns the student.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
