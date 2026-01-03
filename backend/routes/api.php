<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\Helpdesk\AgentChatController;
use App\Http\Controllers\Api\V1\Helpdesk\ChatController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [LoginController::class, 'login']);
Route::post('/password/reset', [PasswordResetController::class, 'request']);
Route::post('/password/reset/confirm', [PasswordResetController::class, 'reset']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    
    Route::apiResource('events', EventController::class)
        ->parameters(['events' => 'event']);
    
    // Help desk chat routes (user)
    Route::prefix('chats')->group(function () {
        Route::get('/', [ChatController::class, 'index']);
        Route::post('/', [ChatController::class, 'store']);
        Route::get('{chat}', [ChatController::class, 'show']);
        Route::post('{chat}/messages', [ChatController::class, 'sendMessage']);
    });
    
    // Help desk agent routes
    Route::middleware('helpdesk.agent')->prefix('helpdesk')->group(function () {
        Route::get('chats', [AgentChatController::class, 'index']);
        Route::get('chats/unassigned', [AgentChatController::class, 'unassigned']);
        Route::get('chats/{chat}', [AgentChatController::class, 'show']);
        Route::post('chats/{chat}/assign', [AgentChatController::class, 'assign']);
        Route::post('chats/{chat}/reply', [AgentChatController::class, 'reply']);
        Route::post('chats/{chat}/resolve', [AgentChatController::class, 'resolve']);
    });
});
