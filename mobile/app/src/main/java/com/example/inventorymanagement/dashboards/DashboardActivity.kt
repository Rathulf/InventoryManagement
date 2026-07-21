package com.example.inventorymanagement.dashboards

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.inventorymanagement.R
import com.example.inventorymanagement.activities.ManageInventoryActivity
import com.example.inventorymanagement.activities.WarehouseActivity
import com.example.inventorymanagement.authentication.LoginActivity
import com.example.inventorymanagement.modules.inventorymodule.InventoryAdapter
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.text.NumberFormat
import java.util.Locale
import kotlin.concurrent.thread

class DashboardActivity : AppCompatActivity() {

    private lateinit var cardLowStock: View
    private lateinit var tvUserRoleBadge: TextView
    private lateinit var tvTotalSkus: TextView
    private lateinit var tvLowStock: TextView
    private lateinit var tvTotalValue: TextView

    private lateinit var etSearch: EditText
    private lateinit var etThreshold: EditText

    private lateinit var rvInventory: RecyclerView
    private lateinit var inventoryAdapter: InventoryAdapter

    private var currentUserRole: String = "STAFF"

    private var fullInventoryList = listOf<JSONObject>()
    private var currentThreshold = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)

        tvUserRoleBadge = findViewById(R.id.tvUserRoleBadge)
        tvTotalSkus = findViewById(R.id.tvTotalSkus)
        cardLowStock = findViewById(R.id.cardLowStock)
        tvLowStock = findViewById(R.id.tvLowStock)
        tvTotalValue = findViewById(R.id.tvTotalValue)

        etSearch = findViewById(R.id.etSearch)
        etThreshold = findViewById(R.id.etThreshold)

        currentUserRole = intent.getStringExtra("USER_ROLE") ?: "STAFF"
        val activeUsername = intent.getStringExtra("USER_NAME") ?: "Operator"

        rvInventory = findViewById(R.id.rvInventory)
        rvInventory.layoutManager = LinearLayoutManager(this)

        // --- ROLE RESTRICTION ENFORCEMENT ---
        if (currentUserRole.equals("STAFF", ignoreCase = true)) {
            // Hide the total inventory value card container completely for staff
            tvTotalValue.parent?.let { parent ->
                if (parent is View) {
                    parent.visibility = View.GONE
                }
            }
        }
        // ------------------------------------

        // Initialize adapter with edit capability and Toast for transactions
        inventoryAdapter = InventoryAdapter(
            emptyList(),
            isUserAdmin = (currentUserRole.equals("ADMIN", ignoreCase = true)),
            onPurgeClicked = { itemId, itemName -> confirmAndPurgeItem(itemId, itemName) },
            onItemClicked = { item ->
                if (currentUserRole.equals("ADMIN", ignoreCase = true)) {
                    showEditAssetDialog(item)
                } else {
                    Toast.makeText(this, "Tap the transaction button to process Stock In/Out.", Toast.LENGTH_SHORT).show()
                }
            },
            onTransactionClicked = { item ->
                // Opens the stock movement processor for both Admin and Staff
                showStockTransactionDialog(item)
            }
        )
        rvInventory.adapter = inventoryAdapter

        if (currentUserRole == "ADMIN") {
            tvUserRoleBadge.text = "ADMIN CONTROL PANEL • Welcome, $activeUsername"
            tvUserRoleBadge.setTextColor(android.graphics.Color.parseColor("#DC2626"))
        } else {
            tvUserRoleBadge.text = "STAFF WORKSPACE • Welcome, $activeUsername"
            tvUserRoleBadge.setTextColor(android.graphics.Color.parseColor("#475569"))
        }

        // Makes the Orange Card interactive
        cardLowStock.setOnClickListener {
            etThreshold.setText("15")
            Toast.makeText(this, "Filtering ledger for Low Stock items...", Toast.LENGTH_SHORT).show()
        }

        setupSearchAndFilterListeners()
        fetchLiveInventoryData()
    }

    // --- MENU LOGIC ---

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.dashboard_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_refresh -> {
                Toast.makeText(this, "Syncing data...", Toast.LENGTH_SHORT).show()
                fetchLiveInventoryData()
                true
            }
            R.id.action_manage_inventory -> {
                val intent = Intent(this, ManageInventoryActivity::class.java)
                intent.putExtra("USER_ROLE", currentUserRole)
                startActivity(intent)
                true
            }
            R.id.action_warehouse -> {
                startActivity(Intent(this, WarehouseActivity::class.java))
                true
            }
            R.id.action_logout -> {
                performLogout()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun performLogout() {
        val sharedPreferences = getSharedPreferences("StockPulseAuth", Context.MODE_PRIVATE)
        sharedPreferences.edit().clear().apply()

        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    // --- FILTER & DATA LOGIC ---

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

        // Smarter Filter: Checks BOTH Search AND Threshold simultaneously
        val filteredList = fullInventoryList.filter { item ->
            val qty = item.optInt("quantity", 0)

            val matchesSearch = query.isEmpty() ||
                    item.optString("name", "").lowercase().contains(query) ||
                    item.optString("sku", "").lowercase().contains(query) ||
                    item.optString("category", "").lowercase().contains(query)

            val matchesThreshold = currentThreshold == 0 || qty <= currentThreshold

            matchesSearch && matchesThreshold
        }

        // Dashboard Metrics Calculation
        var lowStockCount = 0
        var totalValue = 0.0
        val stockWarningLimit = if (currentThreshold > 0) currentThreshold else 15

        for (itemObj in filteredList) {
            val qty = itemObj.optInt("quantity", 0)
            val price = itemObj.optDouble("price", 0.0)

            if (qty <= stockWarningLimit) {
                lowStockCount++
            }
            totalValue += (qty * price)
        }

        // Formats the Double into Philippine Peso Currency
        val format = NumberFormat.getCurrencyInstance(Locale("en", "PH"))
        val formattedValue = format.format(totalValue)

        runOnUiThread {
            tvTotalSkus.text = filteredList.size.toString()
            tvLowStock.text = lowStockCount.toString()
            tvTotalValue.text = formattedValue
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

                    for (i in 0 until jsonArray.length()) {
                        rawList.add(jsonArray.getJSONObject(i))
                    }

                    val uniqueItemList = rawList.distinctBy { it.optString("sku", "N/A").trim().uppercase() }

                    fullInventoryList = uniqueItemList
                    applyFilters()
                }
            } catch (e: Exception) {
                runOnUiThread { Toast.makeText(this, "Network error synchronizing ledger data.", Toast.LENGTH_SHORT).show() }
            }
        }
    }

    private fun showEditAssetDialog(item: JSONObject) {
        val dialogBuilder = AlertDialog.Builder(this)
        val inflater = this.layoutInflater
        val dialogView = inflater.inflate(R.layout.dialog_edit_item, null)
        dialogBuilder.setView(dialogView)

        val etSku = dialogView.findViewById<EditText>(R.id.etEditSku)
        val etName = dialogView.findViewById<EditText>(R.id.etEditName)
        val etCategory = dialogView.findViewById<EditText>(R.id.etEditCategory)
        val etQuantity = dialogView.findViewById<EditText>(R.id.etEditQuantity)
        val btnUpdate = dialogView.findViewById<Button>(R.id.btnDialogUpdate)

        val itemId = item.optString("id")
        etSku.setText(item.optString("sku"))
        etName.setText(item.optString("name"))
        etCategory.setText(item.optString("category"))
        etQuantity.setText(item.optString("quantity"))

        val alertDialog = dialogBuilder.create()

        btnUpdate.setOnClickListener {
            val skuText = etSku.text.toString().trim()
            val nameText = etName.text.toString().trim()
            val catText = etCategory.text.toString().trim()
            val qtyText = etQuantity.text.toString().trim()

            if (skuText.isEmpty() || nameText.isEmpty() || catText.isEmpty() || qtyText.isEmpty()) {
                Toast.makeText(this, "Please populate all fields.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            thread {
                try {
                    val url = URL("https://stockpulse-cbdz.onrender.com/api/items/$itemId")
                    val connection = url.openConnection() as HttpURLConnection
                    connection.requestMethod = "PUT"
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

                    if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                        runOnUiThread {
                            Toast.makeText(this@DashboardActivity, "Item Updated!", Toast.LENGTH_SHORT).show()
                            alertDialog.dismiss()
                            fetchLiveInventoryData()
                        }
                    }
                } catch (e: Exception) {
                    runOnUiThread { Toast.makeText(this@DashboardActivity, "Update failed.", Toast.LENGTH_SHORT).show() }
                }
            }
        }
        alertDialog.show()
    }

    private fun confirmAndPurgeItem(itemId: String, itemName: String) {
        AlertDialog.Builder(this)
            .setTitle("Confirm Purge")
            .setMessage("Are you sure you want to permanently clear $itemName from the backend ledger rows?")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Purge") { _, _ ->
                thread {
                    try {
                        val url = URL("https://stockpulse-cbdz.onrender.com/api/items/$itemId")
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

    private fun showStockTransactionDialog(item: JSONObject) {
        val itemId = item.optString("id")
        val itemName = item.optString("name")
        val currentQty = item.optInt("quantity", 0)

        val dialogView = layoutInflater.inflate(R.layout.dialog_edit_item, null)
        val etSku = dialogView.findViewById<EditText>(R.id.etEditSku)
        val etName = dialogView.findViewById<EditText>(R.id.etEditName)
        val etCategory = dialogView.findViewById<EditText>(R.id.etEditCategory)
        val etQuantity = dialogView.findViewById<EditText>(R.id.etEditQuantity)
        val btnUpdate = dialogView.findViewById<Button>(R.id.btnDialogUpdate)

        // Lock item metadata fields so staff only deal with quantities
        etSku.setText(item.optString("sku"))
        etSku.isEnabled = false
        etName.setText(itemName)
        etName.isEnabled = false
        etCategory.setText(item.optString("category"))
        etCategory.isEnabled = false

        etQuantity.hint = "Enter quantity to add/subtract"
        etQuantity.setText("")

        val dialog = AlertDialog.Builder(this)
            .setTitle("Process Stock: $itemName")
            .setView(dialogView)
            .setNegativeButton("Cancel", null)
            .create()

        // Modify update button text to offer choices or clear intent
        btnUpdate.text = "Confirm Movement"

        btnUpdate.setOnClickListener {
            val inputVal = etQuantity.text.toString().trim().toIntOrNull()
            if (inputVal == null || inputVal <= 0) {
                Toast.makeText(this, "Please enter a valid amount.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Prompt whether this is Stock In or Stock Out
            AlertDialog.Builder(this)
                .setTitle("Select Transaction Type")
                .setMessage("Are you adding stock (IN) or dispatching stock (OUT)?")
                .setPositiveButton("Stock In (+)") { _, _ ->
                    val newQty = currentQty + inputVal
                    executeStockUpdate(itemId, item, newQty, dialog)
                }
                .setNegativeButton("Stock Out (-)") { _, _ ->
                    val newQty = currentQty - inputVal
                    if (newQty < 0) {
                        Toast.makeText(this, "Error: Stock cannot drop below zero.", Toast.LENGTH_SHORT).show()
                        return@setNegativeButton
                    }
                    executeStockUpdate(itemId, item, newQty, dialog)
                }
                .show()
        }

        dialog.show()
    }

    private fun executeStockUpdate(itemId: String, originalItem: JSONObject, updatedQuantity: Int, dialog: AlertDialog) {
        thread {
            try {
                val url = URL("https://stockpulse-cbdz.onrender.com/api/items/$itemId")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "PUT"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                val payload = JSONObject().apply {
                    put("sku", originalItem.optString("sku"))
                    put("name", originalItem.optString("name"))
                    put("category", originalItem.optString("category"))
                    put("quantity", updatedQuantity)
                }

                val os = connection.outputStream
                os.write(payload.toString().toByteArray())
                os.flush()
                os.close()

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    runOnUiThread {
                        Toast.makeText(this@DashboardActivity, "Stock successfully processed!", Toast.LENGTH_SHORT).show()
                        dialog.dismiss()
                        fetchLiveInventoryData()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this@DashboardActivity, "Failed to process stock movement.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
