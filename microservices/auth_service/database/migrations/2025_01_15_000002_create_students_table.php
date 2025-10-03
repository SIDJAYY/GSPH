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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('citizen_id')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('student_id_number')->unique()->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('extension_name')->nullable();
            $table->enum('sex', ['Male', 'Female']);
            $table->enum('civil_status', ['Single', 'Married', 'Widowed', 'Divorced', 'Separated']);
            $table->string('nationality')->default('Filipino');
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->boolean('is_pwd')->default(false);
            $table->string('pwd_specification')->nullable();
            $table->string('religion')->nullable();
            $table->decimal('height_cm', 5, 2)->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email_address')->nullable();
            $table->boolean('is_employed')->default(false);
            $table->boolean('is_job_seeking')->default(false);
            $table->boolean('is_currently_enrolled')->default(true);
            $table->boolean('is_graduating')->default(false);
            $table->boolean('is_solo_parent')->default(false);
            $table->boolean('is_indigenous_group')->default(false);
            $table->boolean('is_registered_voter')->default(false);
            $table->string('voter_nationality')->nullable();
            $table->boolean('has_paymaya_account')->default(false);
            $table->string('preferred_mobile_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
