package com.example.inventorymanagement

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.inventorymanagement.authentication.LoginActivity
import com.example.inventorymanagement.dashboards.DashboardActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Check if the user has an active session saved locally
        val sharedPreferences = getSharedPreferences("StockPulseAuth", Context.MODE_PRIVATE)
        val savedRole = sharedPreferences.getString("USER_ROLE", null)
        val savedName = sharedPreferences.getString("USER_NAME", null)

        // 2. Route the user based on their session status
        if (savedRole != null && savedName != null) {
            // User is already logged in! Send them straight to the Dashboard
            val intent = Intent(this, DashboardActivity::class.java)
            intent.putExtra("USER_ROLE", savedRole)
            intent.putExtra("USER_NAME", savedName)
            startActivity(intent)
        } else {
            // No active session found, route them to the Login screen
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
        }

        // 3. Close this MainActivity so it doesn't stay open in the background
        finish()
    }
}