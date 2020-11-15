<?php

use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

//Login logout routes
Route::post('login', [LoginController::class,'login']);
Route::middleware('auth:api')->post('logout', [LoginController::class,'logout']);


Route::middleware(['auth:api'])->group(function (){
//Rotas para os users
    Route::get('users/me',[UserController::class, 'myProfile']);
    Route::get('users',[UserController::class, 'index']);
    Route::get('users/{user}',[UserController::class, 'show']);
    Route::put('users/{user}',[UserController::class, 'update']);
    Route::delete('users/{user}',[UserController::class, 'destroy']);
});

Route::post('users',[UserController::class, 'store']);
Route::get('users/emailavailable',[UserController::class, 'emailAvailable']);

//Rotas para os products
Route::get('products',[ProductController::class, 'index']);
Route::get('products/{product}',[ProductController::class, 'show']);
Route::post('products',[ProductController::class, 'store']);
Route::put('products/{product}',[ProductController::class, 'update']);
Route::delete('products/{product}',[ProductController::class, 'destroy']);
