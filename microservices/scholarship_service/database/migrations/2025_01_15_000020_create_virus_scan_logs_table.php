<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('virus_scan_logs', function (Blueprint $table) {
            $table->id();
            $table->morphs('scannable'); // Can scan Documents or other models
            $table->string('file_name');
            $table->string('file_hash', 64)->nullable(); // SHA-256 hash
            $table->string('scan_type'); // clamd, clamscan, virustotal, defender
            $table->boolean('is_clean');
            $table->string('threat_name')->nullable();
            $table->decimal('scan_duration', 8, 3); // in seconds
            $table->text('scan_details')->nullable(); // Additional scan information
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('status'); // passed, failed, error, timeout
            $table->timestamps();

            // Indexes for performance
            $table->index(['file_hash']);
            $table->index(['is_clean']);
            $table->index(['scannable_type', 'scannable_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('virus_scan_logs');
    }
};
