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
    val sku: String,
    val qty: Int,
    val status: String
)

interface AuthApi {
    @POST("api/auth/register")
    fun registerUser(@Body request: RegisterRequest): Call<Void>

    @POST("api/auth/login")
    fun loginUser(@Body request: LoginRequest): Call<AuthResponse>

    @GET("api/inventory")
    fun getInventory(): Call<List<InventoryItem>>
}

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:8080/"

    val instance: AuthApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }
}