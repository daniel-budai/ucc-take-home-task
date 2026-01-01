<?php

namespace Tests\Unit\Http\Requests;

use App\Http\Requests\Helpdesk\SendMessageRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SendMessageRequestTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function validates_content_is_required(): void
    {
        $request = new SendMessageRequest();
        $rules = $request->rules();

        $validator = Validator::make([], $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('content', $validator->errors()->toArray());
    }

    #[Test]
    public function validates_content_minimum_length(): void
    {
        $request = new SendMessageRequest();
        $rules = $request->rules();

        $data = [
            'content' => '',
        ];

        $validator = Validator::make($data, $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('content', $validator->errors()->toArray());
    }

    #[Test]
    public function validates_content_maximum_length(): void
    {
        $request = new SendMessageRequest();
        $rules = $request->rules();

        $data = [
            'content' => str_repeat('a', 5001), // 5000 max
        ];

        $validator = Validator::make($data, $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('content', $validator->errors()->toArray());
    }

    #[Test]
    public function accepts_valid_content(): void
    {
        $request = new SendMessageRequest();
        $rules = $request->rules();

        $data = [
            'content' => 'This is a valid message',
        ];

        $validator = Validator::make($data, $rules);

        $this->assertFalse($validator->fails());
    }
}

