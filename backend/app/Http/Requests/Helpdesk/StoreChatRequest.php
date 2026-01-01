<?php

namespace App\Http\Requests\Helpdesk;

use Illuminate\Foundation\Http\FormRequest;

class StoreChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'min:1', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'A message is required to start a chat.',
            'message.min' => 'Message cannot be empty.',
            'message.max' => 'Message cannot exceed 5000 characters.',
        ];
    }
}
