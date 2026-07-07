package com.example.inventorymanagement

import retrofit2.Call
import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.textfield.TextInputEditText

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
            val role = spinnerRole.selectedItem.toString()

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill out all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // 1. Bundle input strings into the request object
            val request = RegisterRequest(name, email, password, role)

            // 2. Post data asynchronously to the Spring Boot backend server
            RetrofitClient.instance.registerUser(request).enqueue(object : retrofit2.Callback<Void> {
                override fun onResponse(call: Call<Void>, response: retrofit2.Response<Void>) {
                    if (response.isSuccessful || response.code() == 201) {
                        val intent = Intent(this@RegisterActivity, LoginActivity::class.java).apply {
                            putExtra("REG_SUCCESS_MSG", "Registration successful! Please log in.")
                        }
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@RegisterActivity, "Registration failed: Email might be taken", Toast.LENGTH_LONG).show()
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