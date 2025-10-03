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
        Schema::create('scholarship_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('scholarship_categories')->onDelete('cascade');
            $table->foreignId('subcategory_id')->constrained('scholarship_subcategories')->onDelete('cascade');
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['new', 'renewal']);
            $table->string('parent_application_id')->nullable();
            $table->enum('status', [
                'draft',
                'submitted',
                'reviewed',
                'approved',
                'processing',
                'released',
                'rejected',
                'on_hold',
                'cancelled'
            ])->default('draft');
            $table->text('reason_for_renewal')->nullable();
            $table->text('financial_need_description');
            $table->decimal('requested_amount', 10, 2)->nullable();
            $table->decimal('approved_amount', 10, 2)->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->json('marginalized_groups')->nullable();
            $table->json('digital_wallets')->nullable();
            $table->string('wallet_account_number')->nullable();
            $table->json('how_did_you_know')->nullable();
            $table->boolean('is_school_at_caloocan')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'type']);
            $table->index(['status', 'submitted_at']);
            $table->index('application_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_applications');
    }
};
