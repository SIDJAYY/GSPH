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
        Schema::table('users', function (Blueprint $table) {
            // Check if columns exist before adding them
            if (!Schema::hasColumn('users', 'mobile')) {
                $table->string('mobile', 20)->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'birthdate')) {
                $table->date('birthdate')->nullable()->after('mobile');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('birthdate');
            }
            if (!Schema::hasColumn('users', 'house_number')) {
                $table->string('house_number', 50)->nullable()->after('address');
            }
            if (!Schema::hasColumn('users', 'street')) {
                $table->string('street', 255)->nullable()->after('house_number');
            }
            if (!Schema::hasColumn('users', 'barangay')) {
                $table->string('barangay', 255)->nullable()->after('street');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status', 50)->default('active')->after('role');
            }
            if (!Schema::hasColumn('users', 'email_verification_token')) {
                $table->string('email_verification_token', 100)->nullable()->after('status');
            }
            if (!Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id', 100)->nullable()->after('email_verified_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'mobile',
                'birthdate',
                'address',
                'house_number',
                'street',
                'barangay',
                'status',
                'email_verification_token',
                'google_id'
            ]);
        });
    }
};
