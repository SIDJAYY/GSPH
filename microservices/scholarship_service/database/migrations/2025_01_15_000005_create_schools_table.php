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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('campus')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->enum('classification', [
                'LOCAL UNIVERSITY/COLLEGE (LUC)',
                'STATE UNIVERSITY/COLLEGE (SUC)',
                'PRIVATE UNIVERSITY/COLLEGE',
                'TECHNICAL/VOCATIONAL INSTITUTE',
                'OTHER'
            ]);
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('region')->nullable();
            $table->string('zip_code', 20)->nullable();
            $table->boolean('is_public')->default(false);
            $table->boolean('is_partner_school')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
