<?php

declare(strict_types=1);

namespace App\Services\Helpdesk;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    public function generateResponse(string $userMessage, array $chatHistory = []): string
    {
        try {
            $response = Http::timeout(30)
                ->retry(3, 100, function ($exception) {
                    // Don't retry on 4xx errors
                    return !($exception instanceof RequestException && 
                           $exception->getCode() >= 400 && 
                           $exception->getCode() < 500);
                })
                ->withHeaders([
                    'Authorization' => 'Bearer ' . config('services.openai.key'),
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => config('services.openai.model', 'gpt-4o-mini'),
                    'messages' => $this->buildMessages($userMessage, $chatHistory),
                    'max_tokens' => 500,
                    'temperature' => 0.7,
                ]);

            if ($response->failed()) {
                Log::error('AI service failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('AI service unavailable');
            }

            $content = $response->json('choices.0.message.content');
            
            if (empty($content)) {
                throw new \Exception('Empty AI response');
            }

            return $content;
            
        } catch (ConnectionException $e) {
            Log::error('AI service connection failed', [
                'error' => $e->getMessage(),
            ]);
            return "I'm having trouble connecting right now. Would you like to speak with a human agent?";
        } catch (\Exception $e) {
            Log::error('AI response failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return "I'm having trouble processing your request right now. Would you like to speak with a human agent?";
        }
    }

    public function shouldTransferToHuman(string $userMessage): bool
    {
        $lowerMessage = strtolower(trim($userMessage));
        
        // Explicit transfer keywords
        $transferKeywords = [
            'human', 'agent', 'person', 'talk to someone', 
            'transfer', 'representative', 'speak to', 'customer service',
            'real person', 'not helping', 'frustrated', 'escalate',
            'supervisor', 'manager'
        ];
        
        foreach ($transferKeywords as $keyword) {
            if (str_contains($lowerMessage, $keyword)) {
                return true;
            }
        }
        
        return false;
    }

    private function buildMessages(string $userMessage, array $history): array
    {
        $systemPrompt = "You are a helpful customer support assistant. " .
                       "Be concise, professional, and empathetic. " .
                       "If you cannot help, suggest transferring to a human agent.";

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];

        // Add chat history (limit to last 10 for context and token management)
        foreach (array_slice($history, -10) as $msg) {
            $role = match($msg['type'] ?? 'user') {
                'user' => 'user',
                'agent' => 'user', // Agent messages as user for context
                default => 'assistant',
            };
            
            $messages[] = [
                'role' => $role,
                'content' => $msg['content'] ?? ''
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $userMessage
        ];

        return $messages;
    }
}

