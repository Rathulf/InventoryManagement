package com.example.inventorymanagement

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import org.json.JSONObject

class InventoryAdapter(
    private var itemList: List<JSONObject>,
    private val isUserAdmin: Boolean,
    private val onPurgeClicked: (String, String) -> Unit
) : RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>() {

    private var currentThreshold: Int = 0

    class InventoryViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvSku: TextView = view.findViewById(R.id.tvRowSku)
        val tvName: TextView = view.findViewById(R.id.tvRowName)
        val tvCategory: TextView = view.findViewById(R.id.tvRowCategory)
        val tvQuantity: TextView = view.findViewById(R.id.tvRowQuantity)
        val btnPurge: ImageButton = view.findViewById(R.id.btnRowPurge)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): InventoryViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_inventory_row, parent, false)
        return InventoryViewHolder(view)
    }

    override fun onBindViewHolder(holder: InventoryViewHolder, position: Int) {
        val item = itemList[position]
        val itemId = item.optString("id", "")
        val itemName = item.optString("name", "Unknown Item")
        val qty = item.optInt("quantity", 0)

        holder.tvSku.text = item.optString("sku", "N/A")
        holder.tvName.text = itemName
        holder.tvCategory.text = item.optString("category", "General")
        holder.tvQuantity.text = "$qty units"

        // HIGHLIGHT LOGIC: Turn the text red if stock falls below the threshold
        if (currentThreshold > 0 && qty < currentThreshold) {
            holder.tvQuantity.setTextColor(Color.parseColor("#DC2626")) // Red alert
        } else {
            holder.tvQuantity.setTextColor(Color.parseColor("#64748B")) // Default slate gray
        }

        if (isUserAdmin && itemId.isNotEmpty()) {
            holder.btnPurge.visibility = View.VISIBLE
            holder.btnPurge.setOnClickListener { onPurgeClicked(itemId, itemName) }
        } else {
            holder.btnPurge.visibility = View.GONE
        }
    }

    override fun getItemCount(): Int = itemList.size

    fun updateData(newList: List<JSONObject>, newThreshold: Int = 0) {
        itemList = newList
        currentThreshold = newThreshold
        notifyDataSetChanged()
    }
}