<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'school_id',
        'educational_level',
        'program',
        'major',
        'track_specialization',
        'area_of_specialization',
        'year_level',
        'school_year',
        'school_term',
        'units_enrolled',
        'units_completed',
        'gpa',
        'general_weighted_average',
        'previous_school',
        'is_current',
        'is_graduating',
        'enrollment_date',
        'graduation_date',
    ];

    protected $casts = [
        'units_enrolled' => 'integer',
        'units_completed' => 'integer',
        'gpa' => 'decimal:2',
        'general_weighted_average' => 'decimal:2',
        'is_current' => 'boolean',
        'is_graduating' => 'boolean',
        'enrollment_date' => 'date',
        'graduation_date' => 'date',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    // Scopes
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public function scopeGraduating($query)
    {
        return $query->where('is_graduating', true);
    }

    public function scopeByEducationalLevel($query, $level)
    {
        return $query->where('educational_level', $level);
    }

    public function scopeBySchoolYear($query, $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }
}
