package com.example.inventorymanagement.activities

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.RadioGroup
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.inventorymanagement.R
import com.example.inventorymanagement.modules.inventorymodule.InventoryAdapter
import com.google.android.material.floatingactionbutton.FloatingActionButton
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class ManageInventoryActivity : AppCompatActivity() {

    private lateinit var fabAddItem: FloatingActionButton
    private lateinit var etSearch: EditText
    private lateinit var etThreshold: EditText
    private lateinit var rvInventory: RecyclerView
    private lateinit var inventoryAdapter: InventoryAdapter

    private var currentUserRole: String = "STAFF"
    private var fullInventoryList = listOf<JSONObject>()
    private var currentThreshold = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_inventory)

        val toolbar = findViewById<Toolbar>(R.id.manageInventoryToolbar)
        setSupportActionBar(toolbar)
        toolbar.setNavigationIcon(android.R.drawable.ic_menu_revert)
        toolbar.setNavigationOnClickListener { finish() }

        fabAddItem = findViewById(R.id.fabAddItem)
        etSearch = findViewById(R.id.etSearch)
        etThreshold = findViewById(R.id.etThreshold)
        rvInventory = findViewById(R.id.rvInventory)

        currentUserRole = intent.getStringExtra("USER_ROLE") ?: "STAFF"

        rvInventory.layoutManager = LinearLayoutManager(this)

        inventoryAdapter = InventoryAdapter(
            emptyList(),
            isUserAdmin = (currentUserRole == "ADMIN"),
            onPurgeClicked = { itemId, itemName -> confirmAndPurgeItem(itemId, itemName) },
            onItemClicked = { item -> showEditAssetDialog(item) },
            onTransactionClicked = { item -> showTransactionDialog(item) }
        )
        rvInventory.adapter = inventoryAdapter

        // Visibility setup
        Toast.makeText(this, "Debug Role: $currentUserRole", Toast.LENGTH_LONG).show()
        fabAddItem.visibility = View.VISIBLE
        fabAddItem.setOnClickListener { showRegisterAssetDialog() }

        setupSearchAndFilterListeners()
        fetchLiveInventoryData()
    }

    private fun setupSearchAndFilterListeners() {
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { applyFilters() }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        etThreshold.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                currentThreshold = s?.toString()?.toIntOrNull() ?: 0
                applyFilters()
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
    }

    private fun applyFilters() {
        val query = etSearch.text.toString().trim().lowercase()

        val filteredList = fullInventoryList.filter { item ->
            val qty = item.optInt("quantity", 0)
            val matchesSearch = query.isEmpty() ||
                    item.optString("name", "").lowercase().contains(query) ||
                    item.optString("sku", "").lowercase().contains(query) ||
                    item.optString("category", "").lowercase().contains(query)

            val matchesThreshold = currentThreshold == 0 || qty <= currentThreshold

            matchesSearch && matchesThreshold
        }

        runOnUiThread {
            inventoryAdapter.updateData(filteredList, currentThreshold)
        }
    }

    private fun fetchLiveInventoryData() {
        thread {
            try {
                val url = URL("https://stockpulse-cbdz.onrender.com/api/items")
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
                    for (i in 0 until jsonArray.length()) { rawList.add(jsonArray.getJSONObject(i)) }

                    fullInventoryList = rawList.distinctBy { it.optString("sku", "N/A").trim().uppercase() }
                    applyFilters()
                }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this, "Failed to fetch data.", Toast.LENGTH_SHORT).show() }
            }
        }
    }

    // --- ADD ITEM LOGIC ---

    private fun showRegisterAssetDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_item, null)
        val dialogBuilder = AlertDialog.Builder(this).setView(dialogView)
        val alertDialog = dialogBuilder.create()

        val etSku = dialogView.findViewById<EditText>(R.id.etDialogSku)
        val etName = dialogView.findViewById<EditText>(R.id.etDialogName)
        val etCategory = dialogView.findViewById<EditText>(R.id.etDialogCategory)
        val etQuantity = dialogView.findViewById<EditText>(R.id.etDialogQuantity)
        val etPrice = dialogView.findViewById<EditText>(R.id.etDialogPrice) // New Price Field
        val btnSave = dialogView.findViewById<Button>(R.id.btnDialogSave)

        btnSave.setOnClickListener {
            val sku = etSku.text.toString().trim()
            val name = etName.text.toString().trim()
            val category = etCategory.text.toString().trim()
            val qtyString = etQuantity.text.toString().trim()
            val priceString = etPrice.text.toString().trim()

            if (sku.isEmpty() || name.isEmpty() || category.isEmpty() || qtyString.isEmpty() || priceString.isEmpty()) {
                Toast.makeText(this, "Please fill out all fields.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val qty = qtyString.toIntOrNull() ?: 0
            val price = priceString.toDoubleOrNull() ?: 0.0

            addNewInventoryItem(sku, name, category, qty, price)
            alertDialog.dismiss()
        }

        alertDialog.show()
    }

    private fun addNewInventoryItem(skuText: String, nameText: String, catText: String, qtyText: Int, priceText: Double) {
        thread {
            try {
                val url = URL("https://stockpulse-cbdz.onrender.com/api/items")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                val payload = JSONObject().apply {
                    put("sku", skuText)
                    put("name", nameText)
                    put("category", catText)
                    put("quantity", qtyText)
                    put("price", priceText) // Appending price to the database
                }

                val os = connection.outputStream
                os.write(payload.toString().toByteArray())
                os.flush()
                os.close()

                if (connection.responseCode == HttpURLConnection.HTTP_CREATED || connection.responseCode == HttpURLConnection.HTTP_OK) {
                    runOnUiThread {
                        Toast.makeText(this, "Item successfully added to inventory!", Toast.LENGTH_SHORT).show()
                        fetchLiveInventoryData()
                    }
                } else {
                    runOnUiThread {
                        Toast.makeText(this, "Failed to add item. Server code: ${connection.responseCode}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "Network error: Could not reach the backend.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    // --- EDIT & TRANSACTION LOGIC ---

    private fun showEditAssetDialog(item: JSONObject) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_edit_item, null)
        val dialogBuilder = AlertDialog.Builder(this).setView(dialogView)
        val alertDialog = dialogBuilder.create()

        val etSku = dialogView.findViewById<EditText>(R.id.etEditSku).apply { setText(item.optString("sku")) }
        val etName = dialogView.findViewById<EditText>(R.id.etEditName).apply { setText(item.optString("name")) }
        val etCategory = dialogView.findViewById<EditText>(R.id.etEditCategory).apply { setText(item.optString("category")) }
        val etQuantity = dialogView.findViewById<EditText>(R.id.etEditQuantity).apply { setText(item.optString("quantity")) }
        val etPrice = dialogView.findViewById<EditText>(R.id.etEditPrice).apply { setText(item.optString("price")) }
        val itemId = item.optString("id")

        dialogView.findViewById<Button>(R.id.btnDialogUpdate).setOnClickListener {
            val skuText = etSku.text.toString().trim()
            val nameText = etName.text.toString().trim()
            val catText = etCategory.text.toString().trim()
            val qtyText = etQuantity.text.toString().trim()
            val priceText = etPrice.text.toString().trim()

            // FIX 1: Show a Toast if a field is empty instead of failing silently
            if (skuText.isEmpty() || nameText.isEmpty() || catText.isEmpty() || qtyText.isEmpty() || priceText.isEmpty()) {
                Toast.makeText(this, "Please fill out all fields, including Price.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val qty = qtyText.toIntOrNull() ?: 0
            val price = priceText.toDoubleOrNull() ?: 0.0

            thread {
                try {
                    val connection = URL("https://stockpulse-cbdz.onrender.com/api/items/$itemId").openConnection() as HttpURLConnection
                    connection.requestMethod = "PUT"
                    connection.setRequestProperty("Content-Type", "application/json")
                    connection.doOutput = true

                    val payload = JSONObject().apply {
                        put("sku", skuText)
                        put("name", nameText)
                        put("category", catText)
                        put("quantity", qty)
                        put("price", price)
                    }
                    connection.outputStream.use { it.write(payload.toString().toByteArray()) }

                    val responseCode = connection.responseCode

                    // FIX 2: Accept 204 (No Content) as a successful update, common in some APIs
                    if (responseCode == 200 || responseCode == 204) {
                        runOnUiThread {
                            Toast.makeText(this@ManageInventoryActivity, "Updated!", Toast.LENGTH_SHORT).show()
                            alertDialog.dismiss()
                            fetchLiveInventoryData()
                        }
                    } else {
                        // FIX 3: If the server rejects it, show the exact error code
                        runOnUiThread {
                            Toast.makeText(this@ManageInventoryActivity, "Server rejected update. Error Code: $responseCode", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    runOnUiThread { Toast.makeText(this@ManageInventoryActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show() }
                }
            }
        }
        alertDialog.show()
    }

    private fun showTransactionDialog(item: JSONObject) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_transaction, null)
        val dialogBuilder = AlertDialog.Builder(this).setView(dialogView)
        val alertDialog = dialogBuilder.create()

        val tvTitle = dialogView.findViewById<TextView>(R.id.tvTransactionTitle)
        val rgType = dialogView.findViewById<RadioGroup>(R.id.rgTransactionType)
        val etQty = dialogView.findViewById<EditText>(R.id.etTransactionQty)

        val itemName = item.optString("name", "Unknown Item")
        val currentQty = item.optInt("quantity", 0)
        val currentPrice = item.optDouble("price", 0.0) // Extracting existing price
        val itemId = item.optString("id")

        tvTitle.text = "Manage Stock: $itemName\n(Current Qty: $currentQty)"

        dialogView.findViewById<Button>(R.id.btnProcessTransaction).setOnClickListener {
            val inputQtyStr = etQty.text.toString().trim()
            if (inputQtyStr.isEmpty()) return@setOnClickListener
            val inputQty = inputQtyStr.toInt()
            val isStockIn = rgType.checkedRadioButtonId == R.id.rbStockIn

            val newQuantity = if (isStockIn) currentQty + inputQty else {
                if (inputQty > currentQty) {
                    Toast.makeText(this, "Insufficient stock!", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                currentQty - inputQty
            }

            thread {
                try {
                    val connection = URL("http://10.0.2.2:8080/api/items/$itemId").openConnection() as HttpURLConnection
                    connection.requestMethod = "PUT"
                    connection.setRequestProperty("Content-Type", "application/json")
                    connection.doOutput = true

                    val payload = JSONObject().apply {
                        put("sku", item.optString("sku"))
                        put("name", item.optString("name"))
                        put("category", item.optString("category"))
                        put("quantity", newQuantity)
                        put("price", currentPrice) // Persisting the price during a transaction
                    }
                    connection.outputStream.use { it.write(payload.toString().toByteArray()) }

                    if (connection.responseCode == 200) {
                        runOnUiThread {
                            Toast.makeText(this@ManageInventoryActivity, "Transaction successful!", Toast.LENGTH_SHORT).show()
                            alertDialog.dismiss()
                            fetchLiveInventoryData()
                        }
                    }
                } catch (e: Exception) {
                    runOnUiThread { Toast.makeText(this@ManageInventoryActivity, "Error processing.", Toast.LENGTH_SHORT).show() }
                }
            }
        }
        alertDialog.show()
    }

    private fun confirmAndPurgeItem(itemId: String, itemName: String) {
        AlertDialog.Builder(this)
            .setTitle("Confirm Purge")
            .setMessage("Clear $itemName from backend ledger?")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Purge") { _, _ ->
                thread {
                    try {
                        val connection = URL("https://stockpulse-cbdz.onrender.com/api/items/$itemId").openConnection() as HttpURLConnection
                        connection.requestMethod = "DELETE"
                        connection.connect()

                        if (connection.responseCode == 200) {
                            runOnUiThread {
                                Toast.makeText(this, "Asset cleared.", Toast.LENGTH_SHORT).show()
                                fetchLiveInventoryData()
                            }
                        }
                    } catch (e: Exception) {
                        runOnUiThread { Toast.makeText(this, "Error deleting.", Toast.LENGTH_SHORT).show() }
                    }
                }
            }
            .show()
    }
}