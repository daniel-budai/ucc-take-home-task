<?php

namespace Tests\Unit\Services;

use App\Services\Helpdesk\AIService;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AIServiceTest extends TestCase
{
    private AIService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AIService();
    }

    #[Test]
    #[DataProvider('transferKeywordsProvider')]
    public function detects_transfer_request_keywords(string $message): void
    {
        // User intent detection
        $this->assertTrue($this->service->shouldTransferToHuman($message));
    }

    public static function transferKeywordsProvider(): array
    {
        return [
            ['I want to talk to a human'],
            ['Can I speak to an agent please?'],
            ['Transfer me to customer service'],
            ['I need a real person'],
            ['This is frustrating, escalate this'],
            ['I want to talk to someone'],
            ['Can I speak to a representative'],
            ['I need a supervisor'],
        ];
    }

    #[Test]
    #[DataProvider('normalMessagesProvider')]
    public function normal_messages_are_not_flagged_as_transfer(string $message): void
    {
        // Avoid false positives
        $this->assertFalse($this->service->shouldTransferToHuman($message));
    }

    public static function normalMessagesProvider(): array
    {
        return [
            ['How do I reset my password?'],
            ['My order is delayed'],
            ['Thank you for your help'],
            ['What are your business hours?'],
        ];
    }

    #[Test]
    public function transfer_detection_is_case_insensitive(): void
    {
        $this->assertTrue($this->service->shouldTransferToHuman('TALK TO HUMAN'));
        $this->assertTrue($this->service->shouldTransferToHuman('Talk To Human'));
        $this->assertTrue($this->service->shouldTransferToHuman('i WaNt A pErSoN'));
    }

    #[Test]
    public function transfer_detection_handles_whitespace(): void
    {
        $this->assertTrue($this->service->shouldTransferToHuman('  I want to talk to a human  '));
        $this->assertTrue($this->service->shouldTransferToHuman("\nI need an agent\n"));
    }
}

