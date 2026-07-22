package com.example.inventorymanagement.activities

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.inventorymanagement.R
import com.example.inventorymanagement.modules.inventorymodule.WarehouseAdapter
import com.google.android.material.appbar.MaterialToolbar
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class WarehouseActivity : AppCompatActivity() {

    private lateinit var rvWarehouse: RecyclerView
    private lateinit var warehouseAdapter: WarehouseAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_warehouse)

        // Setup the top toolbar with a back button
        val toolbar = findViewById<MaterialToolbar>(R.id.warehouseToolbar)

        toolbar.setNavigationIcon(android.R.drawable.ic_menu_revert)
        toolbar.setNavigationOnClickListener { finish() } // Closes screen on back press

        rvWarehouse = findViewById(R.id.rvWarehouse)
        rvWarehouse.layoutManager = LinearLayoutManager(this)

        warehouseAdapter = WarehouseAdapter(emptyMap())
        rvWarehouse.adapter = warehouseAdapter

        fetchWarehouseData()
    }

    private fun fetchWarehouseData() {
        thread {
            try {
                val url = URL("https://stockpulse-cbdz.onrender.com/api/items")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 15000
                connection.connect()

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val response = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) { response.append(line) }
                    reader.close()

                    val jsonArray = JSONArray(response.toString())

                    // NEW GROUPING LOGIC: Map of Category -> List of Items
                    val categoryMap = mutableMapOf<String, MutableList<JSONObject>>()

                    for (i in 0 until jsonArray.length()) {
                        val item = jsonArray.getJSONObject(i)
                        val category = item.optString("category", "Uncategorized").trim()

                        // If the category doesn't exist in the map yet, create an empty list for it
                        if (!categoryMap.containsKey(category)) {
                            categoryMap[category] = mutableListOf()
                        }

                        // Add the full item object to its respective category list
                        categoryMap[category]?.add(item)
                    }

                    val sortedMap = categoryMap.toSortedMap()

                    runOnUiThread {
                        warehouseAdapter.updateData(sortedMap)
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "Failed to load warehouse summary.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

}