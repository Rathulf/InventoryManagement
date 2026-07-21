package com.example.inventorymanagement.dashboards

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.inventorymanagement.InventoryItem
import com.example.inventorymanagement.R
import com.example.inventorymanagement.RetrofitClient
import com.example.inventorymanagement.TransactionRequest
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class StaffDashboardActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private val inventoryList = mutableListOf<InventoryItem>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_staff_dashboard)

        recyclerView = findViewById(R.id.rvStaffInventory)
        recyclerView.layoutManager = LinearLayoutManager(this)

        findViewById<Button>(R.id.btnStockIn).setOnClickListener {
            showTransactionDialog("IN")
        }

        findViewById<Button>(R.id.btnStockOut).setOnClickListener {
            showTransactionDialog("OUT")
        }

        fetchInventory()
    }

    private fun fetchInventory() {
        RetrofitClient.instance.getInventory().enqueue(object : Callback<List<InventoryItem>> {
            override fun onResponse(call: Call<List<InventoryItem>>, response: Response<List<InventoryItem>>) {
                if (response.isSuccessful && response.body() != null) {
                    inventoryList.clear()
                    inventoryList.addAll(response.body()!!)
                }
            }
            override fun onFailure(call: Call<List<InventoryItem>>, t: Throwable) {
                Toast.makeText(this@StaffDashboardActivity, "Error loading stock", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun showTransactionDialog(type: String) {
        if (inventoryList.isEmpty()) {
            Toast.makeText(this, "Inventory data is still loading...", Toast.LENGTH_SHORT).show()
            return
        }

        val itemNames = inventoryList.map { "${it.name} (Stock: ${it.quantity})" }.toTypedArray()
        var selectedItemIndex = 0

        AlertDialog.Builder(this)
            .setTitle(if (type == "IN") "Stock In (Receiving)" else "Stock Out (Dispatching)")
            .setSingleChoiceItems(itemNames, 0) { _, which ->
                selectedItemIndex = which
            }
            .setPositiveButton("Proceed") { _, _ ->
                val chosenItem = inventoryList[selectedItemIndex]
                executeTransaction(chosenItem.id, type)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun executeTransaction(itemId: Long, type: String) {
        val request = TransactionRequest(itemId = itemId, type = type, quantity = 1, performedBy = "Mobile Staff")

        RetrofitClient.instance.processTransaction(request).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@StaffDashboardActivity, "Transaction successful!", Toast.LENGTH_SHORT).show()
                    fetchInventory()
                } else {
                    Toast.makeText(this@StaffDashboardActivity, "Transaction failed.", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@StaffDashboardActivity, "Error: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}