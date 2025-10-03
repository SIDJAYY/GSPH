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
        Schema::create('academic_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->enum('educational_level', [
                'ELEMENTARY',
                'HIGH SCHOOL',
                'SENIOR HIGH SCHOOL',
                'TERTIARY/COLLEGE',
                'GRADUATE SCHOOL'
            ]);
            $table->string('program')->nullable();
            $table->string('major')->nullable();
            $table->string('track_specialization')->nullable();
            $table->string('area_of_specialization')->nullable();
            $table->string('year_level');
            $table->string('school_year');
            $table->string('school_term');
            $table->integer('units_enrolled')->nullable();
            $table->integer('units_completed')->nullable();
            $table->decimal('gpa', 3, 2)->nullable();
            $table->decimal('general_weighted_average', 3, 2)->nullable();
            $table->string('previous_school')->nullable();
            $table->boolean('is_current')->default(true);
            $table->boolean('is_graduating')->default(false);
            $table->date('enrollment_date')->nullable();
            $table->date('graduation_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_records');
    }
};
