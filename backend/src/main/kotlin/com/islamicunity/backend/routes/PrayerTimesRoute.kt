package com.islamicunity.backend.routes

import com.islamicunity.backend.network.httpClient
import com.islamicunity.models.PrayerTimesResponse
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.prayerTimesRoutes() {
    route("/prayer-times") {
        get {
            val address = call.request.queryParameters["address"] ?: "Delhi,INDIA"
            val method = call.request.queryParameters["method"]?.toIntOrNull() ?: 8 // Default to method 8 as per user app
            // method 8 might be specific; user's url had tune=2,3,4,5,2,3,4,5,-3
            val tune = call.request.queryParameters["tune"] ?: "2,3,4,5,2,3,4,5,-3" 

            try {
                // Using timingsByAddress to match Android app's pattern
                // URI: https://api.aladhan.com/v1/timingsByAddress/{date}?address=...
                // We'll use today's date or specific date if passed
                val date = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"))
                
                val response: PrayerTimesResponse = httpClient.get("https://api.aladhan.com/v1/timingsByAddress/$date") {
                    parameter("address", address)
                    parameter("method", method)
                    parameter("tune", tune)
                }.body()
                
                call.respond(response)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.message))
            }
        }
    }
}
