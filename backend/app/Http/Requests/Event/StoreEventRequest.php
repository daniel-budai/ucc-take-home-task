<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware/policy
    }

    protected function prepareForValidation(): void
    {
        // Sanitize title
        if ($this->has('title')) {
            $this->merge([
                'title' => trim($this->input('title')),
            ]);
        }

        // Sanitize description
        if ($this->has('description')) {
            $this->merge([
                'description' => trim($this->input('description')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'occurrence' => [
                'required',
                'date',
                'after_or_equal:now',
            ],
            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'The event title is required.',
            'title.max' => 'The title cannot exceed 255 characters.',
            'occurrence.required' => 'The event occurrence date and time is required.',
            'occurrence.after_or_equal' => 'The event must be scheduled for a future date and time.',
            'description.max' => 'The description cannot exceed 5000 characters.',
        ];
    }
}

