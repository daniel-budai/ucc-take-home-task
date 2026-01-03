<?php

use App\Models\Chat;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/*
|--------------------------------------------------------------------------
| Chat Channel
|--------------------------------------------------------------------------
|
| Authorize users to listen on chat channels using ChatPolicy.
| Users can access if they own the chat OR are assigned agents.
|
*/
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    $chat = Chat::find($chatId);
    
    return $chat && $user->can('view', $chat);
});
