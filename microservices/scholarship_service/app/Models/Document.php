<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'application_id',
        'document_type_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'status',
        'verification_notes',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'verified_at' => 'datetime',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(ScholarshipApplication::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByType($query, $documentTypeId)
    {
        return $query->where('document_type_id', $documentTypeId);
    }

    // Methods
    public function verify($notes = null, $verifiedBy = null): bool
    {
        $this->update([
            'status' => 'verified',
            'verification_notes' => $notes,
            'verified_by' => $verifiedBy ?? auth()->id(),
            'verified_at' => now(),
        ]);

        return true;
    }

    public function reject($notes = null, $verifiedBy = null): bool
    {
        $this->update([
            'status' => 'rejected',
            'verification_notes' => $notes,
            'verified_by' => $verifiedBy ?? auth()->id(),
            'verified_at' => now(),
        ]);

        return true;
    }
}
