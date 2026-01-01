<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\EventController;
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
    
    // Help desk routes (protected by additional middleware)
    // Route::middleware('helpdesk.agent')->group(function () {
    //     // Help desk routes here
    // });
});
