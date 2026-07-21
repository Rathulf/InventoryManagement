package com.example.inventorymanagement

import okhttp3.OkHttpClient
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

// Data contracts matching your Spring Boot backend controllers
data class RegisterRequest(val name: String, val email: String, val password: String, val role: String)
data class LoginRequest(val email: String, val password: String)
data class AuthResponse(val name: String, val email: String, val role: String)

data class InventoryItem(
    val id: Long,
    val name: String,
    val sku: String?,
    val quantity: Int,
    val category: String?
)

interface AuthApi {
    @POST("api/employees/register")
    fun registerUser(@Body request: RegisterRequest): Call<Void>

    @POST("api/employees/login")
    fun loginUser(@Body request: LoginRequest): Call<AuthResponse>

    @GET("api/items")
    fun getInventory(): Call<List<InventoryItem>>
}

object RetrofitClient {
    private const val BASE_URL = "https://stockpulse-cbdz.onrender.com/"

    // Create a client that waits up to 60 seconds for Render to wake up
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    val instance: AuthApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient) // Attach the patient client here
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }
}
