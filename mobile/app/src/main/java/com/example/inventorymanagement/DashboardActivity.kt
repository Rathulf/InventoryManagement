package com.example.inventorymanagement

import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class DashboardActivity : AppCompatActivity() {

    private lateinit var tvTotalItems: TextView
    private lateinit var tvLowStock: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        // Initialize UI Elements
        tvTotalItems = findViewById(R.id.tvTotalItems)
        tvLowStock = findViewById(R.id.tvLowStock)

        // Fetch metrics on load
        loadDashboardData()
    }

    private fun loadDashboardData() {
        RetrofitClient.instance.getInventory().enqueue(object : Callback<List<InventoryItem>> {
            override fun onResponse(call: Call<List<InventoryItem>>, response: Response<List<InventoryItem>>) {
                if (response.isSuccessful && response.body() != null) {
                    val inventoryList = response.body()!!
                    updateMetrics(inventoryList)
                } else {
                    Toast.makeText(this@DashboardActivity, "Failed to load stock data", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<InventoryItem>>, t: Throwable) {
                Toast.makeText(this@DashboardActivity, "Network error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun updateMetrics(items: List<InventoryItem>) {
        // 1. Calculate Total Unique Items
        val uniqueItemsCount = items.size
        tvTotalItems.text = uniqueItemsCount.toString()

        // 2. Compute Low Stock count directly using count closure syntax
        val lowStockCount = items.count { it.qty <= 5 }

        // 3. Set text using String formatting to clear localization layout warnings
        tvLowStock.text = String.format("%d Items", lowStockCount)
    }
}