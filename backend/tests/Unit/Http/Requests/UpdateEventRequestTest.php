<?php

namespace Tests\Unit\Http\Requests;

use App\Http\Requests\Event\UpdateEventRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UpdateEventRequestTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function allows_description_to_be_nullable(): void
    {
        $request = new UpdateEventRequest();
        $rules = $request->rules();

        $validator = Validator::make([], $rules);

        $this->assertFalse($validator->fails());
    }

    #[Test]
    public function validates_description_max_length(): void
    {
        $request = new UpdateEventRequest();
        $rules = $request->rules();

        $data = [
            'description' => str_repeat('a', 5001), // 5000 max
        ];

        $validator = Validator::make($data, $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('description', $validator->errors()->toArray());
    }

    #[Test]
    public function trims_description_during_preparation(): void
    {
        $request = new UpdateEventRequest();
        $request->merge(['description' => '  Updated description  ']);

        // Use reflection to call protected method
        $reflection = new \ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);

        $this->assertEquals('Updated description', $request->input('description'));
    }
}

