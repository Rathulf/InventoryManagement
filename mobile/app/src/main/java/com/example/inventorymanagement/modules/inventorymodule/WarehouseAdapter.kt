package com.example.inventorymanagement.modules.inventorymodule

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.inventorymanagement.R
import org.json.JSONObject

// The adapter now takes a Map where the Key is Category, and the Value is a List of JSONObjects (the items)
class WarehouseAdapter(private var categoryData: Map<String, List<JSONObject>>) : RecyclerView.Adapter<WarehouseAdapter.WarehouseViewHolder>() {

    private var categories = categoryData.keys.toList()

    class WarehouseViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val headerLayout: LinearLayout = view.findViewById(R.id.layoutCategoryHeader)
        val expandedContent: LinearLayout = view.findViewById(R.id.layoutExpandedContent)
        val tvCategory: TextView = view.findViewById(R.id.tvWarehouseCategory)
        val tvTotal: TextView = view.findViewById(R.id.tvWarehouseTotal)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): WarehouseViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_warehouse_row, parent, false)
        return WarehouseViewHolder(view)
    }

    override fun onBindViewHolder(holder: WarehouseViewHolder, position: Int) {
        val categoryName = categories[position]
        val itemsInCategory = categoryData[categoryName] ?: emptyList()

        // Calculate the total quantity for the header
        var totalQuantity = 0
        for (item in itemsInCategory) {
            totalQuantity += item.optInt("quantity", 0)
        }

        holder.tvCategory.text = categoryName.uppercase()
        holder.tvTotal.text = "$totalQuantity Units"

        // Clear out any old views from recycling
        holder.expandedContent.removeAllViews()

        // Generate a text row for each item in this category
        for (item in itemsInCategory) {
            val name = item.optString("name", "Unknown")
            val sku = item.optString("sku", "N/A")
            val qty = item.optInt("quantity", 0)

            val tvItem = TextView(holder.itemView.context).apply {
                text = "• $name (SKU: $sku) - $qty units"
                setPadding(0, 8, 0, 8)
                setTextColor(Color.parseColor("#475569"))
                textSize = 14f
            }
            holder.expandedContent.addView(tvItem)
        }

        // Toggle the dropdown when the header is tapped
        holder.headerLayout.setOnClickListener {
            if (holder.expandedContent.visibility == View.VISIBLE) {
                holder.expandedContent.visibility = View.GONE
            } else {
                holder.expandedContent.visibility = View.VISIBLE
            }
        }
    }

    override fun getItemCount(): Int = categories.size

    fun updateData(newData: Map<String, List<JSONObject>>) {
        categoryData = newData
        categories = newData.keys.toList()
        notifyDataSetChanged()
    }
}