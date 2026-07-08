package com.example.inventorymanagement

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val etEmail = findViewById<TextInputEditText>(R.id.etLoginEmail)
        val etPassword = findViewById<TextInputEditText>(R.id.etLoginPassword)
        val btnLogin = findViewById<Button>(R.id.btnLoginSubmit)
        val tvToRegister = findViewById<TextView>(R.id.tvToRegister)

        val successMessage = intent.getStringExtra("REG_SUCCESS_MSG")
        if (!successMessage.isNullOrEmpty()) {
            Toast.makeText(this, successMessage, Toast.LENGTH_LONG).show()
        }

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter your email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val request = LoginRequest(email, password)

            RetrofitClient.instance.loginUser(request).enqueue(object : Callback<AuthResponse> {
                override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                    if (response.isSuccessful && response.body() != null) {
                        val session = response.body()!!

                        // Cache user identity details locally using SharedPreferences
                        val sharedPreferences = getSharedPreferences("StockPulseAuth", Context.MODE_PRIVATE)
                        sharedPreferences.edit().apply {
                            putString("USER_NAME", session.name)
                            putString("USER_EMAIL", session.email)
                            putString("USER_ROLE", session.role)
                            apply()
                        }

                        Toast.makeText(this@LoginActivity, "Welcome back, ${session.name}!", Toast.LENGTH_SHORT).show()

                        // 🟢 Active Redirect: Takes you directly to your Dashboard Activity workspace
                        val intent = Intent(this@LoginActivity, DashboardActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, "Invalid email or password.", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                    Toast.makeText(this@LoginActivity, "Server network error: ${t.message}", Toast.LENGTH_SHORT).show()

                }
            })
        }

        tvToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
            finish()
        }
    }
}