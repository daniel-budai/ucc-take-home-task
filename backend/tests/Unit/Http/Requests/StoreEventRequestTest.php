<?php

namespace Tests\Unit\Http\Requests;

use App\Http\Requests\Event\StoreEventRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class StoreEventRequestTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function validates_required_fields(): void
    {
        $request = new StoreEventRequest();
        $rules = $request->rules();

        $validator = Validator::make([], $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
        $this->assertArrayHasKey('occurrence', $validator->errors()->toArray());
    }

    #[Test]
    public function validates_title_max_length(): void
    {
        $request = new StoreEventRequest();
        $rules = $request->rules();

        $data = [
            'title' => str_repeat('a', 256), // 255 max
            'occurrence' => now()->addDay()->toISOString(),
        ];

        $validator = Validator::make($data, $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
    }

    #[Test]
    public function validates_occurrence_must_be_future(): void
    {
        $request = new StoreEventRequest();
        $rules = $request->rules();

        $data = [
            'title' => 'Test Event',
            'occurrence' => now()->subDay()->toISOString(),
        ];

        $validator = Validator::make($data, $rules);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('occurrence', $validator->errors()->toArray());
    }

    #[Test]
    public function trims_title_during_preparation(): void
    {
        $request = new StoreEventRequest();
        $request->merge(['title' => '  Test Event  ']);

        // Use reflection to call protected method
        $reflection = new \ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);

        $this->assertEquals('Test Event', $request->input('title'));
    }

    #[Test]
    public function allows_nullable_description(): void
    {
        $request = new StoreEventRequest();
        $rules = $request->rules();

        $data = [
            'title' => 'Test Event',
            'occurrence' => now()->addDay()->toISOString(),
            'description' => null,
        ];

        $validator = Validator::make($data, $rules);

        $this->assertFalse($validator->fails());
    }
}

