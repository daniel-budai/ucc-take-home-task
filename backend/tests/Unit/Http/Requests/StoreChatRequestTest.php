<?php

namespace Tests\Unit\Http\Requests;

use App\Http\Requests\Helpdesk\StoreChatRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class StoreChatRequestTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function validates_message_is_required(): void
    {
        $request = new StoreChatRequest();
        $rules = $request->rules();

        $validator = Validator::make([], $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    #[Test]
    public function validates_message_minimum_length(): void
    {
        $request = new StoreChatRequest();
        $rules = $request->rules();

        $data = [
            'message' => '',
        ];

        $validator = Validator::make($data, $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    #[Test]
    public function validates_message_maximum_length(): void
    {
        $request = new StoreChatRequest();
        $rules = $request->rules();

        $data = [
            'message' => str_repeat('a', 5001), // 5000 max
        ];

        $validator = Validator::make($data, $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('message', $validator->errors()->toArray());
    }

    #[Test]
    public function accepts_valid_message(): void
    {
        $request = new StoreChatRequest();
        $rules = $request->rules();

        $data = [
            'message' => 'I need help with my order',
        ];

        $validator = Validator::make($data, $rules);

        $this->assertFalse($validator->fails());
    }
}

