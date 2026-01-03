<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('description')) {
            $this->merge([
                'description' => trim($this->input('description')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
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
            'description.max' => 'The description cannot exceed 5000 characters.',
        ];
    }
}

