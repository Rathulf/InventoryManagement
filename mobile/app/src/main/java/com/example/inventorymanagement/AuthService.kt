package com.example.inventorymanagement

import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

// Data contracts matching your Spring Boot backend controllers
data class RegisterRequest(val name: String, val email: String, val password: String, val role: String)
data class LoginRequest(val email: String, val password: String)
data class AuthResponse(val name: String, val email: String, val role: String)

data class InventoryItem(
    val id: Long,
    val name: String,
    val sku: String?,
    // Changed from 'qty' to 'quantity' to perfectly match your backend JSON payload
    val quantity: Int,
    val category: String?
)

interface AuthApi {
    // Updated from /api/auth to /api/employees
    @POST("api/employees/register")
    fun registerUser(@Body request: RegisterRequest): Call<Void>

    // Updated from /api/auth to /api/employees
    @POST("api/employees/login")
    fun loginUser(@Body request: LoginRequest): Call<AuthResponse>

    // Updated from /api/inventory to /api/items
    @GET("api/items")
    fun getInventory(): Call<List<InventoryItem>>
}

object RetrofitClient {
    // Pointing directly to your live production server on Render
    private const val BASE_URL = "https://stockpulse-cbdz.onrender.com/"

    val instance: AuthApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }
}