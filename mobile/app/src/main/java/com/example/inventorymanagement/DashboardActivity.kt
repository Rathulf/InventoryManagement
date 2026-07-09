package com.example.inventorymanagement

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class DashboardActivity : AppCompatActivity() {

    private lateinit var tvUserRoleBadge: TextView
    private lateinit var tvTotalSkus: TextView
    private lateinit var tvTotalVolume: TextView
    private lateinit var fabAddItem: FloatingActionButton

    private lateinit var rvInventory: RecyclerView
    private lateinit var inventoryAdapter: InventoryAdapter

    private var currentUserRole: String = "STAFF"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        tvUserRoleBadge = findViewById(R.id.tvUserRoleBadge)
        tvTotalSkus = findViewById(R.id.tvTotalSkus)
        tvTotalVolume = findViewById(R.id.tvTotalVolume)
        fabAddItem = findViewById(R.id.fabAddItem)

        currentUserRole = intent.getStringExtra("USER_ROLE") ?: "STAFF"
        val activeUsername = intent.getStringExtra("USER_NAME") ?: "Operator"

        // Initialize lists with admin privileges checking flag
        rvInventory = findViewById(R.id.rvInventory)
        rvInventory.layoutManager = LinearLayoutManager(this)

        inventoryAdapter = InventoryAdapter(emptyList(), isUserAdmin = (currentUserRole == "ADMIN")) { itemId, itemName ->
            confirmAndPurgeItem(itemId, itemName)
        }
        rvInventory.adapter = inventoryAdapter

        if (currentUserRole == "ADMIN") {
            tvUserRoleBadge.text = "ADMIN CONTROL PANEL • Welcome, $activeUsername"
            tvUserRoleBadge.setTextColor(android.graphics.Color.parseColor("#DC2626"))
            fabAddItem.visibility = View.VISIBLE
        } else {
            tvUserRoleBadge.text = "STAFF WORKSPACE • Welcome, $activeUsername"
            tvUserRoleBadge.setTextColor(android.graphics.Color.parseColor("#475569"))
            fabAddItem.visibility = View.GONE
        }

        fabAddItem.setOnClickListener { showRegisterAssetDialog() }
        fetchLiveInventoryData()
    }

    private fun fetchLiveInventoryData() {
        thread {
            try {
                val url = URL("http://10.0.2.2:8080/api/inventory")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connect()

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val response = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) { response.append(line) }
                    reader.close()

                    val jsonArray = JSONArray(response.toString())
                    val rawList = mutableListOf<JSONObject>()

                    for (i in 0 until jsonArray.length()) {
                        rawList.add(jsonArray.getJSONObject(i))
                    }

                    // 🟢 UNIQUE PROTECTION FILTER LAYER: Eliminates matching SKU duplicates
                    val uniqueItemList = rawList.distinctBy { it.optString("sku", "N/A").trim().uppercase() }

                    var grossVolume = 0
                    for (itemObj in uniqueItemList) {
                        grossVolume += itemObj.optInt("quantity", 0)
                    }

                    runOnUiThread {
                        tvTotalSkus.text = uniqueItemList.size.toString()
                        tvTotalVolume.text = "$grossVolume units"
                        inventoryAdapter.updateData(uniqueItemList)
                    }
                }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this, "Network error synchronizing ledger data.", Toast.LENGTH_SHORT).show() }
            }
        }
    }

    private fun confirmAndPurgeItem(itemId: String, itemName: String) {
        AlertDialog.Builder(this)
            .setTitle("Confirm Purge")
            .setMessage("Are you sure you want to permanently clear $itemName from the backend ledger rows?")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Purge") { _, _ ->
                thread {
                    try {
                        val url = URL("http://10.0.2.2:8080/api/inventory/$itemId")
                        val connection = url.openConnection() as HttpURLConnection
                        connection.requestMethod = "DELETE"
                        connection.connect()

                        if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                            runOnUiThread {
                                Toast.makeText(this, "Asset record successfully cleared.", Toast.LENGTH_SHORT).show()
                                fetchLiveInventoryData()
                            }
                        }
                    } catch (e: Exception) {
                        runOnUiThread { Toast.makeText(this, "Network error disconnecting row records.", Toast.LENGTH_SHORT).show() }
                    }
                }
            }
            .show()
    }

    private fun showRegisterAssetDialog() {
        val dialogBuilder = AlertDialog.Builder(this)
        val inflater = this.layoutInflater
        val dialogView = inflater.inflate(R.layout.dialog_add_item, null)
        dialogBuilder.setView(dialogView)

        val etSku = dialogView.findViewById<EditText>(R.id.etDialogSku)
        val etName = dialogView.findViewById<EditText>(R.id.etDialogName)
        val etCategory = dialogView.findViewById<EditText>(R.id.etDialogCategory)
        val etQuantity = dialogView.findViewById<EditText>(R.id.etDialogQuantity)
        val btnSave = dialogView.findViewById<Button>(R.id.btnDialogSave)

        val alertDialog = dialogBuilder.create()

        btnSave.setOnClickListener {
            val skuText = etSku.text.toString().trim()
            val nameText = etName.text.toString().trim()
            val catText = etCategory.text.toString().trim()
            val qtyText = etQuantity.text.toString().trim()

            if (skuText.isEmpty() || nameText.isEmpty() || catText.isEmpty() || qtyText.isEmpty()) {
                Toast.makeText(this, "Please populate all tracking properties.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            thread {
                try {
                    val url = URL("http://10.0.2.2:8080/api/inventory")
                    val connection = url.openConnection() as HttpURLConnection
                    connection.requestMethod = "POST"
                    connection.setRequestProperty("Content-Type", "application/json")
                    connection.doOutput = true

                    val payload = JSONObject().apply {
                        put("sku", skuText)
                        put("name", nameText)
                        put("category", catText)
                        put("quantity", qtyText.toInt())
                    }

                    val os = connection.outputStream
                    os.write(payload.toString().toByteArray())
                    os.flush()
                    os.close()

                    if (connection.responseCode == HttpURLConnection.HTTP_CREATED || connection.responseCode == HttpURLConnection.HTTP_OK) {
                        runOnUiThread {
                            Toast.makeText(this@DashboardActivity, "Item successfully saved!", Toast.LENGTH_SHORT).show()
                            alertDialog.dismiss()
                            fetchLiveInventoryData()
                        }
                    }
                } catch (e: Exception) {
                    runOnUiThread { Toast.makeText(this@DashboardActivity, "Failed to connect to backend api.", Toast.LENGTH_SHORT).show() }
                }
            }
        }
        alertDialog.show()
    }
}