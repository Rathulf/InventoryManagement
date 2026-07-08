package com.example.inventorymanagement

import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etName = findViewById<TextInputEditText>(R.id.etRegisterName)
        val etEmail = findViewById<TextInputEditText>(R.id.etRegisterEmail)
        val etPassword = findViewById<TextInputEditText>(R.id.etRegisterPassword)
        val spinnerRole = findViewById<Spinner>(R.id.spinnerRole)
        val btnRegister = findViewById<Button>(R.id.btnRegisterSubmit)
        val tvToLogin = findViewById<TextView>(R.id.tvToLogin)

        // Set choices for the role selector
        val roles = arrayOf("Admin", "Staff Member")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, roles)
        spinnerRole.adapter = adapter

        btnRegister.setOnClickListener {
            val name = etName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            // 🟢 Normalizes the dropdown selection string case format to match backend expectations
            val role = spinnerRole.selectedItem.toString().uppercase().replace(" ", "_").trim()

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill out all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password.length < 6) {
                Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val request = RegisterRequest(name, email, password, role)

            RetrofitClient.instance.registerUser(request).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful || response.code() == 201) {
                        val intent = Intent(this@RegisterActivity, LoginActivity::class.java).apply {
                            putExtra("REG_SUCCESS_MSG", "Registration successful! Please log in.")
                        }
                        startActivity(intent)
                        finish()
                    } else {
                        val errorResponse = response.errorBody()?.string() ?: "Email might be taken"
                        Toast.makeText(this@RegisterActivity, "Registration failed: $errorResponse", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@RegisterActivity, "Connection error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }

        tvToLogin.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}