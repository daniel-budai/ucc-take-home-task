<?php

namespace App\Http\Requests\Helpdesk;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:1', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Message content is required.',
            'content.min' => 'Message cannot be empty.',
            'content.max' => 'Message cannot exceed 5000 characters.',
        ];
    }
}
